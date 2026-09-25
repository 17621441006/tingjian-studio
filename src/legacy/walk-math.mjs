// Positions are metres in the calibrated living-room frame. Edges follow the
// clear aisle; stepping never changes yaw/pitch/fov or cuts through the table.
export const WALK_POINTS=[
 {id:'start',name:'客厅起点',p:[0,1.33,2.27],links:['window','aisle','sofa-front']},
 {id:'window',name:'窗边',p:[0,1.33,3.05],links:['start']},
 {id:'sofa-front',name:'沙发前',p:[.66,1.33,1.35],links:['start']},
 {id:'aisle',name:'客厅通道',p:[-1.18,1.33,.70],links:['start','dining-aisle']},
 {id:'dining-aisle',name:'餐厅通道',p:[-1.18,1.33,-1.60],links:['aisle','dining']},
 {id:'dining',name:'餐桌前',p:[-.10,1.33,-2.05],links:['dining-aisle']}
];
export const START_LOOK={yaw:0,pitch:-Math.atan(.266/2.27),fov:61.6};
export function lookAfterDrag(start,dx,dy,width){const sensitivity=1.3/Math.max(width,1);return {...start,yaw:start.yaw-dx*sensitivity,pitch:Math.max(-1.22,Math.min(1.22,start.pitch+dy*sensitivity))};}
export function direction(look){return [Math.sin(look.yaw)*Math.cos(look.pitch),Math.sin(look.pitch),-Math.cos(look.yaw)*Math.cos(look.pitch)];}
export function walkRoute(from,to){if(from===to)return [];const queue=[[from]],seen=new Set([from]);while(queue.length){const path=queue.shift(),at=WALK_POINTS.find(p=>p.id===path.at(-1));if(!at)break;for(const id of at.links){if(seen.has(id))continue;const next=[...path,id];if(id===to)return next.slice(1).map(x=>WALK_POINTS.find(p=>p.id===x));seen.add(id);queue.push(next);}}return [];}
export function stepPose(from,to,t,look){const u=Math.max(0,Math.min(1,t)),k=u*u*(3-2*u);return {position:from.map((x,i)=>x+(to[i]-x)*k),look:{...look}};}
export function footprint(state,item,category){if(category==='floor'||category==='rug'||state.item==='none')return null;const d=item?.dimensions|| (category==='sofa'?[234,88,86]:[67,112,42]);const scale=item?.dimensions?state.length/d[0]:1,rot=((item?.rotation||0)+state.angle)*Math.PI/180;return {x:category==='sofa'?1.52+state.offset/100:-.035+state.offset/100,z:category==='sofa'?-.50:-.20,hx:(Math.abs(Math.cos(rot))*d[0]+Math.abs(Math.sin(rot))*d[1])*scale/200,hz:(Math.abs(Math.sin(rot))*d[0]+Math.abs(Math.cos(rot))*d[1])*scale/200};}
export function segmentClear(a,b,boxes){for(let i=1;i<=24;i++){const t=i/24,x=a[0]+(b[0]-a[0])*t,z=a[2]+(b[2]-a[2])*t;for(const box of boxes)if(box&&Math.abs(x-box.x)<box.hx+.12&&Math.abs(z-box.z)<box.hz+.12)return false;}return true;}
