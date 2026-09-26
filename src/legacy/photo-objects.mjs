import {sceneEditURL} from './scene-edit-location.mjs';
import {SCENE_EDIT_ASSETS} from './scene-edit-assets.mjs';
const cache=new Map(),jobs=new Map();
const load=async path=>{const url=await sceneEditURL(path);return new Promise((resolve,reject)=>{const im=new Image();im.crossOrigin='anonymous';im.onload=()=>resolve(im);im.onerror=()=>reject(Error('单品效果未能载入，请重试'));im.src=url;});};
export const sceneEditKey=(path,scene)=>JSON.stringify([path,scene.design,scene.room,[...(scene.removed||[])].sort(),scene.partitionStyle||'original']);
export function editRegions(scene){if((scene.layout&&scene.layout!=='original')||(scene.variant&&scene.variant!=='original'))return null;const row=SCENE_EDIT_ASSETS[scene.design]?.[scene.room];if(!row)return null;const legacy=scene.design==='copper'&&['living','dining'].includes(scene.room);const removed=(scene.removed||[]).filter(id=>row.objects[id]&&!(legacy&&['decor','sofa','rug','cabinet'].includes(id)));return {row,removed,partition:scene.partitionStyle==='custom'&&row.partition&&!(scene.removed||[]).includes('partition')};}
function clip(ctx,polygons,w,h){ctx.beginPath();for(const polygon of polygons){polygon.forEach(([x,y],i)=>i?ctx.lineTo(x*w,y*h):ctx.moveTo(x*w,y*h));ctx.closePath();}ctx.clip();}
const order={decor:0,rug:1,partition:2,shower:2,curtain:2,cabinet:3,wardrobe:3,displayShelf:4,tv:4,mirror:4,sofa:5,bed:5,vanity:5,laundry:5,diningSet:6,desk:6,chair:7,toilet:7,table:8,plant:9,lamp:9};
const bounds=poly=>[Math.min(...poly.map(p=>p[0])),Math.min(...poly.map(p=>p[1])),Math.max(...poly.map(p=>p[0])),Math.max(...poly.map(p=>p[1]))];
export function removalPolygons(row,id){
 const polygons=[...(row.objects[id]||[])];if(!['table','diningSet','cabinet','displayShelf','desk','bed','vanity','wardrobe'].includes(id))return polygons;
 const boxes=polygons.map(bounds);
 for(const child of ['plant','decor','lamp'])for(const polygon of row.objects[child]||[]){const [a,b,c,d]=bounds(polygon),x=(a+c)/2;if(boxes.some(([l,t,r,bottom])=>x>=l-.025&&x<=r+.025&&d>=t&&d<=bottom+.025))polygons.push(polygon);}
 return polygons;
}
export function compositeObjectCanvas(canvas,original,clean,custom,row,removed,allRemoved=removed){
 const w=canvas.width,h=canvas.height,ctx=canvas.getContext('2d');ctx.drawImage(original,0,0,w,h);
 const bulk=clean&&allRemoved.length>=4;
 if(bulk){ctx.drawImage(clean,0,0,w,h);const attached=allRemoved.flatMap(id=>removalPolygons(row,id));for(const [id,polygons]of Object.entries(row.objects).sort(([a],[b])=>(order[a]??5)-(order[b]??5))){if(allRemoved.includes(id))continue;const kept=polygons.filter(p=>!attached.includes(p));if(!kept.length)continue;ctx.save();clip(ctx,kept,w,h);ctx.drawImage(original,0,0,w,h);ctx.restore();}}
 if(clean&&!bulk)for(const id of removed){
  const mask=document.createElement('canvas');mask.width=w;mask.height=h;const mc=mask.getContext('2d');mc.save();clip(mc,removalPolygons(row,id),w,h);mc.fillStyle='white';mc.fillRect(0,0,w,h);mc.restore();
  // Keep foreground furniture when the object below or behind it is removed.
  for(const [other,polygons]of Object.entries(row.objects)){if(allRemoved.includes(other)||(order[other]??5)<=(order[id]??5))continue;const attached=removalPolygons(row,id),kept=polygons.filter(p=>!attached.includes(p));if(!kept.length)continue;mc.save();clip(mc,kept,w,h);mc.clearRect(0,0,w,h);mc.restore();}
  const patch=document.createElement('canvas');patch.width=w;patch.height=h;const pc=patch.getContext('2d');pc.drawImage(clean,0,0,w,h);pc.globalCompositeOperation='destination-in';pc.filter='blur('+Math.max(1,w/900)+'px)';pc.drawImage(mask,0,0);ctx.drawImage(patch,0,0);
 }
 if(custom){ctx.save();clip(ctx,row.partition.polygons,w,h);ctx.drawImage(custom,0,0,w,h);ctx.restore();}
 return canvas;
}
export async function prepareObjectPhoto(path,scene){
 const edits=editRegions(scene);if(!edits||(!edits.removed.length&&!edits.partition)||typeof document==='undefined'||typeof document.createElement('canvas').getContext!=='function')return path;
 const key=sceneEditKey(path,scene);if(cache.has(key))return cache.get(key);if(jobs.has(key))return jobs.get(key);
 const job=(async()=>{const {row,removed,partition}=edits;const [original,clean,custom]=await Promise.all([load(path),removed.length?load(row.clean):null,partition?load(row.partition.path):null]);
 const canvas=document.createElement('canvas');canvas.width=original.naturalWidth;canvas.height=original.naturalHeight;compositeObjectCanvas(canvas,original,clean,custom,row,removed,scene.removed||[]);
 const blob=await new Promise(r=>canvas.toBlob(r,'image/png'));if(!blob)throw Error('单品效果暂时无法生成');const url=URL.createObjectURL(blob);cache.set(key,url);while(cache.size>16){const k=cache.keys().next().value,u=cache.get(k);cache.delete(k);setTimeout(()=>URL.revokeObjectURL(u),60000);}return url;})();jobs.set(key,job);try{return await job;}finally{jobs.delete(key);}
}

export function currentObjectPhoto(path,scene){return cache.get(sceneEditKey(path,scene))||path;}
