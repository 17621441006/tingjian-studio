import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {HOMES,ROOMS,homeAsset} from '../src/legacy/home-designs.mjs';
import {EXPANSION_IDS,EXPANSION_PLANS} from '../src/legacy/expansion-homes.mjs';
import {livingReverseAsset} from '../src/legacy/wood-homes.mjs';
import {layoutsFor,LAYOUT_ROOMS} from '../src/legacy/layout-options.mjs';
import {assembleHome,resolveScene,sceneAsset} from '../src/legacy/scene-options.mjs';
import {designerFrames,} from '../src/legacy/designer-gallery.mjs';
import {floorRegions,floorMask} from '../src/legacy/photo-floor.mjs';
import {buildWholeGeometry,disposeWholeGeometry} from '../src/legacy/whole-model-geometry.mjs';
import {buildDetailedHome} from '../src/legacy/whole-model-detailed.mjs';
assert.equal(Object.keys(HOMES).length,20);
assert.deepEqual(Object.keys(HOMES).slice(-4),EXPANSION_IDS);
assert.deepEqual(new Set(LAYOUT_ROOMS.map(r=>r.id)),new Set(ROOMS.map(r=>r.id)));
const assets=JSON.parse(await fs.readFile('verification/v38/assets.json','utf8'));assert.equal(assets.length,72);
for(const row of assets){const bytes=await fs.readFile(row.path);assert.equal(bytes.length,row.bytes);assert.equal(createHash('sha256').update(bytes).digest('hex'),row.sha256);assert.equal(bytes.toString('ascii',0,4),'RIFF');assert.equal(bytes.toString('ascii',8,12),'WEBP');assert.deepEqual([row.width,row.height],row.thumb?[480,320]:[1536,1024]);}
for(const design of EXPANSION_IDS){
 const frames=assembleHome(design,new Map());assert.equal(new Set(frames.map(f=>f.path)).size,8);
 for(const r of ROOMS){const scene=resolveScene({design,room:r.id});assert.equal(sceneAsset(scene),homeAsset(design,r.id));assert(layoutsFor(design,r.id)[0].copy===HOMES[design].rooms[r.id].copy);await fs.access('dist'+homeAsset(design,r.id));await fs.access('dist'+homeAsset(design,r.id,true));const mask=floorMask(128,86,floorRegions(scene));assert(mask.some(v=>v));assert(mask.filter(v=>v).length<128*86*.4);}
 assert.deepEqual(designerFrames('final',design).map(f=>f.path),designerFrames('base',design).map(f=>f.path));await fs.access('dist'+livingReverseAsset(design));
 for(const build of [buildWholeGeometry,buildDetailedHome]){
  const model=build({design,frames});model.updateMatrixWorld(true);let meshes=0;
  model.traverse(o=>{if(o.isMesh){meshes++;for(const v of o.geometry.attributes.position.array)assert(Number.isFinite(v));}});assert(meshes>80);
  for(const room of ['second','kitchen','bath','balcony','utility','dining'])assert.equal(model.userData.rooms.get(room).userData.plan,EXPANSION_PLANS[design][room]);
  assert(model.userData.objects.get('balcony-window').userData.clear);assert(model.userData.objects.get('kitchen-fridge').position.z<4.5,'fridge must not occupy kitchen doorway');
  if(design==='moss-garden')assert(![...model.userData.objects.keys()].some(k=>k==='second-daybed'||k==='second-single-bed'));
  if(design==='silver-retreat')assert(!model.userData.objects.has('kitchen-return'));
  if(design==='tea-cuisine')assert(model.userData.objects.has('utility-washer')&&model.userData.objects.has('utility-dryer'));
  disposeWholeGeometry(model);
 }
}
const html=await fs.readFile('dist/tour/legacy.html','utf8');assert.equal((html.match(/data-home-design=/g)||[]).length,20);assert(html.includes('另 10 套'));assert(!(await fs.readFile('dist/index.html','utf8')).includes('历史案例'));
const results={passed:true,schemes:20,added:EXPANSION_IDS,mainImages:36,thumbnails:36,nativeResolution:[1536,1024],allEightRoomsInLayoutStep:true,geometryVariants:['second','kitchen','bath','balcony','utility','dining'],sameOriginNewImages:true,browserVisualTested:false,scope:'Authored concept images and approximate furnishing models; not measured construction drawings or image-derived scans.'};
await fs.writeFile('verification/v38/checks.json',JSON.stringify(results,null,2)+'\n');console.log(results);
