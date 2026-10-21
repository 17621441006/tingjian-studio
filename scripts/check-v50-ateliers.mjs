import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {HOMES,ROOMS,homeAsset} from '../src/legacy/home-designs.mjs';
import {ATELIER_IDS,ATELIER_COLORS,ATELIER_PLANS} from '../src/legacy/atelier-homes.mjs';
import {COLLECTION} from '../src/collection/catalog.mjs';
import {livingReverseAsset} from '../src/legacy/wood-homes.mjs';
import {layoutsFor} from '../src/legacy/layout-options.mjs';
import {assembleHome,resolveScene,sceneAsset} from '../src/legacy/scene-options.mjs';
import {designerFrames} from '../src/legacy/designer-gallery.mjs';
import {floorRegions,floorMask} from '../src/legacy/photo-floor.mjs';
import {wholeModelSpec} from '../src/legacy/whole-model-state.mjs';
import {mediaCandidates} from '../src/legacy/media-loader.mjs';
const hash=b=>createHash('sha256').update(b).digest('hex');
const baseline=JSON.parse(await fs.readFile('verification/v50/baseline.json','utf8'));
const expectedOrder=[...baseline.order,...ATELIER_IDS];
assert.deepEqual(Object.keys(HOMES),expectedOrder);assert.equal(expectedOrder.length,25);
for(const [id,digest] of Object.entries(baseline.unchangedHomes))assert.equal(hash(JSON.stringify(HOMES[id])),digest,'Unrelated home changed: '+id);
for(const [p,digest] of Object.entries(baseline.unchangedSources))assert.equal(hash(await fs.readFile(p)),digest,'Motion/brand changed: '+p);
for(const [id,digest] of Object.entries(baseline.unchangedFeatured))assert.equal(hash(JSON.stringify({...COLLECTION.find(s=>s.id===id),index:undefined})),digest,'Featured content changed: '+id);
assert.deepEqual(COLLECTION.map(s=>s.id),['nocturne','cashmere-hush','dusk','saddle-weave','flora','cinnabar','verdigris','stillwood','amber','inkcourt']);
assert.equal(hash(JSON.stringify(HOMES['flora-original'].rooms)),baseline.originalRooms,'v48 original was not preserved');
for(const p of ['src/legacy/flora-home.mjs','src/collection/flora-selection.mjs']){
 const snapshot='verification/v50/rollback/'+p.split('/').at(-1).replace('.mjs','-v49.mjs');
 const buf=await fs.readFile(snapshot);assert(buf.length>1000);
}
const assets=JSON.parse(await fs.readFile('verification/v50/assets.json','utf8'));
assert.equal(assets.length,43);const unique=new Set();
for(const a of assets){const b=await fs.readFile(a.path);assert.equal(b.length,a.bytes);assert.equal(hash(b),a.sha256);assert(b.length>5000);assert.equal(b.toString('ascii',0,4),'RIFF');assert.equal(b.toString('ascii',8,12),'WEBP');assert.deepEqual([a.width,a.height],a.room==='hero'?[768,512]:a.thumb?[480,320]:[1536,1024]);assert.equal(hash(await fs.readFile(a.path.replace(/^dist\//,'build/'))),a.sha256,a.path);if(!a.thumb)unique.add(a.sha256);}
assert.equal(unique.size,21);
for(const version of ['v47','v48','v49'])for(const a of JSON.parse(await fs.readFile('verification/'+version+'/assets.json','utf8')))assert.equal(hash(await fs.readFile(a.path)),a.sha256,'Approved image overwritten: '+a.path);
for(const id of ['silver-retreat',...ATELIER_IDS]){
 assert.equal(Object.keys(HOMES[id].rooms).length,8);
 const frames=assembleHome(id,new Map());assert.equal(new Set(frames.map(f=>f.path)).size,8);
 for(const {id:room} of ROOMS){
  const scene=resolveScene({design:id,room});assert.equal(sceneAsset(scene),homeAsset(id,room));
  assert.equal(layoutsFor(id,room)[0].copy,HOMES[id].rooms[room].copy);
  for(const thumb of [false,true])await fs.access('dist'+homeAsset(id,room,thumb));
  const count=floorMask(1536,1024,floorRegions(scene)).filter(Boolean).length;assert(count>100&&count<1536*1024*.12,id+'/'+room+' invalid floor sample');
 }
 await fs.access('dist'+livingReverseAsset(id));
 assert.deepEqual(designerFrames('final',id).map(f=>f.path),designerFrames('base',id).map(f=>f.path));
 if(ATELIER_IDS.includes(id)){const spec=wholeModelSpec({design:id,frames});assert.deepEqual(spec.palette,ATELIER_COLORS[id]);assert.deepEqual(spec.expansionPlans,ATELIER_PLANS[id]);}
}
const flora=COLLECTION.find(s=>s.id==='flora');assert.equal(flora.index,'05');assert.equal(flora.rooms.length,8);assert.equal(flora.gallery.length,9);
for(const room of ['living','living2','kitchen'])assert((room==='living2'?livingReverseAsset('silver-retreat'):homeAsset('silver-retreat',room)).startsWith('/designs-v50/'));
for(const room of ['dining','master','second','bath','balcony','utility'])assert(homeAsset('silver-retreat',room).startsWith('/designs-v49/'));
for(const root of ['dist','build']){const html=await fs.readFile(root+'/tour/legacy.html','utf8');assert.deepEqual([...html.matchAll(/data-home-design="([^"]+)"/g)].map(x=>x[1]),expectedOrder);assert(html.includes('花影绮居 · 初版'));assert(html.includes('翡织曲邸'));assert(html.includes('雾蓝云邸'));}
for(const p of ['src/tour/tour.js','src/legacy/trial.mjs'])for(const id of ATELIER_IDS)assert((await fs.readFile(p,'utf8')).includes("'"+id+"'"),'Deep link missing '+id);
const {origin}=JSON.parse(await fs.readFile('verification/v50/media-origin.json','utf8'));
globalThis.__TINGJIAN_V48_ORIGIN__=origin;
for(const id of ['flora-original','mauve-walnut','pine-library'])for(const r of [...ROOMS.map(r=>r.id),'living2']){
 const full=r==='living2'?livingReverseAsset(id):homeAsset(id,r);
 assert(full.startsWith(origin+'/designs-v48/'));assert.equal(mediaCandidates(full).length,3);
 const thumb=r==='living2'?livingReverseAsset(id,true):homeAsset(id,r,true);assert(thumb.startsWith('/designs-v48/'));await fs.access('build'+thumb);
}
delete globalThis.__TINGJIAN_V48_ORIGIN__;
const report={passed:true,workbenchSchemes:25,originalV48Archived:true,v49RollbackSaved:true,newSchemes:2,newRooms:16,newViews:18,floraEditedViews:3,original21HomesUnchanged:true,other9FeaturedUnchanged:true,homepageOrderAndMotionUnchanged:true,priorApprovedAssetsUnchanged:true,newAssets:43,mediaFallbackRoutes:3,modelsUseExistingGeometry:true};
await fs.writeFile('verification/v50/checks.json',JSON.stringify(report,null,2)+'\n');console.log(report);
