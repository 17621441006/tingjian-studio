import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {COLLECTIONS,LIFE_ITEMS,emptyLifestyle,normalizeLifestyle,recommendLifestyle,toggleLifestyleItem,sceneActions,lifestyleSummaryHTML} from '../src/legacy/lifestyle-data.mjs';
import {buildWholeGeometry,disposeWholeGeometry} from '../src/legacy/whole-model-geometry.mjs';
import {buildDetailedHome} from '../src/legacy/whole-model-detailed.mjs';
import {assembleHome} from '../src/legacy/scene-options.mjs';
let modelCases=0;
for(const [n,design] of ['dusk','chinese','plum-gallery'].entries()){
 let life=recommendLifestyle(emptyLifestyle(design));assert.equal(life.collection,COLLECTIONS[n].id);
 // Maximal valid per-room sets stress the new geometry; conflicts sanitize deterministically.
 for(const room of Object.keys(life.rooms))life.rooms[room]=LIFE_ITEMS.filter(i=>i.rooms.includes(room)).map(i=>i.id);
 life=normalizeLifestyle(life,design);assert(!life.rooms.living.includes('artwork'));assert(life.rooms.living.includes('art-tv'));
 const cleared=toggleLifestyleItem(life,'bath','mirror');assert(!cleared.rooms.bath.includes('mirror'));assert.deepEqual(cleared.rooms.living,life.rooms.living);assert(life.rooms.bath.includes('mirror'));
 for(const scene of ['home','night','away'])for(const build of [buildWholeGeometry,buildDetailedHome]){
  const snapshot={design,frames:assembleHome(design,new Map()),lifestyle:{...life,scene},signature:design+scene};const model=build(snapshot);
  for(const [room,ids] of Object.entries(life.rooms))for(const id of ids){if(id==='climate')continue;const obj=model.userData.objects.get('life-'+room+'-'+id);assert(obj,room+' '+id);assert(obj.children.length>0);}
  let meshCount=0;model.traverse(o=>{if(!o.isMesh)return;meshCount++;for(const v of o.geometry.attributes.position.array)assert(Number.isFinite(v));});assert(meshCount<1700);
  assert.equal(model.userData.objects.get('life-living-curtain').userData.openPercent,scene==='home'?70:scene==='away'?30:0);
  assert.equal(model.userData.objects.get('life-living-lighting').userData.brightness,scene==='home'?65:scene==='away'?0:8);
  assert.equal(model.userData.objects.get('living-tv').visible,false);disposeWholeGeometry(model);modelCases++;
 }
 const actions=sceneActions({...life,scene:'night'});assert(actions.some(a=>a.device==='照明'&&a.value.includes('8%')));assert(actions.every(a=>a.device!=='背景音'||a.value==='关闭'));
 const html=lifestyleSummaryHTML({...life,scene:'night'});assert(html.includes('夜起')&&html.includes('厨房')&&html.includes('未连接真实设备'));
}
const original=buildDetailedHome({design:'dusk',frames:assembleHome('dusk',new Map())});assert.equal([...original.userData.objects.keys()].filter(k=>k.startsWith('life-')).length,0);assert(original.userData.objects.get('living-tv').visible);disposeWholeGeometry(original);
for(const name of ['collector','oriental','nocturne']){
 const path='dist/lifestyle-v33/'+name+'.webp';
 const info=JSON.parse(execFileSync('ffprobe',['-v','error','-show_entries','stream=width,height','-of','json',path])).streams[0];assert.deepEqual([info.width,info.height],[1536,1024]);
 execFileSync('ffmpeg',['-v','error','-i',path,'-f','null','-'],{stdio:'pipe'});assert((await fs.stat(path)).size>10000);
}
const source=await fs.readFile('src/legacy/whole-export.mjs','utf8');assert(source.includes('lifestyleSummaryHTML(snapshot.lifestyle,escape)'));
console.log(JSON.stringify({passed:true,modelCases,checks:['Maximal selections produce finite independent objects in detailed and light models','Removing art TV restores baseline on rebuild; room choices are immutable and scoped','Scene values propagate to curtain and lighting geometry','Export includes styling, installation notes and simulated actions','Three concept images decode at native 1536 x 1024']}));
