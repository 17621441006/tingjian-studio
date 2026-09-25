import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import {Color} from 'three';
import {FLOOR_CATALOG,normalizeFloorProduct} from '../src/legacy/floor-catalog.mjs';
import {assembleHome,resolveScene} from '../src/legacy/scene-options.mjs';
import {buildWholeGeometry,disposeWholeGeometry} from '../src/legacy/whole-model-geometry.mjs';
import {buildDetailedHome} from '../src/legacy/whole-model-detailed.mjs';
import {openImageDialog} from '../src/legacy/dialog-view.mjs';
assert.equal(FLOOR_CATALOG.filter(x=>x.category==='wood').length,5);
assert.equal(FLOOR_CATALOG.filter(x=>x.category==='tile').length,5);
assert.equal(new Set(FLOOR_CATALOG.map(x=>x.brand)).size,10);
for(const item of FLOOR_CATALOG){
 for(const path of [item.image,item.thumb])assert((await fs.stat('dist'+path)).size>1000);
 const saved=new Map([['dusk:living',resolveScene({design:'dusk',room:'living',floorProduct:item.id})],['dusk:second',resolveScene({design:'dusk',room:'second',floorProduct:item.id})]]);
 for(const builder of [buildWholeGeometry,buildDetailedHome]){
  const model=builder({design:'dusk',frames:assembleHome('dusk',saved)});
  for(const id of ['living','second']){const mesh=model.userData.objects.get(id+'-floor');assert.equal(mesh.userData.floorProduct,item.id);assert(mesh.material.color.equals(new Color(item.color)));}
  assert.equal(model.userData.objects.get('master-floor').userData.floorProduct,null);
  disposeWholeGeometry(model);
 }
}
assert.equal(normalizeFloorProduct('unknown'),null);
assert.equal(resolveScene({room:'bath',floorProduct:'listone-walnut'}).floorProduct,null);
// Exercise real fullscreen and unsupported/rejected fullscreen fallback without a browser.
class Events {listeners={};addEventListener(k,f){(this.listeners[k]??=[]).push(f)}removeEventListener(k,f){this.listeners[k]=(this.listeners[k]||[]).filter(x=>x!==f)}emit(k){for(const f of this.listeners[k]||[])f()}}
for(const mode of ['allowed','rejected','unavailable']){
 const doc=new Events(),host=new Events(),dialog=new Events();let exits=0;
 Object.assign(host,{innerHeight:900,document:doc});Object.assign(doc,{fullscreenEnabled:mode!=='unavailable',documentElement:{requestFullscreen:async()=>{if(mode==='rejected')throw Error('denied');doc.fullscreenElement=doc.documentElement;}},exitFullscreen:async()=>{exits++;doc.fullscreenElement=null;doc.emit('fullscreenchange');}});
 Object.assign(dialog,{style:{},classList:{toggle(){}},showModal(){this.open=true},close(){this.open=false;this.emit('close')}});
 await openImageDialog(dialog,host,{fullscreen:true});assert(dialog.open);assert.equal(dialog.style.height,'900px');dialog.close();assert.equal(exits,mode==='allowed'?1:0);
}
await fs.mkdir('verification/v17',{recursive:true});await fs.writeFile('verification/v17/floors-checks.json',JSON.stringify({passed:true,products:10,brands:10,actualThreeBuilders:2,fullscreen:['allowed','rejected','unavailable'],method:'Asset existence, official catalog records, actual Three.js material and state checks; DOM fullscreen boundary tested, not GPU/browser QA'},null,2));
console.log('10 floor candidates validated in both 3D builders; fullscreen and graceful fallback passed.');
