import assert from 'node:assert/strict';
import * as THREE from 'three';
import {assembleHome} from '../src/legacy/scene-options.mjs';
import {buildDetailedHome} from '../src/legacy/whole-model-detailed.mjs';
import {disposeWholeGeometry} from '../src/legacy/whole-model-geometry.mjs';
import {applyPanoramaSkin} from '../src/legacy/panorama-skin.mjs';
const root=buildDetailedHome({design:'dusk',frames:assembleHome('dusk',new Map())});
const objects=new Map(root.userData.objects),before=new Map(),textures={};
root.traverse(m=>{if(m.isMesh)before.set(m,{geometry:m.geometry,vertices:m.geometry.attributes.position.array.slice()});});
for(const id of root.userData.rooms.keys())textures[id]=new THREE.Texture();
const floor=objects.get('living-floor'),floorMaterial=floor.material;floor.userData.floorProduct='test-brand';
applyPanoramaSkin(root,textures);
assert(root.userData.photoProjection.mappedMeshes>100);assert(root.userData.photoProjection.protectedWalls>=28);
for(const [id,o] of objects)assert.equal(root.userData.objects.get(id),o);
for(const [m,b]of before){assert.equal(m.geometry,b.geometry);assert.deepEqual(m.geometry.attributes.position.array,b.vertices);if(m.userData.straightWall){assert.equal(m.geometry.type,'BoxGeometry');assert(!m.material.name.startsWith('panorama-'));}else if(m===floor)assert.equal(m.material,floorMaterial);}
for(const id of ['living-sofa','master-bed','dining-chair-1','kitchen-cabinet']){const object=objects.get(id);assert.equal(object.userData.objectId,id);let n=0;object.traverse(m=>{if(m.isMesh){assert(m.material.name.startsWith('panorama-'));n++;}});assert(n>0);}
const shader={uniforms:{},vertexShader:'#include <begin_vertex>',fragmentShader:'#include <map_fragment>'};
let mat;root.traverse(m=>{if(m.isMesh&&m.material.name==='panorama-living')mat=m.material;});mat.onBeforeCompile(shader);assert(shader.fragmentShader.includes('texture2D(map,panoramaUV)'));assert.equal(shader.uniforms.capturePoint.value.y,1.55);
disposeWholeGeometry(root);Object.values(textures).forEach(t=>t.dispose());
console.log('v24: panorama furniture restored, every geometry/object preserved, straight walls excluded, branded floor preserved, shader bindings passed.');
