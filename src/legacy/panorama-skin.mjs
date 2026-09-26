import * as THREE from 'three';
// Straight geometry and independent surface materials: never project photographed
// furniture onto walls or floors. The original panorama remains in the VR viewer.
export function applyDuskMaterials(root,textures={}){
 root.userData.ownedMaterials??=new Set();
 const wood=new THREE.MeshPhysicalMaterial({color:'#86705b',map:textures.wood||null,roughness:.64});
 const plaster=new THREE.MeshPhysicalMaterial({color:'#d6c8b4',roughness:.94});
 const stone=new THREE.MeshPhysicalMaterial({color:'#b9b0a1',map:textures.stone||null,roughness:.68});
 for(const m of [wood,plaster,stone])root.userData.ownedMaterials.add(m);
 for(const [id,room]of root.userData.rooms)room.traverse(mesh=>{
  if(!mesh.isMesh||!mesh.userData.straightWall)return;
  mesh.material=['kitchen','bath','utility'].includes(id)?stone:['living','dining'].includes(id)?wood:plaster;
 });
 root.userData.photoProjection={mappedMeshes:0,depthRecovered:false};
 return root;
}
