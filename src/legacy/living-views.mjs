import {loadMediaImage,resolvedMediaURL} from './media-loader.mjs';
import {livingReverseAsset} from './wood-homes.mjs';
import {floraAsset,floraPreviousAsset} from './flora-home.mjs';
const states=new WeakMap();
const isDining=scene=>scene.design==='silver-retreat'&&scene.room==='dining';
export const alternateViewLabel=(scene,image)=>states.get(image)?.selected?.title||(isDining(scene)?'餐柜收起状态':'客厅2 · 原方案反向视角');
export function livingViewPath(image){return states.get(image)?.selected?.path||null;}
export function renderLivingViews(host,image,scene,ready,restore,links=[]){
 if(!host||!image)return;
 const dining=isDining(scene),flora=scene.design==='silver-retreat'&&scene.room==='living';
 const state={selected:null,revision:0};states.set(image,state);host.replaceChildren();host.hidden=scene.room!=='living'&&!dining;if(host.hidden)return;
 const views=[{id:'front',label:dining?'展开用餐':'客厅'},dining?{id:'reverse',label:'收起留白',title:'餐柜收起状态',path:floraAsset('dining-closed'),alt:'花影绮居 · 餐柜与抽拉餐桌收起状态 · 概念图',download:'餐柜收起',note:'餐桌收进中央柜体，释放过道 · 收纳构造意向，单品与地面修改暂不联动'}:{id:'reverse',label:'客厅2 · 看向阳台',title:'客厅2 · 原方案反向视角',path:livingReverseAsset(scene.design),alt:'客厅2 · 从餐厅看向客厅与阳台 · 原方案概念图',download:'客厅2',note:'原方案反向视角 · 单品、地面与装饰修改暂不联动'}];
 if(flora)views.push({id:'previous',label:'方案二',title:'方案二 · 圆桌与矮餐柜',path:floraPreviousAsset(),alt:'花影绮居 · 方案二 · 上一版圆餐桌与矮餐边柜客厅 · 概念图',download:'客厅-方案二',note:'保留上一版客厅：圆餐桌、矮餐边柜与原雕花屏风 · 单品、地面与装饰修改暂不联动'});
 const doc=host.ownerDocument||document;
 const group=doc.createElement('div');group.className='living-camera-buttons';group.setAttribute('role','group');group.setAttribute('aria-label',dining?'餐柜与餐桌状态':flora?'客厅视角与方案':'客厅视角');
 const note=doc.createElement('span');note.className='living-camera-note';note.setAttribute('role','status');note.setAttribute('aria-live','polite');
 const buttons=views.map(v=>{const b=doc.createElement('button');b.type='button';b.textContent=v.label;b.dataset.livingCamera=v.id;if(v.title)b.title=v.title;return b;});
 const mark=()=>buttons.forEach((b,i)=>b.setAttribute('aria-pressed',String(views[i].id===(state.selected?.id||'front'))));mark();
 buttons.forEach((button,i)=>button.addEventListener('click',async()=>{
  const view=views[i],revision=++state.revision;buttons.forEach(b=>b.disabled=false);
  if(!view.path){state.selected=null;mark();note.textContent='';restore();if(state.frontAlt)image.alt=state.frontAlt;for(const [a,download,href] of state.downloads||[]){a.download=download;a.href=href;}return;}
  button.disabled=true;note.textContent='正在载入'+view.label+'…';
  try{await ready;await loadMediaImage(view.path);if(states.get(image)!==state||revision!==state.revision)return;
   state.downloads??=links.filter(Boolean).map(a=>[a,a.download,a.href]);state.frontAlt??=image.alt;
   state.selected={...view,path:resolvedMediaURL(view.path)};image.src=state.selected.path;image.alt=view.alt;
   for(const a of links)if(a){a.href=state.selected.path;if(a.hasAttribute?.('download'))a.download=scene.design+'-'+view.download+'.webp';}
   mark();note.textContent=view.note;
  }catch(e){if(states.get(image)===state&&revision===state.revision)note.textContent=e.message;}
  finally{if(states.get(image)===state&&revision===state.revision)button.disabled=false;}
 }));
 group.append(...buttons);host.append(group,note);
}
