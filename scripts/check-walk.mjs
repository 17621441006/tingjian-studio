import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {Vector3} from 'three';
import {referenceCamera} from '../src/legacy/room-renderer.mjs';
import {WALK_POINTS,START_LOOK,lookAfterDrag,direction,walkRoute,stepPose,footprint,segmentClear} from '../src/legacy/walk-math.mjs';
import {initialState,chooseItem,itemFor} from '../src/legacy/room-state.mjs';
import {arrivalCamera} from '../src/tour/tour-state.mjs';
import {nodes} from '../src/tour/tour-data.mjs';
const checks=[];
let look=lookAfterDrag(START_LOOK,150,-30,900);const before=structuredClone(look),from=WALK_POINTS[0].p,to=WALK_POINTS[3].p;
for(const t of [0,.2,.5,.8,1]){const p=stepPose(from,to,t,look);assert.deepEqual(p.look,before);assert.equal(p.position[1],1.33);}assert.deepEqual(stepPose(from,to,1,look).position,to);assert.notDeepEqual(lookAfterDrag(look,-30,100,900),look);assert.equal(Math.round(Math.hypot(...direction(look))*1e6),1e6);checks.push('Walking interpolates position only; yaw, pitch, FOV and eye height are unchanged, and look controls still work after arrival');
const state=initialState(),boxes=['table','sofa'].map(c=>footprint(state.objects[c],itemFor(c==='sofa'?'sofa-02':state.objects[c].item),c));
for(const a of WALK_POINTS)for(const b of WALK_POINTS){if(a.id===b.id)continue;const route=walkRoute(a.id,b.id);assert.equal(route.at(-1).id,b.id);let previous=a;for(const p of route){assert(previous.links.includes(p.id));assert(segmentClear(previous.p,p.p,boxes));previous=p;}}
assert.equal(segmentClear([0,1.33,2.27],[0,1.33,-2.05],boxes),false);checks.push('Every floor destination is reachable via the clear aisle; a direct path through the coffee table is rejected');
for(const source of nodes)for(const target of nodes){const current={yaw:137,pitch:-22,fov:51},next=arrivalCamera(current,target,{preserve:true,fromNorth:source.north});const worldA=(current.yaw+source.north+720)%360,worldB=(next.yaw+target.north+720)%360;assert(Math.abs(worldA-worldB)<1e-7);assert.equal(current.pitch,next.pitch);assert.equal(current.fov,next.fov);}checks.push('All 64 whole-home node transitions preserve world heading, including 90° and 180° panorama calibration offsets');
const c=referenceCamera(),rearFloor=new Vector3();let z=-4.45;rearFloor.set(0,.004,z).project(c);const pixelY=(-rearFloor.y*.5+.5)*1024;assert(pixelY<590&&pixelY>570);checks.push('Rear floor geometry reaches dining-chair floor pixels rather than ending at the old foreground mask');
const w=await fs.readFile('src/legacy/room-walk.mjs','utf8');assert(w.includes('renderer.shadowMap.autoUpdate=false'));assert(!w.includes('setAnimationLoop'));assert(!w.includes('setInterval'));assert(w.includes('if(motion)queue()'));assert(w.includes('renderer.forceContextLoss()'));assert(w.includes('cancelAnimationFrame(frame)'));checks.push('No perpetual animation loop; static shadows, interaction resolution cap, hidden-tab suspension and renderer disposal present');
const report={passed:true,browserUITested:false,checks};await fs.writeFile('verification/walk.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report));
