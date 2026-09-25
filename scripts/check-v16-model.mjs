import fs from 'node:fs/promises';import assert from 'node:assert/strict';import * as THREE from 'three';
import {HOMES,ROOMS} from '../src/legacy/home-designs.mjs';import {assembleHome,resolveScene} from '../src/legacy/scene-options.mjs';import {buildDetailedHome} from '../src/legacy/whole-model-detailed.mjs';import {buildWholeGeometry,disposeWholeGeometry} from '../src/legacy/whole-model-geometry.mjs';
import {SCENE_OBJECTS,applyObjectVisibility} from '../src/legacy/scene-objects.mjs';
import {REFRESHED_ROOMS} from '../src/legacy/room-refresh.mjs';
const stats=[],errors=[],warn=console.warn;console.warn=(...x)=>errors.push(x.join(' '));
for(const design of Object.keys(HOMES)){
 const frames=assembleHome(design,new Map()),model=buildDetailedHome({design,frames,signature:design});assert.equal(model.userData.rooms.size,8);assert.equal(model.userData.quality,'detailed');assert.equal(model.userData.detailFeatures.length,8);
 let meshes=0,triangles=0;model.traverse(o=>{if(o.isMesh){meshes++;triangles+=(o.geometry.index?.count||o.geometry.attributes.position.count)/3;assert([...o.geometry.attributes.position.array].every(Number.isFinite));assert([...o.geometry.attributes.normal.array].every(Number.isFinite));}});
 const bounds=new THREE.Box3().setFromObject(model);assert(bounds.min.x>-.2&&bounds.max.x<10.8);assert(bounds.min.z>-.2&&bounds.max.z<7.3);assert(bounds.max.y<2.7);assert(triangles<160000&&meshes<200);
 for(const id of ['living-sofa','living-table','living-rug','master-bed','master-curtains','balcony-curtains','bath-wc','utility-laundry'])assert(model.userData.objects.has(id));
 if(Object.keys(HOMES).includes(design)){assert.equal(new Set(frames.map(f=>f.path)).size,8);for(const f of frames){assert((await fs.stat('dist'+f.path)).size>20000);assert((await fs.stat('dist'+f.thumb)).size>1000);}assert(model.userData.objects.get('utility-window').userData.clear);assert(model.userData.objects.get('utility-window').userData.upperOpening);assert(model.userData.objects.get('balcony-window').userData.clear);assert(model.userData.objects.get('living-tv').visible);assert.equal(model.userData.rooms.get('second').userData.plan,model.userData.spec.secondPlan);assert.equal(model.userData.rooms.get('balcony').userData.plan,model.userData.spec.balconyPlan);if(['dusk','chinese'].includes(design)){assert(model.userData.objects.has('second-daybed'));assert(model.userData.objects.has('balcony-bench'));}else assert(!model.userData.objects.has('balcony-bench'));}
 stats.push({design,meshes,triangles});disposeWholeGeometry(model);
}
for(const [sofa,floor,bed,bedding] of [['wine','oak','wood','olive'],['mink','smoked','leather','ivory']]){const saved=new Map([['dusk:living',resolveScene({design:'dusk',room:'living',pieces:{sofa,floor,table:'glass'}})],['dusk:master',resolveScene({design:'dusk',room:'master',pieces:{bed,bedding,window:'clear'},window:'clear'})]]);const model=buildDetailedHome({design:'dusk',frames:assembleHome('dusk',saved)}),o=model.userData.objects;assert.equal(o.get('living-sofa').userData.choice,sofa);assert.equal(o.get('living-floor').userData.floor,floor);assert.equal(o.get('dining-floor').userData.floor,floor);assert.equal(o.get('master-bed').userData.choice,bed);assert.equal(o.get('master-bed').userData.bedding,bedding);assert(o.get('master-window').userData.clear);disposeWholeGeometry(model);}
// All sixteen removable-item combinations exist from both fixed viewpoints.
for(let mask=0;mask<16;mask++){
 const removed=SCENE_OBJECTS.filter(o=>mask&o.bit).map(o=>o.id),saved=new Map(['living','dining'].map(room=>['copper:'+room,resolveScene({design:'copper',room,removed})]));
 const frames=assembleHome('copper',saved);for(const f of frames.filter(f=>['living','dining'].includes(f.id))){assert((await fs.stat('dist'+f.path)).size>20000);assert((await fs.stat('dist'+f.thumb)).size>1000);assert.deepEqual(f.scene.removed,removed);}
 for(const builder of [buildWholeGeometry,buildDetailedHome]){
  const model=builder({design:'copper',frames}),o=model.userData.objects;
  for(const [id,bit]of [['living-sofa',2],['living-rug',4],['entry-art',1],['living-wall-art',1],['living-media',8],['entry-storage',8]])assert.equal(o.get(id).visible,!(mask&bit),id+' mask '+mask);
  assert(o.get('living-tv').visible,'wall-mounted TV survives cabinet removal');assert(o.get('dining-table').visible);assert(o.get('living-table').visible);
  model.traverse(node=>{if(node.isMesh)assert([...node.geometry.attributes.position.array].every(Number.isFinite));});
  applyObjectVisibility(model,{removed:[]});for(const id of ['living-sofa','living-rug','entry-art','living-wall-art','living-media','entry-storage'])assert(o.get(id).visible);
  disposeWholeGeometry(model);
 }
}
for(const [design,rooms]of Object.entries(REFRESHED_ROOMS))for(const room of rooms){const frame=assembleHome(design,new Map()).find(f=>f.id===room);assert(frame.path.includes('/v16/'));}
for(const design of ['dusk','chinese']){const frames=assembleHome(design,new Map());for(const room of ['second','master'])assert(!frames.find(f=>f.id===room).path.includes('/v16/'));}
console.warn=warn;assert.deepEqual(errors,[]);
const assets=JSON.parse(await fs.readFile('verification/v16/assets.json','utf8'));assert(assets.length>=55);assert(assets.every(x=>x.width>=1536&&x.height>=1024));
const result={passed:true,method:'Actual Three.js geometry and material-state checks; UI tested separately; no browser/GPU frame-rate measurement',newNativeImages:assets.length,stats};await fs.writeFile('verification/v16/model-checks.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));
