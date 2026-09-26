import * as THREE from 'three';
import {MODEL_ROOMS} from './whole-model-state.mjs';
// Approximate panorama capture locations in the existing floor-plan coordinate frame.
// This is projective texture mapping, not recovered scan geometry or measured depth.
export const CAPTURES={living:[5.2,1.55,4.25,0],dining:[4.9,1.55,6.05,Math.PI],balcony:[5.1,1.55,1.45,0],master:[8.7,1.55,2.6,Math.PI/2],second:[8.45,1.55,5.8,Math.PI/2],kitchen:[2.15,1.55,3.9,0],bath:[.8,1.55,6.1,0],utility:[.6,1.55,2.9,Math.PI]};
export function applyPanoramaSkin(root,textures){
 let count=0;
 for(const room of MODEL_ROOMS){const texture=textures[room.id];if(!texture)continue;
  const capture=CAPTURES[room.id];const material=new THREE.MeshBasicMaterial({map:texture,toneMapped:false,side:THREE.DoubleSide});
  material.name='panorama-'+room.id;material.userData.capture=capture;
  material.onBeforeCompile=shader=>{
   shader.uniforms.capturePoint={value:new THREE.Vector3(...capture.slice(0,3))};shader.uniforms.captureYaw={value:capture[3]};
   shader.vertexShader='varying vec3 vCaptureWorld;\n'+shader.vertexShader;
   shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvCaptureWorld=(modelMatrix*vec4(transformed,1.0)).xyz;');
   shader.fragmentShader='varying vec3 vCaptureWorld; uniform vec3 capturePoint; uniform float captureYaw;\n'+shader.fragmentShader;
   shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>',`vec3 captureRay=normalize(vCaptureWorld-capturePoint);
float longitude=atan(captureRay.x,-captureRay.z)-captureYaw;
vec2 panoramaUV=vec2(fract(0.5+longitude/6.28318530718),0.5+asin(clamp(captureRay.y,-1.0,1.0))/3.14159265359);
diffuseColor *= texture2D(map,panoramaUV);`);
  };
  material.customProgramCacheKey=()=> 'tingjian-pano-projection-v1';
  root.userData.ownedMaterials.add(material);
  root.userData.rooms.get(room.id)?.traverse(mesh=>{if(!mesh.isMesh)return;mesh.material=material;mesh.castShadow=false;mesh.receiveShadow=false;count++;});
 }
 root.userData.photoProjection={mappedMeshes:count,depthRecovered:false};return root;
}
