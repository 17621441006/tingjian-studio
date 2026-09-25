import {openImageDialog} from './dialog-view.mjs';
import {HOMES,ROOMS} from './home-designs.mjs';
import {LAYOUT_ROOMS,LIGHT_SCENES,layoutsFor,layoutInfo} from './layout-options.mjs';
import {resolveScene,sceneAvailable,sceneAsset,sceneNote,sceneItems,sceneLabel,sceneFromGallery,assembleHome} from './scene-options.mjs';
import {PIECE_GROUPS,pieceGroups,pieceItem,changePiece,defaultPieces} from './home-pieces.mjs';
import {exportEffectBook} from './whole-export.mjs';
import PURCHASES from './purchase-data.json';

export function initDesignJourney(root,gallery){
 const $=s=>root.querySelector(s),$$=s=>[...root.querySelectorAll(s)];
 let step='style',confirmed=null,current=resolveScene(),intended=resolveScene(),busy=false,job=0,pieceJob=0,galleryBusy=false,inEditor=false,detailsView='summary',allProducts=false,onlySelected=false;
 let wholeBusy=false,wholeJob=0,wholeRoom='living',wholeView='overview',exportBusy=false;
 const saved=new Map(),seeds=new Map(),shortlists=new Map(),snapshots=new Map(),loaded=new Set(),pending=new Map();
 const clone=value=>JSON.parse(JSON.stringify(value));
 const roomName=id=>ROOMS.find(r=>r.id===id)?.name||id;
 const lightName=id=>LIGHT_SCENES.find(l=>l.id===id)?.name||id;
 const currentShortlist=()=>{if(!shortlists.has(confirmed))shortlists.set(confirmed,new Set());return shortlists.get(confirmed);};
 const makeButton=(text,key,value,fn)=>{const b=document.createElement('button');b.type='button';b.textContent=text;b.dataset[key]=value;b.addEventListener('click',fn);return b;};
 const frames=()=>assembleHome(confirmed,saved,seeds.get(confirmed));
 const signature=()=>JSON.stringify({frames:frames().map(f=>({id:f.id,scene:f.scene,path:f.path})),shortlist:[...currentShortlist()].sort()});
 const snapshot=()=>snapshots.get(confirmed);
 function imageReady(path){
  if(!path)return Promise.reject(new Error('这组搭配尚未成图，已保留刚才的选择。'));
  if(loaded.has(path))return Promise.resolve();if(pending.has(path))return pending.get(path);
  const p=new Promise((resolve,reject)=>{const im=new Image();im.decoding='async';im.onload=()=>{loaded.add(path);resolve();};im.onerror=()=>reject(new Error('这一张暂时没载入，已保留刚才的选择。'));im.src=path;});pending.set(path,p);p.finally(()=>pending.delete(path)).catch(()=>{});return p;
 }
 function galleryVisible(){return step==='style'||step==='details'&&detailsView==='pieces';}
 function syncNavigation(){
  root.dataset.journeyStep=step;root.dataset.detailsView=detailsView;
  for(const b of $$('[data-journey-step]')){b.setAttribute('aria-current',b.dataset.journeyStep===step?'step':'false');b.disabled=b.dataset.journeyStep!=='style'&&(!confirmed||busy||galleryBusy);}
  $('[data-journey-summary]').hidden=!confirmed||inEditor;$('[data-journey-chosen]').textContent=confirmed?'已选风格 · '+HOMES[confirmed].name:'';
  $('[data-confirm-style]').disabled=busy||galleryBusy;$('[data-confirm-style]').textContent=busy?'正在保留你的选择…':'确定'+HOMES[gallery.getState().design].name+'，试布局 →';$('[data-confirm-style]').setAttribute('aria-busy',String(busy||galleryBusy));
  $('[data-layout-next]').disabled=busy||!confirmed;$('[data-details-next]').disabled=busy||galleryBusy||!confirmed;
  $('[data-layout-stage]').setAttribute('aria-busy',String(busy));$('[data-layout-loading]').hidden=!busy;
  for(const b of $$('[data-home-design]'))b.disabled=busy&&step==='style';
  $('[data-home-panel]').hidden=inEditor||!galleryVisible();$('[data-layout-panel]').hidden=inEditor||step!=='layout';$('[data-journey-details]').hidden=inEditor||step!=='details';$('[data-whole-panel]').hidden=inEditor||step!=='whole';
  $('[data-journey-confirmbar]').hidden=step!=='style';$('[data-details-summary]').hidden=detailsView==='pieces';$('[data-details-piece-scope]').hidden=detailsView!=='pieces';
  for(const b of $$('[data-details-view]'))b.setAttribute('aria-pressed',String(b.dataset.detailsView===detailsView));
 }
 function renderLayoutControls(){
  const roomList=$('[data-layout-rooms]');roomList.replaceChildren();
  for(const r of LAYOUT_ROOMS){const b=makeButton(r.name,'layoutRoom',r.id,()=>chooseRoom(r.id));b.setAttribute('aria-pressed',String(current.room===r.id));roomList.append(b);}
  const list=$('[data-layout-options]');list.replaceChildren();
  for(const l of layoutsFor(current.design,current.room)){
   const candidate=resolveScene({...current,layout:l.id}),available=sceneAvailable(candidate),b=makeButton('','layoutChoice',l.id,()=>choose({...intended,layout:l.id}));b.disabled=!available;b.title=available?l.title:sceneNote(candidate);b.setAttribute('aria-pressed',String(current.layout===l.id));
   const im=document.createElement('img');im.src=sceneAsset(available?candidate:resolveScene({...candidate,pieces:defaultPieces(),mode:'pieces',variant:'original',window:'original'}),true);im.alt='';im.width=480;im.height=320;im.loading='lazy';im.decoding='async';
   const labels=document.createElement('span'),strong=document.createElement('strong'),small=document.createElement('small');strong.textContent=l.name;small.textContent=available?l.short:'当前单品组合尚未成图';labels.append(strong,small);b.append(im,labels);list.append(b);
  }
  const lights=$('[data-layout-lights]');lights.replaceChildren();const full=current.design==='dusk'&&current.room==='living';
  for(const l of LIGHT_SCENES.filter(x=>full||x.id==='daywarm')){const candidate={...current,light:l.id},b=makeButton('','layoutLight',l.id,()=>choose({...intended,light:l.id}));b.disabled=!sceneAvailable(candidate);b.title=b.disabled?sceneNote(candidate):l.hint;b.setAttribute('aria-pressed',String(current.light===l.id));const strong=document.createElement('strong'),small=document.createElement('small');strong.textContent=l.name;small.textContent=b.disabled?'本组合待补充':l.hint;b.append(strong,small);lights.append(b);}
  $('[data-layout-light-hint]').textContent=full?'按当前搭配显示可用光线':'本区先比较排布';$('[data-layout-go-lights]').hidden=full||current.design!=='dusk';
  $('[data-layout-scope]').textContent=current.design==='dusk'?'风格和单品已保留。布局、光线和窗景只显示已有对应效果的组合。':'已保留'+HOMES[current.design].name+'的当前搭配；本套先沿用原排布，新排布试验位于暮色私邸。';
  $('[data-layout-availability]').textContent=sceneNote(current);
  const info=layoutInfo(current),path=sceneAsset(current);
  $('[data-layout-image]').src=path;$('[data-layout-image]').alt=HOMES[current.design].name+' · '+roomName(current.room)+' · '+sceneLabel(current)+' · '+lightName(current.light)+'概念效果图';
  for(const key of ['layout','light','room','design'])$('[data-layout-stage]').dataset[key]=current[key];$('[data-layout-stage]').dataset.sofa=current.pieces.sofa;
  $('[data-layout-image-label]').textContent=info.name+' / '+lightName(current.light);$('[data-layout-selected-items]').textContent=sceneItems(current).map(x=>x[0]+' · '+x[1]).join('　/　');
  $('[data-layout-save]').href=path;$('[data-layout-save]').download=HOMES[current.design].name+'-'+roomName(current.room)+'-'+info.name+'-'+lightName(current.light)+'.jpg';
  $('[data-layout-story-title]').textContent=info.title;$('[data-layout-story-copy]').textContent=info.copy;$('[data-layout-benefit]').textContent=info.benefit;$('[data-layout-tradeoff]').textContent=info.tradeoff;
  const checks=$('[data-layout-checks]');checks.replaceChildren();for(const check of info.checks){const li=document.createElement('li');li.textContent=check;checks.append(li);}
  $('[data-layout-checks-wrap]').open=current.layout==='glazing'||current.window==='clear';
  const windows=$('[data-window-options]');windows.replaceChildren();$('[data-window-section]').hidden=current.design!=='dusk'||current.room!=='master';
  for(const [id,name] of [['original','保留现有窗'],['clear','整面玻璃 · 侧边通风']]){const candidate={...current,window:id},b=makeButton(name,'windowChoice',id,()=>choose({...intended,window:id}));b.disabled=!sceneAvailable(candidate);b.title=b.disabled?sceneNote(candidate):name;b.setAttribute('aria-pressed',String(current.window===id));windows.append(b);}
  // A small, same-frame selector keeps the chosen colour in view while trying a layout.
  const tones=$('[data-layout-sofas]');tones.replaceChildren();$('[data-layout-sofa-section]').hidden=current.design!=='dusk'||current.room!=='living'||current.mode!=='pieces';
  for(const id of ['cognac','wine']){const item=pieceItem('sofa',id),candidate={...current,pieces:changePiece(current.pieces,'sofa',id)},b=makeButton(item.name,'layoutSofa',id,()=>choose({...intended,pieces:changePiece(intended.pieces,'sofa',id)}));b.disabled=!sceneAvailable(candidate);b.setAttribute('aria-pressed',String(current.pieces.sofa===id));tones.append(b);}
 }
 function renderProducts(){
  const home=HOMES[current.design],room=home.rooms[current.room],shortlist=currentShortlist();
  const candidates=PURCHASES.filter(x=>x.schemes.includes(home.purchaseKey||current.design)&&(onlySelected?shortlist.has(x.id):allProducts||room.purchase.includes(x.category)&&!(current.layout==='storage'&&current.room==='living'&&x.category==='sofa')));
  const list=$('[data-details-products]');list.replaceChildren();
  for(const item of candidates){
   const card=document.createElement('article');card.className='home-product';const brand=document.createElement('span');brand.className='home-product-brand';brand.textContent=item.brand;
   const title=document.createElement('h4');title.textContent=item.product;const reason=document.createElement('p');reason.textContent=item.whyMatched;
   const material=document.createElement('small');material.textContent='材质：'+(item.materials||[]).join('；');
   const size=document.createElement('small');size.textContent=typeof item.dimensions==='string'?item.dimensions:item.dimensions?item.dimensions.label+'：'+item.dimensions.text:'尺寸、饰面与配置请向品牌确认';
   const notes=document.createElement('small');notes.textContent=item.purchaseNote||'';const links=document.createElement('div');links.className='home-product-links';
   for(const link of [{label:item.linkType||'产品官网',url:item.url},...(item.secondaryLinks||[])]){const a=document.createElement('a');a.href=link.url;a.target='_blank';a.rel='noopener noreferrer';a.textContent=link.label+' ↗';links.append(a);}
   const pick=makeButton(shortlist.has(item.id)?'已加入候选 ✓':'加入候选','shortlistItem',item.id,()=>{shortlist.has(item.id)?shortlist.delete(item.id):shortlist.add(item.id);renderProducts();renderWhole();$('[data-shortlist-item="'+item.id+'"]')?.focus();});pick.className='shortlist-add';pick.setAttribute('aria-pressed',String(shortlist.has(item.id)));
   card.append(brand,title,reason,material,size,notes,links,pick);list.append(card);
  }
  $('[data-details-product-scope]').setAttribute('aria-pressed',String(allProducts));$('[data-details-product-scope]').textContent=allProducts?'仅看当前空间':'查看全屋候选';$('[data-shortlist-count]').textContent='购买候选 '+shortlist.size+' 件 · 不会自动替换画面';
  $('[data-shortlist-only]').setAttribute('aria-pressed',String(onlySelected));$('[data-shortlist-only]').textContent=onlySelected?'回到全部候选':'只看已选候选';$('[data-details-empty]').hidden=candidates.length>0;
 }
 function renderDetails(){
  const info=layoutInfo(current),home=HOMES[current.design];$('[data-details-image]').src=sceneAsset(current);$('[data-details-image]').alt=home.name+'已选'+sceneLabel(current)+'效果';
  $('[data-details-design]').textContent=home.name+' · '+roomName(current.room);$('[data-details-title]').textContent=sceneLabel(current);$('[data-details-copy]').textContent=info.name+' / '+lightName(current.light)+(current.window==='clear'?' / 整面窗景设想':'');
  const dl=$('[data-details-items]');dl.replaceChildren();for(const [name,copy] of sceneItems(current)){const row=document.createElement('div'),dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=name;dd.textContent=copy;row.append(dt,dd);dl.append(row);}
  const nav=$('[data-details-room-picks]');nav.replaceChildren();for(const r of LAYOUT_ROOMS){const b=makeButton(r.name,'detailsRoom',r.id,()=>chooseRoom(r.id));b.setAttribute('aria-pressed',String(r.id===current.room));nav.append(b);}
  const pieceButton=$('[data-details-view="pieces"]');pieceButton.hidden=current.design!=='dusk';pieceButton.textContent=current.layout!=='original'||current.light!=='daywarm'||current.mode==='palette'?'改为原布局与日光暖灯，换单品':'换单品 · 当前固定视角';
  $('[data-details-shopping-note]').textContent='下方是可看样、试坐和询价的购买候选。加入清单只记录选购意向；画面实际应用的款式以上方搭配为准。新收纳与外窗另行复尺深化。';renderProducts();
 }
 function renderWhole(){
  if(!confirmed)return;const result=snapshot(),stale=result&&result.signature!==signature();
  $('[data-whole-generate]').disabled=wholeBusy||busy||galleryBusy;$('[data-whole-generate]').textContent=wholeBusy?'正在整理效果…':result?stale?'更新全屋效果册':'重新汇总当前方案':'生成全屋效果册';
  $('[data-whole-progress-wrap]').hidden=!wholeBusy;$('[data-whole-result]').hidden=!result;$('[data-whole-empty]').hidden=!!result;
  $('[data-whole-stale]').hidden=!stale;$('[data-whole-export]').disabled=!result||stale||wholeBusy||exportBusy;
  if(!result)return;
  $('[data-whole-title]').textContent=HOMES[result.design].name+' · '+result.frames.length+' 个空间';$('[data-whole-count]').textContent=result.frames.filter(f=>f.changed).length+' 个空间已调整，其余沿用本套风格';
  const mosaic=$('[data-whole-mosaic]');mosaic.replaceChildren();const nav=$('[data-whole-rooms]');nav.replaceChildren();
  for(const f of result.frames){
   const b=makeButton('','wholeRoom',f.id,()=>{wholeRoom=f.id;wholeView='room';renderWhole();});b.className='whole-room-card';const im=document.createElement('img');im.src=f.path;im.alt=HOMES[result.design].name+' · '+f.name;im.width=1536;im.height=1024;im.loading='lazy';im.decoding='async';const labels=document.createElement('span'),name=document.createElement('strong'),small=document.createElement('small');name.textContent=f.name;small.textContent=f.id==='dining'&&f.shared?'与客厅共用已选视角':f.changed?'已应用 · '+f.label:'沿用风格原方案';labels.append(name,small);b.append(im,labels);mosaic.append(b);
   const tab=makeButton(f.name,'wholeRoomTab',f.id,()=>{wholeRoom=f.id;wholeView='room';renderWhole();});tab.setAttribute('aria-pressed',String(f.id===wholeRoom));nav.append(tab);
  }
  const active=result.frames.find(f=>f.id===wholeRoom)||result.frames[0];$('[data-whole-room-image]').src=active.path;$('[data-whole-room-image]').alt=active.name+' · '+active.label;$('[data-whole-room-title]').textContent=active.name+' · '+active.label;
  $('[data-whole-room-info]').textContent=active.items.map(x=>x.join('：')).join(' / ');$('[data-whole-room-save]').href=active.path;$('[data-whole-room-save]').download=HOMES[result.design].name+'-'+active.name.replaceAll('/','-')+'.jpg';
  $('[data-whole-mosaic]').hidden=wholeView!=='overview';$('[data-whole-room-view]').hidden=wholeView!=='room';for(const b of $$('[data-whole-view]'))b.setAttribute('aria-pressed',String(b.dataset.wholeView===wholeView));
  const applied=$('[data-whole-applied]');applied.replaceChildren();for(const f of result.frames.filter(f=>f.changed)){const row=document.createElement('p');row.textContent=f.name+'：'+f.items.map(x=>x.join(' · ')).join('；');applied.append(row);}
  if(!applied.children.length){const p=document.createElement('p');p.textContent='沿用本套风格原搭配。';applied.append(p);}
  const candidates=$('[data-whole-candidates]');candidates.replaceChildren();for(const item of result.products){const a=document.createElement('a');a.href=item.url;a.target='_blank';a.rel='noopener noreferrer';a.textContent=item.brand+' · '+item.product+' ↗';candidates.append(a);}
  if(!result.products.length)candidates.textContent='暂未加入购买候选。你可以回到第三步挑选试坐、看样的产品。';
 }
 async function buildWhole(){
  if(!confirmed||wholeBusy)return;const design=confirmed,sig=signature(),id=++wholeJob,list=clone(frames()),products=PURCHASES.filter(p=>currentShortlist().has(p.id));wholeBusy=true;let count=0;renderWhole();$('[data-whole-progress]').value=0;$('[data-whole-progress]').max=list.length;$('[data-whole-progress-text]').textContent='正在读取原尺寸效果图 0 / '+list.length;$('[data-whole-status]').textContent='';
  try{await Promise.all(list.map(async f=>{await imageReady(f.path);if(id!==wholeJob)return;count++;$('[data-whole-progress]').value=count;$('[data-whole-progress-text]').textContent='已读取 '+count+' / '+list.length+' 个空间';}));
   if(id!==wholeJob||design!==confirmed||sig!==signature())return;
   snapshots.set(design,{design,signature:sig,frames:list,products:clone(products),createdAt:new Date().toISOString()});wholeView='overview';$('[data-whole-status]').textContent='已按当前选择汇总。可以看全屋一览、逐室大图，或下载含图片的效果册。';
  }catch(error){if(id===wholeJob)$('[data-whole-status]').textContent='有图片未载入，上一份完整效果已保留。请重试。';}
  finally{if(id===wholeJob){wholeBusy=false;renderWhole();}}
 }
 function render(){syncNavigation();if(confirmed){renderLayoutControls();renderDetails();renderWhole();}}
 function commit(next){current=resolveScene(next);intended=clone(current);saved.set(current.design+':'+current.room,clone(current));}
 async function choose(value,{confirm=false,nextStep=null}={}){
  const next=resolveScene(value);if(!sceneAvailable(next)){$('[data-layout-status]').textContent=sceneNote(next);return false;}
  const id=++job;pieceJob++;intended=clone(next);busy=true;syncNavigation();$('[data-layout-status]').textContent='';$('[data-details-status]').textContent=step==='details'?'正在载入所选空间…':'';
  try{await imageReady(sceneAsset(next));if(id!==job)return false;commit(next);if(confirm){confirmed=next.design;if(!seeds.has(next.design))seeds.set(next.design,clone(next));}if(nextStep)step=nextStep;detailsView='summary';$('[data-details-status]').textContent='';render();return true;}
  catch(error){if(id!==job)return false;intended=clone(current);const output=step==='style'?$('[data-journey-confirm-status]'):step==='details'?$('[data-details-status]'):$('[data-layout-status]');output.textContent=error.message;output.append(' ',makeButton('重新载入','layoutRetry','',()=>choose(next,{confirm,nextStep})));return false;}
  finally{if(id===job){busy=false;syncNavigation();}}
 }
 function chooseRoom(room){const design=confirmed||current.design;return choose(saved.get(design+':'+room)||{...seeds.get(design),design,room,layout:'original',light:'daywarm',window:'original'});}
 gallery.setRoomHandler?.((design,room)=>{if(step!=='details'||detailsView!=='pieces'||design!==confirmed)return false;const next=resolveScene(saved.get(design+':'+room)||{...seeds.get(design),design,room,layout:'original',light:'daywarm',window:'original'});if(['living','master'].includes(room)&&next.layout==='original'&&next.light==='daywarm'&&next.mode==='pieces'){gallery.openView(design,room,'original','pieces',next.pieces);}else chooseRoom(room);return true;});
 function goStep(next){
  if(next!=='style'&&(!confirmed||busy||galleryBusy))return;if(next==='style'&&busy){job++;busy=false;intended=clone(current);}pieceJob++;step=next;detailsView='summary';inEditor=false;root.dataset.surface='home';$('[data-editor-panel]').hidden=true;$('[data-details-status]').textContent='';
  if(next!=='whole'){wholeJob++;wholeBusy=false;$('[data-space-model]').open=false;document.dispatchEvent(new CustomEvent('tingjian:model-visible',{detail:false}));}
  render();
 }
 for(const b of $$('[data-journey-step]'))b.addEventListener('click',()=>goStep(b.dataset.journeyStep));$('[data-journey-change]').addEventListener('click',()=>goStep('style'));
 $('[data-confirm-style]').addEventListener('click',()=>{if(busy||galleryBusy)return;const view=gallery.getState();$('[data-journey-confirm-status]').textContent='';choose(sceneFromGallery(view),{confirm:true,nextStep:'layout'});});
 $('[data-layout-next]').addEventListener('click',()=>goStep('details'));$('[data-details-next]').addEventListener('click',()=>{goStep('whole');if(step==='whole')buildWhole();});$('[data-whole-back]').addEventListener('click',()=>goStep('details'));$('[data-details-back]').addEventListener('click',()=>goStep('layout'));$('[data-layout-go-lights]').addEventListener('click',()=>chooseRoom('living'));
 for(const b of $$('[data-details-view]'))b.addEventListener('click',async()=>{
  if(!confirmed||busy||galleryBusy)return;const id=++pieceJob;if(b.dataset.detailsView==='summary'){detailsView='summary';$('[data-details-status]').textContent='';render();return;}
  $('[data-details-status]').textContent='正在载入原布局、日光暖灯的单品搭配…';const room=['living','master'].includes(current.room)?current.room:'living';
  const ok=await gallery.openView(confirmed,room,'original','pieces',current.pieces);if(id!==pieceJob||step!=='details'||inEditor)return;
  if(ok===true){commit(sceneFromGallery(gallery.getState()));detailsView='pieces';$('[data-details-status]').textContent='';render();}
  else $('[data-details-status]').textContent='单品对照暂未载入，已保留所选排布。请再点一次。';
 });
 $('[data-details-product-scope]').addEventListener('click',()=>{allProducts=!allProducts;onlySelected=false;renderProducts();});$('[data-shortlist-only]').addEventListener('click',()=>{onlySelected=!onlySelected;renderProducts();});
 document.addEventListener('tingjian:home-view',event=>{if(step==='details'&&detailsView==='pieces'&&!inEditor&&event.detail.design===confirmed){commit(sceneFromGallery(event.detail));renderDetails();renderWhole();}syncNavigation();});
 document.addEventListener('tingjian:home-loading',event=>{galleryBusy=!!event.detail;syncNavigation();});
 document.addEventListener('tingjian:editor-open',()=>{inEditor=true;job++;pieceJob++;wholeJob++;wholeBusy=false;busy=false;galleryBusy=false;intended=clone(current);syncNavigation();});
 document.addEventListener('tingjian:home-open',()=>{if(inEditor){inEditor=false;step='style';detailsView='summary';syncNavigation();}});
 const dialog=$('[data-journey-dialog]');
 function large(path=sceneAsset(current),title=HOMES[current.design].name+' · '+sceneLabel(current)+' · '+lightName(current.light)){$('[data-journey-dialog-image]').src=path;$('[data-journey-dialog-image]').alt=title;$('[data-journey-dialog-title]').textContent=title;$('[data-journey-dialog-view]').classList.remove('is-native');$('[data-journey-native]').setAttribute('aria-pressed','false');if(typeof dialog.showModal==='function')openImageDialog(dialog,window);}
 $('[data-layout-large]').addEventListener('click',()=>large());$('[data-details-large]').addEventListener('click',()=>large());$('[data-journey-close]').addEventListener('click',()=>dialog.close());dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close();});$('[data-journey-native]').addEventListener('click',()=>{const on=$('[data-journey-dialog-view]').classList.toggle('is-native');$('[data-journey-native]').setAttribute('aria-pressed',String(on));});
 $('[data-whole-generate]').addEventListener('click',buildWhole);for(const b of $$('[data-whole-view]'))b.addEventListener('click',()=>{wholeView=b.dataset.wholeView;renderWhole();});
 $('[data-whole-room-large]').addEventListener('click',()=>{const f=snapshot()?.frames.find(f=>f.id===wholeRoom);if(f)large(f.path,HOMES[confirmed].name+' · '+f.name);});
 $('[data-whole-export]').addEventListener('click',async()=>{const result=snapshot();if(!result||result.signature!==signature()||exportBusy)return;exportBusy=true;renderWhole();$('[data-whole-status]').textContent='正在将原尺寸图片打包到效果册…';try{await exportEffectBook(clone(result),HOMES[confirmed].name);$('[data-whole-status]').textContent='效果册已下载，包含图片、实际搭配和单独列出的购买候选。';}catch(error){$('[data-whole-status]').textContent='效果册未下载成功，请重试；页面内的效果仍保留。';}finally{exportBusy=false;renderWhole();}});
 $('[data-space-model]').addEventListener('toggle',()=>{const visible=$('[data-space-model]').open&&step==='whole';document.dispatchEvent(new CustomEvent('tingjian:model-visible',{detail:visible}));});
 render();return {getState:()=>({step,confirmed,current:clone(current),busy,detailsView,wholeBusy,whole:snapshot()?clone(snapshot()):null,stale:!!snapshot()&&snapshot().signature!==signature()})};
}
