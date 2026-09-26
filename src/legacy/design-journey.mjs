import {createFloorLive} from './floor-live.mjs';
import {renderFloorCatalog,floorProduct,FLOOR_CATALOG} from './floor-catalog.mjs';
import {openImageDialog} from './dialog-view.mjs';
import {renderMaterialList} from './material-previews.mjs';
import {supportsSceneObjects,toggleSceneObject,renderSceneObjectControls} from './scene-objects.mjs';
import {HOMES,ROOMS} from './home-designs.mjs';
import {LAYOUT_ROOMS,LIGHT_SCENES,layoutsFor,layoutInfo} from './layout-options.mjs';
import {resolveScene,sceneAvailable,sceneAsset,sceneNote,sceneItems,sceneLabel,sceneFromGallery,assembleHome} from './scene-options.mjs';
import {PIECE_GROUPS,pieceGroups,pieceItem,changePiece,defaultPieces} from './home-pieces.mjs';
import {exportEffectBook} from './whole-export.mjs';
import PURCHASES from './purchase-data.json';
import {duskVrMatch} from '../vr/dusk-manifest.mjs';

export function initDesignJourney(root,gallery){
 const $=s=>root.querySelector(s),$$=s=>[...root.querySelectorAll(s)];
 let step='style',confirmed=null,current=resolveScene(),intended=resolveScene(),busy=false,job=0,pieceJob=0,galleryBusy=false,inEditor=false,detailsView='summary',allProducts=false,onlySelected=false;
 let wholeBusy=false,wholeJob=0,wholeRoom='living',wholeView='model',exportBusy=false;
 let editCategory='sofa',modelApi=null,modelPromise=null,modelSignature=null,historyOpen=false;
 let bulkBusy=false,bulkJob=0,modelQuality='detailed';
 const syncFloorLive=createFloorLive(root);
 const confirmations=new Map();
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
 function galleryVisible(){return step==='style';}
 const roomSignature=id=>JSON.stringify(frames().find(f=>f.id===id));
 const roomConfirmed=id=>confirmations.get(confirmed+':'+id)===roomSignature(id);
 const confirmationCount=()=>confirmed?ROOMS.filter(r=>roomConfirmed(r.id)).length:0;
 const allConfirmed=()=>confirmationCount()===ROOMS.length;
 function syncNavigation(){
  root.dataset.journeyStep=step;root.dataset.detailsView=detailsView;
  for(const b of $$('[data-journey-step]')){b.setAttribute('aria-current',b.dataset.journeyStep===step?'step':'false');b.disabled=bulkBusy||b.dataset.journeyStep!=='style'&&(!confirmed||busy||galleryBusy||b.dataset.journeyStep==='whole'&&!allConfirmed());}
  $('[data-journey-summary]').hidden=!confirmed||inEditor;$('[data-journey-chosen]').textContent=confirmed?'已选风格 · '+HOMES[confirmed].name:'';
  $('[data-confirm-style]').disabled=busy||galleryBusy;$('[data-confirm-style]').textContent=busy?'正在保留你的选择…':'确定'+HOMES[gallery.getState().design].name+'，试布局 →';$('[data-confirm-style]').setAttribute('aria-busy',String(busy||galleryBusy));
  $('[data-layout-next]').disabled=busy||!confirmed;$('[data-details-next]').disabled=busy||bulkBusy||galleryBusy||!allConfirmed();
  $('[data-confirm-all]').disabled=busy||bulkBusy||!confirmed; $('[data-confirm-all]').textContent=bulkBusy?'正在检查全屋图片…':allConfirmed()?'全部已确认 ✓':'一键确认全部空间';
  $('[data-confirm-room]').disabled=busy||bulkBusy||!confirmed; $('[data-room-edit-loading]').hidden=!busy; $('[data-room-editor-picture]').setAttribute('aria-busy',String(busy));
  $('[data-layout-stage]').setAttribute('aria-busy',String(busy));$('[data-layout-loading]').hidden=!busy;
  for(const b of $$('[data-details-object-controls] button'))b.disabled=bulkBusy||b.dataset.sceneRestore!==undefined&&!current.removed.length;
  for(const b of $$('[data-home-design]'))b.disabled=busy&&step==='style';
  $('[data-home-panel]').hidden=inEditor||!galleryVisible();$('[data-layout-panel]').hidden=inEditor||step!=='layout';$('[data-journey-details]').hidden=inEditor||step!=='details';$('[data-whole-panel]').hidden=inEditor||step!=='whole';
  $('[data-journey-confirmbar]').hidden=step!=='style';$('[data-details-summary]').hidden=false;
  if(historyOpen){$('[data-home-panel]').hidden=true;$('[data-layout-panel]').hidden=true;$('[data-journey-details]').hidden=true;$('[data-whole-panel]').hidden=true;}
  modelApi?.setVisible(!historyOpen&&step==='whole'&&wholeView==='model');
  if(historyOpen||step!=='whole')$('[data-dusk-vr-host]')?.replaceChildren();
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
  const home=HOMES[current.design],info=layoutInfo(current),frame=frames().find(f=>f.id===current.room);$('[data-details-image]').src=frame.path;$('[data-details-image]').alt=home.name+' · '+roomName(current.room)+' · '+sceneLabel(current);
  $('[data-details-design]').textContent=home.name+' · '+roomName(current.room);$('[data-details-title]').textContent=roomName(current.room);$('[data-details-copy]').textContent=(frame.shared?'客餐厅共用选材 · 显示已选客厅视角':sceneLabel(current))+' / '+lightName(current.light);
  renderMaterialList($('[data-details-items]'),sceneItems(current),{path:frame.path,room:current.room});
  const count=confirmationCount();$('[data-room-progress]').textContent='已确认 '+count+' / '+ROOMS.length+' 个空间';$('[data-details-next]').textContent=allConfirmed()?'查看我的三维全屋效果 →':'全部确认后，看全屋效果 →';
  $('[data-room-confirm-state]').textContent=roomConfirmed(current.room)?'本空间已确认 ✓':'本空间待确认';$('[data-confirm-room]').textContent=roomConfirmed(current.room)?'已确认 · 再次确认':'确认这一间';$('[data-next-unconfirmed]').hidden=allConfirmed();
  const nav=$('[data-details-room-picks]');nav.replaceChildren();for(const r of ROOMS){const f=frames().find(f=>f.id===r.id),b=makeButton('','detailsRoom',r.id,()=>chooseRoom(r.id)),im=document.createElement('img'),text=document.createElement('span'),small=document.createElement('small');im.src=f.thumb;im.alt='';im.loading='lazy';im.width=90;im.height=60;text.textContent=r.name;small.textContent=roomConfirmed(r.id)?'已确认 ✓':'待确认';b.setAttribute('aria-pressed',String(r.id===current.room));b.dataset.confirmed=String(roomConfirmed(r.id));b.append(im,text,small);nav.append(b);}
  const cats=$('[data-room-edit-categories]'),list=$('[data-room-edit-choices]');cats.replaceChildren();list.replaceChildren();
  renderFloorCatalog($('[data-details-floor-catalog]'),current,async id=>{const base=intended.room===current.room?intended:current;if(await choose({...base,floorProduct:id}))$('[data-floor-live]')?.scrollIntoView?.({behavior:'smooth',block:'center'});},{disabled:bulkBusy});
  renderSceneObjectControls($('[data-details-object-controls]'),current,id=>{if(bulkBusy)return;const base=intended.room===current.room?intended:current;choose(id===null?{...base,removed:[]}:toggleSceneObject(base,id));},{disabled:bulkBusy});
  const groups=current.design==='dusk'&&current.mode==='pieces'&&current.layout==='original'&&current.light==='daywarm'?pieceGroups(current.room):[];
  if(!groups.length)groups.push('scheme');if(!groups.includes('floor'))groups.push('floor');
  if(!groups.includes(editCategory))editCategory=groups[0]||'floor';
  $('[data-details-floor-catalog]').hidden=editCategory!=='floor';
  for(const kind of groups){const b=makeButton(PIECE_GROUPS[kind]?.label||'原方案','editCategory',kind,()=>{editCategory=kind;renderDetails();});b.setAttribute('aria-pressed',String(kind===editCategory));cats.append(b);}
  if(editCategory!=='scheme'){
   for(const item of (editCategory==='floor'&&!(current.design==='dusk'&&current.room==='living'&&current.mode==='pieces'&&current.layout==='original'&&current.light==='daywarm')?[]:PIECE_GROUPS[editCategory].items)){const kind=editCategory,next=resolveScene({...current,pieces:changePiece(current.pieces,kind,item.id),...(kind==='floor'?{floorProduct:null}:{}),...(kind==='window'?{window:item.id}:{})}),b=makeButton('','editPiece',item.id,()=>{const base=intended.room===current.room?intended:current;choose({...base,pieces:changePiece(base.pieces,kind,item.id),...(kind==='floor'?{floorProduct:null}:{}),...(kind==='window'?{window:item.id}:{})});});b.dataset.kind=kind;b.setAttribute('aria-pressed',String(current.pieces[editCategory]===item.id&&!(kind==='floor'&&current.floorProduct)));
    const thumb=document.createElement('img'),labels=document.createElement('span'),name=document.createElement('strong'),meta=document.createElement('small');thumb.src=sceneAsset(next,true);thumb.alt='';thumb.width=132;thumb.height=88;thumb.loading='lazy';name.textContent=item.name;meta.textContent=item.finish;labels.append(name,meta);b.append(thumb,labels);const preview=document.createElement('span');preview.className='room-choice-preview';preview.setAttribute('aria-hidden','true');const large=document.createElement('img');large.src=sceneAsset(next);large.alt='';large.loading='lazy';preview.append(large);b.append(preview);list.append(b);
   }
   $('[data-room-edit-scope]').textContent=current.room==='living'?'地面可选原方案饰面或品牌试铺；原方案与品牌选择互斥，客餐厅同步。':'床架、床品和窗景可以独立选择，其他搭配保留。';
  }else if(supportsSceneObjects(current)){
   $('[data-room-edit-scope]').textContent='加回会恢复本套原单品。移除柜体会同时移走其台面摆件，挂墙电视、固定书架和餐桌仍保留。';
  }else if(current.design==='dusk'&&current.room==='balcony'){
   for(const item of layoutsFor(current.design,current.room)){const next={...current,layout:item.id},b=makeButton(item.name+' · '+item.short,'editLayout',item.id,()=>choose(next));b.setAttribute('aria-pressed',String(current.layout===item.id));list.append(b);}$('[data-room-edit-scope]').textContent='先比较现有窗与整面窗景。外窗设想须结合原结构、物业与专业设计核验。';
  }else{
   const card=document.createElement('div');card.className='room-retained-choice';const title=document.createElement('strong'),copy=document.createElement('p');title.textContent='保留这组完整搭配';copy.textContent=home.rooms[current.room].copy;card.append(title,copy);list.append(card);
   $('[data-room-edit-scope]').textContent=['living','master'].includes(current.room)&&current.design==='dusk'?'当前保留你选的排布与光线。如需逐件试配，可返回布局页选择原排布、日光暖灯。':'本空间目前提供这组完整设计，可以在这里查看材料并确认；切换房间不会离开编辑区。';
  }
  $('[data-details-shopping-note]').textContent='购买候选用于看样与询价，独立于当前场景选择，不会自动替换画面。';renderProducts();
 }
 async function syncWholeModel(){
  const result=snapshot();if(!result||step!=='whole'||wholeView!=='model'||historyOpen){modelApi?.setVisible(false);return;}
  if(!modelApi&&!modelPromise){$('[data-current-model-loading]').hidden=false;modelPromise=import('./whole-model.mjs').then(m=>m.createWholeModel({stage:$('[data-current-model-stage]'),canvas:$('[data-current-model-canvas]'),labels:$('[data-current-model-labels]'),status:$('[data-current-model-status]'),onSelect:room=>{wholeRoom=room;renderWhole();}})).then(api=>{modelApi=api;return api;}).catch(error=>{modelPromise=null;$('[data-current-model-loading]').hidden=true;$('[data-current-model-retry]').hidden=false;$('[data-current-model-status]').textContent='三维视图暂未载入，可以重试；右侧写实效果和图片总览仍可使用。';throw error;});}
  try{if(!modelApi)await modelPromise;if(!modelApi||step!=='whole'||wholeView!=='model'||historyOpen)return;
   const latest=snapshot();if(modelSignature!==latest.signature){modelApi.update(latest);modelSignature=latest.signature;}modelApi.setQuality?.(modelQuality);modelApi.select(wholeRoom);modelApi.setVisible(true);$('[data-current-model-loading]').hidden=true;$('[data-current-model-retry]').hidden=true;
  }catch{}
 }
 function renderWhole(){
  if(!confirmed)return;const result=snapshot(),stale=result&&result.signature!==signature();
  $('[data-whole-generate]').disabled=wholeBusy||busy||galleryBusy||!allConfirmed();$('[data-whole-generate]').textContent=wholeBusy?'正在准备全屋…':result?stale?'更新全屋方案':'重新同步当前方案':'查看已确认的全屋';
  $('[data-whole-progress-wrap]').hidden=!wholeBusy;$('[data-whole-result]').hidden=!result;$('[data-whole-empty]').hidden=!!result;
  $('[data-whole-stale]').hidden=!stale;$('[data-whole-export]').disabled=!result||stale||wholeBusy||exportBusy;
  if(!result)return;
  const photoButton=$('[data-model-quality="photo"]');photoButton.hidden=result.design!=='dusk';if(result.design!=='dusk'&&modelQuality==='photo')modelQuality='detailed';for(const b of $$('[data-model-quality]'))b.setAttribute('aria-pressed',String(b.dataset.modelQuality===modelQuality));
  const vr=duskVrMatch(result),vrHost=$('[data-dusk-vr-host]');
  $('[data-whole-view="vr"]').hidden=!vr.available;
  if(wholeView==='vr'&&!vr.available)wholeView='model';
  const vrVisible=vr.available&&wholeView==='vr'&&step==='whole'&&!historyOpen;
  $('[data-dusk-vr-panel]').hidden=!vrVisible;
  $('[data-dusk-vr-selection]').textContent=vr.changed.length?'你已修改 '+vr.changed.join('、')+'。下方仍是暮色基准全景，尚未重绘这些修改；请用“三维整屋 + 写实对照”查看已确认搭配。':'全景依据暮色基准搭配制作。可见细节以原设计图为参照，未展示区域为 AI 补全。';
  if(vrVisible&&!vrHost.children.length){const iframe=document.createElement('iframe');iframe.title='暮色私邸 · 写实全景 VR';iframe.src='/vr/dusk/#'+wholeRoom;iframe.setAttribute('allow','fullscreen; xr-spatial-tracking');iframe.setAttribute('allowfullscreen','');vrHost.append(iframe);}
  if(!vrVisible)vrHost.replaceChildren();
  $('[data-whole-title]').textContent=HOMES[result.design].name+' · '+result.frames.length+' 个空间';$('[data-whole-count]').textContent='8 / 8 个空间已确认 · 选材与三维同步';
  const mosaic=$('[data-whole-mosaic]');mosaic.replaceChildren();const nav=$('[data-whole-rooms]');nav.replaceChildren();
  for(const f of result.frames){
   const b=makeButton('','wholeRoom',f.id,()=>{wholeRoom=f.id;wholeView='room';renderWhole();});b.className='whole-room-card';const im=document.createElement('img');im.src=f.path;im.alt=HOMES[result.design].name+' · '+f.name;im.width=1536;im.height=1024;im.loading='lazy';im.decoding='async';const labels=document.createElement('span'),name=document.createElement('strong'),small=document.createElement('small');name.textContent=f.name;small.textContent=f.id==='dining'&&f.shared?'与客厅共用已选视角':f.changed?'已应用 · '+f.label:'沿用风格原方案';labels.append(name,small);b.append(im,labels);mosaic.append(b);
   const tab=makeButton(f.name,'wholeRoomTab',f.id,()=>{wholeRoom=f.id;wholeView='room';renderWhole();});tab.setAttribute('aria-pressed',String(f.id===wholeRoom));nav.append(tab);
  }
  const active=result.frames.find(f=>f.id===wholeRoom)||result.frames[0];$('[data-whole-room-image]').src=active.path;$('[data-whole-room-image]').alt=active.name+' · '+active.label;$('[data-whole-room-title]').textContent=active.name+' · '+active.label;
  $('[data-whole-room-info]').textContent=active.items.map(x=>x.join('：')).join(' / ');$('[data-whole-room-save]').href=active.path;$('[data-whole-room-save]').download=HOMES[result.design].name+'-'+active.name.replaceAll('/','-')+'.jpg';
  $('[data-current-model-panel]').hidden=wholeView!=='model';$('[data-current-model-accuracy]').hidden=wholeView!=='model';
  $('[data-current-model-photo]').src=active.path;$('[data-current-model-photo]').alt=active.name+' · '+active.label;$('[data-current-model-room-title]').textContent=active.name;$('[data-current-model-room-items]').textContent=active.label;
  const modelRooms=$('[data-current-model-rooms]');modelRooms.replaceChildren();for(const f of result.frames){const b=makeButton(f.name,'modelRoom',f.id,()=>{wholeRoom=f.id;renderWhole();});b.setAttribute('aria-pressed',String(f.id===wholeRoom));modelRooms.append(b);}syncWholeModel();
  $('[data-whole-mosaic]').hidden=wholeView!=='overview';$('[data-whole-room-view]').hidden=wholeView!=='room';for(const b of $$('[data-whole-view]'))b.setAttribute('aria-pressed',String(b.dataset.wholeView===wholeView));
  const applied=$('[data-whole-applied]');applied.replaceChildren();for(const f of result.frames){const section=document.createElement('section'),title=document.createElement('h5'),dl=document.createElement('dl');title.textContent=f.name;renderMaterialList(dl,f.items,{path:f.path,room:f.id});section.append(title,dl);applied.append(section);}
  if(!applied.children.length){const p=document.createElement('p');p.textContent='沿用本套风格原搭配。';applied.append(p);}
  const candidates=$('[data-whole-candidates]');candidates.replaceChildren();for(const item of result.products){const a=document.createElement('a');a.href=item.url;a.target='_blank';a.rel='noopener noreferrer';a.textContent=item.brand+' · '+item.product+' ↗';candidates.append(a);}
  if(!result.products.length)candidates.textContent='暂未加入购买候选。你可以回到第三步挑选试坐、看样的产品。';
 }
 async function buildWhole(){
  if(!confirmed||wholeBusy||!allConfirmed())return;const design=confirmed,sig=signature(),id=++wholeJob,list=clone(frames()),products=[...PURCHASES.filter(p=>currentShortlist().has(p.id)),...FLOOR_CATALOG.filter(p=>list.some(f=>f.scene.floorProduct===p.id))];wholeBusy=true;let count=0;renderWhole();$('[data-whole-progress]').value=0;$('[data-whole-progress]').max=list.length;$('[data-whole-progress-text]').textContent='正在读取原尺寸效果图 0 / '+list.length;$('[data-whole-status]').textContent='';
  try{await Promise.all(list.map(async f=>{await imageReady(f.path);if(id!==wholeJob)return;count++;$('[data-whole-progress]').value=count;$('[data-whole-progress-text]').textContent='已读取 '+count+' / '+list.length+' 个空间';}));
   if(id!==wholeJob||design!==confirmed||sig!==signature())return;
   snapshots.set(design,{design,signature:sig,frames:list,products:clone(products),createdAt:new Date().toISOString()});wholeView='model';$('[data-whole-status]').textContent='已同步八个空间。品牌地面在三维中展示样板纹理试铺；右侧效果图沿用原设计，官网样板和产品链接已加入清单。';
  }catch(error){if(id===wholeJob)$('[data-whole-status]').textContent='有图片未载入，上一份完整效果已保留。请重试。';}
  finally{if(id===wholeJob){wholeBusy=false;renderWhole();}}
 }
 function render(){syncNavigation();syncFloorLive(current,confirmed?frames():[],step==='details'&&!historyOpen);if(confirmed){renderLayoutControls();renderDetails();renderWhole();}}
 function commit(next){current=resolveScene(next);intended=clone(current);saved.set(current.design+':'+current.room,clone(current));gallery.syncFloor?.(current.design,current.room,current.floorProduct);if(['living','dining'].includes(current.room)){const pair=current.room==='living'?'dining':'living',prior=saved.get(current.design+':'+pair)||{design:current.design,room:pair};saved.set(current.design+':'+pair,resolveScene({...prior,floorProduct:current.floorProduct}));gallery.syncFloor?.(current.design,pair,current.floorProduct);}if(supportsSceneObjects(current)){const other=current.room==='living'?'dining':'living',prior=saved.get(current.design+':'+other)||{design:current.design,room:other};saved.set(current.design+':'+other,resolveScene({...prior,removed:current.removed}));gallery.syncRemovals?.(current.design,current.removed);}}
 async function choose(value,{confirm=false,nextStep=null}={}){
  if(bulkBusy)return false;
  const next=resolveScene(value);if(!sceneAvailable(next)){$('[data-layout-status]').textContent=sceneNote(next);return false;}
  const id=++job;pieceJob++;intended=clone(next);busy=true;syncNavigation();$('[data-layout-status]').textContent='';$('[data-details-status]').textContent=step==='details'?'正在载入所选空间…':'';
  try{await imageReady(sceneAsset(next));if(id!==job)return false;commit(next);if(confirm){confirmed=next.design;if(!seeds.has(next.design))seeds.set(next.design,clone(next));}if(nextStep)step=nextStep;detailsView='summary';$('[data-details-status]').textContent='';render();return true;}
  catch(error){if(id!==job)return false;intended=clone(current);const output=step==='style'?$('[data-journey-confirm-status]'):step==='details'?$('[data-details-status]'):$('[data-layout-status]');output.textContent=error.message;output.append(' ',makeButton('重新载入','layoutRetry','',()=>choose(next,{confirm,nextStep})));return false;}
  finally{if(id===job){busy=false;syncNavigation();}}
 }
 function chooseRoom(room){const design=confirmed||current.design;return choose(saved.get(design+':'+room)||{...seeds.get(design),design,room,floorProduct:null,layout:'original',light:'daywarm',window:'original'});}
 gallery.setRoomHandler?.(()=>false);
 function goStep(next){
  if(bulkBusy)return;
  if(next!=='style'&&(!confirmed||busy||galleryBusy||next==='whole'&&!allConfirmed()))return;if(next==='style'&&busy){job++;busy=false;intended=clone(current);}pieceJob++;step=next;detailsView='summary';inEditor=false;root.dataset.surface='home';$('[data-editor-panel]').hidden=true;$('[data-details-status]').textContent='';
  if(next!=='whole'){wholeJob++;wholeBusy=false;modelApi?.setVisible(false);}
  render();
 }
 for(const b of $$('[data-journey-step]'))b.addEventListener('click',()=>{goStep(b.dataset.journeyStep);if(step==='whole'&&(!snapshot()||snapshot().signature!==signature()))buildWhole();});$('[data-journey-change]').addEventListener('click',()=>goStep('style'));
 $('[data-confirm-style]').addEventListener('click',()=>{if(busy||galleryBusy)return;const view=gallery.getState();$('[data-journey-confirm-status]').textContent='';choose(sceneFromGallery(view),{confirm:true,nextStep:'layout'});});
 $('[data-layout-next]').addEventListener('click',()=>goStep('details'));$('[data-details-next]').addEventListener('click',()=>{goStep('whole');if(step==='whole')buildWhole();});$('[data-whole-back]').addEventListener('click',()=>goStep('details'));$('[data-details-back]').addEventListener('click',()=>goStep('layout'));$('[data-layout-go-lights]').addEventListener('click',()=>chooseRoom('living'));
 $('[data-confirm-room]').addEventListener('click',()=>{if(busy||bulkBusy||!confirmed)return;confirmations.set(confirmed+':'+current.room,roomSignature(current.room));$('[data-details-status]').textContent=roomName(current.room)+'已确认。'+(allConfirmed()?'所有空间已选好，可以查看全屋效果。':'可以继续查看其他房间。');render();});
 $('[data-confirm-all]').addEventListener('click',async()=>{
  if(busy||bulkBusy||!confirmed)return;const design=confirmed,sig=signature(),list=clone(frames()),id=++bulkJob;bulkBusy=true;let count=0;syncNavigation();
  const output=$('[data-details-status]');output.textContent='正在核对八个空间的当前方案…';
  try{await Promise.all(list.map(async f=>{await imageReady(f.path);if(id===bulkJob&&bulkBusy)output.textContent='已核对 '+(++count)+' / '+list.length+' 个空间';}));
   if(id!==bulkJob||design!==confirmed||sig!==signature()){output.textContent='方案已更新，请重新确认全屋。';return;}
   for(const f of list)confirmations.set(design+':'+f.id,JSON.stringify(f));
   output.textContent='八个空间全部确认。已保留你调整的搭配，其余沿用本套方案；可以继续修改，或查看全屋效果。';
  }catch{if(id===bulkJob)output.textContent='有空间图片未载入，本次批量确认未生效。原有选择和确认记录已保留，请重试。';}
  finally{if(id===bulkJob){bulkBusy=false;render();}}
 });
 $('[data-next-unconfirmed]').addEventListener('click',()=>{if(busy||bulkBusy)return;const index=ROOMS.findIndex(r=>r.id===current.room),ordered=[...ROOMS.slice(index+1),...ROOMS.slice(0,index+1)],next=ordered.find(r=>!roomConfirmed(r.id));if(next)chooseRoom(next.id);});
 $('[data-details-product-scope]').addEventListener('click',()=>{allProducts=!allProducts;onlySelected=false;renderProducts();});$('[data-shortlist-only]').addEventListener('click',()=>{onlySelected=!onlySelected;renderProducts();});
 document.addEventListener('tingjian:home-view',event=>{if(step==='details'&&detailsView==='pieces'&&!inEditor&&event.detail.design===confirmed){commit(sceneFromGallery(event.detail));renderDetails();renderWhole();}syncNavigation();});
 document.addEventListener('tingjian:home-loading',event=>{galleryBusy=!!event.detail;syncNavigation();});
 document.addEventListener('tingjian:editor-open',()=>{inEditor=true;job++;pieceJob++;wholeJob++;wholeBusy=false;busy=false;galleryBusy=false;intended=clone(current);syncNavigation();});
 document.addEventListener('tingjian:home-open',()=>{if(inEditor&&!historyOpen){inEditor=false;step='style';detailsView='summary';syncNavigation();}});
 const dialog=$('[data-journey-dialog]');
 function large(path=frames().find(f=>f.id===current.room)?.path||sceneAsset(current),title=HOMES[current.design].name+' · '+sceneLabel(current)+' · '+lightName(current.light)){$('[data-journey-dialog-image]').src=path;$('[data-journey-dialog-image]').alt=title;$('[data-journey-dialog-title]').textContent=title;$('[data-journey-dialog-view]').classList.remove('is-native');$('[data-journey-native]').setAttribute('aria-pressed','false');if(typeof dialog.showModal==='function')openImageDialog(dialog,window,{fullscreen:true});}
 $('[data-layout-large]').addEventListener('click',()=>large());$('[data-details-large]').addEventListener('click',()=>large());$('[data-journey-close]').addEventListener('click',()=>dialog.close());dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close();});$('[data-journey-native]').addEventListener('click',()=>{const on=$('[data-journey-dialog-view]').classList.toggle('is-native');$('[data-journey-native]').setAttribute('aria-pressed',String(on));});
 $('[data-whole-generate]').addEventListener('click',buildWhole);for(const b of $$('[data-whole-view]'))b.addEventListener('click',()=>{wholeView=b.dataset.wholeView;renderWhole();});
 $('[data-whole-room-large]').addEventListener('click',()=>{const f=snapshot()?.frames.find(f=>f.id===wholeRoom);if(f)large(f.path,HOMES[confirmed].name+' · '+f.name);});
 $('[data-whole-export]').addEventListener('click',async()=>{const result=snapshot();if(!result||result.signature!==signature()||exportBusy)return;exportBusy=true;renderWhole();$('[data-whole-status]').textContent='正在将原尺寸图片打包到效果册…';try{await exportEffectBook(clone(result),HOMES[confirmed].name);$('[data-whole-status]').textContent='效果册已下载，包含图片、实际搭配和单独列出的购买候选。';}catch(error){$('[data-whole-status]').textContent='效果册未下载成功，请重试；页面内的效果仍保留。';}finally{exportBusy=false;renderWhole();}});
 $('[data-current-model-room-large]').addEventListener('click',()=>{const f=snapshot()?.frames.find(f=>f.id===wholeRoom);if(f)large(f.path,HOMES[confirmed].name+' · '+f.name);});
 $('[data-current-model-home]').addEventListener('click',()=>modelApi?.view('all'));$('[data-current-model-top]').addEventListener('click',()=>modelApi?.view('top'));$('[data-current-model-focus]').addEventListener('click',()=>modelApi?.view(wholeRoom));$('[data-current-model-retry]').addEventListener('click',syncWholeModel);
 for(const b of $$('[data-model-quality]'))b.addEventListener('click',()=>{modelQuality=b.dataset.modelQuality;for(const button of $$('[data-model-quality]'))button.setAttribute('aria-pressed',String(button.dataset.modelQuality===modelQuality));modelApi?.setQuality?.(modelQuality);});
 $('[data-current-model-edit]').addEventListener('click',()=>{goStep('details');chooseRoom(wholeRoom);});
 document.addEventListener('tingjian:history',e=>{historyOpen=!!e.detail;if(historyOpen){job++;busy=false;wholeJob++;wholeBusy=false;bulkJob++;bulkBusy=false;pieceJob++;inEditor=false;}else{inEditor=false;root.dataset.surface='home';$('[data-editor-panel]').hidden=true;}render();});
 render();return {getState:()=>({step,confirmed,current:clone(current),busy,bulkBusy,modelQuality,detailsView,wholeBusy,whole:snapshot()?clone(snapshot()):null,confirmedRooms:ROOMS.filter(r=>confirmed&&roomConfirmed(r.id)).map(r=>r.id),historyOpen,stale:!!snapshot()&&snapshot().signature!==signature()})};
}
