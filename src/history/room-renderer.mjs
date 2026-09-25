import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {ASSET,ORIGINAL,PHOTO,VIEWS,itemFor,validateState,isOriginal,sceneFor} from './room-state.mjs';
import {MASKS,FLOOR_EXCLUSIONS} from './room-masks.mjs';
import {illuminationTexture,bakeContacts,integrateGround,softenRugEdge} from './room-integration.mjs';
export {MASKS};
const pictureCache=new Map();
function readImage(url){if(!pictureCache.has(url))pictureCache.set(url,new Promise((resolve,reject)=>{const im=new Image();im.decoding='async';im.onload=()=>resolve(im);im.onerror=()=>{pictureCache.delete(url);reject(new Error('场景图片载入失败，请重试'));};im.src=url;}));return pictureCache.get(url);}
export function toBlob(canvas){return new Promise((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(new Error('图片导出失败')),'image/png'));}
function polygon(ctx,points){ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();}
function photoTexture(image,polygons,holes=[],plant=false){
 const canvas=document.createElement('canvas');canvas.width=PHOTO.width;canvas.height=PHOTO.height;const ctx=canvas.getContext('2d');
 if(polygons){for(const p of polygons){ctx.save();polygon(ctx,p);ctx.clip();ctx.drawImage(image,0,0,PHOTO.width,PHOTO.height);ctx.restore();}}else ctx.drawImage(image,0,0,PHOTO.width,PHOTO.height);
 if(holes.length){ctx.globalCompositeOperation='destination-out';for(const p of holes){polygon(ctx,p);ctx.fill();}ctx.globalCompositeOperation='source-over';}
 if(plant){
  // A small colour-key silhouette retains fine green branches above the vase
  // without reintroducing a rectangle of the original floor behind them.
  const patch=document.createElement('canvas');patch.width=144;patch.height=88;const p=patch.getContext('2d');p.drawImage(image,681,598,144,88,0,0,144,88);const pixels=p.getImageData(0,0,144,88);
  for(let i=0;i<pixels.data.length;i+=4){const r=pixels.data[i],g=pixels.data[i+1],b=pixels.data[i+2];pixels.data[i+3]=Math.round(255*Math.max(0,Math.min(1,(g-r*.9)/4,(g-b*1.12)/5)));}p.putImageData(pixels,0,0);ctx.drawImage(patch,681,598);
 }
 const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;texture.generateMipmaps=true;texture.minFilter=THREE.LinearMipmapLinearFilter;texture.anisotropy=8;return texture;
}
export function referenceCamera(){const c=new THREE.PerspectiveCamera(PHOTO.fov,1.5,.05,50);c.position.set(...PHOTO.camera);c.lookAt(...PHOTO.target);c.updateMatrixWorld();return c;}
function projectedMaterial(texture,projection,surround=null){
 const m=new THREE.MeshBasicMaterial({map:texture,side:THREE.DoubleSide,transparent:true,alphaTest:.01,depthWrite:true,toneMapped:false});
 m.onBeforeCompile=shader=>{
  shader.uniforms.referenceProjection={value:projection};shader.uniforms.surroundPhoto={value:surround};shader.uniforms.referenceEye={value:new THREE.Vector3(...PHOTO.camera)};
  shader.vertexShader='uniform mat4 referenceProjection; varying vec4 photographPosition; varying vec3 photoWorld;\n'+shader.vertexShader;
  shader.vertexShader=shader.vertexShader.replace('#include <project_vertex>','#include <project_vertex>\n photoWorld=(modelMatrix*vec4(transformed,1.0)).xyz; photographPosition = referenceProjection * vec4(photoWorld, 1.0);');
  shader.fragmentShader='uniform sampler2D surroundPhoto; uniform vec3 referenceEye; varying vec4 photographPosition; varying vec3 photoWorld;\n'+shader.fragmentShader;
  shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>',surround?`vec3 dir=normalize(photoWorld-referenceEye);
   vec2 sphericalUV=vec2(0.5+atan(dir.x,-dir.z)/6.2831853,0.5+asin(clamp(dir.y,-1.0,1.0))/3.14159265);
   vec4 surroundColor=texture2D(surroundPhoto,sphericalUV);
   vec2 photoUV=photographPosition.xy/photographPosition.w*0.5+0.5;
   float edge=min(min(photoUV.x,1.0-photoUV.x),min(photoUV.y,1.0-photoUV.y));
   float blend=photographPosition.w>0.0?smoothstep(0.0,0.04,edge):0.0;
   diffuseColor*=mix(surroundColor,texture2D(map,clamp(photoUV,0.0,1.0)),blend);`:`vec2 photoUV=photographPosition.xy/photographPosition.w*0.5+0.5;
   if(photographPosition.w<=0.0||photoUV.x<0.0||photoUV.x>1.0||photoUV.y<0.0||photoUV.y>1.0) discard;
   diffuseColor *= texture2D(map, photoUV);`);
 };m.customProgramCacheKey=()=>surround?'tingjian-projection-surround-v5':'tingjian-projection-alpha-v5';return m;
}
function plane(scene,w,h,material,position,rotation=[0,0,0]){const o=new THREE.Mesh(new THREE.PlaneGeometry(w,h),material);o.position.set(...position);o.rotation.set(...rotation);scene.add(o);return o;}
export function disposeScene(scene){const geometries=new Set(),materials=new Set(),textures=new Set();scene?.traverse(o=>{if(o.geometry)geometries.add(o.geometry);for(const m of Array.isArray(o.material)?o.material:o.material?[o.material]:[]){materials.add(m);for(const t of Object.values(m))if(t?.isTexture)textures.add(t);}});geometries.forEach(x=>x.dispose());materials.forEach(x=>x.dispose());textures.forEach(x=>x.dispose());}
function softenMask(texture){const canvas=document.createElement('canvas');canvas.width=PHOTO.width;canvas.height=PHOTO.height;const ctx=canvas.getContext('2d');ctx.filter='blur(.55px)';ctx.drawImage(texture.image,0,0);texture.image=canvas;texture.needsUpdate=true;return texture;}
function toneMaterial(material,tone){
 // Re-colour the material's diffuse layer, preserving measured weave/wood detail.
 const canvas=document.createElement('canvas');canvas.width=canvas.height=48;const ctx=canvas.getContext('2d');ctx.drawImage(material.map.image,0,0,48,48);const data=ctx.getImageData(0,0,48,48).data;
 const linear=x=>x<=.04045?x/12.92:Math.pow((x+.055)/1.055,2.4);let mean=0;
 for(let i=0;i<data.length;i+=4)mean+=.2126*linear(data[i]/255)+.7152*linear(data[i+1]/255)+.0722*linear(data[i+2]/255);mean=Math.max(.005,mean/(48*48));
 material.onBeforeCompile=shader=>{shader.uniforms.finishTone={value:new THREE.Vector3(...tone)};shader.uniforms.finishMean={value:mean};shader.fragmentShader='uniform vec3 finishTone;uniform float finishMean;\n'+shader.fragmentShader;shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>',`#include <map_fragment>\nfloat finishDetail=clamp(dot(diffuseColor.rgb,vec3(.2126,.7152,.0722))/finishMean,.18,2.3);diffuseColor.rgb=finishTone*mix(1.0,finishDetail,.72);`);};
 material.customProgramCacheKey=()=>`edition-tone-${tone.join('-')}`;material.userData.finishTone=tone;
}
function addOriginal(slot,category,projection,photos){
 const material=projectedMaterial(photoTexture(category==='rug'?photos.removed:photos.original,MASKS[category],[],category==='table'),projection);
 const mesh=plane(slot,14,category==='sofa'?7:14,material,category==='sofa'?[1.30,2,-2]:[0,category==='table'?.28:.008,-2],category==='sofa'?[0,Math.PI/2,0]:[-Math.PI/2,0,0]);
 mesh.renderOrder=category==='sofa'?3:category==='table'?2:1;if(category!=='rug')material.depthTest=false;mesh.userData.photoProxy=true;
 // Invisible depth-only surrogates cast contact shadows for photo originals.
 if(category!=='rug'){const mat=new THREE.MeshBasicMaterial({colorWrite:false,depthWrite:false}),proxy=new THREE.Mesh(new THREE.BoxGeometry(...(category==='table'?[.70,.34,1.12]:[.85,.68,2.34])),mat);proxy.position.set(category==='table'?-.035:1.52,category==='table'?.19:.38,category==='table'?-.20:-.5);proxy.castShadow=true;slot.add(proxy);}
}
async function materialFor(item,category,state,manager){
 const loader=new THREE.TextureLoader(manager),prefix=ASSET+'materials/'+item.material+'/'+item.material;
 const [map,normal,arm]=await Promise.all(['_diff_1k.jpg','_nor_gl_1k.jpg','_arm_1k.jpg'].map(ext=>loader.loadAsync(prefix+ext)));map.colorSpace=THREE.SRGBColorSpace;
 const tiles={curly_teddy_natural:[.335804,.3309],poly_wool_herringbone:[.270079,.2757],wooden_floor_02:[1.942,1.942],marble_01:[1.5,1.5]},tile=tiles[item.material];
 const width=category==='rug'?state.length/100*2/3:5.24,depth=category==='rug'?state.length/100:9,multiplier=category==='floor'?100/state.length:1;
 for(const t of [map,normal,arm]){t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=8;t.repeat.set(width/tile[0]*multiplier,depth/tile[1]*multiplier);}
 const material=new THREE.MeshStandardMaterial({map,normalMap:normal,roughnessMap:arm,aoMap:arm,aoMapIntensity:.65,roughness:category==='rug'?1:.83,metalness:0,normalScale:new THREE.Vector2(category==='rug'?.30:.16,category==='rug'?.30:.16),side:THREE.DoubleSide});if(item.tone)toneMaterial(material,item.tone);return material;
}
export async function addModel(slot,item,pose,manager){
 const model=(await new GLTFLoader(manager).loadAsync(item.file)).scene;model.updateMatrixWorld(true);
 let box=new THREE.Box3().setFromObject(model),size=box.getSize(new THREE.Vector3()),center=box.getCenter(new THREE.Vector3());
 const scale=pose.length/100/(item.category==='rug'||item.lengthAxis==='z'?size.z:size.x);
 model.scale.multiplyScalar(scale);model.position.set(-center.x*scale,-box.min.y*scale,-center.z*scale);slot.add(model);
 slot.rotation.y=((item.rotation||0)+pose.angle)*Math.PI/180;
 slot.position.set(item.category==='sofa'?1.52+pose.offset/100:-.035+pose.offset/100,item.category==='rug'?.008:.018,item.category==='sofa'?-.50:item.category==='rug'?-.55:-.20);
 const finished=new Set();model.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;for(const mat of Array.isArray(o.material)?o.material:[o.material]){if(finished.has(mat))continue;finished.add(mat);for(const val of Object.values(mat))if(val?.isTexture)val.anisotropy=8;if(item.id==='black-table'){mat.roughness=.36;mat.metalness=0;}if(item.category==='rug'){mat.roughness=1;mat.metalness=0;mat.normalScale?.set(.45,.45);}if(item.id==='sofa-02'){mat.metalness=0;mat.normalScale?.set(.7,.7);}if(item.finish==='smoked'){if(item.category==='table'){mat.color.multiply(new THREE.Color().setRGB(.68,.60,.50));mat.roughness=.85;mat.metalness=0;}else if(mat.name.includes('legs')){mat.color.multiply(new THREE.Color().setRGB(.50,.36,.24));mat.roughness=.8;}}}}});return slot;
}
async function addReconstructedTable(slot,pose,manager){
 const wood=await materialFor({material:'wooden_floor_02'},'rug',{length:100},manager);wood.color.set('#725440');wood.roughness=.45;
 const stone=new THREE.MeshStandardMaterial({color:0x3d3b35,roughness:.5});
 const part=(w,h,d,y,mat,z=0)=>{const o=new THREE.Mesh(new RoundedBoxGeometry(w,h,d,2,.008),mat);o.position.set(0,y,z);o.castShadow=o.receiveShadow=true;slot.add(o);};
 part(.72,.055,1.16,.393,wood);part(.54,.014,.91,.428,stone);part(.62,.055,1.06,.085,wood);
 for(const z of [-.38,.38])part(.57,.26,.065,.225,wood,z);
 slot.position.set(-.035+pose.offset/100,.016,-.20);slot.rotation.y=pose.angle*Math.PI/180;slot.userData.approximation=true;
}
export function makeRenderer(canvas){
 const renderer=new THREE.WebGLRenderer({...(canvas?{canvas}:{}),antialias:true,alpha:false,preserveDrawingBuffer:true,powerPreference:'default'});
 renderer.setPixelRatio(1);renderer.setSize(PHOTO.width,PHOTO.height,false);renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=.94;renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.setClearColor(0xd5cbbc,1);return renderer;
}
export async function buildRoomScene(input,renderer,report=()=>{},{walk=false}={}){
 const state=validateState(input),design=sceneFor(state),scene=new THREE.Scene(),extras=[],slots={},contactTargets=[],groundMaterials=[];let envRT;
 try{
 report({label:'读取房间与独立物件…'});
 const photos=Object.fromEntries(await Promise.all([['original',ORIGINAL],['clean',design.plate],['removed','/tour/trial-assets/table-removed.png'],...(walk?[['surround','/tour/trial-assets/room-surround-v5.png']]:[])].map(async([key,path])=>[key,await readImage(path)])));
 renderer.toneMappingExposure=design.exposure||.94;
 const ref=referenceCamera(),projection=new THREE.Matrix4().multiplyMatrices(ref.projectionMatrix,ref.matrixWorldInverse);
 let surround=null;if(walk){surround=new THREE.Texture(photos.surround);surround.colorSpace=THREE.SRGBColorSpace;surround.wrapS=THREE.RepeatWrapping;surround.needsUpdate=true;extras.push(surround);}
 const clean=photoTexture(photos.clean),wallMat=projectedMaterial(clean,projection,surround),shell=new THREE.Group();shell.name='architecture';scene.add(shell);
 plane(shell,5.24,9,wallMat,[0,0,-.5],[-Math.PI/2,0,0]);plane(shell,5.24,3,wallMat,[0,1.5,-4.70]);plane(shell,5.24,3,wallMat,[0,1.5,4],[0,Math.PI,0]);plane(shell,8.7,3,wallMat,[-2.62,1.5,-.35],[0,Math.PI/2,0]);plane(shell,8.7,3,wallMat,[2.62,1.5,-.35],[0,-Math.PI/2,0]);plane(shell,5.24,9,wallMat,[0,2.95,-.5],[Math.PI/2,0,0]);
 const pmrem=new THREE.PMREMGenerator(renderer);
 if(walk){const environment=new RoomEnvironment();envRT=pmrem.fromScene(environment,.06);environment.dispose();}
 else{scene.updateMatrixWorld(true);envRT=pmrem.fromScene(scene,.055,.05,30,{size:128,position:new THREE.Vector3(0,1.1,.2)});}
 pmrem.dispose();scene.environment=envRT.texture;scene.environmentIntensity=walk?.38:(design.environment||1.05);
 scene.add(new THREE.HemisphereLight(0xfff5e9,0x66503d,1.15));const sun=new THREE.DirectionalLight(0xfff0df,1.35);sun.position.set(-3,5,3);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);sun.shadow.camera.left=-4;sun.shadow.camera.right=4;sun.shadow.camera.top=5;sun.shadow.camera.bottom=-4;sun.shadow.camera.near=.1;sun.shadow.camera.far=18;sun.shadow.normalBias=.001;sun.shadow.bias=-.00005;sun.shadow.radius=4;scene.add(sun);const fill=new THREE.DirectionalLight(0xe9efff,.28);fill.position.set(3,3,2);scene.add(fill);
 const manager=new THREE.LoadingManager();manager.onProgress=(url,loaded,total)=>report({label:'读取家具与材质',loaded,total});
 for(const category of ['floor','rug','table','sofa']){
  const pose=state.objects[category],item=itemFor(pose.item),slot=new THREE.Group();slot.name=category;slot.userData.category=category;slots[category]=slot;scene.add(slot);if(pose.item==='none')continue;
  if(item.kind==='original'){
   if(!walk){if(category!=='floor')addOriginal(slot,category,projection,photos);if(category==='rug')groundMaterials.push({material:slot.children[0].material,rug:true,photo:true});continue;}
   if(category==='table'){await addReconstructedTable(slot,pose,manager);continue;}
   if(category==='sofa'){await addModel(slot,itemFor('sofa-02'),{...pose,length:234},manager);slot.userData.approximation=true;continue;}
   const mat=await materialFor({material:category==='floor'?'wooden_floor_02':'curly_teddy_natural'},category,pose,manager);mat.color.set(category==='floor'?'#795b46':'#b49c78');
   const mesh=plane(slot,category==='floor'?5.24:1.75,category==='floor'?9:2.5,mat,category==='floor'?[0,.004,-.5]:[-.05,.014,-.55],[-Math.PI/2,0,0]);mesh.receiveShadow=true;continue;
  }
  if(item.kind==='model'){await addModel(slot,item,pose,manager);if(!walk&&category==='rug'){const seen=new Set();slot.traverse(o=>{if(o.isMesh)for(const material of Array.isArray(o.material)?o.material:[o.material])if(!seen.has(material)){seen.add(material);groundMaterials.push({material,rug:true});}});}continue;}
  const mat=await materialFor(item,category,pose,manager);
  if(category==='floor'){
   if(!walk){const floorMask=softenMask(photoTexture(photos.clean,MASKS.floor,FLOOR_EXCLUSIONS));extras.push(floorMask);mat.transparent=true;groundMaterials.push({material:mat,mask:floorMask});}
   const floor=plane(slot,5.24,9,mat,[0,.004,-.5],[-Math.PI/2,0,0]);floor.receiveShadow=true;
  }else{const length=pose.length/100,width=length*2/3;slot.position.set(-.05+pose.offset/100,.008,-.55);slot.rotation.y=pose.angle*Math.PI/180;
   const edgeMat=new THREE.MeshStandardMaterial({color:0x8a7b67,roughness:1,metalness:0});const edge=new THREE.Mesh(new RoundedBoxGeometry(width,.011,length,2,.003),edgeMat);edge.position.y=.0055;edge.castShadow=edge.receiveShadow=true;slot.add(edge);
   const rug=plane(slot,width,length,mat,[0,.012,0],[-Math.PI/2,0,0]);rug.castShadow=rug.receiveShadow=true;if(!walk){softenRugEdge(mat);groundMaterials.push({material:mat,rug:true},{material:edgeMat,rug:true});}
  }
 }
 if(!walk){
  report({label:'匹配房间光线与家具接触阴影…'});scene.updateMatrixWorld(true);
  const furniture=bakeContacts(slots,renderer);contactTargets.push(furniture);
  const all=state.objects.rug.item!=='none'&&state.objects.rug.item!=='original-rug'?bakeContacts(slots,renderer,{includeRug:true}):furniture;if(all!==furniture)contactTargets.push(all);
  const light=illuminationTexture(photos.clean);extras.push(light);
  for(const entry of groundMaterials)integrateGround(entry.material,{...entry,projection,light,contacts:entry.rug?furniture:all});
  const shadow=plane(scene,5.2,9,new THREE.ShadowMaterial({opacity:.17,depthWrite:false}),[0,.006,-.5],[-Math.PI/2,0,0]);shadow.receiveShadow=true;
  if(state.objects.floor.item==='original-floor')integrateGround(wallMat,{projection,light,contacts:all,photo:true,floorOnly:true});
 }
 scene.updateMatrixWorld(true);return {scene,slots,state,dispose(){disposeScene(scene);extras.forEach(x=>x.dispose());contactTargets.forEach(x=>x.dispose());envRT.dispose();sun.shadow.map?.dispose();}};
 }catch(err){disposeScene(scene);extras.forEach(x=>x.dispose());contactTargets.forEach(x=>x.dispose());envRT?.dispose();throw err;}
}
export async function renderRoom(input,report=()=>{}){
 const state=validateState({...input,view:'main'}),start=performance.now(),out=document.createElement('canvas');out.width=PHOTO.width;out.height=PHOTO.height;const ctx=out.getContext('2d');if(!ctx)throw new Error('浏览器无法输出图片');
 if(isOriginal(state)&&state.view==='main'){ctx.drawImage(await readImage(ORIGINAL),0,0,PHOTO.width,PHOTO.height);return {blob:await toBlob(out),duration:performance.now()-start};}
 let renderer,built;
 try{
  renderer=makeRenderer();built=await buildRoomScene(state,renderer,report);const v=VIEWS[state.view],camera=new THREE.PerspectiveCamera(v.fov,1.5,.05,50);camera.position.set(...v.camera);camera.lookAt(...v.target);
  report({label:'计算完整地面、物件与接地阴影…'});await new Promise(r=>requestAnimationFrame(r));renderer.render(built.scene,camera);ctx.drawImage(renderer.domElement,0,0);return {blob:await toBlob(out),duration:performance.now()-start,view:state.view};
 }finally{built?.dispose();renderer?.dispose();renderer?.forceContextLoss();}
}
