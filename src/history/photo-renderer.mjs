import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import {PHOTO,selection} from './trial-state.mjs';

function image(url){return new Promise((resolve,reject)=>{const im=new Image();im.decoding='async';im.onload=()=>resolve(im);im.onerror=()=>reject(new Error('背景图没有加载成功，请重试'));im.src=url;});}
function blob(canvas){return new Promise((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(new Error('效果图导出失败')),'image/png'));}
function disposeObject(object){const geometries=new Set(),materials=new Set(),textures=new Set();object?.traverse(o=>{if(o.geometry)geometries.add(o.geometry);for(const m of (Array.isArray(o.material)?o.material:o.material?[o.material]:[])){materials.add(m);for(const value of Object.values(m))if(value?.isTexture)textures.add(value);}});geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());textures.forEach(t=>t.dispose());}

// A single on-demand frame of the actual supplied mesh. No orbit controls,
// animation loop or retained WebGL renderer in the photographic viewer.
export async function renderPhoto(input,onProgress=()=>{}){
  const state=selection(input);
  const canvas=document.createElement('canvas');canvas.width=PHOTO.width;canvas.height=PHOTO.height;
  const ctx=canvas.getContext('2d');if(!ctx)throw new Error('当前浏览器无法合成图片');
  onProgress('正在读取当前视角…');
  const background=await image(state.choice==='original'?'/tour/trial-assets/original-room.jpg':'/tour/trial-assets/table-removed.png');
  ctx.drawImage(background,0,0,canvas.width,canvas.height);
  if(state.choice!=='table'){onProgress('正在导出当前效果…');return blob(canvas);}
  let renderer,model,environment,envRT,scene;
  try{
    onProgress('正在读取茶几模型…');
    model=(await new GLTFLoader().loadAsync('/assets/models/table.glb')).scene;
    onProgress('正在计算透视、材质与接地阴影…');
    renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,preserveDrawingBuffer:true,powerPreference:'low-power'});
    renderer.setPixelRatio(1);renderer.setSize(PHOTO.width,PHOTO.height,false);
    renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.08;
    renderer.setClearColor(0,0);renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
    scene=new THREE.Scene();
    const camera=new THREE.PerspectiveCamera(PHOTO.fov,PHOTO.width/PHOTO.height,.05,40);
    camera.position.set(...PHOTO.camera);camera.lookAt(...PHOTO.target);
    environment=new RoomEnvironment();const pmrem=new THREE.PMREMGenerator(renderer);envRT=pmrem.fromScene(environment,.08);pmrem.dispose();environment.dispose();environment=null;
    scene.environment=envRT.texture;scene.environmentIntensity=.58;
    scene.add(new THREE.HemisphereLight(0xffefda,0x4b3827,1.2));
    const sun=new THREE.DirectionalLight(0xffe0b7,2.4);sun.position.set(-3,5,2);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);sun.shadow.camera.left=-2;sun.shadow.camera.right=2;sun.shadow.camera.top=2;sun.shadow.camera.bottom=-2;sun.shadow.camera.near=.1;sun.shadow.camera.far=15;sun.shadow.normalBias=.003;sun.shadow.bias=-.0002;sun.shadow.radius=3;scene.add(sun);
    const fill=new THREE.DirectionalLight(0xe5ecff,.45);fill.position.set(3,3,1);scene.add(fill);
    const shadow=new THREE.Mesh(new THREE.PlaneGeometry(6,6),new THREE.ShadowMaterial({opacity:.24}));shadow.rotation.x=-Math.PI/2;shadow.receiveShadow=true;shadow.position.y=.002;scene.add(shadow);
    model.scale.setScalar(state.length/112);model.rotation.y=Math.PI/2+state.angle*Math.PI/180;model.position.set(PHOTO.objectPosition[0]+state.offset/100,PHOTO.objectPosition[1],PHOTO.objectPosition[2]);
    model.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;const mats=Array.isArray(o.material)?o.material:[o.material];for(const m of mats){m.roughness=.28;m.metalness=0;if(m.map)m.map.anisotropy=Math.min(4,renderer.capabilities.getMaxAnisotropy());}}});scene.add(model);
    renderer.render(scene,camera);ctx.drawImage(renderer.domElement,0,0);
    onProgress('正在导出当前效果…');return await blob(canvas);
  }finally{if(scene)disposeObject(scene);else disposeObject(model);environment?.dispose();envRT?.dispose();renderer?.dispose();renderer?.forceContextLoss();}
}
