import {offlineHtml} from './offline.mjs';
import * as THREE from 'three';

const data=JSON.parse(document.getElementById('vr-data').textContent);
const $=s=>document.querySelector(s),stage=$('[data-stage]'),canvas=$('[data-canvas]');
const rooms=data.rooms,cache=new Map(),pending=new Map(),pointers=new Map();
let renderer,scene,camera,sphere,active=null,requested=null,serial=0,lon=0,lat=0,fov=75,comparing=false,frame=0,disposed=false,exporting=false,pinch=null;
const status=text=>{$('[data-status]').textContent=text;};
const roomById=id=>rooms.find(r=>r.id===id);
const safeId=id=>roomById(id)?id:rooms[0].id;
const toUrl=path=>new URL(path,location.href).href;
const loadStatus=$('[data-loading]');
$('[data-description]').textContent=data.description;
for(const room of rooms){const b=document.createElement('button');b.type='button';b.textContent=room.name;b.dataset.room=room.id;b.addEventListener('click',()=>selectRoom(room.id));$('[data-rooms]').append(b);}

function setup(){
 try{
  renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:false,powerPreference:'low-power'});
  renderer.setPixelRatio(Math.min(devicePixelRatio||1,2));renderer.outputColorSpace=THREE.SRGBColorSpace;
  scene=new THREE.Scene();camera=new THREE.PerspectiveCamera(fov,1,.1,30);camera.rotation.order='YXZ';
  const geo=new THREE.SphereGeometry(10,96,64);geo.scale(-1,1,1);
  sphere=new THREE.Mesh(geo,new THREE.MeshBasicMaterial({color:0xffffff}));sphere.rotation.y=-Math.PI/2;scene.add(sphere);
  renderer.xr.enabled=true;renderer.xr.setReferenceSpaceType('local');
  for(let i=0;i<2;i++){const c=renderer.xr.getController(i);c.addEventListener('select',()=>{const index=rooms.findIndex(r=>r.id===active?.id);selectRoom(rooms[(index+1)%rooms.length].id);});scene.add(c);}
  renderer.xr.addEventListener('sessionstart',()=>{renderer.setAnimationLoop(()=>renderer.render(scene,camera));$('[data-xr]').textContent='退出头显 VR';});
  renderer.xr.addEventListener('sessionend',()=>{renderer.setAnimationLoop(null);$('[data-xr]').textContent='进入头显 VR';draw();});
  return true;
 }catch(error){loadStatus.hidden=true;$('[data-error]').hidden=false;$('[data-error-text]').textContent='此设备未能启动全景显示。仍可对照原设计图、下载全景或离线文件；也可以更换浏览器重试。';status('全景需要浏览器开启 WebGL。');return false;}
}
function direction(yaw,pitch=-.22){return new THREE.Vector3(Math.sin(yaw)*Math.cos(pitch),Math.sin(pitch),-Math.cos(yaw)*Math.cos(pitch));}
function paint(){
 frame=0;if(disposed||!renderer||!active||document.hidden||renderer.xr.isPresenting)return;
 const {width,height}=stage.getBoundingClientRect();if(!width||!height)return;
 renderer.setSize(width,height,false);camera.aspect=width/height;camera.fov=fov;camera.rotation.set(lat,-lon,0,'YXZ');camera.updateProjectionMatrix();camera.updateMatrixWorld();renderer.render(scene,camera);
 const forward=new THREE.Vector3();camera.getWorldDirection(forward);
 for(const b of $('[data-hotspots]').children){const v=direction(Number(b.dataset.yaw));const behind=v.dot(forward)<=0;const p=v.clone().multiplyScalar(9).project(camera);b.hidden=comparing||behind||Math.abs(p.x)>.88||Math.abs(p.y)>.78;if(!b.hidden){b.style.left=(p.x*.5+.5)*100+'%';b.style.top=(-p.y*.5+.5)*100+'%';}}
}
function draw(){if(!frame&&!disposed)frame=requestAnimationFrame(paint);}
function reset(){lon=active?.yaw||0;lat=0;fov=75;draw();}
function texture(room){
 if(cache.has(room.id))return Promise.resolve(cache.get(room.id));
 if(pending.has(room.id))return pending.get(room.id);
 const promise=new THREE.TextureLoader().loadAsync(room.pano).then(t=>{
  if(disposed){t.dispose();throw Error('查看器已关闭');}
  const w=t.image.naturalWidth||t.image.width,h=t.image.naturalHeight||t.image.height;
  if(w!==h*2){t.dispose();throw Error('全景比例异常，请重新载入');}
  t.colorSpace=THREE.SRGBColorSpace;t.generateMipmaps=false;t.minFilter=THREE.LinearFilter;t.magFilter=THREE.LinearFilter;t.wrapS=THREE.RepeatWrapping;
  cache.set(room.id,t);return t;
 }).finally(()=>pending.delete(room.id));pending.set(room.id,promise);return promise;
}
function trim(){for(const [id,t]of cache){if(cache.size<=2)break;if(id!==active?.id&&id!==requested){cache.delete(id);t.dispose();}}}
function syncRoomUi(){
 const r=active;$('[data-title]').textContent=r.name;$('[data-count]').textContent=String(rooms.indexOf(r)+1).padStart(2,'0')+' / '+String(rooms.length).padStart(2,'0');$('[data-caption]').textContent=r.caption;
 $('[data-reference]').src=r.source;$('[data-reference]').alt=r.name+' · 原始设计图';
 $('[data-pano-download]').href=r.pano;$('[data-pano-download]').download='暮色-'+r.id+'-360全景.png';
 for(const b of $('[data-rooms]').children)b.setAttribute('aria-pressed',String(b.dataset.room===r.id));
 $('[data-hotspots]').replaceChildren();r.neighbors.forEach((id,i)=>{const b=document.createElement('button');b.type='button';b.textContent='前往 '+roomById(id).name+' →';b.dataset.yaw=String((i-(r.neighbors.length-1)/2)*.52);b.addEventListener('click',()=>selectRoom(id));$('[data-hotspots]').append(b);});
 try{history.replaceState(null,'','#'+r.id);}catch{}
 status('暮色基准方案 · '+(r.width&&r.height?r.width+' × '+r.height+' 原生全景':'360° 球面全景')+' · 未展示区域为 AI 补全');
}
async function selectRoom(id){
 const room=roomById(safeId(id)),token=++serial;requested=room.id;
 if(!renderer){active=room;syncRoomUi();$('[data-reference]').hidden=false;return;}
 loadStatus.textContent='正在载入'+room.name+'…';loadStatus.hidden=false;$('[data-error]').hidden=true;
 try{const t=await texture(room);if(token!==serial||disposed){trim();return;}sphere.material.map=t;sphere.material.needsUpdate=true;active=room;requested=null;comparing=false;$('[data-reference]').hidden=true;stage.classList.remove('is-comparing');$('[data-compare]').setAttribute('aria-pressed','false');$('[data-compare]').textContent='对照原设计图';$('[data-hint]').textContent='拖动环顾 · 滚轮 / 双指缩放';syncRoomUi();reset();trim();}
 catch(error){if(token===serial&&!disposed){$('[data-error]').hidden=false;$('[data-error-text]').textContent=room.name+'全景未载入，上一间画面已保留。请重试。';status('可稍后重试，或先查看其他空间。');}}
 finally{if(token===serial)loadStatus.hidden=true;}
}
function zoom(delta){fov=THREE.MathUtils.clamp(fov+delta,35,100);draw();}
canvas.addEventListener('pointerdown',e=>{if(comparing)return;canvas.setPointerCapture(e.pointerId);pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});if(pointers.size===2){const [a,b]=[...pointers.values()];pinch={distance:Math.hypot(a.x-b.x,a.y-b.y),fov};}stage.focus({preventScroll:true});});
canvas.addEventListener('pointermove',e=>{const old=pointers.get(e.pointerId);if(!old||comparing)return;pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});if(pointers.size===2&&pinch){const[a,b]=[...pointers.values()];fov=THREE.MathUtils.clamp(pinch.fov*pinch.distance/Math.max(1,Math.hypot(a.x-b.x,a.y-b.y)),35,100);}else{lon+=(old.x-e.clientX)*.004;lat=THREE.MathUtils.clamp(lat+(e.clientY-old.y)*.003,-1.35,1.35);}draw();});
const release=e=>{pointers.delete(e.pointerId);pinch=null;};for(const name of ['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(name,release);
canvas.addEventListener('wheel',e=>{e.preventDefault();if(!comparing)zoom(e.deltaY*.025);},{passive:false});
stage.addEventListener('keydown',e=>{if(e.target!==stage&&e.target!==canvas)return;const keys=['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','+','=','-','Home'];if(!keys.includes(e.key))return;e.preventDefault();if(e.key==='ArrowLeft')lon-=.12;if(e.key==='ArrowRight')lon+=.12;if(e.key==='ArrowUp')lat+=.1;if(e.key==='ArrowDown')lat-=.1;if(['+','='].includes(e.key))zoom(-6);if(e.key==='-')zoom(6);if(e.key==='Home')reset();lat=THREE.MathUtils.clamp(lat,-1.35,1.35);draw();});
$('[data-reset]').addEventListener('click',reset);$('[data-zoom-in]').addEventListener('click',()=>zoom(-8));$('[data-zoom-out]').addEventListener('click',()=>zoom(8));
$('[data-compare]').addEventListener('click',()=>{if(!active)return;comparing=!comparing;$('[data-reference]').hidden=!comparing;stage.classList.toggle('is-comparing',comparing);$('[data-compare]').setAttribute('aria-pressed',String(comparing));$('[data-compare]').textContent=comparing?'返回 360° 全景':'对照原设计图';$('[data-hint]').textContent=comparing?'原始设计图 · 未重绘':'拖动环顾 · 滚轮 / 双指缩放';draw();});
$('[data-retry]').addEventListener('click',()=>{if(!renderer){location.reload();return;}selectRoom(requested||active?.id||rooms[0].id);});
$('[data-fullscreen]').addEventListener('click',async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else if(stage.requestFullscreen)await stage.requestFullscreen();else stage.classList.toggle('is-expanded');}catch{stage.classList.toggle('is-expanded');}draw();});
document.addEventListener('fullscreenchange',()=>{$('[data-fullscreen]').textContent=document.fullscreenElement?'退出全屏':'全屏 ↗';draw();});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){stage.classList.remove('is-expanded');draw();}});
$('[data-xr]').addEventListener('click',async()=>{try{if(renderer.xr.isPresenting){await renderer.xr.getSession().end();return;}const s=await navigator.xr.requestSession('immersive-vr',{optionalFeatures:['local-floor']});await renderer.xr.setSession(s);status('已进入头显；按控制器扳机切换下一间。');}catch{status('头显未连接或浏览器未授权。可继续用屏幕环顾，也可在头显浏览器中打开此页面。');}});
if(renderer&&navigator.xr&&isSecureContext)navigator.xr.isSessionSupported('immersive-vr').then(ok=>{$('[data-xr]').hidden=!ok;}).catch(()=>{});

async function dataUrl(url){if(url.startsWith('data:'))return url;const r=await fetch(toUrl(url));if(!r.ok)throw Error('图片下载失败');const b=await r.blob();if(!b.type.startsWith('image/'))throw Error('素材类型错误');return new Promise((yes,no)=>{const f=new FileReader();f.onload=()=>yes(f.result);f.onerror=no;f.readAsDataURL(b);});}
async function downloadOffline(){
 if(exporting)return;exporting=true;const button=$('[data-export]');button.disabled=true;
 try{
  if(data.offline){status('当前已是完整离线文件，可直接保存或复制这个 HTML。');return;}
  const embedded=structuredClone(data);embedded.offline=true;let done=0;
  // Sequential rooms keep the in-memory image decoding / network footprint bounded.
  for(const room of embedded.rooms){[room.pano,room.source]=await Promise.all([dataUrl(room.pano),dataUrl(room.source)]);status('正在打包原生全景 '+(++done)+' / '+rooms.length);}
  const responses=await Promise.all(['/vr/dusk/index.html','/vr/dusk/vr.css','/vr/dusk/vr.js'].map(async p=>{const r=await fetch(p);if(!r.ok)throw Error('查看器未载入');return r.text();}));
  const html=offlineHtml(...responses,embedded);
  const blob=new Blob([html],{type:'text/html;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='庭间-暮色写实全景VR.html';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);status('离线 VR 已下载，包含八个全景、原图对照与查看器。');
 }catch{status('离线包未下载成功，请重试。页面内的全景不会受影响。');}finally{exporting=false;button.disabled=false;}
}
$('[data-pano-download]').addEventListener('click',async e=>{if(!active||!/^https?:/.test(active.pano))return;e.preventDefault();try{const r=await fetch(active.pano);if(!r.ok)throw Error('download');const url=URL.createObjectURL(await r.blob()),a=document.createElement('a');a.href=url;a.download='暮色-'+active.id+'-360全景.png';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);}catch{status('全景原图下载未完成，请重试。');}});
$('[data-export]').addEventListener('click',downloadOffline);
const observer=new ResizeObserver(draw);observer.observe(stage);
document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0;renderer?.xr.getSession()?.end().catch(()=>{});}else draw();});
window.addEventListener('pagehide',()=>{disposed=true;serial++;cancelAnimationFrame(frame);observer.disconnect();renderer?.setAnimationLoop(null);for(const t of cache.values())t.dispose();sphere?.geometry.dispose();sphere?.material.dispose();renderer?.dispose();renderer?.forceContextLoss();});
setup();selectRoom(safeId(location.hash.slice(1)));
