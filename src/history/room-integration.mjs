import * as THREE from 'three';

// Single-view compositing: retain large-scale light from the clean plate, while
// the replacement keeps its own high-frequency colour, normal and roughness maps.
export function illuminationTexture(image){
 const canvas=document.createElement('canvas');canvas.width=192;canvas.height=128;
 const ctx=canvas.getContext('2d');ctx.filter='blur(2px)';ctx.drawImage(image,0,0,192,128);
 const t=new THREE.CanvasTexture(canvas);t.colorSpace=THREE.SRGBColorSpace;t.generateMipmaps=false;t.minFilter=THREE.LinearFilter;return t;
}

const contactVertex=`varying vec2 sourceUv; varying float surfaceHeight;
void main(){sourceUv=uv;vec4 world=modelMatrix*vec4(position,1.0);surfaceHeight=world.y;gl_Position=projectionMatrix*viewMatrix*world;}`;
const contactFragment=`uniform sampler2D sourceMap;uniform bool cutout;uniform float cutoff;varying vec2 sourceUv;varying float surfaceHeight;
void main(){if(cutout&&texture2D(sourceMap,sourceUv).a<cutoff)discard;
float occlusion=exp(-max(surfaceHeight,0.0)*4.8);gl_FragColor=vec4(vec3(occlusion),1.0);}`;
const quadVertex=`varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.0,1.0);}`;
const blurFragment=`uniform sampler2D source;uniform vec2 stepSize;varying vec2 vUv;
void main(){vec3 c=texture2D(source,vUv).rgb*.227027;
c+=(texture2D(source,vUv+stepSize*1.384615).rgb+texture2D(source,vUv-stepSize*1.384615).rgb)*.316216;
c+=(texture2D(source,vUv+stepSize*3.230769).rgb+texture2D(source,vUv-stepSize*3.230769).rgb)*.070270;
gl_FragColor=vec4(c,1.0);}`;

// Render the actual underside silhouettes. This distinguishes thin table legs
// from a low sofa base; no painted oval or rectangular drop shadow is used.
export function bakeContacts(slots,renderer,{includeRug=false,size=512}={}){
 const scene=new THREE.Scene(),mats=[];
 for(const category of ['table','sofa',...(includeRug?['rug']:[])]){
  const slot=slots[category];slot?.updateMatrixWorld(true);
  slot?.traverse(o=>{if(!o.isMesh||o.userData.photoProxy||!o.castShadow)return;
   const originals=Array.isArray(o.material)?o.material:[o.material];
   const materials=originals.map(m=>{const cutout=!!m.map&&m.alphaTest>0;const mat=new THREE.ShaderMaterial({vertexShader:contactVertex,fragmentShader:contactFragment,uniforms:{sourceMap:{value:m.map||null},cutout:{value:cutout},cutoff:{value:m.alphaTest||.5}},side:THREE.DoubleSide});mats.push(mat);return mat;});
   const mesh=new THREE.Mesh(o.geometry,Array.isArray(o.material)?materials:materials[0]);mesh.matrixAutoUpdate=false;mesh.matrix.copy(o.matrixWorld);scene.add(mesh);
  });
 }
 const camera=new THREE.OrthographicCamera(-2.62,2.62,4.5,-4.5,.01,3);
 camera.position.set(0,-.04,-.5);camera.up.set(0,0,-1);camera.lookAt(0,1,-.5);camera.updateMatrixWorld();
 const projection=new THREE.Matrix4().multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse);
 const raw=new THREE.WebGLRenderTarget(size,size),temp=new THREE.WebGLRenderTarget(size,size),result=new THREE.WebGLRenderTarget(size,size);
 const blur=new THREE.ShaderMaterial({vertexShader:quadVertex,fragmentShader:blurFragment,depthTest:false,depthWrite:false,uniforms:{source:{value:raw.texture},stepSize:{value:new THREE.Vector2(1.6/size,0)}}});
 const quad=new THREE.Mesh(new THREE.PlaneGeometry(2,2),blur),blurScene=new THREE.Scene();blurScene.add(quad);
 const previous=renderer.getRenderTarget(),color=renderer.getClearColor(new THREE.Color()),alpha=renderer.getClearAlpha(),tone=renderer.toneMapping;
 try{
  renderer.toneMapping=THREE.NoToneMapping;renderer.setClearColor(0x000000,1);
  renderer.setRenderTarget(raw);renderer.clear();renderer.render(scene,camera);
  renderer.setRenderTarget(temp);renderer.clear();renderer.render(blurScene,camera);
  blur.uniforms.source.value=temp.texture;blur.uniforms.stepSize.value.set(0,1.0/size);
  renderer.setRenderTarget(result);renderer.clear();renderer.render(blurScene,camera);
 }catch(error){result.dispose();throw error;}
 finally{renderer.setRenderTarget(previous);renderer.setClearColor(color,alpha);renderer.toneMapping=tone;raw.dispose();temp.dispose();mats.forEach(m=>m.dispose());quad.geometry.dispose();blur.dispose();}
 return {texture:result.texture,projection,dispose:()=>result.dispose()};
}

export function integrateGround(material,{projection,light,contacts,mask=null,rug=false,photo=false,floorOnly=false}){
 const old=material.onBeforeCompile,baseKey=material.customProgramCacheKey();
 material.onBeforeCompile=shader=>{
  old?.(shader);
  shader.uniforms.roomProjection={value:projection};shader.uniforms.roomIllumination={value:light};shader.uniforms.roomMask={value:mask};
  shader.uniforms.contactProjection={value:contacts.projection};shader.uniforms.contactAtlas={value:contacts.texture};
  shader.vertexShader='varying vec3 roomSurface;\n'+shader.vertexShader;
  shader.vertexShader=shader.vertexShader.replace('#include <project_vertex>','#include <project_vertex>\nroomSurface=(modelMatrix*vec4(transformed,1.0)).xyz;');
  shader.fragmentShader='uniform mat4 roomProjection;uniform mat4 contactProjection;uniform sampler2D roomIllumination;uniform sampler2D roomMask;uniform sampler2D contactAtlas;varying vec3 roomSurface;\n'+shader.fragmentShader;
  shader.fragmentShader=shader.fragmentShader.replace('#include <alphatest_fragment>',`#include <alphatest_fragment>
   vec4 roomClip=roomProjection*vec4(roomSurface,1.0);vec2 roomUv=roomClip.xy/roomClip.w*.5+.5;
   ${mask?'if(roomClip.w<=0.0||any(lessThan(roomUv,vec2(0.0)))||any(greaterThan(roomUv,vec2(1.0))))discard;diffuseColor.a*=texture2D(roomMask,roomUv).a;if(diffuseColor.a<.002)discard;':''}`);
  shader.fragmentShader=shader.fragmentShader.replace('#include <opaque_fragment>',`
   ${photo?'':`float plateLuma=dot(texture2D(roomIllumination,clamp(roomUv,0.0,1.0)).rgb,vec3(.2126,.7152,.0722));
   float illumination=clamp(.62+plateLuma*2.25,.69,1.08);
   outgoingLight*=illumination*vec3(1.0,.982,.957);`}
   ${rug&&!photo?'float textileLuma=dot(outgoingLight,vec3(.2126,.7152,.0722));outgoingLight=mix(vec3(textileLuma),outgoingLight,.94);':''}
   vec4 contactClip=contactProjection*vec4(roomSurface,1.0);vec2 contactUv=contactClip.xy/contactClip.w*.5+.5;
   if(${floorOnly?'roomSurface.y<.025&&':''}all(greaterThanEqual(contactUv,vec2(0.0)))&&all(lessThanEqual(contactUv,vec2(1.0)))){
    float grounding=texture2D(contactAtlas,contactUv).r;outgoingLight*=1.0-grounding*${photo?'.26':'.34'};
   }
   #include <opaque_fragment>`);
 };
 material.customProgramCacheKey=()=>`${baseKey}|tingjian-fixed-ground-7-${!!mask}-${rug}-${photo}-${floorOnly}`;
}

export function softenRugEdge(material){
 const old=material.onBeforeCompile,baseKey=material.customProgramCacheKey();material.transparent=true;material.alphaTest=.002;
 material.onBeforeCompile=shader=>{old?.(shader);shader.vertexShader='varying vec2 wovenUv;\n'+shader.vertexShader;shader.vertexShader=shader.vertexShader.replace('#include <uv_vertex>','#include <uv_vertex>\nwovenUv=uv;');
  shader.fragmentShader='varying vec2 wovenUv;\n'+shader.fragmentShader;
  shader.fragmentShader=shader.fragmentShader.replace('#include <alphatest_fragment>',`vec2 uvEdge=min(wovenUv,1.0-wovenUv);float distanceToEdge=min(uvEdge.x,uvEdge.y);
   float fibre=sin(wovenUv.x*2317.0)*sin(wovenUv.y*2081.0)*.00017;
   diffuseColor.a*=smoothstep(0.0,.0007,distanceToEdge+fibre);
   #include <alphatest_fragment>`);
 };
 material.customProgramCacheKey=()=>`${baseKey}|soft-woven-edge`;
}
