import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {selection} from './trial-state.mjs';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { SSAOPass } from 'three/addons/postprocessing/SSAOPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

const root = document.getElementById('daan-spaces');
const stage = root.querySelector('.daan-stage');
const canvas = root.querySelector('canvas');
const status = root.querySelector('[data-model-status]');
const detail = root.querySelector('[data-detail]');
const styleButtons = [...root.querySelectorAll('[data-style]')];
const viewSelect = root.querySelector('[data-view]');
const wallSelect = root.querySelector('[data-wall]');
const labelCheck = root.querySelector('[data-labels]');
let currentStyle = 'sculpt', currentView = 'all';
let model, materials, raf = 0, visible = true, needsRender = true;
let objects = 0, cameraMotion = null, lastTime = 0, rendering = false;
const wallPlane = new THREE.Plane(new THREE.Vector3(0,-1,0), 1.12);
const texturePool = new Map();
const modelLabels = [];
let atlasImage=null;
let coffeeSlot=null,previewTable=null,tableLoading=null;
const pickables=[];
const rooms = [
  {id:'living',name:'客餐厅',area:'21.4㎡',p:[[3.48,2.16],[7.13,2.16],[7.13,7.10],[1.85,7.10],[1.85,5.23],[3.48,5.23]],label:[5.32,5.17]},
  {id:'master',name:'主卧',area:'13.5㎡',p:[[7.13,.78],[8.37,.78],[8.37,0],[10.64,0],[10.64,4.40],[7.13,4.40]],label:[8.95,3.82]},
  {id:'second',name:'次卧',area:'7.2㎡',p:[[7.13,4.40],[9.91,4.40],[9.91,7.10],[7.13,7.10]],label:[8.55,5.48]},
  {id:'kitchen',name:'厨房',area:'6.6㎡',p:[[1.20,2.16],[3.48,2.16],[3.48,5.23],[1.85,5.23],[1.85,4.56],[1.20,4.56]],label:[2.20,3.65]},
  {id:'bath',name:'卫生间',area:'4.3㎡',p:[[0,4.56],[1.85,4.56],[1.85,7.10],[0,7.10]],label:[.94,6.02]},
  {id:'balcony',name:'景观阳台',area:'5.0㎡',p:[[3.48,.57],[6.08,.57],[6.08,1.17],[7.13,1.17],[7.13,2.16],[3.48,2.16]],label:[4.9,1.30]},
  {id:'utility',name:'生活阳台',area:'2.5㎡',p:[[0,2.16],[1.20,2.16],[1.20,4.56],[0,4.56]],label:[.59,3.1]}
];
const outline = [[0,2.16],[3.48,2.16],[3.48,.57],[6.08,.57],[6.08,1.17],[7.13,1.17],[7.13,.78],[8.37,.78],[8.37,0],[10.64,0],[10.64,4.40],[9.91,4.40],[9.91,7.10],[0,7.10]];
const palette = {
  original:{name:'原貌参考',tag:'红棕木地板 · 白墙 · 深色皮沙发',wall:'#f0ede6',floor:'#713b28',wood:'#965b36',darkwood:'#563926',stone:'#dfded7',fabric:'#423e3a',accent:'#948171',metal:'#a5a4a0',rug:'#b9aaa0',cabinet:'#e0ddd5',linen:'#efebe2',tile:'#d8d6cd',art:'#686b67'},
  sculpt:{name:'胡桃木私邸',tag:'深胡桃木 · 巧克力棕皮 · 羊毛与亚麻 · 哑光墨石',wall:'#e7e1d5',floor:'#8b7057',wood:'#79503a',darkwood:'#4d3528',stone:'#55524a',fabric:'#66422e',accent:'#7a8260',metal:'#8b7a60',rug:'#c6b69a',cabinet:'#77604c',linen:'#ded3bd',tile:'#c6bbaa',art:'#443f34'},
  retro:{name:'橄榄沙龙',tag:'橄榄绿皮革 · 烟熏木 · 棕石 · 拉丝银',wall:'#e5dfd2',floor:'#76614d',wood:'#654634',darkwood:'#3b3028',stone:'#655346',fabric:'#606447',accent:'#884733',metal:'#adb0af',rug:'#cfc1a8',cabinet:'#696d51',linen:'#ded5c4',tile:'#b9b5a7',art:'#793f32'},
  east:{name:'茶庭光影',tag:'茶色木作 · 干邑棕皮 · 细格栅 · 纸感柔光',wall:'#e7e1d5',floor:'#9f8260',wood:'#8b5e3d',darkwood:'#4f3526',stone:'#454b45',fabric:'#945c36',accent:'#625f42',metal:'#797362',rug:'#baaa87',cabinet:'#8c6b4c',linen:'#e0d7bd',tile:'#b9b5a3',art:'#534d3d'}
};
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(39,1,.06,150);
let renderer;
try {
  renderer = new THREE.WebGLRenderer({canvas,antialias:true,alpha:true,preserveDrawingBuffer:true,powerPreference:'high-performance'});
} catch(error) {
  status.textContent = '当前预览未启用3D，请用支持 WebGL 的浏览器打开保存版。';
  throw error;
}
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1,1.8));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.02;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.localClippingEnabled = true;
renderer.setClearColor(0,0);
const controls = new OrbitControls(camera,canvas);
controls.enableDamping = true;
controls.dampingFactor = .095;
controls.minDistance = 1.9;
controls.maxDistance = 33;
controls.maxPolarAngle = Math.PI*.486;
controls.minPolarAngle = .005;
controls.screenSpacePanning = true;
controls.target.set(5.2,.15,3.65);
controls.rotateSpeed = .7;
controls.zoomSpeed = .8;
controls.addEventListener('change',()=>{needsRender=true; requestRender();});
controls.addEventListener('start',()=>{cameraMotion=null;});

const environment = new RoomEnvironment();
const pmrem = new THREE.PMREMGenerator(renderer);
const envRT = pmrem.fromScene(environment,.05);
scene.environment = envRT.texture;
scene.environmentIntensity = .62;
environment.dispose(); pmrem.dispose();
const hemisphere=new THREE.HemisphereLight(0xfffbef,0x716150,1.0);scene.add(hemisphere);
const sun = new THREE.DirectionalLight(0xffecd5,3.2);
sun.position.set(1.4,6.5,-4.8);
sun.castShadow=true;
sun.shadow.mapSize.set(2048,2048);
sun.shadow.camera.left=-9; sun.shadow.camera.right=9;
sun.shadow.camera.top=9; sun.shadow.camera.bottom=-9;
sun.shadow.camera.near=.5; sun.shadow.camera.far=35;
sun.shadow.bias=-.0005; sun.shadow.normalBias=.025;
sun.target.position.set(5,0,4);
scene.add(sun,sun.target);
const fill=new THREE.DirectionalLight(0xe9f0ff,.65);fill.position.set(-5,8,12);scene.add(fill);
const ground = new THREE.Mesh(new THREE.PlaneGeometry(80,80),new THREE.ShadowMaterial({opacity:.15}));
ground.rotation.x=-Math.PI/2;ground.position.y=-.28;ground.receiveShadow=true;scene.add(ground);
const composer=new EffectComposer(renderer);
const aoPass=new SSAOPass(scene,camera,512,512,16);
aoPass.kernelRadius=.22;aoPass.minDistance=.0002;aoPass.maxDistance=.009;
aoPass.normalMaterial.clippingPlanes=[wallPlane];
composer.addPass(new RenderPass(scene,camera));composer.addPass(aoPass);composer.addPass(new OutputPass());

function rng(seed=19){let s=seed;return()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296;};}
function photoTexture(kind,color){
  const source={wood:[0,0],leather:[1,0],weave:[2,0],rug:[0,1],stone:[1,1],plaster:[2,1],tile:[2,1]}[kind];
  if(!atlasImage||!source)return null;
  const key='photo-'+kind+color;if(texturePool.has(key))return texturePool.get(key);
  const n=root.dataset.textureQuality==='full'?512:256;
  const c=document.createElement('canvas');c.width=c.height=n;const ctx=c.getContext('2d',{willReadFrequently:true});
  const sw=atlasImage.width/3,sh=atlasImage.height/2;
  ctx.drawImage(atlasImage,source[0]*sw+3,source[1]*sh+3,sw-6,sh-6,0,0,n,n);
  const img=ctx.getImageData(0,0,n,n),a=img.data;
  let mean=0;for(let i=0;i<a.length;i+=4)mean+=a[i]*.2126+a[i+1]*.7152+a[i+2]*.0722;mean/=n*n;
  const target=new THREE.Color(color);target.convertLinearToSRGB();
  for(let i=0;i<a.length;i+=4){const lum=a[i]*.2126+a[i+1]*.7152+a[i+2]*.0722;const ratio=Math.pow(Math.max(.04,lum/mean),kind==='wood'?.92:.72);a[i]=Math.min(255,target.r*255*ratio);a[i+1]=Math.min(255,target.g*255*ratio);a[i+2]=Math.min(255,target.b*255*ratio);}
  ctx.putImageData(img,0,0);
  const tex=new THREE.CanvasTexture(c);tex.colorSpace=THREE.SRGBColorSpace;tex.wrapS=tex.wrapT=THREE.RepeatWrapping;tex.anisotropy=Math.min(renderer.capabilities.getMaxAnisotropy(),8);tex.userData.baseColor=color;
  texturePool.set(key,tex);return tex;
}
function procedural(kind,color){
  const photo=photoTexture(kind,color);if(photo)return photo;
  const key=kind+color;if(texturePool.has(key))return texturePool.get(key);
  const c=document.createElement('canvas');c.width=c.height=512;const ctx=c.getContext('2d');
  ctx.fillStyle=color;ctx.fillRect(0,0,512,512);const random=rng(135);
  if(kind==='wood'){
    for(let r=0;r<8;r++){
      const yy=r*64;ctx.fillStyle=`rgba(50,25,8,${.025+random()*.07})`;ctx.fillRect(0,yy,512,64);
      ctx.strokeStyle='rgba(49,33,19,.22)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(0,yy);ctx.lineTo(512,yy);ctx.stroke();
      const xx=(r%3)*171;ctx.beginPath();ctx.moveTo(xx,yy);ctx.lineTo(xx,yy+64);ctx.stroke();
      for(let j=0;j<70;j++){let y=yy+random()*64;ctx.beginPath();ctx.moveTo(0,y);for(let x=0;x<=512;x+=32)ctx.lineTo(x,y+Math.sin(x/70+j)*1.5);ctx.strokeStyle=`rgba(64,40,20,${random()*.08})`;ctx.lineWidth=.4+random()*.8;ctx.stroke();}
    }
  } else if(kind==='weave') {
    for(let x=0;x<512;x+=3){ctx.fillStyle=x%6?'rgba(255,255,255,.055)':'rgba(0,0,0,.05)';ctx.fillRect(x,0,1,512);ctx.fillRect(0,x,512,1);}
  } else {
    for(let i=0;i<10000;i++){ctx.fillStyle=`rgba(${random()>.5?'255,255,255':'0,0,0'},${random()*.045})`;ctx.fillRect(random()*512,random()*512,1+random()*2,1+random()*2);}
    if(kind==='stone')for(let i=0;i<40;i++){ctx.strokeStyle='rgba(69,54,38,.025)';ctx.beginPath();let y=random()*512;ctx.moveTo(0,y);for(let x=0;x<=512;x+=30)ctx.lineTo(x,y+Math.sin(x/43+i)*4);ctx.stroke();}
    if(kind==='tile'){ctx.strokeStyle='rgba(100,100,90,.12)';ctx.lineWidth=2;ctx.strokeRect(0,0,512,512);}
  }
  const tex=new THREE.CanvasTexture(c);tex.colorSpace=THREE.SRGBColorSpace;tex.wrapS=tex.wrapT=THREE.RepeatWrapping;
  if(kind==='wood')tex.repeat.set(.45,.45);else if(kind==='tile')tex.repeat.set(1.5,1.5);else if(kind==='weave')tex.repeat.set(1,1);else tex.repeat.set(.65,.65);
  tex.anisotropy=Math.min(renderer.capabilities.getMaxAnisotropy(),4);tex.userData.baseColor=color;texturePool.set(key,tex);return tex;
}
function material(c,rough=.75,extra={}){return new THREE.MeshPhysicalMaterial({color:c,roughness:rough,...extra});}
function createMaterials(p){
  const textured=(kind,color,rough,bump=.003)=>{const t=procedural(kind,color);return material('#ffffff',rough,{map:t,bumpMap:t,bumpScale:bump});};
  const m={wall:textured('plaster',p.wall,.91,.0012),floor:textured('wood',p.floor,.42,.002),wood:textured('wood',p.wood,.40,.002),darkwood:textured('wood',p.darkwood,.38,.002),stone:textured('stone',p.stone,.48,.0018),fabric:textured('leather',p.fabric,.39,.003),accent:textured('weave',p.accent,.9,.004),metal:material(p.metal,.28,{metalness:.92,anisotropy:.45,anisotropyRotation:Math.PI/2}),rug:textured('rug',p.rug,.97,.016),cabinet:textured('wood',p.cabinet,.45,.002),linen:textured('weave',p.linen,.94,.004),tile:textured('tile',p.tile,.59,.003),art:textured('plaster',p.art,.93,.006),ceramic:material('#efede3',.16,{clearcoat:.6,clearcoatRoughness:.15}),black:material('#202321',.25),soil:material('#3c3325',1),leaf:material('#536546',.56,{side:THREE.DoubleSide}),glass:new THREE.MeshPhysicalMaterial({color:'#dbe7dd',roughness:.045,metalness:.02,transparent:true,opacity:.12,depthWrite:false,side:THREE.DoubleSide}),light:material('#fff2dc',.3,{emissive:'#ffdfac',emissiveIntensity:1.0})};
  m.fabric.clearcoat=.13;m.fabric.clearcoatRoughness=.48;
  m.linen.sheen=.7;m.linen.sheenColor=new THREE.Color(p.linen);m.linen.sheenRoughness=.9;
  m.rug.sheen=.5;m.rug.sheenColor=new THREE.Color(p.rug);m.rug.sheenRoughness=.98;
  m.wall.clippingPlanes=[wallPlane];m.wall.clipShadows=true;
  m.frame=material(currentStyle==='original'?'#4b4a40':p.darkwood,.5);m.frame.clippingPlanes=[wallPlane];m.frame.clipShadows=true;
  m.window=m.glass.clone();m.window.clippingPlanes=[wallPlane];
  m.door=m.wood.clone();m.door.clippingPlanes=[wallPlane];
  return m;
}
function add(mesh,parent=model){parent.add(mesh);mesh.castShadow=true;mesh.receiveShadow=true;objects++;return mesh;}
function metricUV(geo,mat){
  if(!geo.attributes.uv)return geo;
  const p=geo.attributes.position,n=geo.attributes.normal,u=geo.attributes.uv;
  const scale=(mat===materials?.fabric?2.2:mat===materials?.linen?9:mat===materials?.rug?6:mat===materials?.floor ? .8 : 1);
  for(let i=0;i<p.count;i++){const nx=Math.abs(n.getX(i)),ny=Math.abs(n.getY(i)),nz=Math.abs(n.getZ(i));let a,b;if(ny>=nx&&ny>=nz){a=p.getX(i);b=p.getZ(i);}else if(nx>=nz){a=p.getZ(i);b=p.getY(i);}else{a=p.getX(i);b=p.getY(i);}u.setXY(i,a*scale,b*scale);}return geo;
}
function box(w,h,d,x,y,z,mat=materials.wood,parent=model){const m=new THREE.Mesh(metricUV(new THREE.BoxGeometry(w,h,d),mat),mat);m.position.set(x,y,z);return add(m,parent);}
function round(w,h,d,r,x,y,z,mat=materials.fabric,parent=model){const m=new THREE.Mesh(metricUV(new RoundedBoxGeometry(w,h,d,4,Math.min(r,w/2,h/2,d/2)),mat),mat);m.position.set(x,y,z);return add(m,parent);}
function cyl(rt,rb,h,x,y,z,mat=materials.wood,parent=model,segments=36){const m=new THREE.Mesh(new THREE.CylinderGeometry(rt,rb,h,segments),mat);m.position.set(x,y,z);return add(m,parent);}
function ball(r,x,y,z,mat=materials.fabric,parent=model){const m=new THREE.Mesh(new THREE.SphereGeometry(r,24,16),mat);m.position.set(x,y,z);return add(m,parent);}
function line(points,color,width=1,parent=model){const g=new THREE.BufferGeometry().setFromPoints(points.map(p=>new THREE.Vector3(...p)));const l=new THREE.Line(g,new THREE.LineBasicMaterial({color,linewidth:width}));parent.add(l);return l;}
function polygon(points,mat,y=0,depth=.12,parent=model){const s=new THREE.Shape();points.forEach((p,i)=>i?s.lineTo(p[0],-p[1]):s.moveTo(p[0],-p[1]));s.closePath();const geo=new THREE.ExtrudeGeometry(s,{depth,bevelEnabled:false});const m=new THREE.Mesh(geo,mat);m.rotation.x=-Math.PI/2;m.position.y=y-depth;return add(m,parent);}
function wall(a,b,openings=[]){
  const len=Math.hypot(b[0]-a[0],b[1]-a[1]), yaw=-Math.atan2(b[1]-a[1],b[0]-a[0]);
  const g=new THREE.Group();g.position.set(a[0],0,a[1]);g.rotation.y=yaw;model.add(g);let start=0;
  function seg(from,to,bottom,top){if(to-from<.015||top-bottom<.015)return;box(to-from,top-bottom,.15,(from+to)/2,(top+bottom)/2,0,materials.wall,g);}
  for(const o of openings.sort((u,v)=>u.s-v.s)){
    seg(start,o.s,0,2.65);seg(o.s,o.e,0,o.b||0);seg(o.s,o.e,o.t||2.12,2.65);
    if(o.type==='window')windowUnit(g,o.s,o.e,o.b||.65,o.t||2.30);
    if(o.type==='door')doorUnit(g,o.s,o.e,o.t||2.12,o.glass);
    start=o.e;
  }
  seg(start,len,0,2.65);
  box(len,.07,.17,len/2,.036,0,materials.frame,g);
  return g;
}
function windowUnit(parent,s,e,b,t){
  const h=t-b,w=e-s;
  box(w,.075,.17,(s+e)/2,b,0,materials.frame,parent);
  box(w,.07,.10,(s+e)/2,t,0,materials.frame,parent);
  const n=Math.max(2,Math.ceil(w/.72));
  for(let i=0;i<=n;i++)box(.037,h,.07,s+w*i/n,(b+t)/2,0,materials.frame,parent);
  box(w-.05,h-.06,.013,(s+e)/2,(b+t)/2,0,materials.window,parent).castShadow=false;
  box(w+.1,.04,.26,(s+e)/2,b-.04,0,materials.door,parent);
}
function doorUnit(parent,s,e,h,glass=false){
  const w=e-s;
  box(.055,h,.19,s,h/2,0,materials.frame,parent);box(.055,h,.19,e,h/2,0,materials.frame,parent);
  box(w,.06,.19,(s+e)/2,h,0,materials.frame,parent);
  if(glass){
    for(let i=0;i<2;i++){const dx=s+w*(i+.5)/2;box(w/2-.04,h-.04,.014,dx,h/2,i*.028,materials.window,parent).castShadow=false;box(.027,h,.055,dx+w/4-.02,h/2,i*.028,materials.frame,parent);}
  }else{
    const leaf=new THREE.Group();leaf.position.set(s,0,0);leaf.rotation.y=-Math.PI*.30;parent.add(leaf);
    box(w-.06,h-.04,.045,(w-.06)/2,h/2,0,materials.door,leaf);
    box(.025,.03,.10,w-.15,1.02,.06,materials.metal,leaf);
  }
}
function architecture(){
  polygon(outline,material('#b6b2a7',.9),-.13,.13);
  rooms.forEach(r=>polygon(r.p,['kitchen','bath','utility','balcony'].includes(r.id)?materials.tile:materials.floor,0,.13));
  // Boundary follows the supplied plan. No compass is assumed.
  wall([0,2.16],[1.20,2.16]);
  wall([1.20,2.16],[3.48,2.16],[{s:.45,e:1.82,b:1.02,t:2.30,type:'window'}]);
  wall([3.48,2.16],[3.48,.57],[{s:.18,e:1.39,b:.67,t:2.40,type:'window'}]);
  wall([3.48,.57],[6.08,.57],[{s:.12,e:2.46,b:.67,t:2.40,type:'window'}]);
  wall([6.08,.57],[6.08,1.17]);
  wall([6.08,1.17],[7.13,1.17],[{s:.09,e:.96,b:.67,t:2.40,type:'window'}]);
  wall([7.13,1.17],[7.13,.78]);wall([7.13,.78],[8.37,.78]);wall([8.37,.78],[8.37,0]);
  wall([8.37,0],[10.64,0],[{s:.08,e:2.18,b:.53,t:2.34,type:'window'}]);
  wall([10.64,0],[10.64,4.40],[{s:.08,e:1.76,b:.53,t:2.34,type:'window'},{s:3.31,e:4.04,b:.80,t:2.28,type:'window'}]);
  wall([10.64,4.40],[9.91,4.40]);
  wall([9.91,4.40],[9.91,7.10],[{s:.82,e:1.65,b:.80,t:2.28,type:'window'}]);
  wall([9.91,7.10],[0,7.10],[{s:6.95,e:7.97,b:0,t:2.12,type:'door'}]);
  wall([0,7.10],[0,2.16],[{s:1.70,e:2.22,b:1.3,t:2.28,type:'window'},{s:2.72,e:4.76,b:.80,t:2.35,type:'window'}]);
  // Interior walls and existing door positions; kitchen and balconies remain separated.
  wall([1.20,2.16],[1.20,4.56],[{s:.88,e:1.66,b:0,t:2.18,type:'door',glass:true}]);
  wall([0,4.56],[1.85,4.56]);
  wall([1.85,4.56],[1.85,7.10],[{s:.82,e:1.64,b:0,t:2.08,type:'door'}]);
  wall([1.85,5.23],[3.48,5.23],[{s:.05,e:.97,b:0,t:2.15,type:'door',glass:currentStyle!=='original'}]);
  wall([3.48,2.16],[3.48,5.23]);
  wall([3.48,2.16],[7.13,2.16],[{s:.30,e:3.12,b:0,t:2.25,type:'door',glass:true}]);
  wall([7.13,1.17],[7.13,7.10],[{s:2.42,e:3.22,b:0,t:2.12,type:'door'},{s:4.11,e:5.03,b:0,t:2.12,type:'door'}]);
  wall([7.13,4.40],[9.91,4.40]);
  // Low bay sill beneath the existing master corner windows.
  box(2.02,.51,.42,9.5,.255,.25,materials.stone);
  const ceiling=polygon(outline,material(palette[currentStyle].wall,.95),2.78,.12);ceiling.userData.roof=true;ceiling.visible=false;ceiling.castShadow=false;
  // Physical plank edges are clipped to the measured-plan polygons, not a rectangular room.
  const inside=(x,z,p)=>{let yes=false;for(let i=0,j=p.length-1;i<p.length;j=i++){const a=p[i],b=p[j];if(((a[1]>z)!==(b[1]>z))&&(x<(b[0]-a[0])*(z-a[1])/(b[1]-a[1])+a[0]))yes=!yes;}return yes;};
  const seamMat=material(palette[currentStyle].darkwood,.86);
  for(const r of rooms.filter(r=>['living','master','second'].includes(r.id)))for(let x=.17;x<10.65;x+=.19){let start=null;for(let z=0;z<=7.12;z+=.04){const hit=inside(x,z,r.p);if(hit&&start===null)start=z;if(!hit&&start!==null){box(.003,.0015,z-start,x,.0016,(z+start)/2,seamMat);start=null;}}}
  for(const [x,z,w] of [[3.82,2.22,.26],[6.72,2.22,.27],[8.55,.16,.24],[10.43,.18,.24]])curtain(x,z,w,2.28);
}
function curtain(x,z,w,h){
  const g=new THREE.PlaneGeometry(w,h,35,12),p=g.attributes.position;
  for(let i=0;i<p.count;i++){const xx=p.getX(i),yy=p.getY(i);p.setXYZ(i,xx,yy+h/2+.04,.055*Math.sin(xx/w*Math.PI*10)+.01*Math.sin(yy*8));}
  g.computeVertexNormals();const mat=materials.linen.clone();mat.side=THREE.DoubleSide;mat.clippingPlanes=[wallPlane];mat.clipShadows=true;const mesh=new THREE.Mesh(g,mat);mesh.position.set(x,0,z);add(mesh);
}
function group(x,z,angle=0,parent=model){const g=new THREE.Group();g.position.set(x,0,z);g.rotation.y=angle;parent.add(g);return g;}
function tube(points,radius,mat,parent=model,closed=false){const path=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)),closed,'centripetal');return add(new THREE.Mesh(new THREE.TubeGeometry(path,Math.max(24,points.length*6),radius,7,closed),mat),parent);}
function cushion(w,h,d,x,y,z,mat=materials.fabric,parent=model,seed=0){
  const geo=new RoundedBoxGeometry(w,h,d,8,Math.min(.09,h*.36));const p=geo.attributes.position;
  for(let i=0;i<p.count;i++){
    const xx=p.getX(i),yy=p.getY(i),zz=p.getZ(i),nx=xx/(w/2),nz=zz/(d/2),top=Math.max(0,yy/(h/2));
    const edge=Math.pow(Math.max(Math.abs(nx),Math.abs(nz)),5);
    const crease=.0045*Math.sin(xx*77+zz*41+seed)*Math.cos(zz*36-seed)*edge;
    p.setXYZ(i,xx+.003*Math.sin(zz*47+seed)*edge,yy+top*(-.016*(1-nx*nx)*(1-nz*nz)+crease),zz);
  }
  geo.computeVertexNormals();metricUV(geo,mat);const mesh=new THREE.Mesh(geo,mat);mesh.position.set(x,y,z);add(mesh,parent);
  const hw=w/2-.025,hd=d/2-.025,rr=Math.min(.055,hw/3,hd/3),pts=[];
  for(const [cx,cz,start] of [[hw-rr,hd-rr,0],[-hw+rr,hd-rr,Math.PI/2],[-hw+rr,-hd+rr,Math.PI],[hw-rr,-hd+rr,Math.PI*1.5]])for(let j=0;j<=7;j++){const a=start+j/7*Math.PI/2;pts.push([x+cx+Math.cos(a)*rr,y+h*.29,z+cz+Math.sin(a)*rr]);}
  tube(pts,.0022,mat,parent,true);return mesh;
}
function cloth(w,l,x,y,z,mat=materials.linen,parent=model){
  const geo=new THREE.PlaneGeometry(w,l,32,42),p=geo.attributes.position;
  for(let i=0;i<p.count;i++){const xx=p.getX(i),zz=p.getY(i),edge=Math.max(0,(Math.abs(xx)/(w/2)-.85)/.15);p.setXYZ(i,x+xx,y+.009*Math.sin(xx*25+zz*9)+.006*Math.cos(zz*30+xx*7)-edge*.08,z+zz);}
  geo.computeVertexNormals();const m=mat.clone();m.side=THREE.DoubleSide;return add(new THREE.Mesh(geo,m),parent);
}
function tagObject(object,text){object.userData.spec=text;object.name=text.split('｜')[0];object.userData.independentObject=true;pickables.push(object);return object;}
function chair(x,z,angle=0,variant='normal'){
  const g=group(x,z,angle),c=currentStyle;
  for(const sx of [-1,1])for(const sz of [-1,1])tube([[sx*.215,.02,sz*.205],[sx*.194,.30,sz*.179],[sx*.181,.455,sz*.17]],.020,materials.wood,g);
  round(.46,.043,.405,.035,0,.417,0,materials.darkwood,g);
  cushion(.465,.075,.41,0,.455,0,c==='east'?materials.rug:materials.fabric,g,9);
  for(const sx of [-1,1])tube([[sx*.18,.41,-.17],[sx*.20,.61,-.207],[sx*.20,.72,-.215]],.018,materials.wood,g);
  const back=[];for(let i=0;i<=20;i++){const a=-1.10+i/20*2.20;back.push([Math.sin(a)*.29,.724+.018*Math.cos(a),-.24+(.29-Math.cos(a)*.29)*.95]);}
  tube(back,.029,materials.wood,g);
  return tagObject(g,'曲木餐椅｜约宽50×深48cm；实木靠背、皮面或编织座面。椅型参考 CH20，当前为手工近似模型。');
}
function plant(x,z,size=.75){
  const g=group(x,z);cyl(.16*size,.11*size,.29*size,0,.145*size,0,materials.stone,g);cyl(.14*size,.14*size,.015,0,.294*size,0,materials.soil,g);
  const random=rng(7);
  for(let i=0;i<7;i++){
    const angle=i*2.4,tx=Math.sin(angle)*.27*size,tz=Math.cos(angle)*.24*size,ty=(.5+random()*.6)*size;
    const path=new THREE.CatmullRomCurve3([new THREE.Vector3(0,.28*size,0),new THREE.Vector3(tx*.45,ty*.75,tz*.45),new THREE.Vector3(tx,ty,tz)]);
    add(new THREE.Mesh(new THREE.TubeGeometry(path,9,.009*size,5,false),materials.leaf),g);
    const leaf=ball(.16*size,tx,ty,tz,materials.leaf,g);leaf.scale.set(.48,1.7,.35);leaf.rotation.set(.5,angle,-.55);
  }return g;
}
function vase(x,y,z,s=.14,mat=materials.stone,parent=model){
  const pts=[new THREE.Vector2(s*.5,0),new THREE.Vector2(s,.05),new THREE.Vector2(s,.18),new THREE.Vector2(s*.50,.28),new THREE.Vector2(s*.47,.35)];
  const mesh=new THREE.Mesh(new THREE.LatheGeometry(pts,28),mat);mesh.position.set(x,y,z);add(mesh,parent);return mesh;
}
function books(x,y,z,parent=model){for(let i=0;i<3;i++){const b=box(.28-i*.015,.035,.19,x,y+i*.036,z,i===1?materials.art:materials.linen,parent);b.rotation.y=i*.13;}}
function artPanel(x,y,z,w,h,orientation=0){
  const g=group(x,z,orientation);box(w,.04,h,0,0,0,materials.wood,g); // replace horizontal base with wall art
  g.children[0].geometry.dispose();g.children[0].geometry=new THREE.BoxGeometry(w,h,.035);g.children[0].position.y=y;
  box(w-.055,h-.055,.04,0,y,.025,materials.linen,g);
  const disc=cyl(w*.26,w*.26,.018,-w*.12,y+.03,.056,materials.art,g);disc.rotation.x=Math.PI/2;
  box(w*.12,h*.58,.023,w*.22,y-h*.12,.075,materials.darkwood,g);return g;
}
function lamp(x,z,kind='orb',height=1.7,parent=model){
  cyl(.15,.18,.035,x,.025,z,materials.metal,parent);cyl(.014,.014,height-.25,x,(height-.25)/2,z,materials.metal,parent,12);
  if(kind==='paper'){
    const l=ball(.29,x,height-.1,z,materials.linen,parent);l.scale.y=1.25;
    for(let j=-3;j<=3;j++){const yy=j*.075;const radius=Math.sqrt(Math.max(.01,.29*.29-(yy/1.25)**2));const ring=new THREE.Mesh(new THREE.TorusGeometry(radius,.0025,4,40),materials.wood);ring.rotation.x=Math.PI/2;ring.position.set(x,height-.1+yy,z);add(ring,parent);}
  }else if(kind==='dome'){
    const mesh=new THREE.Mesh(new THREE.SphereGeometry(.28,32,16,0,Math.PI*2,0,Math.PI/2),materials.accent);mesh.position.set(x,height-.05,z);add(mesh,parent);
    cyl(.22,.22,.04,x,height-.065,z,materials.light,parent);
  }else ball(.18,x,height-.12,z,materials.light,parent);
}
function pendant(x,z,kind='orb'){
  // Ceiling fixtures are hidden in the low-wall dollhouse view to keep circulation legible.
  const g=group(x,z);g.userData.ceiling=true;
  cyl(.013,.013,.4,0,2.43,0,materials.metal,g,10);
  if(kind==='paper'){const b=ball(.30,0,2.12,0,materials.linen,g);b.scale.set(1.45,.67,1);}
  else if(kind==='cluster')for(let i=0;i<3;i++)ball(.13,Math.cos(i*2.1)*.28,2.03+i*.1,Math.sin(i*2.1)*.2,materials.light,g);
  else {const b=ball(.27,0,2.1,0,materials.light,g);b.scale.y=.53;}
  return g;
}
function living(){
  const c=currentStyle,p=palette[c];
  if(c!=='original')round(2.7,.015,2.74,.18,5.22,.019,3.91,materials.rug);
  const sofa=group(4.02,3.74);
  for(const zz of [-.96,.96])for(const xx of [-.30,.31])cyl(.018,.024,.16,xx,.09,zz,materials.metal,sofa,16);
  round(.88,.115,2.34,.02,0,.195,0,materials.darkwood,sofa);
  round(.86,.14,2.30,.05,0,.29,0,materials.fabric,sofa);
  round(.13,.50,2.29,.04,-.38,.57,0,materials.fabric,sofa);
  for(let i=0;i<3;i++){
    cushion(.71,.17,.67,.045,.427,-.705+i*.705,materials.fabric,sofa,i*9);
    const back=group(-.25,-.705+i*.705,0,sofa);back.position.y=.61;back.rotation.z=-.13;
    const m=cushion(.43,.19,.665,0,0,0,materials.fabric,back,i*7);back.rotation.z=-Math.PI/2+.16;
  }
  for(const zz of [-1.085,1.085])cushion(.83,.30,.14,.015,.50,zz,materials.fabric,sofa,5);
  for(const zz of [-.68,.61]){const g=group(-.08,zz,0,sofa);g.position.y=.66;g.rotation.z=-Math.PI/2+.24;g.rotation.x=.13;cushion(.36,.13,.37,0,0,0,zz<0?materials.linen:materials.accent,g,11);}
  const throwGroup=group(.10,.76,0,sofa);cloth(.65,.52,0,.55,0,materials.linen,throwGroup);
  tagObject(sofa,'皮沙发｜约234×88cm；巧克力棕 / 橄榄绿 / 干邑棕，带缝线与软包压痕。定制造型，非已锁定品牌SKU。');
  if(c==='original')round(1.52,.23,.65,.07,.48,.35,-.95,materials.fabric,sofa);
  if(c==='retro'){
    for(const zz of [-.94,.94]){const leg=cyl(.025,.025,.79,0,.18,zz,materials.metal,sofa,14);leg.rotation.z=Math.PI/2;}
  }
  const coffeeStart=model.children.length;
  if(c==='sculpt'){
    const table=group(5.34,3.8);round(.67,.055,1.12,.014,0,.385,0,materials.wood,table);
    round(.50,.015,.89,.012,0,.420,0,materials.stone,table);
    for(const dz of [-.33,.33])box(.53,.24,.07,0,.24,dz,materials.wood,table);
    box(.62,.05,1.06,0,.10,0,materials.wood,table);
    tagObject(table,'叠层茶几｜约67×112cm；顺纹胡桃木 + 哑光深色石材嵌板。定制家具，边角微倒圆。');
  } else if(c==='retro'){
    round(.92,.055,1.23,.20,5.34,.40,3.78,materials.darkwood);
    for(const dx of [-.3,.3])for(const dz of [-.45,.45])cyl(.022,.022,.36,5.34+dx,.19,3.78+dz,materials.metal);
    const small=cyl(.27,.27,.045,6.04,.52,4.20,materials.metal);cyl(.025,.025,.5,6.04,.25,4.20,materials.metal);
  } else if(c==='east'){
    const t=round(.63,.035,1.12,.018,5.32,.41,3.81,materials.stone);
    for(const dx of [-.28,.28])for(const dz of [-.51,.51])box(.023,.40,.023,5.32+dx,.205,3.81+dz,materials.metal);
    box(.56,.03,.83,5.29,.23,3.96,materials.wood);
  }else{box(.65,.075,1.16,5.15,.45,3.78,materials.black);box(.45,.36,.8,5.15,.22,3.78,materials.darkwood);}
  books(5.37,c==='east'?.41:.465,3.66);vase(5.36,c==='east'?.40:.44,4.06,.07,materials.art);
  const coffeeParts=model.children.slice(coffeeStart);coffeeSlot=new THREE.Group();coffeeParts.forEach(part=>coffeeSlot.add(part));coffeeSlot.userData.coffee=true;coffeeSlot.userData.spec='茶几试验｜点击后可在下方替换或移除。';model.add(coffeeSlot);pickables.push(coffeeSlot);
  // Media wall is on the original living/bedroom partition, clear of the bedroom door.
  const media=round(.32,.33,1.88,.012,6.88,.31,2.86,materials.wood);
  for(let i=0;i<3;i++){box(.014,.26,.60,6.71,.325,2.23+i*.62,materials.wood);box(.01,.012,.52,6.696,.46,2.23+i*.62,materials.darkwood);}
  for(const zz of [2.11,3.60])cyl(.014,.020,.145,6.87,.075,zz,materials.metal);
  tagObject(media,'低电视柜｜约188×32cm；胡桃木木皮、连续纹理、内凹拉手和悬浮细腿。定制家具。');
  box(.045,.82,1.44,7.025,1.04,2.82,materials.black);
  box(.012,.76,1.38,6.995,1.04,2.82,material('#343a37',.28,{metalness:.1}));
  if(c==='east')for(let i=0;i<22;i++)box(.02,1.80,.025,7.035,.94,1.95+i*.084,materials.wood);
  else if(c==='sculpt')round(.045,1.78,1.90,.04,7.055,.96,2.85,materials.wall);
  // Compact dining: preserve the route from entry to bedrooms.
  if(c==='retro'){
    round(1.30,.075,.77,.08,5.29,.75,6.03,materials.darkwood);
    for(const xx of [4.78,5.8])for(const zz of [5.77,6.29])cyl(.025,.025,.71,xx,.355,zz,materials.metal);
  }else{
    round(1.34,.045,.77,.075,5.29,.75,6.04,materials.wood);
    for(const xx of [4.75,5.83])for(const zz of [5.75,6.33]){tube([[xx,.02,zz],[xx,.35,zz],[xx,.733,zz]],.026,materials.wood);}
  }
  chair(4.90,5.43,Math.PI);chair(5.63,5.43,Math.PI);chair(4.90,6.66,0);chair(5.63,6.66,0);
  vase(5.29,.79,6.03,.075,materials.art);
  pendant(5.29,6.02,c==='east'?'paper':c==='retro'?'cluster':'orb');
  // Shallow entrance storage; the image does not reveal the complete entrance threshold.
  round(.33,1.05,1.13,.025,2.06,.525,6.48,materials.cabinet);
  box(.03,.74,.70,1.90,1.54,6.37,materials.metal);
  if(c!=='original'){
    artPanel(5.20,1.58,7.012,1.25,.76,Math.PI);
    lamp(4.06,2.50,c==='east'?'paper':c==='retro'?'dome':'orb',1.62);
    artPanel(3.565,1.59,3.71,1.22,.81,Math.PI/2);
  }
}
function bed(x,z,width=1.8,length=2.02,angle=-Math.PI/2,small=false){
  const g=group(x,z,angle),c=currentStyle;
  round(width+.08,.20,length+.06,.05,0,.21,0,materials.wood,g);
  round(width,.20,length,.07,0,.40,0,materials.linen,g);
  cloth(width+.055,length*.78,0,.56,length*.11,small?materials.rug:materials.linen,g);
  round(width+.12,.80,.10,.025,0,.64,-length/2-.03,materials.wood,g);
  round(width-.035,.56,.065,.06,0,.71,-length/2+.031,materials.linen,g);
  const count=width>=1.5?2:1;
  for(let i=0;i<count;i++){const xx=count===2?(i===0?-.43:.43):0;const p=cushion(count===2?.69:.72,.16,.43,xx,.58,-length*.33,materials.linen,g,i*5);p.rotation.x=.1;}
  cloth(width+.08,.43,0,.593,length*.28,materials.rug,g);
  for(let i=0;i<6;i++)line([[-width/2+.05,.583,-.2+i*.12],[width/2-.05,.583,-.2+i*.12]],palette[c].linen,1,g);
  return tagObject(g,'木框软包床｜主卧1.8m、次卧约1.2m；胡桃木框、亚麻靠包与棉麻床品。床头及柜体定制。');
}
function wardrobe(x,z,width,depth,angle=0){
  const g=group(x,z,angle);box(width,2.38,depth,0,1.19,0,materials.cabinet,g);
  const n=Math.max(2,Math.round(width/.47));
  for(let i=0;i<n;i++){
    box(width/n-.012,2.29,.025,-width/2+(i+.5)*width/n,1.21,depth/2+.015,materials.wood,g);
    box(.009,.36,.027,-width/2+(i+1)*width/n-.04,1.16,depth/2+.04,materials.metal,g);
  }return g;
}
function master(){
  const c=currentStyle;
  if(c!=='original')round(2.45,.012,2.57,.05,9.26,.012,2.64,materials.rug);
  bed(9.41,2.67,1.78,2.02,-Math.PI/2);
  wardrobe(7.48,1.84,1.58,.57,Math.PI/2);
  for(const z of [1.49,3.85]){
    if(c==='retro')cyl(.20,.20,.45,10.28,.225,z,materials.metal);
    else round(.35,.40,.34,.055,10.28,.20,z,materials.darkwood);
    ball(.10,10.28,.57,z,materials.light);
  }
  if(c==='east')for(let i=0;i<31;i++)box(.025,1.07,.024,10.545,.56,1.32+i*.091,materials.wood);
  if(c==='sculpt')round(.06,1.08,2.45,.025,10.54,.60,2.68,materials.wood);
  if(c==='retro')box(.035,1.25,2.74,10.545,.68,2.68,materials.accent);
  round(1.90,.045,.35,.025,9.50,.546,.25,materials.fabric);
  books(9.12,.58,.26);plant(8.65,.52,.60);
  artPanel(8.12,1.50,.86,.57,.72,0);
  // Drapery remains at the existing corner glazing, with a fine pleated surface.
  const curtain=materials.linen.clone();curtain.clippingPlanes=[wallPlane];
  for(let j=0;j<6;j++)cyl(.028,.028,2.13,8.51+j*.045,1.32,.14,curtain,model,8);
}
function second(){
  const c=currentStyle;
  if(c==='east'){
    box(2.01,.24,1.31,8.75,.12,6.33,materials.wood);
    round(1.89,.08,1.19,.018,8.75,.285,6.33,materials.rug);
    round(.45,.08,.42,.045,8.08,.38,6.33,materials.fabric);
    box(.90,.07,.52,8.02,.75,4.75,materials.wood);box(.07,.72,.49,7.62,.37,4.75,materials.wood);chair(8.06,5.32,0,'light');
    wardrobe(8.95,4.73,1.14,.53,0);
  }else if(c==='retro'){
    // A compact studio with a daybed rather than an invented enlarged bedroom.
    round(1.98,.24,.78,.07,8.70,.24,6.60,materials.fabric);
    round(1.98,.44,.14,.07,8.70,.49,6.91,materials.fabric);
    for(const x of [7.91,9.45])round(.20,.4,.73,.08,x,.53,6.61,materials.fabric);
    round(1.65,.06,.54,.04,8.60,.76,4.83,materials.wood);
    for(const x of [7.90,9.30])box(.03,.73,.44,x,.38,4.83,materials.metal);
    chair(8.6,5.47,0);box(.65,.41,.045,8.62,1.05,4.66,materials.black);
    for(let j=0;j<3;j++){box(1.25,.035,.20,8.7,1.42+j*.29,4.54,materials.darkwood);}
  }else{
    bed(8.72,6.33,1.19,2.02,-Math.PI/2,true);
    wardrobe(8.00,4.73,1.34,.53,0);
    round(.43,.045,.93,.025,9.60,.75,5.11,materials.wood);
    box(.04,.70,.82,9.73,.37,5.11,materials.wood);chair(9.03,5.11,Math.PI/2);
    books(9.59,.80,4.84);
  }
}
function faucet(x,y,z,angle=0){
  const g=group(x,z,angle);const path=new THREE.CatmullRomCurve3([new THREE.Vector3(0,y,0),new THREE.Vector3(0,y+.28,0),new THREE.Vector3(.14,y+.29,0),new THREE.Vector3(.15,y+.20,0)]);
  add(new THREE.Mesh(new THREE.TubeGeometry(path,16,.013,7,false),materials.metal),g);
}
function kitchen(){
  const c=currentStyle;
  box(.58,.80,2.02,3.11,.41,3.90,materials.cabinet);
  box(.64,.04,2.12,3.09,.84,3.85,materials.stone);
  for(let i=0;i<4;i++){box(.018,.72,.485,2.805,.44,3.13+i*.49,materials.wood);box(.029,.014,.15,2.79,.67,3.13+i*.49,materials.metal);}
  box(1.61,.81,.56,2.34,.405,2.53,materials.cabinet);box(1.66,.04,.60,2.33,.835,2.52,materials.stone);
  box(.51,.018,.64,3.09,.869,4.37,materials.black);
  for(const dz of [-.19,.19]){const ring=new THREE.Mesh(new THREE.TorusGeometry(.105,.009,5,24),materials.metal);ring.rotation.x=Math.PI/2;ring.position.set(3.10,.887,4.37+dz);add(ring);}
  box(.40,.04,.51,3.09,.85,3.40,materials.metal);box(.34,.043,.43,3.075,.86,3.40,materials.black);
  faucet(3.33,.89,3.41,Math.PI);
  box(.62,1.72,.65,1.59,.86,2.59,c==='retro'?materials.cabinet:materials.metal);
  box(.64,.016,.67,1.59,.66,2.59,materials.black);
  for(let i=0;i<3;i++)box(.33,.64,.62,3.27,1.90,3.43+i*.65,materials.cabinet);
  box(.18,.10,.64,3.31,1.53,4.4,materials.metal);
  box(.31,.016,1.78,3.22,1.565,3.74,materials.light);
  vase(2.12,.86,2.51,.07,materials.art);books(2.50,.86,2.51);
}
function bathroom(){
  const glass=materials.glass.clone();glass.opacity=.27;glass.clippingPlanes=[wallPlane];
  box(.88,.43,.48,1.13,.48,4.88,materials.cabinet);box(.91,.045,.52,1.13,.72,4.88,materials.stone);
  round(.45,.12,.30,.045,1.13,.79,4.89,materials.ceramic);round(.34,.016,.20,.04,1.13,.854,4.89,materials.stone);
  faucet(1.15,.77,4.67,Math.PI/2);
  round(.72,.79,.02,.13,1.11,1.41,4.654,materials.metal);
  const shower=group(.51,6.42);
  box(.89,.035,1.03,0,.035,0,materials.stone,shower);
  box(.015,2.1,1.06,.44,1.06,0,glass,shower).castShadow=false;
  box(.89,2.1,.015,0,1.06,-.52,glass,shower).castShadow=false;
  box(.025,2.12,.025,.44,1.07,-.52,materials.frame,shower);
  cyl(.012,.012,1.25,-.30,1.24,0,materials.metal,shower,10);cyl(.10,.10,.028,-.16,1.9,0,materials.metal,shower);
  box(.30,.77,.17,1.33,.4,6.90,materials.ceramic);
  const toilet=round(.36,.40,.58,.13,1.33,.23,6.59,materials.ceramic);round(.38,.055,.49,.14,1.33,.457,6.56,materials.ceramic);
  box(.28,.035,.12,1.70,.77,6.45,materials.metal);
}
function balconies(){
  const c=currentStyle;
  const g=group(5.11,1.28,-.16);
  cyl(.018,.018,.48,-.23,.24,-.22,materials.metal,g,10);cyl(.018,.018,.48,.23,.24,-.22,materials.metal,g,10);
  cyl(.018,.018,.48,-.23,.24,.22,materials.metal,g,10);cyl(.018,.018,.48,.23,.24,.22,materials.metal,g,10);
  round(.68,.11,.65,.14,0,.48,0,materials.fabric,g);round(.68,.40,.12,.06,0,.70,-.26,materials.fabric,g);
  cyl(.22,.22,.04,5.86,.48,1.51,materials.stone);cyl(.035,.035,.44,5.86,.23,1.51,materials.metal);
  plant(3.95,1.16,.88);vase(5.87,.50,1.5,.06,materials.art);
  box(.63,.85,.64,.63,.425,4.05,materials.ceramic);
  const rim=cyl(.21,.21,.055,.63,.48,3.70,materials.metal);rim.rotation.x=Math.PI/2;
  const pane=cyl(.16,.16,.061,.63,.48,3.68,materials.black);pane.rotation.x=Math.PI/2;
  box(.70,.04,.68,.63,.87,4.05,materials.wood);
  for(let i=0;i<2;i++)box(.72,.045,.35,.60,1.38+i*.41,4.33,materials.wood);
  box(.64,.17,.30,.60,1.49,4.32,materials.rug);
  if(c==='east')plant(.35,2.47,.48);
}
function details(){
  // Veneer joints, hardware and small daily objects give the model a human scale.
  for(const zz of [3.13,3.62,4.11,4.60])for(const yy of [.28,.51])box(.012,.004,.46,2.791,yy,zz,materials.darkwood);
  box(.60,.19,.011,1.59,1.47,2.928,materials.darkwood);
  box(.04,.32,.02,1.82,1.09,2.932,materials.metal);
  for(const xx of [.86,1.17,1.48])box(.29,.34,.018,xx,.49,5.127,materials.wood);
  for(const xx of [.93,1.39])box(.13,.015,.027,xx,.62,5.142,materials.metal);
  const soap=round(.06,.13,.047,.009,.86,.81,4.90,materials.art);cyl(.01,.01,.035,.86,.89,4.90,materials.metal);
  for(const yy of [1.12,1.18,1.24,1.30,1.36])tube([[.99,yy,5.76],[1.30,yy,5.76]],.0025,materials.linen);
  box(.37,.018,.018,1.16,1.4,5.76,materials.metal);
  cloth(.31,.36,1.16,1.30,5.76,materials.linen);
  for(const [x,z,yaw] of [[7.03,3.41,Math.PI/2],[3.56,4.80,-Math.PI/2],[4.1,7.012,Math.PI],[10.54,3.22,Math.PI/2]]){
    const g=group(x,z,yaw);round(.08,.12,.013,.008,0,.33,0,materials.ceramic,g);for(const xx of [-.018,.018])box(.004,.015,.016,xx,.336,.003,materials.black,g);
  }
  for(const [x,z] of [[4.35,3.0],[6.7,5.0],[8.5,2.1],[2.3,3.4],[1.1,5.8]]){
    const g=group(x,z);g.userData.ceiling=true;const ring=cyl(.045,.045,.022,0,2.615,0,materials.darkwood,g);cyl(.025,.025,.024,0,2.60,0,materials.light,g);
    const l=new THREE.PointLight(0xffdcb0,.35,4,2);l.position.set(0,2.38,0);g.add(l);
  }
}
function disposeModel(){
  if(!model)return;
  const geometries=new Set(),mats=new Set();model.traverse(o=>{if(o.geometry)geometries.add(o.geometry);if(o.material)(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>mats.add(m));});
  scene.remove(model);geometries.forEach(g=>g.dispose());mats.forEach(m=>m.dispose());
  modelLabels.forEach(l=>l.el.remove());modelLabels.length=0;pickables.length=0;
}
function build(style){
  disposeModel();currentStyle=style;objects=0;model=new THREE.Group();scene.add(model);materials=createMaterials(palette[style]);
  // Preserve the existing geometry and transforms while giving every room and
  // its component meshes a stable scene-graph identity for future replacements.
  const sections=[['architecture',architecture],['living',living],['master',master],['second',second],['kitchen',kitchen],['bath',bathroom],['balconies',balconies],['lighting',details]];
  for(const [id,make] of sections){const start=model.children.length;make();const parts=model.children.slice(start),group=new THREE.Group();group.name=id;group.userData.room=id;parts.forEach((o,i)=>{o.userData.objectId=`${style}/${id}/${i}`;if(!o.name)o.name=`${id}-${i+1}`;group.add(o);});model.add(group);}
  rooms.forEach(r=>{const b=document.createElement('span');b.className='daan-room-label';b.textContent=r.name;b.setAttribute('aria-label',r.name+'，原图标注'+r.area);stage.appendChild(b);modelLabels.push({el:b,pos:new THREE.Vector3(r.label[0],.20,r.label[1]),room:r.id});});
  root.querySelector('[data-style-name]').textContent=palette[style].name;
  root.querySelector('[data-materials]').textContent=palette[style].tag;
  styleButtons.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.style===style)));
  setWalls();updateDetail();needsRender=true;requestRender();
  root.dataset.renderState='ready';root.dataset.style=style;
  status.textContent='已按房间拆分对象 · 拖动旋转 · 点选独立家具看用料';
  root.dispatchEvent(new CustomEvent('daan-style-change',{detail:{style}}));
  applyCoffeeSelection();
}
function setWalls(){
  const full=wallSelect.value==='full';wallPlane.constant=full?2.70:1.12;
  model?.traverse(o=>{if(o.userData.ceiling)o.visible=full;if(o.userData.roof)o.visible=currentView.endsWith('_inside')&&full;});
  needsRender=true;requestRender();
}
const viewData={
  all:{target:[5.15,.50,3.65],pos:[12.8,10.8,15.35]},
  top:{target:[5.15,0,3.55],pos:[5.15,17.5,3.56]},
  living:{target:[5.20,.45,4.24],pos:[10.7,8.2,12.8]},
  master:{target:[9.02,.42,2.35],pos:[14.25,7.5,7.7]},
  second:{target:[8.57,.38,5.77],pos:[12.12,6.7,9.6]},
  kitchen:{target:[2.27,.52,3.70],pos:[6.95,7.4,8.6]},
  bath:{target:[.99,.46,5.90],pos:[4.98,6.5,10.1]},
  living_inside:{target:[5.24,1.17,5.73],pos:[5.42,1.58,2.37]},
  sofa_detail:{target:[4.07,.57,3.85],pos:[5.77,1.29,5.24]},
  table_detail:{target:[5.31,.32,3.82],pos:[6.21,1.35,4.55]},
  master_inside:{target:[9.65,1.01,2.47],pos:[7.58,1.58,3.95]}
};
function setView(view,instant=false){
  const wasInside=currentView.endsWith('_inside');
  currentView=view;const v=viewData[view]||viewData.all;const pos=new THREE.Vector3(...v.pos),target=new THREE.Vector3(...v.target);
  camera.fov=view.endsWith('_inside')?56:view.includes('detail')?44:39;camera.updateProjectionMatrix();
  aoPass.ssaoMaterial.uniforms.cameraProjectionMatrix.value.copy(camera.projectionMatrix);aoPass.ssaoMaterial.uniforms.cameraInverseProjectionMatrix.value.copy(camera.projectionMatrixInverse);
  if(view.endsWith('_inside')||view.includes('detail')){wallSelect.value='full';setWalls();}else{if(wasInside||wallSelect.value==='full'){wallSelect.value='cut';setWalls();}model?.traverse(o=>{if(o.userData.roof)o.visible=false;});}
  const aspect=stage.clientWidth/Math.max(stage.clientHeight,1);
  if(['all','top'].includes(view))pos.sub(target).multiplyScalar(Math.max(1,1.26/aspect)).add(target);
  if(instant||window.matchMedia('(prefers-reduced-motion: reduce)').matches){camera.position.copy(pos);controls.target.copy(target);controls.update();}
  else cameraMotion={start:performance.now(),from:camera.position.clone(),fromTarget:controls.target.clone(),to:pos,target,duration:650};
  controls.minDistance=view.includes('detail')?.45:1.3;
  root.dataset.view=view;updateDetail();needsRender=true;requestRender();
}
function updateDetail(){
  if(currentView==='sofa_detail')detail.textContent='皮面软包 · 独立坐垫 · 缝线 · 木底座 · 定制造型';
  else if(currentView==='table_detail')detail.textContent='顺纹木作 · 石材嵌板 · 微倒圆边角 · 定制造型';
  else if(currentView==='second')detail.textContent=currentStyle==='retro'?'次卧约7.2㎡ · 书房 + 沙发床':currentStyle==='east'?'次卧约7.2㎡ · 榻榻米 + 阅读位':'次卧约7.2㎡ · 1.2m客床 + 窗边书桌';
  else if(currentView.startsWith('master'))detail.textContent='主卧约13.5㎡ · 转角窗 · 1.8m床 · 衣柜位置为方案';
  else if(currentView==='kitchen')detail.textContent='厨房约6.6㎡ · 保留独立厨房与生活阳台';
  else if(currentView==='bath')detail.textContent='卫生间约4.3㎡ · 洁具与排水位置待复尺';
  else if(currentView.startsWith('living'))detail.textContent='客餐厅原图标注21.4㎡ · 保留原门洞和阳台分隔';
  else detail.textContent='概念比例模型 · 净高暂按2.65m · 入户被原图遮挡，位置待复尺';
}
function labels(){
  const show=labelCheck.checked||currentView==='top',w=stage.clientWidth,h=stage.clientHeight;
  for(const l of modelLabels){
    const p=l.pos.clone().project(camera),on=show&&p.z<1&&Math.abs(p.x)<.90&&Math.abs(p.y)<.90;
    l.el.hidden=!on;if(on){l.el.style.left=((p.x*.5+.5)*w)+'px';l.el.style.top=((-p.y*.5+.5)*h)+'px';}
  }
}
function render(t){
  raf=0;if(!visible)return;rendering=true;
  if(cameraMotion){const m=cameraMotion,u=Math.min((t-m.start)/m.duration,1),k=u*u*(3-2*u);camera.position.lerpVectors(m.from,m.to,k);controls.target.lerpVectors(m.fromTarget,m.target,k);needsRender=true;if(u===1)cameraMotion=null;}
  const changed=controls.update();if(needsRender||changed){if(currentView.endsWith('_inside'))composer.render();else renderer.render(scene,camera);labels();needsRender=false;lastTime=t;}
  rendering=false;if(cameraMotion||changed||performance.now()-lastTime<250)requestRender();
}
function requestRender(){if(!raf&&visible&&!rendering)raf=requestAnimationFrame(render);}
function resize(){const w=Math.max(stage.clientWidth,1),h=Math.max(stage.clientHeight,1),old=camera.aspect;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();composer.setSize(w,h);if(Math.abs(old-camera.aspect)>.20&&['all','top'].includes(currentView))setView(currentView,true);needsRender=true;requestRender();}
new ResizeObserver(resize).observe(stage);
new IntersectionObserver(e=>{visible=e[0].isIntersecting;if(visible){needsRender=true;requestRender();}},{rootMargin:'100px'}).observe(stage);
styleButtons.forEach(b=>b.addEventListener('click',()=>build(b.dataset.style)));
viewSelect.addEventListener('change',()=>setView(viewSelect.value));
wallSelect.addEventListener('change',setWalls);
labelCheck.addEventListener('change',()=>{needsRender=true;requestRender();});
root.querySelector('[data-rotate-left]').addEventListener('click',()=>orbitNudge(-.25));
root.querySelector('[data-rotate-right]').addEventListener('click',()=>orbitNudge(.25));
function orbitNudge(angle){const p=camera.position.clone().sub(controls.target);p.applyAxisAngle(new THREE.Vector3(0,1,0),angle);camera.position.copy(controls.target).add(p);needsRender=true;requestRender();}
root.querySelector('[data-zoom-in]').addEventListener('click',()=>zoom(.83));
root.querySelector('[data-zoom-out]').addEventListener('click',()=>zoom(1.2));
function zoom(f){const p=camera.position.clone().sub(controls.target);p.multiplyScalar(f);p.setLength(THREE.MathUtils.clamp(p.length(),controls.minDistance,controls.maxDistance));camera.position.copy(controls.target).add(p);needsRender=true;requestRender();}
const themeObserver=new MutationObserver(()=>{needsRender=true;requestRender();});themeObserver.observe(document.documentElement,{attributes:true,attributeFilter:['class','style','data-theme']});
canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();status.textContent='3D显示暂时中断，请重新打开预览。';root.dataset.renderState='context-lost';});
let pointerStart=null;
canvas.addEventListener('pointerdown',e=>{pointerStart=[e.clientX,e.clientY];});
canvas.addEventListener('pointerup',e=>{if(!pointerStart||Math.hypot(e.clientX-pointerStart[0],e.clientY-pointerStart[1])>6)return;const rect=canvas.getBoundingClientRect(),v=new THREE.Vector2((e.clientX-rect.left)/rect.width*2-1,-(e.clientY-rect.top)/rect.height*2+1),ray=new THREE.Raycaster();ray.setFromCamera(v,camera);const hit=ray.intersectObjects(pickables,true)[0];if(hit){let o=hit.object;while(o&&!o.userData.spec)o=o.parent;if(o){detail.textContent=o.userData.spec;let part=o;while(part&&!part.userData.coffee)part=part.parent;if(part)document.dispatchEvent(new CustomEvent('tingjian:coffee-picked'));}}});
const lightSelect=root.querySelector('[data-light]');
lightSelect?.addEventListener('change',()=>{const evening=lightSelect.value==='evening';sun.intensity=evening?.50:3.2;hemisphere.intensity=evening?.65:1;fill.intensity=evening?.2:.65;scene.environmentIntensity=evening?.35:.62;renderer.toneMappingExposure=evening?1.15:1.02;needsRender=true;requestRender();});
build(palette[root.dataset.requestedStyle]?root.dataset.requestedStyle:'sculpt');setView('living',true);viewSelect.value='living';resize();
const atlas=root.querySelector('[data-atlas]');
if(atlas){const ready=()=>{if(!atlas.naturalWidth)return;atlasImage=atlas;texturePool.forEach(t=>t.dispose());texturePool.clear();build(currentStyle);root.dataset.textures='ready';};if(atlas.complete)ready();else atlas.addEventListener('load',ready,{once:true});}

function coffeeState(){const el=document.getElementById('furniture-trial');return selection({choice:el.dataset.choice,length:el.dataset.length,angle:el.dataset.angle,offset:el.dataset.offset});}
async function applyCoffeeSelection(){
  let value;try{value=coffeeState();}catch{return;}
  const eligible=currentStyle==='sculpt';
  if(coffeeSlot)coffeeSlot.visible=!eligible||value.choice==='original';
  if(previewTable)previewTable.visible=false;
  needsRender=true;requestRender();
  if(!eligible||value.choice!=='table')return;
  try{
    if(!previewTable){
      status.textContent='正在载入茶几轻量模型…';
      if(!tableLoading)tableLoading=new GLTFLoader().loadAsync('/tour/trial-assets/table-preview.glb').then(result=>{
        previewTable=result.scene;previewTable.visible=false;previewTable.userData.coffee=true;previewTable.userData.spec='黑漆矮茶几｜用户提供模型的轻量预览，默认长112cm，尺寸尚待厂家核实。';
        previewTable.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;o.material=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.28,metalness:0});}});scene.add(previewTable);return previewTable;
      }).catch(error=>{tableLoading=null;throw error;});
      await tableLoading;
    }
    value=coffeeState();if(currentStyle!=='sculpt'||value.choice!=='table')return;
    previewTable.scale.setScalar(value.length/112);previewTable.position.set(5.34-value.offset/100,.02,3.8);previewTable.rotation.y=Math.PI/2+value.angle*Math.PI/180;previewTable.visible=true;
    if(!pickables.includes(previewTable))pickables.push(previewTable);
    status.textContent='茶几已替换 · 下方点击初步渲染查看写实场景';needsRender=true;requestRender();
  }catch{if(coffeeSlot)coffeeSlot.visible=true;status.textContent='茶几模型载入失败，可在下方查看写实样张或重试。';needsRender=true;requestRender();}
}
document.addEventListener('tingjian:coffee-change',()=>{if(currentStyle!=='sculpt')build('sculpt');else applyCoffeeSelection();});
