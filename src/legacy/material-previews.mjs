import {FLOOR_CATALOG,floorProductLabel} from './floor-catalog.mjs';
// Preview the selected design itself, never an unrelated product or texture sample.
export function renderMaterialList(list,items,{path,room='living'}={}){
 list.replaceChildren();list.classList.add?.('material-preview-list');
 for(const [name,copy] of items){
  const product=['品牌地面','品牌地面候选'].includes(name)?FLOOR_CATALOG.find(x=>copy.startsWith(floorProductLabel(x))):null,previewPath=product?.image||path;
  const row=document.createElement('div');row.className='material-preview-row';
  const dt=document.createElement('dt'),dd=document.createElement('dd'),button=document.createElement('button');
  button.type='button';button.className='material-thumb';button.setAttribute('aria-label','放大查看'+name+'的方案细节');button.setAttribute('aria-expanded','false');
  const im=document.createElement('img');im.src=previewPath;im.alt=product?floorProductLabel(product)+' · 官方样板':name+' · 当前方案';im.loading='lazy';im.decoding='async';im.width=52;im.height=52;
  const focus=/地面|地板|地毯|墙地/.test(name)?'50% 86%':/床/.test(name)||room==='master'?'50% 62%':/窗/.test(name)?'55% 32%':/光|灯/.test(name)?'50% 24%':/沙发|家具|坐/.test(name)?'76% 62%':'45% 53%';im.style.objectPosition=focus;
  const pop=document.createElement('span');pop.className='material-popover';pop.setAttribute('aria-hidden','true');
  const large=document.createElement('img');large.src=previewPath;large.alt='';large.loading='lazy';large.decoding='async';
  const caption=document.createElement('span');caption.textContent=product?floorProductLabel(product)+' · 官方样板':name+' · 当前方案画面';pop.append(large,caption);button.append(im,pop);
  button.addEventListener('click',()=>{const on=button.getAttribute('aria-expanded')!=='true';button.setAttribute('aria-expanded',String(on));});
  button.addEventListener('blur',()=>button.setAttribute('aria-expanded','false'));
  button.addEventListener('keydown',e=>{if(e.key==='Escape'){button.setAttribute('aria-expanded','false');button.blur?.();}});
  const label=document.createElement('span');label.textContent=name;dt.append(button,label);dd.textContent=copy;row.append(dt,dd);list.append(row);
 }
}
