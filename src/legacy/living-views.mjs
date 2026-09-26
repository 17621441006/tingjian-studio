import {livingReverseAsset} from './wood-homes.mjs';
const states=new WeakMap();
export function livingViewPath(image){const s=states.get(image);return s?.reverse?s.path:null;}
export function renderLivingViews(host,image,scene,ready,restore,links=[]){
 if(!host||!image)return;
 const state={reverse:false,path:livingReverseAsset(scene.design),revision:0};states.set(image,state);host.replaceChildren();host.hidden=scene.room!=='living';if(host.hidden)return;
 const doc=host.ownerDocument||document;
 const group=doc.createElement('div');group.className='living-camera-buttons';group.setAttribute('role','group');group.setAttribute('aria-label','客厅视角');
 const front=doc.createElement('button'),back=doc.createElement('button'),note=doc.createElement('span');front.type=back.type='button';front.textContent='客厅';back.textContent='客厅2 · 看向阳台';front.dataset.livingCamera='front';back.dataset.livingCamera='reverse';note.className='living-camera-note';note.setAttribute('role','status');note.setAttribute('aria-live','polite');
 const mark=()=>{front.setAttribute('aria-pressed',String(!state.reverse));back.setAttribute('aria-pressed',String(state.reverse));};mark();
 front.addEventListener('click',()=>{state.revision++;state.reverse=false;back.disabled=false;mark();note.textContent='';restore();for(const [a,download] of state.downloads||[])a.download=download;});
 back.addEventListener('click',async()=>{const revision=++state.revision;back.disabled=true;note.textContent='正在载入客厅2…';try{await ready;await new Promise((resolve,reject)=>{const im=new Image();im.onload=resolve;im.onerror=()=>reject(Error('客厅2暂未载入，请重试'));im.src=state.path;});if(states.get(image)!==state||revision!==state.revision)return;state.downloads=links.filter(Boolean).map(a=>[a,a.download]);state.reverse=true;image.src=state.path;image.alt='客厅2 · 从餐厅看向客厅与阳台 · 原方案概念图';for(const a of links){if(a){a.href=state.path;if(a.hasAttribute?.('download'))a.download=scene.design+'-客厅2.webp';}}mark();note.textContent='原方案反向视角 · 单品、地面与装饰修改暂不联动';}catch(e){if(states.get(image)===state&&revision===state.revision)note.textContent=e.message;}finally{if(states.get(image)===state&&revision===state.revision)back.disabled=false;}});
 group.append(front,back);host.append(group,note);
}
