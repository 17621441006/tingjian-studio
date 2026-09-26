import * as THREE from 'three';
import {FLOOR_CATALOG} from './floor-catalog.mjs';
export async function loadFloorTextures(loader){
 const textures={};
 await Promise.allSettled(FLOOR_CATALOG.filter(p=>p.imageType!=='场景图').map(async p=>{
  const t=await loader.loadAsync(p.image);t.colorSpace=THREE.SRGBColorSpace;t.wrapS=t.wrapT=THREE.RepeatWrapping;textures[p.id]=t;
 }));
 return textures;
}
export function applyFloorTextures(root,textures){
 for(const [id,p]of Object.entries(root.userData.spec.floorByRoom)){
  if(!p)continue;const floor=root.userData.objects.get(id+'-floor');if(!floor)continue;
  const material=floor.material,map=textures[p.id];material.map=map||null;
  if(map)material.color.set('#ffffff');
  const size=p.category==='tile'?(p.id==='laminam-statuario'?[1,3]:[1.2,1.2]):p.pattern==='herringbone'?[1.58,1.58]:[2.2,2.2];
  // ShapeGeometry UVs are the plan coordinates in metres, not normalised 0..1.
  const uv=floor.geometry.attributes.uv,pos=floor.geometry.attributes.position;
  for(let i=0;i<uv.count;i++)uv.setXY(i,pos.getX(i)/size[0],-pos.getY(i)/size[1]);uv.needsUpdate=true;
  material.onBeforeCompile=shader=>{
   shader.vertexShader='varying vec2 vFloorPlan;\n'+shader.vertexShader;
   shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvFloorPlan=position.xy;');
   shader.fragmentShader='varying vec2 vFloorPlan;\n'+shader.fragmentShader;
   let finish='';
   if(p.category==='tile')finish=`vec2 cell=abs(fract(vFloorPlan/vec2(${size[0].toFixed(2)},${size[1].toFixed(2)}))-.5);float grout=smoothstep(.495,.499,max(cell.x,cell.y));diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.44,.42,.39),grout*.45);`;
   // HARO source is a room photo, never repeat its furniture as a floor texture.
   if(p.imageType==='场景图')finish=`vec2 cell=fract(vFloorPlan/.18);vec2 tile=floor(vFloorPlan/.18);float seed=fract(sin(dot(tile,vec2(12.9898,78.233)))*43758.5453);float rings=sin(length(cell-.5)*96.+seed*12.);float edge=smoothstep(.475,.495,max(abs(cell.x-.5),abs(cell.y-.5)));diffuseColor.rgb*=.85+seed*.25+rings*.045;diffuseColor.rgb*=1.-edge*.24;`;
   shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>','#include <color_fragment>\n'+finish);
  };
  material.customProgramCacheKey=()=> 'floor-v22-'+p.id;material.needsUpdate=true;
  material.userData.floorProduct=p.id;material.userData.previewSource=map?'official-sample':p.imageType==='场景图'?'procedural-endgrain':'color-fallback';
 }
 return root;
}
