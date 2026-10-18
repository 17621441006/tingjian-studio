import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {HOMES,ROOMS,homeAsset} from '../src/legacy/home-designs.mjs';
import {RENEWED_IDS} from '../src/legacy/collector-homes.mjs';
import {livingReverseAsset} from '../src/legacy/wood-homes.mjs';
import {layoutsFor} from '../src/legacy/layout-options.mjs';
import {assembleHome,resolveScene,sceneAsset} from '../src/legacy/scene-options.mjs';
import {designerFrames} from '../src/legacy/designer-gallery.mjs';
import {floorRegions,floorMask} from '../src/legacy/photo-floor.mjs';
import {wholeModelSpec} from '../src/legacy/whole-model-state.mjs';
const hash=b=>createHash('sha256').update(b).digest('hex');
const baseline=JSON.parse(await fs.readFile('verification/v46/baseline.json','utf8'));
assert.deepEqual(Object.keys(HOMES),baseline.order,'Keep all 20 existing IDs and their positions');
for(const [id,digest] of Object.entries(baseline.unchangedHomes))assert.equal(hash(JSON.stringify(HOMES[id])),digest,'Unrelated home changed: '+id);
for(const [p,digest] of Object.entries(baseline.sourceHashes))assert.equal(hash(await fs.readFile(p)),digest,'Homepage/branding source changed: '+p);
assert.equal(HOMES['terracotta-atelier'].name,'绢光雅集');assert.equal(HOMES['silver-retreat'].name,'漆夜藏珍');
const assets=JSON.parse(await fs.readFile('verification/v46/assets.json','utf8'));assert.equal(assets.length,36);
const imageHashes=new Set();
for(const a of assets){const b=await fs.readFile(a.path);assert.equal(b.length,a.bytes);assert.equal(hash(b),a.sha256);assert.equal(b.toString('ascii',0,4),'RIFF');assert.equal(b.toString('ascii',8,12),'WEBP');assert.deepEqual([a.width,a.height],a.thumb?[480,320]:[1536,1024]);if(!a.thumb)imageHashes.add(a.sha256);}
assert.equal(imageHashes.size,18,'18 distinct authored views, never reused across rooms');
for(const id of RENEWED_IDS){
 assert.deepEqual(new Set(Object.keys(HOMES[id].rooms)),new Set(ROOMS.map(r=>r.id)));
 const frames=assembleHome(id,new Map());assert.equal(new Set(frames.map(f=>f.path)).size,8);
 for(const room of ROOMS){const scene=resolveScene({design:id,room:room.id});assert.equal(sceneAsset(scene),homeAsset(id,room.id));assert(homeAsset(id,room.id).startsWith('/designs-v46/'));await fs.access('dist'+homeAsset(id,room.id));await fs.access('dist'+homeAsset(id,room.id,true));assert.equal(layoutsFor(id,room.id)[0].copy,HOMES[id].rooms[room.id].copy);assert(HOMES[id].rooms[room.id].materials.length>=3);const mask=floorMask(1536,1024,floorRegions(scene));assert(mask.some(v=>v));assert(mask.filter(v=>v).length<1536*1024*.3);}
 assert.equal(livingReverseAsset(id),'/designs-v46/schemes/'+id+'/living2.webp');await fs.access('dist'+livingReverseAsset(id));
 assert.deepEqual(designerFrames('final',id).map(f=>f.path),designerFrames('base',id).map(f=>f.path));
 const spec=wholeModelSpec({design:id,frames});assert(spec.palette.wall.startsWith('#e'),'Light walls retained in model');if(id==='silver-retreat'){assert.equal(spec.sofaColor,'#202d3c');assert.equal(spec.table,'glass');}
}
const html=await fs.readFile('dist/tour/legacy.html','utf8');assert.equal((html.match(/data-home-design=/g)||[]).length,20);assert(html.includes('绢光雅集')&&html.includes('漆夜藏珍'));assert(!html.includes('赤陶构所')&&!html.includes('银灰栖居'));
const result={passed:true,schemes:20,replacedSlots:[17,19],unchangedSchemes:18,roomsPerReplacement:8,additionalReverseViews:2,newMainImages:18,newThumbnails:18,homepageAndBrandingUnchanged:true,sameOriginMedia:true,browserVisualTested:false};
await fs.writeFile('verification/v46/checks.json',JSON.stringify(result,null,2)+'\n');console.log(result);
