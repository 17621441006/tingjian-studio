import {prepareObjectPhoto,currentObjectPhoto,sceneEditKey} from './photo-objects.mjs';
import {floorProduct} from './floor-catalog.mjs';
// Normalised image-plane floor boundaries; holes keep rugs and furniture intact.
// This is a material preview over the original photograph, not a geometry viewport.
const P=(...p)=>p;
const common={
 living:{areas:[P([0,1],[0,.93],[.205,.76],[.21,.62],[.32,.59],[.38,.6],[.34,.64],[.23,.95],[1,.96],[1,1])]},
 dining:{areas:[P([0,1],[0,.84],[.14,.76],[.29,.76],[.31,.88],[.7,.88],[.7,.75],[1,.75],[1,1])]},
 master:{areas:[P([.11,1],[.11,.76],[.23,.69],[.28,.70],[.24,.73],[.30,1]),P([.73,1],[.89,.84],[1,.78],[1,1])]},
 second:{areas:[P([.19,1],[.21,.76],[.29,.71],[.33,.76],[.37,.79],[.31,1]),P([.64,.77],[.72,.79],[.90,1],[.80,1])]},
 kitchen:{areas:[P([.18,1],[.235,.80],[.60,.78],[.77,1])]},
 bath:{areas:[P([0,1],[.20,.82],[.30,.84],[.73,.82],[.74,.87],[.70,.93],[.75,1])]},
 utility:{areas:[P([.29,1],[.45,.765],[.74,.765],[.79,.90],[.79,1])]},
 balcony:{areas:[P([.12,1],[.20,.78],[.28,.80],[.29,.70],[.68,.70],[.80,.79],[.91,.76],[.94,1])],holes:[P([.32,.64],[.68,.64],[.68,.84],[.32,.84])]}
};
const sets={
 chinese:{living:{areas:[P([0,1],[.20,.77],[.24,.60],[.35,.59],[.42,.65],[.395,1])]},master:{areas:[P([.10,1],[.13,.77],[.27,.71],[.29,.76],[.26,.80],[.34,1]),P([.40,1],[.77,.79],[.87,.82],[1,.79],[1,1])]},second:{areas:[P([.55,1],[.57,.76],[.54,.67],[.61,.66],[.70,.77],[.85,1])]},kitchen:{areas:[P([.31,1],[.39,.755],[.54,.755],[.66,1])]},balcony:{areas:[P([.04,1],[.32,.66],[.35,.77],[.48,.77],[.49,.74],[.54,.76],[.62,.72],[.67,.85],[.86,1])]},utility:{areas:[P([.22,1],[.31,.89],[.60,.89],[.61,1])]}},
 amber:{living:{areas:[P([0,1],[.29,.62],[.32,.61],[.35,.65],[.27,.78],[.14,1])]},dining:{areas:[P([.45,1],[.54,.76],[.70,.75],[.72,.54],[.79,.55],[.89,.81],[.99,1])]},master:{areas:[P([0,1],[0,.84],[.12,.84],[.27,1]),P([.77,1],[.82,.69],[.88,.66],[.93,.67],[.92,1])]},second:{areas:[P([.47,1],[.46,.70],[.54,.65],[.57,.68],[.66,.78],[.69,.89],[.81,1])]},kitchen:{areas:[P([.25,1],[.265,.83],[.59,.82],[.69,1])]},bath:{areas:[P([0,1],[.13,.90],[.20,.81],[.38,.82],[.40,.74],[.68,.74],[.69,.85],[.64,.92],[.70,1])]},utility:{areas:[P([.22,1],[.37,.78],[.62,.78],[.67,1])]},balcony:{areas:[P([.12,1],[.12,.78],[.26,.67],[.56,.70],[.54,.81],[.72,.87],[.76,.98],[.87,.99],[.89,1])]}},
 copper:{dining:{areas:[P([.76,1],[.79,.83],[.70,.68],[.65,.57],[.76,.61],[.91,.74],[1,.79],[1,1])]},second:{areas:[P([.20,1],[.22,.81],[.32,.85],[.41,.77],[.55,.68],[.85,1])]},utility:{areas:[P([.16,1],[.35,.81],[.68,.81],[.68,1])]},balcony:{areas:[P([.10,1],[.21,.78],[.34,.84],[.47,.85],[.48,.78],[.62,.85],[.79,.87],[.89,.78],[.94,1])]}},
 graphite:{living:{areas:[P([0,1],[.20,.74],[.24,.60],[.35,.62],[.31,.70],[.13,1])]},dining:{areas:[P([.80,1],[.85,.87],[.81,.79],[.88,.76],[.98,.83],[1,.87],[1,1])]},second:{areas:[P([.25,1],[.40,.74],[.62,.73],[.89,1])],holes:[P([.27,.70],[.34,.70],[.44,.93],[.37,.95])]},bath:{areas:[P([0,1],[.27,.81],[.36,.84],[.37,.89],[.65,.89],[.73,.84],[.73,.91],[.71,.94],[.74,1])]},utility:{areas:[P([.15,1],[.27,.86],[.57,.87],[.63,.83],[.72,1])]},balcony:{areas:[P([.11,1],[.14,.70],[.52,.70],[.51,.78],[.68,.80],[.77,.84],[.85,.79],[.90,.80],[.92,1])]}},
 collector:{second:{areas:[P([.19,1],[.22,.78],[.29,.74],[.33,.73],[.34,.80],[.31,1]),P([.58,.68],[.64,.69],[.86,1],[.74,1])]}},
 stone:{second:{areas:[P([.11,1],[.18,.78],[.27,.76],[.29,.82],[.28,1]),P([.65,1],[.84,1],[.83,.94],[.66,.94])]},balcony:{areas:[P([.10,1],[.17,.86],[.28,.84],[.44,.81],[.54,.77],[.73,.71],[.78,.78],[.9,.81],[.94,1])]}}
};
const px=(...points)=>points.map(([x,y])=>[x/1536,y/1024]);
const duskPieces={areas:[px([0,1024],[0,955],[275,792],[279,765],[319,742],[319,596],[403,596],[403,623],[440,623],[495,597],[625,597],[625,622],[987,622],[990,681],[1027,714],[1536,933],[1536,1024])],holes:[
 px([565,681],[990,681],[1270,930],[1536,933],[1536,982],[339,982]),
 px([621,702],[625,673],[674,646],[735,636],[791,635],[849,645],[912,665],[953,701],[944,728],[909,754],[834,773],[741,773],[670,754],[629,729]),
 px([690,540],[802,540],[802,692],[690,692]),
 px([983,508],[1536,508],[1536,941],[1250,941],[991,696])
]};
export function floorRegions(scene,path=''){
 if(scene.design==='dusk'&&/\/(pieces|selections)\/living\//.test(path))return duskPieces;
 return sets[scene.design]?.[scene.room]||common[scene.room]||common.living;
}
export function floorMask(width,height,{areas,holes=[]}){
 const mask=new Uint8Array(width*height);
 for(const [polygons,value]of [[areas,255],[holes,0]])for(const poly of polygons){
  const min=Math.max(0,Math.floor(Math.min(...poly.map(p=>p[1]))*height)),max=Math.min(height,Math.ceil(Math.max(...poly.map(p=>p[1]))*height));
  for(let y=min;y<max;y++){const fy=(y+.5)/height,xs=[];for(let i=0,j=poly.length-1;i<poly.length;j=i++){const a=poly[i],b=poly[j];if((a[1]>fy)!==(b[1]>fy))xs.push((a[0]+(fy-a[1])*(b[0]-a[0])/(b[1]-a[1]))*width);}xs.sort((a,b)=>a-b);for(let i=0;i+1<xs.length;i+=2)mask.fill(value,y*width+Math.max(0,Math.ceil(xs[i])),y*width+Math.min(width,Math.ceil(xs[i+1])));}
 }
 return mask;
}
const fract=x=>x-Math.floor(x);
export function compositeFloorPixels(original,width,height,texture,tw,th,mask,product){
 const out=new Uint8ClampedArray(original);let light=0,count=0;
 for(let i=0;i<mask.length;i++)if(mask[i]){const k=i*4;light+=original[k]*.2126+original[k+1]*.7152+original[k+2]*.0722;count++;}
 const stride=width+1,integral=new Float64Array(stride*(height+1));
 for(let y=0;y<height;y++){let row=0;for(let x=0;x<width;x++){const k=(y*width+x)*4;row+=original[k]*.2126+original[k+1]*.7152+original[k+2]*.0722;integral[(y+1)*stride+x+1]=integral[y*stride+x+1]+row;}}
 const smooth=(x,y)=>{const r=Math.max(2,Math.round(width/150)),a=Math.max(0,x-r),b=Math.min(width,x+r+1),c=Math.max(0,y-r),d=Math.min(height,y+r+1);return(integral[d*stride+b]-integral[c*stride+b]-integral[d*stride+a]+integral[c*stride+a])/((b-a)*(d-c));};
 const mean=light/Math.max(1,count),base=product.color.match(/\w\w/g).map(x=>parseInt(x,16));
 for(let y=0;y<height;y++)for(let x=0;x<width;x++){const n=y*width+x;if(!mask[n])continue;const k=n*4,depth=.32/Math.max(.12,(y+.5)/height-.42),u=((x+.5)/width-.5)*depth*6,v=depth*3,scale=product.category==='tile'?1.2:2.2;
  const tx=Math.floor(fract(u/scale)*tw),ty=Math.floor(fract(v/scale)*th),t=(ty*tw+tx)*4;
  const luminance=smooth(x,y),shade=Math.max(.15,Math.min(1.7,luminance/Math.max(mean,25)));
  let detail=1;if(product.imageType==='场景图'){const cx=fract(u/.18),cy=fract(v/.18);detail=.90+.08*Math.sin(Math.hypot(cx-.5,cy-.5)*80);if(Math.min(cx,cy,1-cx,1-cy)<.015)detail*=.73;}
  if(product.category==='tile'&&Math.min(fract(u/scale),fract(v/scale))<.005)detail=.76;
  for(let c=0;c<3;c++)out[k+c]=Math.min(255,(texture?texture[t+c]:base[c])*Math.pow(shade,.65)*detail*.78);
 }
 return out;
}
const cache=new Map(),jobs=new Map(),images=new Map(),tokens=new WeakMap();
function load(path){if(!images.has(path))images.set(path,new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>resolve(im);im.onerror=()=>{images.delete(path);reject(Error('地面预览图片未能载入'));};im.crossOrigin='anonymous';im.src=path;}));return images.get(path);}
const keyFor=(path,scene)=>sceneEditKey(path,scene)+'|'+scene.floorProduct;
export function currentFloorPhoto(path,scene){return floorProduct(scene.floorProduct)?cache.get(keyFor(path,scene))||path:currentObjectPhoto(path,scene);}
export async function prepareFloorPhoto(path,scene){
 const product=floorProduct(scene.floorProduct);if(typeof document==='undefined'||typeof document.createElement('canvas').getContext!=='function')return path;
 if(!product)return prepareObjectPhoto(path,scene);
 const key=keyFor(path,scene);if(cache.has(key))return cache.get(key);if(jobs.has(key))return jobs.get(key);
 const job=(async()=>{const edited=await prepareObjectPhoto(path,scene);if(!product){cache.set(key,edited);return edited;}const [im,sample]=await Promise.all([load(edited),product.imageType==='场景图'?null:load(product.image)]),w=im.naturalWidth,h=im.naturalHeight,canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.drawImage(im,0,0);const pixels=ctx.getImageData(0,0,w,h);let tex=null,tw=1,th=1;
 if(sample){const tile=document.createElement('canvas');tw=tile.width=sample.naturalWidth;th=tile.height=sample.naturalHeight;const t=tile.getContext('2d');t.drawImage(sample,0,0);tex=t.getImageData(0,0,tw,th).data;}
 pixels.data.set(compositeFloorPixels(pixels.data,w,h,tex,tw,th,floorMask(w,h,floorRegions(scene,path)),product));ctx.putImageData(pixels,0,0);
 const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));if(!blob)throw Error('地面预览无法生成');const url=URL.createObjectURL(blob);cache.set(key,url);while(cache.size>32){const oldest=cache.keys().next().value;const old=cache.get(oldest);cache.delete(oldest);setTimeout(()=>URL.revokeObjectURL(old),60000);}images.delete(path);return url;})();jobs.set(key,job);try{return await job;}finally{jobs.delete(key);}
}
export function setFloorPhoto(img,path,scene,link){if(!img)return;const token={};tokens.set(img,token);img.src=currentFloorPhoto(path,scene);if(link)link.href=img.src;return prepareFloorPhoto(path,scene).then(url=>{if(tokens.get(img)!==token)return;img.src=url;if(link)link.href=url;img.dataset.floorProduct=scene.floorProduct||'';}).catch(()=>{if(tokens.get(img)===token)img.title='图片编辑预览暂未载入，请重新选择重试';});}
