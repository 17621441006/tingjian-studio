import {ITEMS,CATEGORIES,VIEWS,ORIGINAL,SCENES,sceneFor,initialState,chooseItem,removeItem,itemFor,validateState,signature,dimensionsFor,exportPlan,isOriginal} from './room-state.mjs';
import {initHomeGallery} from './home-gallery.mjs';
import {initDesignJourney} from './design-journey.mjs';
const root=document.getElementById('furniture-trial');
const $=s=>root.querySelector(s),$$=s=>[...root.querySelectorAll(s)];
const stage=$('[data-stage]'),image=document.getElementById('render-image');
let state=initialState(),category='table',viewStyle='sculpt',compare=false,pins=true,working=false,queued=null,revision=0,timer=null,last=null,dragged=null,touchTimer=null;
let experience='photo',walk=null;
const cache=new Map(),urls=new Set();
const designStates=new Map();
function status(text){$('[data-status]').textContent=text;}
function cachePut(key,value){cache.set(key,value);if(value.url.startsWith('blob:'))urls.add(value.url);while(cache.size>8){const [oldKey,old]=cache.entries().next().value;cache.delete(oldKey);if(old.url!==last?.url&&old.url.startsWith('blob:')){URL.revokeObjectURL(old.url);urls.delete(old.url);}}}
function dimensionsLabel(item,pose){const d=dimensionsFor(item,pose.length);return d?`${d[0]} × ${d[1]} × ${d[2]} cm`:item?.kind==='original'?'原方案 · 未实测':category==='floor'?`纹理尺度 ${pose.length}%`:'已移除';}
function sync(){
 const design=sceneFor(state);if(root.dataset.surface!=='home'){for(const b of $$('[data-design]'))b.setAttribute('aria-pressed',String(b.dataset.design===state.scene));$('[data-design-copy]').textContent=design.description;}
 if(viewStyle==='sculpt'){document.getElementById('render-title').textContent=design.name;document.getElementById('render-subtitle').textContent=state.scene==='walnut'?'你喜欢的原方案':'EDITION 灵感 · 自住宅适配';document.getElementById('render-copy').textContent=design.description;}
 $('[data-original-toggle]').setAttribute('aria-pressed',String(compare));
 const pose=state.objects[category],item=itemFor(pose.item),cfg=CATEGORIES[category];
 $('[data-selection-label]').textContent=`${cfg.objectName} · ${item?.name||'已移除'}`;
 for(const b of $$('[data-category]'))b.setAttribute('aria-pressed',String(b.dataset.category===category));
 for(const b of $$('[data-viewpoint]'))b.setAttribute('aria-pressed',String(b.dataset.viewpoint===state.view));
 $('[data-size]').min=cfg.min;$('[data-size]').max=cfg.max;$('[data-size]').value=pose.length;
 $('[data-angle]').value=pose.angle;$('[data-offset]').value=pose.offset;
 $('[data-angle-label]').textContent=pose.angle+'°';$('[data-offset-label]').textContent=pose.offset+' cm';
 $('[data-length-label]').textContent=category==='floor'?'纹理尺度 / %':'长边 / cm';
 $('[data-dimensions]').textContent=dimensionsLabel(item,pose);
 const canAdjust=item&&item.kind!=='original';$('[data-adjust-fields]').hidden=!canAdjust;
 $('[data-size-note]').textContent=canAdjust?'按模型等比缩放。这里是试摆尺寸，尚未核对厂家规格。':'选一件替换物品后，可调整尺寸和位置。';
 for(const label of [$('[data-angle]').parentElement,$('[data-offset]').parentElement])label.hidden=category==='floor';
 $('[data-remove]').textContent=category==='floor'?'恢复原地面':'移除这一件';$('[data-remove]').disabled=pose.item==='none';
 $('[data-size-label]').textContent=canAdjust?(category==='floor'?'纹理缩放':'等比调整'):'';
 renderCatalog();renderObjectList();updatePins();walk?.select(category);
 // The original 3D study retains its bounded table trial without loading it
 // merely because the photo workspace changes.
 const table=state.objects.table;
 root.dataset.choice=table.item==='black-table'?'table':table.item==='none'?'none':'original';
 root.dataset.length=String(Math.max(90,Math.min(124,table.length)));root.dataset.angle=String(Math.max(-12,Math.min(12,table.angle)));root.dataset.offset=String(Math.max(-8,Math.min(8,table.offset)));
 document.dispatchEvent(new CustomEvent('tingjian:coffee-change',{detail:{choice:root.dataset.choice,length:+root.dataset.length,angle:+root.dataset.angle,offset:+root.dataset.offset}}));
}
function card(item){const b=document.createElement('button');b.type='button';b.className='atelier-card';b.dataset.item=item.id;b.draggable=item.kind!=='original';if(item.kind==='original')b.dataset.original='true';b.setAttribute('aria-pressed',String(state.objects[category].item===item.id));b.setAttribute('aria-label',item.name+'，点击应用，也可拖入场景');const im=document.createElement('img');im.src=item.thumb;im.alt=item.name;im.loading='lazy';im.decoding='async';if(item.kind==='original')im.style.objectPosition=({table:'50% 85%',sofa:'85% 75%',rug:'40% 95%',floor:'20% 80%'})[category];const label=document.createElement('span');label.textContent=item.name;const small=document.createElement('small');small.textContent=item.kind==='original'?'原方案':item.provenance==='image-reconstruction'?'图片试建':item.provenance==='supplied'?'你提供的模型':item.kind==='model'?'3D 模型':'实物材质';label.append(small);b.append(im,label);
 b.addEventListener('click',()=>applyItem(item.id));
 b.addEventListener('pointerenter',e=>{if(e.pointerType!=='touch')showHover(item,b);});b.addEventListener('pointerleave',hideHover);b.addEventListener('focus',()=>showHover(item,b));b.addEventListener('blur',hideHover);
 b.addEventListener('dragstart',e=>{dragged=item.id;e.dataTransfer.effectAllowed='copy';e.dataTransfer.setData('application/x-tingjian-item',item.id);e.dataTransfer.setData('text/plain',item.id);hideHover();showDrop(item);});b.addEventListener('dragend',()=>{dragged=null;$('[data-drop-hint]').hidden=true;});return b;}
function renderCatalog(){const catalog=$('[data-catalog]');catalog.replaceChildren(...ITEMS.filter(x=>x.category===category&&(state.scene==='walnut'||x.kind!=='original'||category==='floor')).map(item=>card(item.id==='original-floor'&&state.scene!=='walnut'?{...item,name:sceneFor(state).floorName,thumb:sceneFor(state).plate,detail:'当前设计方案的地面'}:item)));}
function renderObjectList(){const list=$('[data-object-list]');list.replaceChildren();for(const [cat,cfg]of Object.entries(CATEGORIES)){const pose=state.objects[cat],item=itemFor(pose.item),b=document.createElement('button');b.type='button';b.dataset.object=cat;b.setAttribute('aria-pressed',String(cat===category));const title=document.createElement('span');title.textContent=cfg.objectName;const small=document.createElement('small');small.textContent=pose.item==='none'?'已移除':item.kind==='original'?'原方案':item.provenance==='image-reconstruction'?'图片试建':item.kind==='model'?'独立模型':'独立材质';b.append(title,small);b.addEventListener('click',()=>selectCategory(cat));list.append(b);}}
function selectCategory(cat){if(!CATEGORIES[cat])return;category=cat;hideContext();sync();}
function applyItem(id){try{state=chooseItem(state,id);category=itemFor(id).category;compare=false;$('[data-original-toggle]').setAttribute('aria-pressed','false');sync();schedule();}catch(e){status(e.message);}}
function alter(patch){try{const next=structuredClone(state);Object.assign(next.objects[category],patch);state=validateState(next);compare=false;sync();schedule(250);}catch(e){status(e.message);}}
for(const b of $$('[data-category]'))b.addEventListener('click',()=>selectCategory(b.dataset.category));
$('[data-size]').addEventListener('change',e=>alter({length:e.target.value}));
for(const key of ['angle','offset']){$(`[data-${key}]`).addEventListener('input',e=>{$(`[data-${key}-label]`).textContent=e.target.value+(key==='angle'?'°':' cm');});$(`[data-${key}]`).addEventListener('change',e=>alter({[key]:e.target.value}));}
function erase(){state=removeItem(state,category);compare=false;hideContext();sync();schedule();}
function restore(){applyItem('original-'+category);hideContext();}
$('[data-remove]').addEventListener('click',erase);$('[data-restore]').addEventListener('click',restore);
function updatePins(){const layer=$('[data-hit-layer]');layer.hidden=!pins||viewStyle!=='sculpt'||compare||experience==='walk';layer.replaceChildren();for(const [key,c]of Object.entries(CATEGORIES)){const b=document.createElement('button');b.type='button';b.className='atelier-hit';b.dataset.hit=key;b.textContent=c.objectName+(state.objects[key].item==='none'?'位置':'');b.setAttribute('aria-pressed',String(category===key));const p=c.point;b.style.left=p[0]*100+'%';b.style.top=p[1]*100+'%';b.addEventListener('click',()=>selectCategory(key));layer.append(b);}}
function showHover(item,card){if(matchMedia('(max-width:700px)').matches||dragged)return;const hover=$('[data-hover]');$('[data-hover-image]').src=item.thumb;$('[data-hover-image]').alt=item.name+'细节';$('[data-hover-title]').textContent=item.name;$('[data-hover-meta]').textContent=item.detail;hover.hidden=false;const r=card.getBoundingClientRect(),w=hover.offsetWidth||300;hover.style.left=Math.max(10,Math.min(window.innerWidth-w-10,r.left-w-14))+'px';hover.style.top=Math.max(10,Math.min(window.innerHeight-hover.offsetHeight-10,r.top-70))+'px';}
function hideHover(){$('[data-hover]').hidden=true;}
window.addEventListener('scroll',hideHover,{passive:true});window.addEventListener('resize',hideHover);
function point(event){const r=stage.getBoundingClientRect();return {x:(event.clientX-r.left)/r.width,y:(event.clientY-r.top)/r.height};}
function objectAt(event){if(experience==='walk')return walk?.pick(event.clientX,event.clientY)||null;const pin=event.target.closest('[data-hit]');if(pin)return pin.dataset.hit;const {x,y}=point(event);if(x>.61&&y>.47)return 'sofa';if(x>.37&&x<.62&&y>.61)return 'table';if(x>.22&&x<.76&&y>.69)return 'rug';if(y>.58)return 'floor';return null;}
function showContext(event){if(viewStyle!=='sculpt'||compare)return;const cat=objectAt(event);if(!cat)return;event.preventDefault();selectCategory(cat);const menu=$('[data-context]'),r=stage.getBoundingClientRect();$('[data-context-label]').textContent=CATEGORIES[cat].objectName;$('[data-context-delete]').textContent=cat==='floor'?'恢复原地面':'删除物件';menu.hidden=false;menu.style.left=Math.max(6,Math.min(event.clientX-r.left,r.width-175))+'px';menu.style.top=Math.max(6,Math.min(event.clientY-r.top,r.height-165))+'px';$('[data-context-replace]').focus({preventScroll:true});}
function hideContext(){$('[data-context]').hidden=true;}
stage.addEventListener('contextmenu',showContext);
stage.addEventListener('click',e=>{if(experience==='walk'||e.target.closest('[data-context]'))return;const cat=objectAt(e);if(cat&&viewStyle==='sculpt'&&!compare)selectCategory(cat);else hideContext();});
stage.addEventListener('pointerdown',e=>{if(e.pointerType==='touch'&&experience==='photo'&&!e.target.closest('[data-context]'))touchTimer=setTimeout(()=>showContext(e),550);});
for(const ev of ['pointerup','pointercancel','pointermove'])stage.addEventListener(ev,()=>clearTimeout(touchTimer));
$('[data-context-replace]').addEventListener('click',()=>{hideContext();$('[data-catalog] button').focus({preventScroll:true});});$('[data-context-delete]').addEventListener('click',erase);$('[data-context-restore]').addEventListener('click',restore);
document.addEventListener('pointerdown',e=>{if(!e.target.closest('[data-stage]'))hideContext();});
root.addEventListener('keydown',e=>{if(e.key==='Escape'){hideContext();hideHover();}if((e.key==='ContextMenu'||(e.key==='F10'&&e.shiftKey))&&e.target.closest('[data-hit]')){const r=e.target.getBoundingClientRect();showContext({target:e.target,clientX:r.left,clientY:r.top,preventDefault:()=>e.preventDefault()});}if(!($('[data-context]').hidden)&&['ArrowDown','ArrowUp'].includes(e.key)){e.preventDefault();const buttons=$$('[data-context] button'),i=buttons.indexOf(document.activeElement);buttons[(i+(e.key==='ArrowDown'?1:-1)+buttons.length)%buttons.length].focus();}});
function showDrop(item){const hint=$('[data-drop-hint]');hint.hidden=false;hint.textContent='拖到'+CATEGORIES[item.category].objectName+'位置，松开自动出图';}
stage.addEventListener('dragover',e=>{if(viewStyle!=='sculpt')return;e.preventDefault();e.dataTransfer.dropEffect='copy';if(dragged)showDrop(itemFor(dragged));});
stage.addEventListener('dragleave',e=>{if(!stage.contains(e.relatedTarget))$('[data-drop-hint]').hidden=true;});
stage.addEventListener('drop',e=>{e.preventDefault();$('[data-drop-hint]').hidden=true;const id=e.dataTransfer.getData('application/x-tingjian-item')||e.dataTransfer.getData('text/plain')||dragged;dragged=null;const item=itemFor(id);if(!item||viewStyle!=='sculpt')return;const p=point(e),valid=experience==='walk'?objectAt(e)===item.category:item.category==='floor'?p.y>.5:item.category==='rug'?p.y>.61:item.category==='sofa'?p.x>.57&&p.y>.4:p.x>.29&&p.x<.7&&p.y>.55;
 if(!valid){status('请把'+item.name+'拖到画面中的'+CATEGORIES[item.category].objectName+'位置，或直接点击素材卡片应用。');return;}
 try{state=chooseItem(state,id);category=item.category;if(experience==='photo'&&['table','sofa'].includes(category)){const origin=CATEGORIES[category].point[0];state.objects[category].offset=Math.round(Math.max(-15,Math.min(15,(p.x-origin)*90)));}state=validateState(state);compare=false;sync();schedule();}catch(err){status(err.message);}});
function progress(p){$('[data-progress-label]').textContent=p.label;const bar=$('[data-progress-bar]');if(p.total>0){bar.max=p.total;bar.value=p.loaded;$('[data-progress-count]').textContent=`已读取 ${p.loaded} / ${p.total} 个资源`;}else{bar.removeAttribute('value');$('[data-progress-count]').textContent='正在处理，完成后自动更新';}}
function snapshotForRender(){if(!compare)return structuredClone(state);const s=initialState(state.scene);s.view=state.view;return s;}
function showResult(result){last={...result,snapshot:structuredClone(result.snapshot)};image.src=result.url;image.alt=(result.compare?'原方案对照':'当前家具试摆')+'，'+VIEWS[result.snapshot.view].name;$('[data-view-label]').textContent=VIEWS[result.snapshot.view].name+(result.compare?' · 原方案':'');$('[data-save-image]').href=result.url;$('[data-save-image]').hidden=false;$('[data-result-note]').textContent=result.sample?'预制 AI 样张 · 不是当前参数渲染':'定点试摆 · 尺寸待实测';}
function schedule(delay=70){clearTimeout(timer);revision++;hideHover();hideContext();updatePins();status('正在更新 '+(experience==='walk'?'客餐厅布置':VIEWS[state.view].name)+'…');timer=setTimeout(()=>{queued={snapshot:snapshotForRender(),id:revision,compare};drain();},delay);}
async function drain(){if(working||!queued)return;const job=queued;queued=null;working=true;const key=signature(job.snapshot),started=performance.now();let created=null;
 try{
  if(job.id!==revision||viewStyle!=='sculpt')return;
  if(experience==='walk'){
   $('[data-progress]').hidden=false;root.setAttribute('aria-busy','true');
   if(!walk){const {createWalkViewer}=await import('./room-walk.mjs');const previousCanvas=$('[data-walk-canvas]'),fresh=document.createElement('canvas');fresh.setAttribute('data-walk-canvas','');fresh.setAttribute('tabindex','0');fresh.setAttribute('aria-label','拖动环看；点击地面圆圈保持朝向行走');fresh.hidden=true;previousCanvas.replaceWith(fresh);const createdWalk=await createWalkViewer({canvas:$('[data-walk-canvas]'),layer:$('[data-walk-layer]'),state:job.snapshot,report:progress,onSelect:selectCategory,onStatus:status,onError:e=>status(e.message),onPose:p=>{$('[data-view-label]').textContent='客餐厅 · '+({start:'起点',window:'窗边',aisle:'通道','dining-aisle':'餐厅通道',dining:'餐桌前','sofa-front':'沙发前'}[p.at]||'行走中');}});
    if(job.id!==revision||experience!=='walk'||viewStyle!=='sculpt'){createdWalk.dispose();return;}walk=createdWalk;
   }else await walk.update(job.snapshot,()=>job.id===revision&&experience==='walk');
   if(job.id===revision&&experience==='walk'){$('[data-walk-canvas]').hidden=false;$('[data-walk-layer]').hidden=false;image.hidden=true;$('[data-result-note]').textContent='客餐厅空间推演 · 原家具背面为近似模型';status('布置已同步。拖动环看，点地面圆圈保持朝向走过去；右键点模型可替换或删除。');}return;
  }
  let result=cache.get(key);if(!result){$('[data-progress]').hidden=false;root.setAttribute('aria-busy','true');progress({label:'准备当前方案…'});
   if(isOriginal(job.snapshot)&&job.snapshot.view==='main')result={url:ORIGINAL,snapshot:job.snapshot};
   else {const {renderRoom}=await import('./room-renderer.mjs');const output=await renderRoom(job.snapshot,p=>{if(job.id===revision&&viewStyle==='sculpt')progress(p);});created=URL.createObjectURL(output.blob);result={url:created,snapshot:job.snapshot};}
   cachePut(key,result);
  }
  if(job.id===revision&&viewStyle==='sculpt'){showResult({...result,compare:job.compare});status(`已更新${job.compare?'原方案对照':'当前布置'} · ${VIEWS[job.snapshot.view].name}。${created?'本次 '+((performance.now()-started)/1000).toFixed(1)+' 秒。':''}可继续替换物件、调整尺寸，或对比原方案。`);}
 }catch(error){if(job.id===revision){status('本次效果未完成：'+(error.message||'请重试')+'。已保留上一张图。');$('[data-result-note]').textContent='画面仍为上次成功结果';const retry=document.createElement('button');retry.textContent='重试当前方案';retry.addEventListener('click',()=>schedule(0));$('[data-status]').append(' ',retry);}}
 finally{working=false;root.setAttribute('aria-busy','false');$('[data-progress]').hidden=true;if(queued)drain();}
}
for(const b of $$('[data-viewpoint]'))b.addEventListener('click',()=>{state.view=b.dataset.viewpoint;sync();schedule();});
$('[data-toggle-pins]').addEventListener('click',()=>{pins=!pins;$('[data-toggle-pins]').setAttribute('aria-pressed',String(pins));updatePins();});
$('[data-original-toggle]').addEventListener('click',()=>{compare=!compare;$('[data-original-toggle]').setAttribute('aria-pressed',String(compare));schedule(0);});
$('[data-side-toggle]').addEventListener('click',()=>{const panel=$('[data-sidebar-content]');panel.hidden=!panel.hidden;$('[data-side-toggle]').textContent=panel.hidden?'+':'−';$('[data-side-toggle]').setAttribute('aria-expanded',String(!panel.hidden));});
$('[data-fullscreen]').addEventListener('click',async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else if(root.requestFullscreen)await root.requestFullscreen();else status('当前浏览器不支持全屏，可使用浏览器缩放。');}catch{status('当前浏览器未允许全屏，仍可在本页操作。');}});
function reset(){walk?.reset();clearTimeout(timer);revision++;queued=null;state=initialState(state.scene);compare=false;$('[data-original-toggle]').setAttribute('aria-pressed','false');sync();if(isOriginal(state))showResult({url:ORIGINAL,snapshot:state,compare:false});else schedule(0);status('已恢复这套方案的初始搭配。');if(experience==='walk')schedule(0);}
$('[data-reset]').addEventListener('click',reset);
$('[data-export]').addEventListener('click',()=>{const value=exportPlan(state);value.walkPose=walk?.getPose()||null;value.experience=experience;value.displayedResult=last?{snapshot:last.snapshot,precomputedSample:!!last.sample}:null;const u=URL.createObjectURL(new Blob([JSON.stringify(value,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=u;a.download='tingjian-living-room-plan.json';a.click();setTimeout(()=>URL.revokeObjectURL(u),1000);});
$('[data-sample]').addEventListener('click',()=>{setExperience('photo',false);clearTimeout(timer);revision++;queued=null;state=chooseItem(initialState(),'black-table');compare=false;sync();showResult({url:'/tour/trial-assets/table-replaced.png',snapshot:structuredClone(state),sample:true});status('正在看提前制作的 AI 写实样张。参数已恢复默认；再换物件，会按当前布置重新出图。');});
$('[data-back-to-edit]').addEventListener('click',()=>chooseDesign(state.scene));
document.addEventListener('tingjian:gallery',e=>{openEditor();viewStyle=e.detail.key;if(viewStyle==='sculpt'&&state.scene!=='walnut'){chooseDesign('walnut');return;}if(viewStyle!=='sculpt'){const nextImage=image.src,nextAlt=image.alt;setExperience('photo',false);image.src=nextImage;image.alt=nextAlt;}const editing=viewStyle==='sculpt';root.dataset.editing=String(editing);$('[data-style-note]').hidden=editing;$('[data-progress]').hidden=true;revision++;queued=null;clearTimeout(timer);if(editing){if(last)showResult(last);else image.src=ORIGINAL;}updatePins();});
document.addEventListener('tingjian:coffee-picked',()=>{document.querySelector('[data-render="sculpt"]').click();selectCategory('table');root.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});});
window.addEventListener('pagehide',()=>{walk?.dispose();walk=null;revision++;queued=null;clearTimeout(timer);urls.forEach(u=>URL.revokeObjectURL(u));});
function setExperience(next,render=true){
 next='photo';
 experience=next;root.dataset.experience=next;clearTimeout(timer);revision++;queued=null;hideContext();hideHover();
 for(const b of $$('[data-experience]'))b.setAttribute('aria-pressed',String(b.dataset.experience===next));
 $('[data-photo-viewbar]').hidden=next==='walk';$('[data-walkbar]').hidden=next!=='walk';
 if(next==='photo'){walk?.dispose();walk=null;$('[data-walk-canvas]').hidden=true;$('[data-walk-layer]').hidden=true;image.hidden=false;if(last)showResult(last);else image.src=ORIGINAL;}
 updatePins();if(render)schedule(0);
}
for(const b of $$('[data-experience]'))b.addEventListener('click',()=>{if(b.dataset.experience!==experience)setExperience(b.dataset.experience);});
for(const b of $$('[data-walk-destination]'))b.addEventListener('click',()=>walk?.walkTo(b.dataset.walkDestination));
$('[data-walk-home]').addEventListener('click',()=>walk?.reset());
$('[data-walk-save]').addEventListener('click',async()=>{if(!walk)return;try{const u=URL.createObjectURL(await walk.save()),a=document.createElement('a');a.href=u;a.download='tingjian-walk-view.png';a.click();setTimeout(()=>URL.revokeObjectURL(u),1000);}catch(e){status(e.message);}});
function openEditor(){root.dataset.surface='editor';$('[data-home-panel]').hidden=true;$('[data-editor-panel]').hidden=false;document.dispatchEvent(new CustomEvent('tingjian:editor-open'));}
document.addEventListener('tingjian:home-open',()=>{clearTimeout(timer);revision++;queued=null;walk?.dispose();walk=null;hideHover();hideContext();root.dataset.surface='home';});
function chooseDesign(id){
 if(!SCENES[id])return;openEditor();designStates.set(state.scene,structuredClone(state));
 state=structuredClone(designStates.get(id)||initialState(id));compare=false;viewStyle='sculpt';root.dataset.editing='true';$('[data-style-note]').hidden=true;
 for(const b of document.querySelectorAll('[data-render]'))b.setAttribute('aria-pressed',String(id==='walnut'&&b.dataset.render==='sculpt'));
 sync();schedule(0);
}
for(const b of $$('[data-design]'))b.addEventListener('click',()=>chooseDesign(b.dataset.design));
root.dataset.editing='true';root.dataset.experience='photo';sync();const homeGallery=initHomeGallery(root);const designJourney=initDesignJourney(root,homeGallery);
// The editor keeps its state when switching top-level sections, and its frame
// follows content height without a second scrollbar inside the workspace.
if(window.parent!==window&&typeof ResizeObserver!=='undefined'){
 let heightFrame;new ResizeObserver(()=>{cancelAnimationFrame(heightFrame);heightFrame=requestAnimationFrame(()=>window.parent.postMessage({type:'tingjian:studio-height',height:document.querySelector('main').getBoundingClientRect().height+24},location.origin));}).observe(document.querySelector('main'));
}
