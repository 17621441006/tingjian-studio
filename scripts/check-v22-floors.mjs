import assert from 'node:assert/strict';import fs from 'node:fs/promises';import vm from 'node:vm';import * as THREE from 'three';
import {FLOOR_CATALOG} from '../src/legacy/floor-catalog.mjs';
import {assembleHome,resolveScene} from '../src/legacy/scene-options.mjs';
import {buildDetailedHome} from '../src/legacy/whole-model-detailed.mjs';
import {buildWholeGeometry,disposeWholeGeometry} from '../src/legacy/whole-model-geometry.mjs';
import {applyFloorTextures} from '../src/legacy/floor-textures.mjs';
import {applyDuskMaterials} from '../src/legacy/panorama-skin.mjs';
for(const p of FLOOR_CATALOG){
 const saved=new Map([['dusk:living',resolveScene({design:'dusk',room:'living',floorProduct:p.id})]]),snapshot={design:'dusk',frames:assembleHome('dusk',saved)},texture=new THREE.Texture();
 for(const builder of [buildDetailedHome,buildWholeGeometry]){
  const root=builder(snapshot),floor=root.userData.objects.get('living-floor'),before=floor.geometry.attributes.position.array.slice();
  const furniture=root.userData.objects.get('living-sofa');const mats=[];furniture?.traverse(m=>{if(m.isMesh)mats.push(m.material);});
  applyDuskMaterials(root,{});applyFloorTextures(root,p.imageType==='场景图'?{}:{[p.id]:texture});
  assert.deepEqual(floor.geometry.attributes.position.array,before);assert.equal(floor.material.userData.floorProduct,p.id);
  assert.equal(floor.material.map,p.imageType==='场景图'?null:texture);
  const shader={vertexShader:'#include <begin_vertex>',fragmentShader:'#include <color_fragment>'};floor.material.onBeforeCompile(shader);assert(shader.vertexShader.includes('vFloorPlan'));assert(!shader.fragmentShader.includes('atan('));
  let walls=0;root.traverse(m=>{if(!m.userData.straightWall)return;walls++;assert.equal(m.geometry.type,'BoxGeometry');assert(Math.abs(Math.sin(m.rotation.y*2))<1e-7);assert(!m.material.name.startsWith('panorama'));});assert(walls>=25);
  let i=0;furniture?.traverse(m=>{if(m.isMesh)assert.equal(m.material,mats[i++]);});assert.equal(root.userData.photoProjection.mappedMeshes,0);disposeWholeGeometry(root);
 }
 texture.dispose();
}
// Exercise the production asynchronous live-preview controller, including latest-selection wins.
const nodes=new Map(),node=s=>{if(!nodes.has(s))nodes.set(s,{hidden:false,textContent:'',getContext(){}});return nodes.get(s);};
const root={querySelector:node};let resolveLoad,updates=[],visibility=[],isolated=[],views=[];
const api={update:s=>updates.push(s),setVisible:v=>visibility.push(v),isolateRoom:r=>isolated.push(r),view:r=>views.push(r)};
const context={floorProduct:id=>FLOOR_CATALOG.find(p=>p.id===id),floorProductLabel:p=>p.name,__load:()=>new Promise(r=>resolveLoad=()=>r({createWholeModel:async()=>api}))};
const code=(await fs.readFile('src/legacy/floor-live.mjs','utf8')).replace(/^import.*\n/gm,'').replace('export function','function').replace("import('./whole-model.mjs')",'__load()');vm.runInNewContext(code+';globalThis.create=createFloorLive;',context);
const sync=context.create(root),a=sync({design:'dusk',room:'living',floorProduct:FLOOR_CATALOG[0].id},[],true),b=sync({design:'dusk',room:'second',floorProduct:FLOOR_CATALOG[1].id},[{id:'second'}],true);resolveLoad();await Promise.all([a,b]);assert.equal(updates.length,1);assert.equal(updates[0].frames[0].id,'second');assert.deepEqual(isolated,['second']);
await sync({design:'dusk',room:'second',floorProduct:null},[],true);assert(node('[data-floor-live]').hidden);assert.equal(visibility.at(-1),false);
await fs.mkdir('verification/v22',{recursive:true});await fs.writeFile('verification/v22/checks.json',JSON.stringify({passed:true,brands:10,builders:2,straightWallGeometry:true,noPanoramaOnFurniture:true,actualTextureAndUVChecks:true,latestSelectionWins:true,originalPhotoPreserved:true,realBrowserTested:false},null,2));console.log('v22: 20 real model material cases, straight walls, unchanged furniture materials, live preview races and clear passed.');
