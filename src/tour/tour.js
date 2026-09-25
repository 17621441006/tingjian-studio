import {cameraFrame,horizontalFov,DEFAULT_FOV,MIN_FOV,MAX_FOV,clamp,wrap,project,RAD} from './pano-math.mjs';
import {vertexShader,fragmentShader} from './pano-shaders.mjs';
import {nodes,rooms} from './tour-data.mjs';
import {styles,styledNode,assetKey} from './styles.mjs';
import {arrivalCamera} from './tour-state.mjs';
import {hdFrame} from './hd-view.mjs';

const root=document.getElementById('daan-vr-v2');
const assets=JSON.parse(root.querySelector('[data-assets]').textContent);
const stage=root.querySelector('[data-stage]');
let canvas=root.querySelector('canvas');
const status=root.querySelector('[data-status]');
const sceneName=root.querySelector('[data-scene]');
const imageFallback=root.querySelector('[data-poster]');
const hdWrap=root.querySelector('[data-hd-wrap]');
const hdImage=root.querySelector('[data-hd-image]');
let hd={zoom:1,x:0,y:0},hdStart=null;
const hotspots=root.querySelector('[data-hotspots]');
const map=root.querySelector('[data-map]');
const mapImage=root.querySelector('[data-map-image]');
const mapDots=root.querySelector('[data-map-dots]');
const roomStrip=root.querySelector('[data-rooms]');
const detailPanel=root.querySelector('[data-detail-panel]');
const featureButtons=root.querySelector('[data-features]');
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const sceneById=new Map(nodes.map(n=>[n.id,n]));
const images=new Map(), textures=new Map();
let styleId='east', node=nodes[0], state={yaw:node.yaw,pitch:node.pitch,fov:DEFAULT_FOV};
let frame=0, texture=null, mode='hd', token=0, loading=false;
let points=[], featureVisible=false, activeFeature=0, pointerStart=null, dragging=false;
let pinch=null, transitionTimer=0;
const pointers=new Map();
let gl=null,program=null,uniforms={},panoramaUnavailable=false;

function announce(message){status.textContent=message;}
function shader(type,source){
  const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);
  if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(s));return s;
}
function initializeGL(){
  gl=canvas.getContext('webgl',{alpha:false,antialias:false,preserveDrawingBuffer:false,powerPreference:'low-power'});
  if(!gl)throw new Error('No WebGL');
  program=gl.createProgram();gl.attachShader(program,shader(gl.VERTEX_SHADER,vertexShader));gl.attachShader(program,shader(gl.FRAGMENT_SHADER,fragmentShader));gl.linkProgram(program);
  if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(program));
  gl.useProgram(program);
  const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
  gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);
  const loc=gl.getAttribLocation(program,'position');gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,2,gl.FLOAT,false,0,0);
  for(const key of ['panorama','forwardV','rightV','upV','tanHalf','aspect','verticalShift'])uniforms[key]=gl.getUniformLocation(program,key);
  gl.uniform1i(uniforms.panorama,0);
}
function ensurePanorama(){
  if(panoramaUnavailable)return false;
  if(gl)return true;
  try{initializeGL();return true;}
  catch(error){gl=null;panoramaUnavailable=true;return false;}
}

function queueRender(){if(!frame&&mode!=='legacy'&&!document.hidden)frame=requestAnimationFrame(render);}
function render(){
  frame=0;
  if(document.hidden)return;
  if(mode==='hd'){
    if(!hdImage.naturalWidth)return;
    const v=hdFrame(Math.max(stage.clientWidth,1),Math.max(stage.clientHeight,1),hdImage.naturalWidth,hdImage.naturalHeight,hd);
    hd={zoom:v.zoom,x:v.x,y:v.y};
    hdImage.style.width=hdImage.naturalWidth+'px';hdImage.style.height=hdImage.naturalHeight+'px';
    hdImage.style.transform=`translate(-50%,-50%) translate(${hd.x}px,${hd.y}px) scale(${v.scale})`;
    root.querySelector('[data-hd-percent]').textContent=Math.round(v.scale*100)+'%';
    root.querySelector('[data-hd-in]').disabled=v.scale>=.999;
    root.querySelector('[data-hd-out]').disabled=hd.zoom<=1.001;
    root.querySelector('[data-hd-fit]').setAttribute('aria-pressed',String(hd.zoom<=1.001));
    root.querySelector('[data-hd-native]').setAttribute('aria-pressed',String(v.scale>=.999));
    return;
  }
  if(mode!=='vr'||!gl||!texture)return;
  const w=Math.max(stage.clientWidth,1),h=Math.max(stage.clientHeight,1);
  const ratio=Math.min(devicePixelRatio||1,2);
  const rw=Math.max(1,Math.round(w*ratio)),rh=Math.max(1,Math.round(h*ratio));
  if(canvas.width!==rw||canvas.height!==rh){canvas.width=rw;canvas.height=rh;}
  if(gl){
    const b=cameraFrame(state,w/h);
    gl.viewport(0,0,rw,rh);gl.useProgram(program);gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,texture);
    gl.uniform3fv(uniforms.forwardV,b.forward);gl.uniform3fv(uniforms.rightV,b.right);gl.uniform3fv(uniforms.upV,b.up);
    gl.uniform1f(uniforms.tanHalf,b.tan);gl.uniform1f(uniforms.verticalShift,b.shift);gl.uniform1f(uniforms.aspect,w/h);gl.drawArrays(gl.TRIANGLES,0,6);
  }
  canvas.style.visibility='visible';imageFallback.hidden=true;
  for(const p of points){
    const loc=project(p.data.yaw,p.data.pitch,state,w,h);
    const show=loc&&loc.visible&&(!p.detail||featureVisible)&&!loading;
    p.el.hidden=!show;
    if(show){p.el.style.left=loc.x+'px';p.el.style.top=loc.y+'px';}
  }
  const yaw=(node.north+state.yaw)*RAD, center=node.point;
  const half=horizontalFov(state,w/h)*RAD/2;
  const a=yaw-half,b=yaw+half,r=1.15;
  const path=`M ${center[0]} ${center[1]} L ${center[0]+Math.sin(a)*r} ${center[1]-Math.cos(a)*r} A ${r} ${r} 0 0 1 ${center[0]+Math.sin(b)*r} ${center[1]-Math.cos(b)*r} Z`;
  root.querySelector('[data-view-cone]').setAttribute('d',path);
  for(const b of root.querySelectorAll('[data-lens]'))b.setAttribute('aria-pressed',String(Math.abs(state.fov-Number(b.dataset.lens))<.1));
}
function touch(cache,key,value){cache.delete(key);cache.set(key,value);}
function loadImage(id,sid=styleId,kind='pano'){
  const key=kind+'/'+assetKey(sid,id);
  if(images.has(key)){const promise=images.get(key);touch(images,key,promise);return promise;}
  const promise=new Promise((resolve,reject)=>{
    const im=new Image();im.decoding='async';im.onload=()=>resolve(im);im.onerror=()=>{images.delete(key);reject(new Error('设计图片读取失败'));};im.src=assets[sid][id][kind];
  });
  touch(images,key,promise);
  while(images.size>4)images.delete(images.keys().next().value);
  return promise;
}
function textureFromImage(id,img,sid){
  const key=assetKey(sid,id);
  if(textures.has(key)){const t=textures.get(key);touch(textures,key,t);return t;}
  const t=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,t);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,false);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
  gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,img);
  touch(textures,key,t);
  while(textures.size>2){const first=textures.keys().next().value;gl.deleteTexture(textures.get(first));textures.delete(first);}
  return t;
}
async function activate(id,animate=true,arrivalYaw,sid=styleId,preserveCamera=false){
  if(!sceneById.has(id)||!assets[sid]?.[id])return;
  const currentToken=++token,next=styledNode(sceneById.get(id),sid);
  loading=true;stage.setAttribute('aria-busy','true');
  if(animate&&!reduced)stage.classList.add('dv-moving');
  const style=styles.find(s=>s.id===sid);
  announce('正在载入'+style.name+' · '+next.name+'…');queueRender();
  try{
    const img=await loadImage(id,sid,mode==='hd'?'hd':'pano');
    if(currentToken!==token)return;
    if(animate&&!reduced)await new Promise(resolve=>setTimeout(resolve,130));
    if(currentToken!==token)return;
    state=arrivalCamera(state,next,{preserve:preserveCamera||mode==='vr',fromNorth:node.north,arrivalYaw});
    const styleChanged=styleId!==sid,roomChanged=node.id!==id;node=next;styleId=sid;
    if(mode==='hd'){
      if(!preserveCamera||roomChanged)hd={zoom:1,x:0,y:0};
      hdImage.src=assets[sid][id].hd;hdImage.alt=style.name+' · '+next.name+'高清定点设计图';
      root.querySelector('[data-hd-download]').href=assets[sid][id].hd;
      root.querySelector('[data-hd-download]').download=sid+'-'+id+'-hd.jpg';
      root.querySelector('[data-resolution]').textContent=img.naturalWidth+' × '+img.naturalHeight+' · 高清定点图';
    }
    else if(gl)texture=textureFromImage(id,img,sid);
    sceneName.textContent=node.name;root.querySelector('[data-scene-number]').textContent=node.number;
    root.querySelector('[data-style-name]').textContent=style.name+(mode==='hd'?' · 高清视图':' · 全景环视');
    root.querySelector('[data-material]').textContent=node.material;
    root.querySelector('[data-summary]').textContent=node.summary;
    canvas.setAttribute('aria-label',style.name+'，'+node.name+'，拖动环视，点地面圆环或房间按钮移动');
    if(styleChanged)buildRooms();
    activeFeature=0;renderFeatures();renderHotspots();updateSelection();updateModeUI();
    loading=false;stage.setAttribute('aria-busy','false');queueRender();
    clearTimeout(transitionTimer);transitionTimer=setTimeout(()=>stage.classList.remove('dv-moving'),60);
    announce(mode==='vr'?'已到达'+next.name+'，保持原来朝向；拖动可继续环看。':preserveCamera?'已切换到'+style.name+'，保留当前房间和视角。':'已进入'+style.name+' · '+node.name+'。');
  }catch(error){
    if(currentToken!==token)return;loading=false;stage.classList.remove('dv-moving');stage.setAttribute('aria-busy','false');queueRender();
    announce('暂时无法读取这个房间，请再次选择。');
  }
}
function renderHotspots(){
  hotspots.replaceChildren();points=[];
  const destinations=root.querySelector('[data-destinations]');destinations.replaceChildren();
  for(const link of node.links){const b=document.createElement('button');b.type='button';b.textContent='前往 '+sceneById.get(link.to).name+' ↗';b.addEventListener('click',()=>activate(link.to,true,link.arrivalYaw));destinations.append(b);}
  for(const link of node.links){
    const button=document.createElement('button');button.type='button';button.className='dv-hotspot cursor-interaction';
    const target=sceneById.get(link.to);button.setAttribute('aria-label','前往'+target.name);
    const ring=document.createElement('span');ring.className='dv-floor-ring';ring.setAttribute('aria-hidden','true');
    const label=document.createElement('span');label.className='dv-hotspot-label';label.textContent=target.name;
    button.append(ring,label);button.addEventListener('click',()=>activate(link.to,true,link.arrivalYaw));
    hotspots.append(button);points.push({el:button,data:link,detail:false});
  }
  for(const detail of node.details){
    const button=document.createElement('button');button.type='button';button.className='dv-detail-dot cursor-interaction';button.textContent='＋';button.setAttribute('aria-label',node.features[detail.feature].title);
    button.addEventListener('click',()=>showFeature(detail.feature));hotspots.append(button);points.push({el:button,data:detail,detail:true});
  }
}
function showFeature(index){
  activeFeature=index;const f=node.features[index];
  root.querySelector('[data-feature-title]').textContent=f.title;root.querySelector('[data-feature-body]').textContent=f.body;
  for(const b of featureButtons.children)b.setAttribute('aria-pressed',String(Number(b.dataset.feature)===index));
  detailPanel.hidden=false;featureVisible=true;
  root.querySelector('[data-show-features]').setAttribute('aria-pressed','true');queueRender();
}
function renderFeatures(){
  featureButtons.replaceChildren();
  node.features.forEach((f,i)=>{const button=document.createElement('button');button.type='button';button.dataset.feature=i;button.textContent=f.title;button.className='cursor-interaction';button.addEventListener('click',()=>showFeature(i));featureButtons.append(button);});
  if(featureVisible)showFeature(activeFeature);else detailPanel.hidden=true;
}
function updateSelection(){
  for(const b of root.querySelectorAll('[data-style]'))b.setAttribute('aria-pressed',String(b.dataset.style===styleId));
  for(const b of root.querySelectorAll('[data-go]'))b.setAttribute('aria-pressed',String(b.dataset.go===node.id));
  for(const p of root.querySelectorAll('[data-room-path]'))p.classList.toggle('dv-current-room',p.dataset.roomPath===node.room);
}
function buildMap(){
  const NS='http://www.w3.org/2000/svg';
  for(const room of rooms){const p=document.createElementNS(NS,'polygon');p.setAttribute('points',room.p.map(x=>x.join(',')).join(' '));p.dataset.roomPath=room.id;p.setAttribute('class','dv-map-room');mapImage.prepend(p);}
  for(const n of nodes){
    const b=document.createElement('button');b.type='button';b.dataset.go=n.id;b.className='dv-map-dot cursor-interaction';b.textContent=n.number;
    b.setAttribute('aria-label','户型图：'+n.name);b.style.left=((n.point[0]+.3)/11.24*100)+'%';b.style.top=((n.point[1]+.3)/7.7*100)+'%';
    b.addEventListener('click',()=>{activate(n.id);map.hidden=true;root.querySelector('[data-show-map]').setAttribute('aria-expanded','false');});mapDots.append(b);
  }
}
function buildRooms(){
  roomStrip.replaceChildren();
  for(const n of nodes){
    const b=document.createElement('button');b.type='button';b.dataset.go=n.id;b.className='dv-room cursor-interaction';
    const img=document.createElement('img');img.src=assets[styleId][n.id].thumb;img.alt='';img.loading='lazy';img.width=160;img.height=96;
    const label=document.createElement('span');label.textContent=n.name;b.append(img,label);b.addEventListener('click',()=>activate(n.id));roomStrip.append(b);
  }
}
function bindCanvas(){
  canvas.addEventListener('pointerdown',event=>{
    if(event.button!==0)return;
    pointers.set(event.pointerId,{x:event.clientX,y:event.clientY});canvas.setPointerCapture(event.pointerId);dragging=true;
    if(pointers.size===1)pointerStart={x:event.clientX,y:event.clientY,yaw:state.yaw,pitch:state.pitch};
    if(pointers.size===2){const p=[...pointers.values()];pinch={distance:Math.hypot(p[1].x-p[0].x,p[1].y-p[0].y),fov:state.fov};}
    canvas.classList.add('dv-dragging');
  });
  canvas.addEventListener('pointermove',event=>{
    if(!pointers.has(event.pointerId))return;
    pointers.set(event.pointerId,{x:event.clientX,y:event.clientY});
    if(pointers.size===2&&pinch){const p=[...pointers.values()];const distance=Math.hypot(p[1].x-p[0].x,p[1].y-p[0].y);state.fov=clamp(pinch.fov*pinch.distance/Math.max(1,distance),MIN_FOV,MAX_FOV);}
    else if(pointerStart){
      const scale=horizontalFov(state,stage.clientWidth/stage.clientHeight)/Math.max(1,stage.clientWidth);
      state.yaw=wrap(pointerStart.yaw-(event.clientX-pointerStart.x)*scale);
      state.pitch=clamp(pointerStart.pitch+(event.clientY-pointerStart.y)*scale,-67,67);
    }
    queueRender();
  });
  const release=event=>{
    pointers.delete(event.pointerId);pinch=null;
    if(pointers.size===1){const p=[...pointers.values()][0];pointerStart={x:p.x,y:p.y,yaw:state.yaw,pitch:state.pitch};}
    else if(!pointers.size){dragging=false;pointerStart=null;canvas.classList.remove('dv-dragging');}
    queueRender();
  };
  canvas.addEventListener('pointerup',release);canvas.addEventListener('pointercancel',release);
  canvas.addEventListener('wheel',event=>{event.preventDefault();state.fov=clamp(state.fov+event.deltaY*.04,MIN_FOV,MAX_FOV);queueRender();},{passive:false});
  canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();texture=null;gl=null;textures.clear();panoramaUnavailable=true;if(mode==='vr')setMode('hd');updateModeUI();});
}

function updateModeUI(){
  root.querySelector('[data-style-name]').textContent=mode==='legacy'?'空间设计 · 全屋选材':mode==='history'?'历史方案 · 独立浏览':styles.find(s=>s.id===styleId).name+(mode==='hd'?' · 高清视图':' · 环视');
  const isHD=mode==='hd';
  root.classList.toggle('dv-hd',isHD);
  root.querySelector('[data-vr-pane]').hidden=!['hd','vr'].includes(mode);
  root.querySelector('[data-history-pane]').hidden=mode==='legacy';root.querySelector('[data-history-archive]').hidden=mode!=='history';
  root.querySelector('[data-legacy-pane]').hidden=mode!=='legacy';
  hdWrap.hidden=!isHD;canvas.hidden=isHD;hotspots.hidden=isHD;
  if(isHD)imageFallback.hidden=true;
  root.querySelector('[data-hd-tools]').hidden=!isHD;
  root.querySelector('[data-vr-tools]').hidden=isHD;
  root.querySelector('[data-lenses]').hidden=isHD;
  root.querySelector('[data-view-cone]').hidden=isHD;
  root.querySelector('[data-view-cone]').style.display=isHD?'none':'';
  root.querySelector('[data-hint]').textContent=isHD?'高清定点图 · 放大后拖动 · 下方前往相邻房间':'拖动环视 · 点地面圆环或下方目的地移动';
  root.querySelector('[data-enter-vr]').hidden=!isHD;
  root.querySelector('[data-caption]').textContent=isHD?'高清定点设计图 · 非房屋实拍':'原有全景设计图 · 非房屋实拍';
  root.querySelector('[data-quality]').textContent=isHD?'点击“从这里出发”或户型图，沿路径查看全屋。当前为生成的定点设计图，局部可能与全景不同；家具尺寸以实测为准。':'当前整圈全景底图为 1774 × 887，局部放大细节有限；不是实拍扫描。高清看屋保留各房间的材质细节。';
  const notice=root.querySelector('[data-mode-notice]');
  notice.hidden=isHD&&!panoramaUnavailable;
  notice.textContent=panoramaUnavailable?'此设备的环视渲染暂不可用，已使用高清看屋；房间切换仍可使用。':'360° 底图分辨率有限，拖动可看方向；看清材质请切回“高清看屋”。';
  if(!isHD)root.querySelector('[data-resolution]').textContent='1774 × 887 · 整圈全景';
  for(const b of root.querySelectorAll('[data-mode]'))b.setAttribute('aria-pressed',String(b.dataset.mode===mode));
}
function zoomHD(factor){hd.zoom*=factor;queueRender();}
hdImage.addEventListener('load',queueRender);
hdImage.addEventListener('error',()=>announce('高清图片载入失败，请切换房间重试。'));
hdWrap.addEventListener('pointerdown',event=>{
  if(event.button!==0)return;
  hdStart={id:event.pointerId,x:event.clientX,y:event.clientY,panX:hd.x,panY:hd.y};
  hdWrap.setPointerCapture(event.pointerId);
});
hdWrap.addEventListener('pointermove',event=>{
  if(!hdStart||hdStart.id!==event.pointerId)return;
  hd.x=hdStart.panX+event.clientX-hdStart.x;hd.y=hdStart.panY+event.clientY-hdStart.y;queueRender();
});
hdWrap.addEventListener('pointerup',()=>{hdStart=null;});
hdWrap.addEventListener('pointercancel',()=>{hdStart=null;});
hdWrap.addEventListener('wheel',event=>{event.preventDefault();zoomHD(Math.exp(-event.deltaY*.0015));},{passive:false});
root.querySelector('[data-hd-fit]').addEventListener('click',()=>{hd={zoom:1,x:0,y:0};queueRender();});
root.querySelector('[data-hd-native]').addEventListener('click',()=>{hd={zoom:100,x:0,y:0};queueRender();});
root.querySelector('[data-hd-in]').addEventListener('click',()=>zoomHD(1.2));
root.querySelector('[data-hd-out]').addEventListener('click',()=>zoomHD(1/1.2));

for(const b of root.querySelectorAll('[data-style]'))b.addEventListener('click',()=>activate(node.id,true,undefined,b.dataset.style,true));
for(const b of root.querySelectorAll('[data-lens]'))b.addEventListener('click',()=>{state.fov=Number(b.dataset.lens);queueRender();});
root.querySelector('[data-show-map]').addEventListener('click',event=>{map.hidden=!map.hidden;event.currentTarget.setAttribute('aria-expanded',String(!map.hidden));queueRender();});
root.querySelector('[data-close-map]').addEventListener('click',()=>{map.hidden=true;root.querySelector('[data-show-map]').setAttribute('aria-expanded','false');});
root.querySelector('[data-show-features]').addEventListener('click',event=>{featureVisible=!featureVisible;event.currentTarget.setAttribute('aria-pressed',String(featureVisible));if(featureVisible)showFeature(activeFeature);else detailPanel.hidden=true;queueRender();});
root.querySelector('[data-close-feature]').addEventListener('click',()=>{featureVisible=false;detailPanel.hidden=true;root.querySelector('[data-show-features]').setAttribute('aria-pressed','false');queueRender();});
for(const b of root.querySelectorAll('[data-turn]'))b.addEventListener('click',()=>{const [x,y]=b.dataset.turn.split(',').map(Number);state.yaw=wrap(state.yaw+x);state.pitch=clamp(state.pitch+y,-67,67);queueRender();});
for(const b of root.querySelectorAll('[data-zoom]'))b.addEventListener('click',()=>{state.fov=clamp(state.fov+Number(b.dataset.zoom),MIN_FOV,MAX_FOV);queueRender();});
root.querySelector('[data-fullscreen]').addEventListener('click',async()=>{
  try{if(document.fullscreenElement)await document.exitFullscreen();else if(root.requestFullscreen)await root.requestFullscreen();else throw new Error('unsupported');}
  catch(error){root.classList.toggle('dv-expanded');announce(root.classList.contains('dv-expanded')?'已放大画面。':'已恢复画面。');queueRender();}
});
root.addEventListener('keydown',event=>{
  if(mode!=='vr'||/INPUT|TEXTAREA|SELECT/.test(event.target.tagName))return;
  const keys={ArrowLeft:[-8,0],ArrowRight:[8,0],ArrowUp:[0,6],ArrowDown:[0,-6]};
  if(keys[event.key]){event.preventDefault();const [x,y]=keys[event.key];state.yaw=wrap(state.yaw+x);state.pitch=clamp(state.pitch+y,-67,67);queueRender();}
  if(event.key==='Escape'){map.hidden=true;root.querySelector('[data-show-map]').setAttribute('aria-expanded','false');}
});
root.querySelector('[data-enter-vr]').addEventListener('click',()=>root.querySelector('[data-mode="vr"]').click());
const legacy=root.querySelector('[data-legacy-source]');
let created=false,historyCreated=false;
const legacyAvailable=!!(legacy?.textContent.trim()||legacy?.dataset.url);
if(!legacyAvailable)root.querySelector('[data-mode="legacy"]').hidden=true;
function setMode(next){
    if(next==='vr'&&!ensurePanorama()){next='hd';announce('此设备暂不支持环视，继续使用高清看屋。');}
    if(mode===next){updateModeUI();return;}
    if(mode==='vr'){
      if(gl)for(const t of textures.values())gl.deleteTexture(t);
      textures.clear();texture=null;
      for(const key of images.keys())if(key.startsWith('pano/'))images.delete(key);
    }
    mode=next;token++;hdStart=null;pointerStart=null;pointers.clear();pinch=null;dragging=false;
    if(frame){cancelAnimationFrame(frame);frame=0;}
    stage.classList.remove('dv-moving');updateModeUI();
    if(mode==='legacy'&&!created&&legacyAvailable){
      if(legacy.dataset.url)root.querySelector('[data-legacy-frame]').src=legacy.dataset.url;
      else {const bytes=Uint8Array.from(atob(legacy.textContent.trim()),c=>c.charCodeAt(0));root.querySelector('[data-legacy-frame]').srcdoc=new TextDecoder().decode(bytes);}
      created=true;
    }
    if(mode==='history'&&!historyCreated){root.querySelector('[data-history-frame]').src='/tour/history.html';historyCreated=true;}
    if(['hd','vr'].includes(mode))activate(node.id,false,undefined,styleId,true);
}
for(const b of root.querySelectorAll('[data-mode]'))b.addEventListener('click',()=>setMode(b.dataset.mode));
buildMap();buildRooms();bindCanvas();
updateModeUI();
new ResizeObserver(queueRender).observe(stage);
document.addEventListener('fullscreenchange',queueRender);
document.addEventListener('visibilitychange',()=>{if(document.hidden&&frame){cancelAnimationFrame(frame);frame=0;}else queueRender();});
if(typeof IntersectionObserver!=='undefined')new IntersectionObserver(entries=>{if(entries.some(x=>x.isIntersecting))queueRender();}).observe(stage);
const requestedMode=typeof location!=='undefined'?new URLSearchParams(location.search).get('mode'):null;
if(requestedMode==='vr')setMode('vr');else if(requestedMode==='hd')activate('living',false);else setMode('legacy');
window.addEventListener('message',event=>{
 const iframe=[root.querySelector('[data-legacy-frame]'),root.querySelector('[data-history-frame]')].find(f=>f.contentWindow===event.source);
 if(!iframe||event.origin!==location.origin||event.data?.type!=='tingjian:studio-height')return;
 const height=Number(event.data.height);if(Number.isFinite(height))iframe.style.height=Math.max(800,Math.min(9000,height))+'px';
});
