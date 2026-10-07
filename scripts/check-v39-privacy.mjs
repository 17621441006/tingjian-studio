import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {HOMES,ROOMS} from '../src/legacy/home-designs.mjs';
import {assembleHome} from '../src/legacy/scene-options.mjs';
import {finalRoomNote} from '../src/legacy/final-assets.mjs';
import {buildWholeGeometry,disposeWholeGeometry} from '../src/legacy/whole-model-geometry.mjs';
import {buildDetailedHome} from '../src/legacy/whole-model-detailed.mjs';
import {privateRoomView,isolatePrivateRoom} from '../src/legacy/privacy-display.mjs';

const privateText=/(?:\d+(?:\.\d+)?\s*(?:㎡|m²|平方米|sq\.?\s*m\b|sqm\b))|75\.10?\b|达安锦园|Da'an Jinyuan/i;
let scanned=0;
async function scan(dir){
 for(const e of await fs.readdir(dir,{withFileTypes:true})){
  const p=path.join(dir,e.name);
  if(e.isDirectory()){await scan(p);continue;}
  if(!/\.(html|js|mjs|json|md|txt)$/i.test(p))continue;
  const s=await fs.readFile(p,'utf8');assert(!privateText.test(s),p+' exposes a property area or name');
  assert(!s.includes('6fe2ce11b656bd7e.png'),p+' references the removed original plan');scanned++;
 }
}
await scan('dist');await scan('build');
const retired=JSON.parse(await fs.readFile('verification/v39/retired-private-assets.json','utf8'));
for(const f of retired.files){await assert.rejects(fs.access(f.path));await assert.rejects(fs.access(f.path.replace(/^dist\//,'build/')));}
assert.equal(Object.keys(HOMES).length,20);
for(const design of Object.keys(HOMES)){
 const frames=assembleHome(design,new Map());assert.equal(frames.length,8);
 for(const room of ROOMS){assert.equal(room.area,'');assert(!privateText.test(JSON.stringify(HOMES[design].rooms[room.id])));assert(!privateText.test(finalRoomNote(design,room.id)||''));}
 for(const build of [buildWholeGeometry,buildDetailedHome]){
  const model=build({design,frames});
  for(const selected of ROOMS.map(r=>r.id)){
   isolatePrivateRoom(model,selected);
   const expected=['living','dining'].includes(selected)?['living','dining']:[selected];
   assert.deepEqual([...model.userData.rooms].filter(([,g])=>g.visible).map(([id])=>id).sort(),expected.sort());
   assert(model.children.filter(c=>c.visible).every(c=>expected.includes(c.userData.room)),'whole foundation must stay hidden');
   assert.equal(privateRoomView('all',selected),selected);assert.equal(privateRoomView('top',selected),selected);
  }
  disposeWholeGeometry(model);
 }
}
const html=await fs.readFile('dist/tour/legacy.html','utf8');
assert(/data-current-model-home hidden disabled/.test(html));assert(/data-current-model-top hidden disabled/.test(html));
assert(!html.includes('class="designer-plan"'));assert(/data-home-area hidden/.test(html));
const report={passed:true,schemes:20,scannedPublicTextFiles:scanned,removedDirectAssets:retired.files.length,modelVariants:40,allRoomIsolationChecked:true,browserVisualTested:false,scope:'Current presentation and published assets only; existing Git history and caches are not rewritten.'};
await fs.writeFile('verification/v39/checks.json',JSON.stringify(report,null,2)+'\n');console.log(report);
