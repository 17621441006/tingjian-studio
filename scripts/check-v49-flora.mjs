import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {HOMES,ROOMS,homeAsset} from '../src/legacy/home-designs.mjs';
import {COUTURE_COLORS,COUTURE_PLANS} from '../src/legacy/couture-homes.mjs';
import {COLLECTION} from '../src/collection/catalog.mjs';
import {livingReverseAsset} from '../src/legacy/wood-homes.mjs';
import {layoutsFor} from '../src/legacy/layout-options.mjs';
import {assembleHome,resolveScene,sceneAsset} from '../src/legacy/scene-options.mjs';
import {designerFrames} from '../src/legacy/designer-gallery.mjs';
import {floorRegions,floorMask} from '../src/legacy/photo-floor.mjs';
import {wholeModelSpec} from '../src/legacy/whole-model-state.mjs';

const hash=b=>createHash('sha256').update(b).digest('hex');
const baseline=JSON.parse(await fs.readFile('verification/v49/baseline.json','utf8'));
assert.deepEqual(Object.keys(HOMES),baseline.order);
for(const [id,digest] of Object.entries(baseline.unchangedHomes))assert.equal(hash(JSON.stringify(HOMES[id])),digest,'Other home changed: '+id);
for(const [p,digest] of Object.entries(baseline.unchangedSources))assert.equal(hash(await fs.readFile(p)),digest,'Existing motion or identity changed: '+p);
for(const [id,digest] of Object.entries(baseline.unchangedFeatured))assert.equal(hash(JSON.stringify({...COLLECTION.find(s=>s.id===id),index:undefined})),digest,'Existing featured scheme changed: '+id);
const expected=['nocturne','cashmere-hush','dusk','saddle-weave','flora','cinnabar','verdigris','stillwood','amber','inkcourt'];
assert.deepEqual(COLLECTION.map(s=>s.id),expected);
assert.deepEqual(COLLECTION.filter(s=>s.id!=='flora').map(s=>s.id),baseline.originalCollection);
const assets=JSON.parse(await fs.readFile('verification/v49/assets.json','utf8'));
assert.equal(assets.length,19);
const mainHashes=new Set();
for(const a of assets){
 const b=await fs.readFile(a.path);assert.equal(b.length,a.bytes,a.path);assert.equal(hash(b),a.sha256);assert(b.length>5000);
 assert.equal(b.toString('ascii',0,4),'RIFF');assert.equal(b.toString('ascii',8,12),'WEBP');
 assert.deepEqual([a.width,a.height],a.room==='hero'?[768,512]:a.thumb?[480,320]:[1536,1024]);
 assert.deepEqual(await fs.readFile(a.path.replace(/^dist\//,'build/')),b);
 if(!a.thumb)mainHashes.add(a.sha256);
}
assert.equal(mainHashes.size,9);
for(const version of ['v47','v48'])for(const a of JSON.parse(await fs.readFile('verification/'+version+'/assets.json','utf8')))assert.equal(hash(await fs.readFile(a.path)),a.sha256,'Previously approved image changed: '+a.path);
const id='silver-retreat';
assert.equal(Object.keys(HOMES[id].rooms).length,8);
const frames=assembleHome(id,new Map());assert.equal(new Set(frames.map(f=>f.path)).size,8);
for(const {id:room} of ROOMS){
 const scene=resolveScene({design:id,room});
 assert.equal(sceneAsset(scene),homeAsset(id,room));assert(homeAsset(id,room).startsWith('/designs-v49/'));
 for(const thumb of [false,true])await fs.access('build'+homeAsset(id,room,thumb));
 assert.equal(layoutsFor(id,room)[0].copy,HOMES[id].rooms[room].copy);
 const mask=floorMask(1536,1024,floorRegions(scene));const count=mask.filter(Boolean).length;
 assert(count>100&&count<1536*1024*.12,'Floor mask too broad: '+room);
}
assert.equal(livingReverseAsset(id),'/designs-v49/schemes/silver-retreat/living2.webp');
await fs.access('build'+livingReverseAsset(id));
assert.deepEqual(designerFrames('final',id).map(f=>f.path),designerFrames('base',id).map(f=>f.path));
const spec=wholeModelSpec({design:id,frames});
assert.deepEqual(spec.palette,COUTURE_COLORS[id]);assert.deepEqual(spec.expansionPlans,COUTURE_PLANS[id]);
const flora=COLLECTION.find(s=>s.id==='flora');
assert.equal(flora.rooms.length,8);assert.equal(flora.gallery.length,9);assert.equal(flora.index,'05');assert.equal(flora.workbench,'/tour/?design=silver-retreat');
assert(flora.gallery.every(v=>v.image.startsWith('/designs-v49/')));
for(const root of ['dist','build']){
 const html=await fs.readFile(root+'/collection/flora.html','utf8');
 assert(html.includes('/tour/?design=silver-retreat'));assert(html.includes('看向客厅'));assert(html.includes('玉兰浅浮雕'));assert(html.includes('THE COLLECTION / 10'));
 const tour=await fs.readFile(root+'/tour/legacy.html','utf8');
 assert.deepEqual([...tour.matchAll(/data-home-design="([^"]+)"/g)].map(x=>x[1]),baseline.order);
 assert(tour.includes('花影绮居'));assert(tour.includes('花影浅浮雕 · 编织 · 釉陶'));
}
for(const p of ['src/tour/tour.js','src/legacy/trial.mjs'])assert((await fs.readFile(p,'utf8')).includes("'silver-retreat'"),'Deep link missing from '+p);
await assert.rejects(fs.access('build/designs-v48/schemes/silver-retreat/living.webp'));
const report={passed:true,workbenchSchemes:22,featuredOrder:expected,other21HomesUnchanged:true,original9FeaturedContentUnchanged:true,originalMotionAndBrandFilesUnchanged:true,newRoomImages:9,newThumbnails:9,newHeroPreview:1,prior90ApprovedImageFilesUnchanged:true,rooms:8,reverseLivingView:true,workbenchDeepLink:true,originalModelPaletteAndPlans:true,browserVisualTested:false,mobileGPUTested:false};
await fs.writeFile('verification/v49/checks.json',JSON.stringify(report,null,2)+'\n');console.log(report);
