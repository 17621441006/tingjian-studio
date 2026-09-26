import {variantsFor,variantAsset} from './home-variants.mjs';
import CATALOG from './floor-catalog.json' with {type:'json'};
export const FLOOR_CATALOG=CATALOG;
export const floorProduct=id=>CATALOG.find(x=>x.id===id)||null;
export const floorProductLabel=item=>item.brand+' · '+item.name;
export const normalizeFloorProduct=id=>floorProduct(id)?.id||null;
export const floorAllowed=(room,item)=>!['bath','kitchen','utility'].includes(room)||item?.category==='tile';
const panelStates=new WeakMap();
export function floorMaterialItems(scene,items){const item=floorProduct(scene.floorProduct);return item?[...items.filter(([label])=>!['地面','地板','品牌地面'].includes(label)),['品牌地面',floorProductLabel(item)+'；'+item.finish+'（已更新房间地面；颜色与铺装为近似预览）']]:items;}
export function renderFloorCatalog(host,scene,onSelect,{disabled=false,inline=false,onVariant=null}={}){
 if(!host)return;const wet=['bath','kitchen','utility'].includes(scene.room),item=floorProduct(scene.floorProduct);
 const state=panelStates.get(host)||{category:item?.category||(wet?'tile':'wood'),room:scene.room};if(state.room!==scene.room){state.category=item?.category||(wet?'tile':'wood');state.room=scene.room;}panelStates.set(host,state);
 if(inline)return renderInlineFloorCards(host,scene,onSelect,disabled,onVariant);
 host.replaceChildren();const el=(tag,text)=>{const e=document.createElement(tag);if(text)e.textContent=text;return e;};
 const title=el('h3','品牌地面 · 10 款精选'),hint=el('p','点击即在房间三维试铺中更换地面，客餐厅联动；写实设计图保留作对照。');hint.className='floor-catalog-note';host.append(title,hint);
 const tabs=el('div');tabs.className='floor-catalog-tabs';tabs.setAttribute('role','group');tabs.setAttribute('aria-label','地面品类');
 for(const [id,name]of [['wood','木地板 · 5'],['tile','地砖 · 5']]){const b=el('button',name);b.type='button';b.dataset.floorCategory=id;b.setAttribute('aria-pressed',String(id===state.category));b.addEventListener('click',()=>{state.category=id;renderFloorCatalog(host,scene,onSelect,{disabled});});tabs.append(b);}host.append(tabs);
 if(wet&&state.category==='wood'){const note=el('p','厨卫与生活阳台先选地砖；木地板在客厅、卧室可选。');note.className='floor-family-note';host.append(note);}
 const list=el('div');list.className='floor-catalog-list';host.append(list);
 for(const product of CATALOG.filter(x=>x.category===state.category)){
  const b=el('button');b.type='button';b.className='floor-card';b.dataset.floorProduct=product.id;b.disabled=disabled||!floorAllowed(scene.room,product);b.setAttribute('aria-pressed',String(item?.id===product.id));b.setAttribute('aria-label',floorProductLabel(product)+'，'+product.finish);
  const im=el('img');im.src=product.thumb;im.alt=product.brand+' 官方样板';im.width=55;im.height=55;im.loading='lazy';im.decoding='async';
  const labels=el('span');labels.append(el('strong',product.brand+' · '+product.name),el('small',product.tone+' / '+product.finish));
  const peek=el('span');peek.className='floor-peek';peek.setAttribute('aria-hidden','true');const big=el('img');big.src=product.image;big.alt='';big.loading='lazy';big.decoding='async';peek.append(big,el('span',product.brand+' · '+product.product+'\n'+product.spec+' · 官网'+product.imageType));b.append(im,labels,peek);
  b.addEventListener('click',()=>onSelect(product.id));list.append(b);
 }
 if(item){const selection=el('div');selection.className='floor-selection';selection.dataset.selectedFloor=item.id;selection.append(el('p','已选：'+floorProductLabel(item)),el('p',item.spec));const link=el('a','查看官网产品 ↗');link.href=item.url;link.target='_blank';link.rel='noopener noreferrer';const clear=el('button','恢复方案地面');clear.type='button';clear.dataset.floorClear='';clear.disabled=disabled;clear.addEventListener('click',()=>onSelect(null));selection.append(link,clear);host.append(selection);
 const sample=el('div');sample.className='floor-spec-preview';const photo=el('img');photo.src=item.image;photo.alt=item.brand+' · '+item.product+' 官方'+item.imageType;photo.loading='lazy';sample.append(photo,el('small',item.description));host.append(sample);}
 const note=el('p','官网产品样板；实际颜色、纹理与适用规格以线下样品为准。');note.className='floor-catalog-note';host.append(note);
}

function renderInlineFloorCards(host,scene,onSelect,disabled,onVariant){
 host.replaceChildren();host.className='floor-catalog floor-inline';
 if(scene.design==='milan'&&scene.room==='living'&&onVariant){
  const note=document.createElement('p');note.className='floor-catalog-note';note.textContent='暮木茶境 · 整体地面对照：三种木地板与石板。下方品牌样板可继续试铺。';host.append(note);
  for(const option of [{id:'original',name:'原浅橡木宽板',summary:'保留上一版浅木色'},...variantsFor('milan')]){
   const b=document.createElement('button');b.type='button';b.className='floor-inline-card';b.dataset.authoredFloor=option.id;b.disabled=disabled;b.setAttribute('aria-pressed',String(scene.variant===option.id&&!scene.floorProduct));
   const im=document.createElement('img');im.src=variantAsset('milan','living',option.id,true);im.alt='';im.width=132;im.height=88;im.loading='lazy';
   const labels=document.createElement('span'),title=document.createElement('strong'),sub=document.createElement('small');title.textContent=option.name;sub.textContent=option.summary;labels.append(title,sub);b.append(im,labels);b.addEventListener('click',()=>onVariant(option.id));host.append(b);
  }
 }

 for(const p of CATALOG){const b=document.createElement('button');b.type='button';b.className='floor-inline-card';b.dataset.floorProduct=p.id;b.disabled=disabled||!floorAllowed(scene.room,p);b.setAttribute('aria-pressed',String(p.id===scene.floorProduct));b.title=p.brand+' · '+p.spec;
 const im=document.createElement('img');im.src=p.thumb;im.alt=p.brand+'官方样板';im.loading='lazy';im.width=132;im.height=88;
 const labels=document.createElement('span'),title=document.createElement('strong'),note=document.createElement('small');title.textContent=floorProductLabel(p);note.textContent=(p.category==='wood'?'木地板':'地砖')+' · '+p.finish;labels.append(title,note);b.append(im,labels);b.addEventListener('click',()=>onSelect(p.id));host.append(b);}
 if(scene.floorProduct){const clear=document.createElement('button');clear.type='button';clear.dataset.floorClear='';clear.textContent='恢复原方案地面';clear.disabled=disabled;clear.addEventListener('click',()=>onSelect(null));host.append(clear);}
}
