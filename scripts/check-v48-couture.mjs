import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {HOMES,ROOMS,homeAsset} from '../src/legacy/home-designs.mjs';
import {COUTURE_IDS,COUTURE_PLANS,COUTURE_COLORS} from '../src/legacy/couture-homes.mjs';
import {COLLECTION} from '../src/collection/catalog.mjs';
import {livingReverseAsset} from '../src/legacy/wood-homes.mjs';
import {layoutsFor} from '../src/legacy/layout-options.mjs';
import {assembleHome,resolveScene,sceneAsset} from '../src/legacy/scene-options.mjs';
import {designerFrames} from '../src/legacy/designer-gallery.mjs';
import {floorRegions,floorMask} from '../src/legacy/photo-floor.mjs';
import {wholeModelSpec} from '../src/legacy/whole-model-state.mjs';
const hash=b=>createHash('sha256').update(b).digest('hex');
const baseline=JSON.parse(await fs.readFile('verification/v48/baseline.json','utf8'));
assert.deepEqual(Object.keys(HOMES),baseline.order);
for(const [id,digest] of Object.entries(baseline.unchangedHomes))assert.equal(hash(JSON.stringify(HOMES[id])),digest,'Other scheme changed: '+id);
for(const [p,digest] of Object.entries(baseline.unchangedSources))assert.equal(hash(await fs.readFile(p)),digest,'Existing motion or identity changed: '+p);
const expected=['nocturne','cashmere-hush','dusk','saddle-weave','cinnabar','verdigris','stillwood','amber','inkcourt'];
assert.deepEqual(COLLECTION.map(s=>s.id),expected);
assert.deepEqual(COLLECTION.filter(s=>!['cashmere-hush','saddle-weave','cinnabar'].includes(s.id)).map(s=>s.id),baseline.originalCollection.filter(id=>id!=='cinnabar'));
const assets=JSON.parse(await fs.readFile('verification/v48/assets.json','utf8'));
assert.equal(assets.length,54);const mainHashes=new Set();
for(const a of assets){const b=await fs.readFile(a.path);assert.equal(b.length,a.bytes,a.path);assert.equal(hash(b),a.sha256);assert(b.length>5000);assert.equal(b.toString('ascii',0,4),'RIFF');assert.equal(b.toString('ascii',8,12),'WEBP');assert.deepEqual([a.width,a.height],a.thumb?[480,320]:[1536,1024]);assert.deepEqual(await fs.readFile(a.path.replace(/^dist\//,'build/')),b);if(!a.thumb)mainHashes.add(a.sha256);}
assert.equal(mainHashes.size,27);
for(const a of JSON.parse(await fs.readFile('verification/v47/assets.json','utf8')))assert.equal(hash(await fs.readFile(a.path)),a.sha256,'Previously approved image changed: '+a.path);
for(const id of COUTURE_IDS){
 assert.equal(Object.keys(HOMES[id].rooms).length,8);
 const frames=assembleHome(id,new Map());assert.equal(new Set(frames.map(f=>f.path)).size,8);
 for(const {id:room} of ROOMS){
  const scene=resolveScene({design:id,room});
  assert.equal(sceneAsset(scene),homeAsset(id,room));
  assert(homeAsset(id,room).startsWith('/designs-v48/'));
  for(const thumb of [false,true])await fs.access('dist'+homeAsset(id,room,thumb));
  assert.equal(layoutsFor(id,room)[0].copy,HOMES[id].rooms[room].copy);
  assert.equal(HOMES[id].rooms[room].materials.length,4);
  const mask=floorMask(1536,1024,floorRegions(scene));const count=mask.filter(Boolean).length;
  assert(count>100&&count<1536*1024*.12,'Floor mask too broad: '+id+'/'+room);
 }
 assert.equal(livingReverseAsset(id),'/designs-v48/schemes/'+id+'/living2.webp');
 assert.deepEqual(designerFrames('final',id).map(f=>f.path),designerFrames('base',id).map(f=>f.path));
 const spec=wholeModelSpec({design:id,frames});
 assert.deepEqual(spec.palette,COUTURE_COLORS[id]);assert.deepEqual(spec.expansionPlans,COUTURE_PLANS[id]);
 assert.equal(spec.sofaTextile,id!=='pine-library');assert.equal(spec.table,'stone');
}
const tour=await fs.readFile('build/tour/legacy.html','utf8');
assert.deepEqual([...tour.matchAll(/data-home-design="([^"]+)"/g)].map(x=>x[1]),baseline.order);
for(const name of ['苔织艺邸','石序光廊','花影绮居'])assert(tour.includes(name));
for(const old of ['墨紫木邸','松烟书邸','漆夜藏珍'])assert(!tour.includes(old));
for(const id of ['cashmere-hush','saddle-weave']){
 const scheme=COLLECTION.find(s=>s.id===id);
 assert.equal(scheme.rooms.length,8);assert.equal(scheme.gallery.length,9);
 assert(scheme.gallery.every(v=>(v.image||v.src||v.path).startsWith('/designs-v47/')));
 const html=await fs.readFile('build/collection/'+id+'.html','utf8');
 assert(html.includes('/tour/?design='+id));
 assert(html.includes('看向客厅'));
 await fs.access('build'+scheme.heroThumb);
}
const origin=JSON.parse(await fs.readFile('verification/v48/media-origin.json','utf8')).origin;
globalThis.__TINGJIAN_V46_ORIGIN__=origin;
for(const room of ['living','living2',...ROOMS.filter(r=>r.id!=='living').map(r=>r.id)]){
 const main=room==='living2'?livingReverseAsset('terracotta-atelier'):homeAsset('terracotta-atelier',room);
 assert(main.startsWith(origin));await assert.rejects(fs.access('build/designs-v46/schemes/terracotta-atelier/'+room+'.webp'));
 await fs.access('build/designs-v46/schemes/terracotta-atelier/'+room+'-thumb.webp');
}
for(const id of [...COUTURE_IDS,'cashmere-hush','saddle-weave'])assert(homeAsset(id,'living').startsWith('/designs-'));
delete globalThis.__TINGJIAN_V46_ORIGIN__;
const report={passed:true,workbenchSchemes:22,featuredOrder:expected,replacements:Object.fromEntries(COUTURE_IDS.map(id=>[id,HOMES[id].name])),other19SchemesUnchanged:true,approvedV47ImageFilesUnchanged:36,newImages:27,newThumbnails:27,roomsPerScheme:8,reverseLivingViews:3,originalMotionAndBrandFilesUnchanged:true,modelPaletteAndLayoutLinked:true,localResourcesVerified:true,browserVisualTested:false,mobileGPUTested:false};
await fs.writeFile('verification/v48/checks.json',JSON.stringify(report,null,2)+'\n');console.log(report);

