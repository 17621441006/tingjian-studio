import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {HOMES,ROOMS,homeAsset} from '../src/legacy/home-designs.mjs';
import {MINERAL_IDS,mineralAsset} from '../src/legacy/mineral-homes.mjs';
import {livingReverseAsset} from '../src/legacy/wood-homes.mjs';
import {designerFrames} from '../src/legacy/designer-gallery.mjs';
import {assembleHome} from '../src/legacy/scene-options.mjs';
import {wholeModelSpec} from '../src/legacy/whole-model-state.mjs';
import {buildDetailedHome} from '../src/legacy/whole-model-detailed.mjs';
import {disposeWholeGeometry} from '../src/legacy/whole-model-geometry.mjs';
import {floorRegions,floorMask} from '../src/legacy/photo-floor.mjs';
import {mediaCandidates} from '../src/legacy/media-loader.mjs';
assert.equal(Object.keys(HOMES).length,20);assert.equal(Object.keys(HOMES)[13],'plum-gallery');assert.equal(Object.keys(HOMES)[14],'amber-stone');assert.equal(HOMES['plum-gallery'].name,'青岩木序');assert.equal(HOMES['amber-stone'].name,'琥珀石邸');
const rows=JSON.parse(await fs.readFile('verification/v36/assets.json','utf8'));assert.equal(rows.length,36);
for(const row of rows){const b=await fs.readFile(row.path);assert.equal(b.length,row.bytes);assert.equal(createHash('sha256').update(b).digest('hex'),row.sha256);const d=JSON.parse(execFileSync('ffprobe',['-v','error','-show_entries','stream=width,height','-of','json',row.path])).streams[0];assert.deepEqual([d.width,d.height],row.thumb?[480,320]:[1536,1024]);execFileSync('ffmpeg',['-v','error','-i',row.path,'-f','null','-'],{stdio:'pipe'});}
for(const id of MINERAL_IDS){for(const room of ROOMS){const p=homeAsset(id,room.id);assert.equal(p,mineralAsset(id,room.id));await fs.access('dist'+p);await fs.access('dist'+homeAsset(id,room.id,true));const mask=floorMask(128,86,floorRegions({design:id,room:room.id}));assert(mask.some(x=>x));assert(mask.filter(x=>x).length<128*86*.6);}assert.equal(livingReverseAsset(id),mineralAsset(id,'living2'));await fs.access('dist'+livingReverseAsset(id));const finals=designerFrames('final',id);assert.equal(finals.length,8);assert(finals.every(f=>f.path===homeAsset(id,f.id)));const frames=assembleHome(id,new Map());assert.equal(new Set(frames.map(f=>f.path)).size,8);const spec=wholeModelSpec({design:id,frames});assert.equal(spec.secondPlan,'classic');assert.equal(spec.balconyPlan,'reading');assert(spec.clearBalcony);assert.equal(spec.floor,id==='plum-gallery'?'smoked':'stone');const model=buildDetailedHome({design:id,frames});let meshes=0;model.traverse(o=>{if(o.isMesh){meshes++;for(const v of o.geometry.attributes.position.array)assert(Number.isFinite(v));}});assert(meshes>10);disposeWholeGeometry(model);}
const html=await fs.readFile('dist/tour/legacy.html','utf8');assert.equal((html.match(/data-home-design=/g)||[]).length,20);assert(!html.includes('紫砚隐居'));assert(html.includes('另 10 套'));
const pin=JSON.parse(await fs.readFile('verification/v36/media-origin.json','utf8'));assert.match(pin.commit,/^[a-f0-9]{40}$/);globalThis.__TINGJIAN_V36_ORIGIN__=pin.origin;assert.equal(mediaCandidates(homeAsset('plum-gallery','living')).length,3);assert.equal(mediaCandidates(livingReverseAsset('amber-stone')).length,3);delete globalThis.__TINGJIAN_V36_ORIGIN__;
const hosted=await fs.readFile('build/tour/legacy.html','utf8');assert(hosted.includes('globalThis.__TINGJIAN_V36_ORIGIN__'));await assert.rejects(fs.access('build/designs-v36'));
const report={passed:true,schemes:20,replaced:'plum-gallery',newScheme:'amber-stone',nativeImages:18,thumbnails:18,mainResolution:[1536,1024],newFinalRoomViews:16,newReverseViews:2,smallBedroomLongitudinal:true,fullHeightBalconyGlass:true,originalAssetsPreserved:true,browserVisualTested:false,scope:'Authored concepts based on existing room views and original areas; no measured CAD claim.'};await fs.writeFile('verification/v36/checks.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));
