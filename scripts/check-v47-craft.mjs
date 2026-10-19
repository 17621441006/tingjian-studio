import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {HOMES,ROOMS,homeAsset} from '../src/legacy/home-designs.mjs';
import {CRAFT_IDS,CRAFT_PLANS} from '../src/legacy/craft-homes.mjs';
import {livingReverseAsset} from '../src/legacy/wood-homes.mjs';
import {layoutsFor} from '../src/legacy/layout-options.mjs';
import {assembleHome,resolveScene,sceneAsset} from '../src/legacy/scene-options.mjs';
import {designerFrames} from '../src/legacy/designer-gallery.mjs';
import {floorRegions,floorMask} from '../src/legacy/photo-floor.mjs';
import {wholeModelSpec} from '../src/legacy/whole-model-state.mjs';
const hash=b=>createHash('sha256').update(b).digest('hex');
const baseline=JSON.parse(await fs.readFile('verification/v47/baseline.json','utf8'));
assert.deepEqual(Object.keys(HOMES),[...baseline.order,...CRAFT_IDS]);
for(const [id,digest] of Object.entries(baseline.unchangedHomes))assert.equal(hash(JSON.stringify(HOMES[id])),digest,'Existing scheme changed: '+id);
for(const [p,digest] of Object.entries(baseline.sourceHashes))assert.equal(hash(await fs.readFile(p)),digest,'Homepage or brand changed: '+p);
const assets=JSON.parse(await fs.readFile('verification/v47/assets.json','utf8'));
assert.equal(assets.length,36);const mainHashes=new Set();
for(const a of assets){const b=await fs.readFile(a.path);assert.equal(b.length,a.bytes,a.path);assert.equal(hash(b),a.sha256);assert(b.length>5000);assert.equal(b.toString('ascii',0,4),'RIFF');assert.equal(b.toString('ascii',8,12),'WEBP');assert.deepEqual([a.width,a.height],a.thumb?[480,320]:[1536,1024]);if(!a.thumb)mainHashes.add(a.sha256);}
assert.equal(mainHashes.size,18);
for(const id of CRAFT_IDS){
 assert.equal(Object.keys(HOMES[id].rooms).length,8);
 const frames=assembleHome(id,new Map());assert.equal(new Set(frames.map(f=>f.path)).size,8);
 for(const {id:room} of ROOMS){const s=resolveScene({design:id,room});assert.equal(sceneAsset(s),homeAsset(id,room));assert(homeAsset(id,room).startsWith('/designs-v47/'));for(const thumb of [false,true])await fs.access('dist'+homeAsset(id,room,thumb));assert.equal(layoutsFor(id,room)[0].copy,HOMES[id].rooms[room].copy);assert.equal(HOMES[id].rooms[room].materials.length,4);const mask=floorMask(1536,1024,floorRegions(s));assert(mask.some(Boolean));assert(mask.filter(Boolean).length<1536*1024*.3);}
 assert.equal(livingReverseAsset(id),'/designs-v47/schemes/'+id+'/living2.webp');await fs.access('dist'+livingReverseAsset(id));
 assert.deepEqual(designerFrames('final',id).map(f=>f.path),designerFrames('base',id).map(f=>f.path));
 const spec=wholeModelSpec({design:id,frames});assert(spec.palette.wall.startsWith('#f'));assert.deepEqual(spec.expansionPlans,CRAFT_PLANS[id]);assert.equal(spec.sofaTextile,id==='cashmere-hush');
}
const html=await fs.readFile('dist/tour/legacy.html','utf8');const ids=[...html.matchAll(/data-home-design="([^"]+)"/g)].map(x=>x[1]);assert.deepEqual(ids,Object.keys(HOMES));assert(html.includes('另 12 套'));assert(html.includes('鞍影织序')&&html.includes('绒光静邸'));
const offloaded=['tea-cuisine','moss-garden'],origin=JSON.parse(await fs.readFile('verification/v47/media-origin.json','utf8')).origin;
globalThis.__TINGJIAN_V38_ORIGIN__=origin;
for(const id of offloaded){assert(homeAsset(id,'living').startsWith(origin));assert(homeAsset(id,'living',true).startsWith('/designs-v38/'));assert(livingReverseAsset(id).startsWith(origin));}
for(const id of CRAFT_IDS)assert(homeAsset(id,'living').startsWith('/designs-v47/'));
delete globalThis.__TINGJIAN_V38_ORIGIN__;
const result={passed:true,schemes:22,added:CRAFT_IDS,existing20Unchanged:true,mainImages:18,thumbnails:18,roomsPerScheme:8,reverseLivingViews:2,homepageAndBrandingUnchanged:true,newImagesSameOrigin:true,independentLayoutPlans:true,browserVisualTested:false};
await fs.writeFile('verification/v47/checks.json',JSON.stringify(result,null,2)+'\n');console.log(result);
