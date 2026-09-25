import * as THREE from 'three';
import {makeRenderer,buildRoomScene,toBlob} from './room-renderer.mjs';
import {itemFor} from './room-state.mjs';
import {WALK_POINTS,START_LOOK,lookAfterDrag,direction,walkRoute,stepPose,footprint,segmentClear} from './walk-math.mjs';

// The same object slots persist at every viewpoint. Rendering is event-driven:
// no permanent orbit/RAF loop, no screenshots/toBlob while dragging, static shadows.
export async function createWalkViewer({canvas,layer,state,report=()=>{},onSelect=()=>{},onStatus=()=>{},onPose=()=>{},onError=()=>{}}){
 const renderer=makeRenderer(canvas),camera=new THREE.PerspectiveCamera(61.6,1.5,.045,40);
 let built,disposed=false,suspended=false,frame=0,settle=0,look={...START_LOOK},position=[...WALK_POINTS[0].p],at='start',motion=null,pointer=null,active='table',moving=false,job=0;
 const events=[],buttons=new Map(),ray=new THREE.Raycaster();
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 function listen(el,event,fn,options){el.addEventListener(event,fn,options);events.push(()=>el.removeEventListener(event,fn,options));}
 function cameraPose(){camera.position.set(...position);const d=direction(look);camera.lookAt(position[0]+d[0],position[1]+d[1],position[2]+d[2]);camera.fov=look.fov;camera.updateMatrixWorld();camera.updateProjectionMatrix();}
 function resolution(interactive=false){const w=Math.max(canvas.clientWidth,320),h=Math.max(canvas.clientHeight,213),dpr=Math.min(devicePixelRatio||1,interactive?1:1.65),scale=Math.min(dpr,1536/w,1024/h);const rw=Math.round(w*scale),rh=Math.round(h*scale);if(canvas.width!==rw||canvas.height!==rh)renderer.setSize(rw,rh,false);camera.aspect=w/h;camera.updateProjectionMatrix();}
 function queue(){if(!frame&&!disposed&&!suspended&&!document.hidden)frame=requestAnimationFrame(draw);}
 function interaction(){moving=true;clearTimeout(settle);settle=setTimeout(()=>{moving=false;queue();},160);queue();}
 function updateButtons(){
  for(const p of WALK_POINTS){const button=buttons.get(p.id),v=new THREE.Vector3(p.p[0],.016,p.p[2]).project(camera),distance=Math.hypot(position[0]-p.p[0],position[2]-p.p[2]);button.hidden=distance<.32||v.z>=1||v.z<=-1||Math.abs(v.x)>.91||Math.abs(v.y)>.92||!!motion;button.style.left=(v.x*.5+.5)*100+'%';button.style.top=(-v.y*.5+.5)*100+'%';}
 }
 function draw(now){frame=0;if(disposed||suspended||document.hidden||!built)return;
  if(motion){const u=(now-motion.start)/motion.duration;position=stepPose(motion.from,motion.to.p,u,look).position;if(u>=1){at=motion.to.id;position=[...motion.to.p];const next=motion.remaining.shift();if(next){motion={from:[...position],to:next,remaining:motion.remaining,start:now,duration:duration(position,next.p)};}else{motion=null;moving=false;onStatus('已到达'+WALK_POINTS.find(p=>p.id===at).name+'，朝向保持不变。拖动可环看。');}}}
  cameraPose();resolution(moving||!!motion||!!pointer);renderer.render(built.scene,camera);renderer.shadowMap.autoUpdate=false;updateButtons();onPose({position:[...position],...look,at});if(motion)queue();
 }
 function duration(a,b){return Math.max(360,Math.min(1300,Math.hypot(a[0]-b[0],a[2]-b[2])*520));}
 function boxes(){return ['table','sofa'].map(cat=>{const pose=built.state.objects[cat];const item=pose.item==='original-sofa'?itemFor('sofa-02'):itemFor(pose.item);return footprint(pose,item,cat);});}
 function walkTo(id){if(!built||disposed||id===at)return;const target=WALK_POINTS.find(p=>p.id===id);if(!target)return;
  // Finish from the current continuous position even if a second destination
  // is requested mid-step; the graph starts from the active segment endpoint.
  const from=motion?motion.to.id:at,route=walkRoute(from,id);if(motion)route.unshift(motion.to);if(!route.length)return;
  let last=position;for(const p of route){if(!segmentClear(last,p.p,boxes())){onStatus('这条通道被当前家具占用。请缩小或移开家具，或选择另一个圆圈。');return;}last=p.p;}
  if(reduced){position=[...target.p];at=id;motion=null;queue();return;}
  const next=route.shift();motion={from:[...position],to:next,remaining:route,start:performance.now(),duration:duration(position,next.p)};moving=true;onStatus('正在走向'+target.name+' · 保持朝向');queue();
 }
 function pick(clientX,clientY){if(!built)return null;const r=canvas.getBoundingClientRect();ray.setFromCamera(new THREE.Vector2((clientX-r.left)/r.width*2-1,-(clientY-r.top)/r.height*2+1),camera);const hits=ray.intersectObjects(Object.values(built.slots),true);for(const hit of hits){let o=hit.object;while(o){if(o.userData.category)return o.userData.category;o=o.parent;}}return null;}
 function pointDown(e){if(e.button!==0)return;pointer={x:e.clientX,y:e.clientY,look:{...look},id:e.pointerId,moved:false};canvas.setPointerCapture(e.pointerId);canvas.classList.add('is-dragging');}
 function pointMove(e){if(!pointer||e.pointerId!==pointer.id)return;const dx=e.clientX-pointer.x,dy=e.clientY-pointer.y;pointer.moved=pointer.moved||Math.hypot(dx,dy)>4;look=lookAfterDrag(pointer.look,dx,dy,canvas.clientWidth);interaction();}
 function pointUp(e){if(!pointer)return;const old=pointer;pointer=null;canvas.classList.remove('is-dragging');if(e.type==='pointerup'&&!old.moved){const cat=pick(e.clientX,e.clientY);if(cat)onSelect(cat);}try{canvas.releasePointerCapture(e.pointerId);}catch{}interaction();}
 try{
  built=await buildRoomScene(state,renderer,report,{walk:true});renderer.shadowMap.needsUpdate=true;
  layer.replaceChildren();for(const p of WALK_POINTS){const b=document.createElement('button');b.className='atelier-walk-point';b.type='button';b.dataset.walkPoint=p.id;b.setAttribute('aria-label','保持朝向走到'+p.name);const ring=document.createElement('i'),label=document.createElement('span');label.textContent=p.name;b.append(ring,label);b.addEventListener('click',e=>{e.stopPropagation();walkTo(p.id);});layer.append(b);buttons.set(p.id,b);}
  listen(canvas,'pointerdown',pointDown);listen(canvas,'pointermove',pointMove);listen(canvas,'pointerup',pointUp);listen(canvas,'pointercancel',pointUp);
  listen(canvas,'wheel',e=>{e.preventDefault();look.fov=Math.max(42,Math.min(66,look.fov+e.deltaY*.025));interaction();},{passive:false});
  listen(canvas,'keydown',e=>{if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home'].includes(e.key))return;e.preventDefault();if(e.key==='Home')look={...START_LOOK};else if(e.key==='ArrowLeft')look.yaw-=.07;else if(e.key==='ArrowRight')look.yaw+=.07;else if(e.key==='ArrowUp')look.pitch=Math.min(1.22,look.pitch+.06);else look.pitch=Math.max(-1.22,look.pitch-.06);queue();});
  listen(canvas,'webglcontextlost',e=>{e.preventDefault();suspended=true;onError(new Error('显卡上下文中断，请返回定点效果后重新进入漫游'));});
  const resize=new ResizeObserver(()=>queue());resize.observe(canvas);
  listen(document,'visibilitychange',()=>{if(document.hidden){if(frame)cancelAnimationFrame(frame);frame=0;}else queue();});
  const visibility=new IntersectionObserver(entries=>{suspended=!entries[0].isIntersecting;if(!suspended)queue();});visibility.observe(canvas);
  async function update(next,isCurrent=()=>true){const token=++job;report({label:'同步独立物件…'});const fresh=await buildRoomScene(next,renderer,report,{walk:true});if(disposed||token!==job||!isCurrent()){fresh.dispose();return;}const old=built;built=fresh;old.dispose();renderer.shadowMap.autoUpdate=true;renderer.shadowMap.needsUpdate=true;queue();}
  function dispose(){if(disposed)return;disposed=true;job++;clearTimeout(settle);if(frame)cancelAnimationFrame(frame);events.forEach(fn=>fn());resize.disconnect();visibility.disconnect();built?.dispose();renderer.dispose();renderer.forceContextLoss();layer.replaceChildren();}
  queue();return {update,dispose,walkTo,pick,reset(){at='start';position=[...WALK_POINTS[0].p];motion=null;look={...START_LOOK};queue();},select(cat){active=cat;},getPose(){return {position:[...position],...look,at};},async save(){cameraPose();resolution(false);renderer.render(built.scene,camera);return toBlob(canvas);},suspend(value){suspended=value;if(!value)queue();}};
 }catch(e){built?.dispose();renderer.dispose();renderer.forceContextLoss();throw e;}
}
