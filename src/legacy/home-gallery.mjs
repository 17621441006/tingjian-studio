import {renderFloorCatalog,normalizeFloorProduct,floorMaterialItems} from './floor-catalog.mjs';
import {renderMaterialList} from './material-previews.mjs';
import {supportsSceneObjects,normalizeRemoved,toggleSceneObject,objectSceneAsset,objectSceneLabel,objectSceneMaterials,renderSceneObjectControls} from './scene-objects.mjs';
import {openImageDialog} from './dialog-view.mjs';
import {HOMES,ROOMS} from './home-designs.mjs';
import {variantsFor,resolveVariantState,variantAsset,homePresentation,VARIANT_ROOMS} from './home-variants.mjs';
import {PIECE_GROUPS,PIECE_ROOMS,defaultPieces,normalizePieces,changePiece,pieceItem,pieceGroups,isPieceView,pieceAsset,piecePresentation,pieceAvailable,pieceAvailabilityNote} from './home-pieces.mjs';
import PURCHASES from './purchase-data.json';

export function initHomeGallery(root){
 const $=s=>root.querySelector(s),$$=s=>[...root.querySelectorAll(s)];
 const panel=$('[data-home-panel]'),stage=$('[data-home-stage]'),picture=$('[data-home-image]');
 let displayed={...resolveVariantState(),mode:'pieces'},pieces=defaultPieces(),requestId=0,allProducts=false,category='sofa';
 let intended={view:{...displayed},pieces:{...pieces}},roomHandler=null;
 const choices=Object.fromEntries(Object.keys(HOMES).map(id=>[id,'original'])),modes={dusk:'pieces'};
 const removedByDesign={copper:[]},floorBySpace={};
 const floorSelection=()=>floorBySpace[displayed.design+':'+displayed.room]||null;
 const loaded=new Set(),pending=new Map();
 const assetFor=(view,selection=pieces,thumb=false)=>objectSceneAsset(view,thumb)||(isPieceView(view)?pieceAsset(view.room,selection,thumb):variantAsset(view.design,view.room,view.variant,thumb));
 function getImage(path){
  if(loaded.has(path))return Promise.resolve();
  if(pending.has(path))return pending.get(path);
  const promise=new Promise((resolve,reject)=>{const im=new Image();im.decoding='async';im.onload=()=>{loaded.add(path);resolve();};im.onerror=()=>reject(new Error('图片暂未载入，请重试'));im.src=path;});
  pending.set(path,promise);promise.finally(()=>pending.delete(path)).catch(()=>{});return promise;
 }
 function showSurface(){
  document.dispatchEvent(new CustomEvent('tingjian:home-open'));
  root.dataset.surface='home';panel.hidden=false;$('[data-editor-panel]').hidden=true;
  for(const b of $$('[data-design]'))b.setAttribute('aria-pressed','false');
 }
 function renderRooms(){
  const list=$('[data-home-rooms]');list.replaceChildren();
  for(const [i,room]of ROOMS.entries()){
   const b=document.createElement('button');b.type='button';b.dataset.homeRoom=room.id;b.setAttribute('aria-pressed',String(displayed.room===room.id));
   const img=document.createElement('img');img.src=assetFor({...displayed,room:room.id},pieces,true);img.alt='';img.width=90;img.height=60;img.loading='lazy';img.decoding='async';
   const text=document.createElement('span'),name=document.createElement('strong'),number=document.createElement('small');name.textContent=room.name;
   number.textContent=String(i+1).padStart(2,'0')+(supportsSceneObjects({...displayed,room:room.id})?' · 可增减单品':displayed.design==='dusk'&&PIECE_ROOMS.includes(room.id)?' · 单品选配':variantsFor(displayed.design).length&&VARIANT_ROOMS.includes(room.id)?' · 搭配对照':'');
   text.append(number,name);b.append(img,text);b.addEventListener('click',()=>{if(roomHandler?.(displayed.design,room.id))return;select(displayed.design,room.id,displayed.variant,displayed.mode);});list.append(b);
  }
 }
 function renderVariants(){
  const options=variantsFor(displayed.design),list=$('[data-home-variants]');list.replaceChildren();
  $('[data-home-variant-picker]').hidden=!options.length||isPieceView(displayed);
  const previewRoom=VARIANT_ROOMS.includes(displayed.room)?displayed.room:'living';
  for(const [index,option] of [{id:'original',name:'原搭配',summary:'保留原方案，随时对照'},...options].entries()){
   const button=document.createElement('button');button.type='button';button.dataset.homeVariant=option.id;button.setAttribute('aria-pressed',String(option.id===displayed.variant));
   const img=document.createElement('img');img.src=variantAsset(displayed.design,previewRoom,option.id,true);img.alt='';img.width=90;img.height=60;img.decoding='async';img.loading='lazy';
   const labels=document.createElement('span'),name=document.createElement('strong'),sub=document.createElement('small');name.textContent=(index?String(index).padStart(2,'0')+' / ':'')+option.name;sub.textContent=option.summary;labels.append(name,sub);button.append(img,labels);
   button.addEventListener('click',()=>select(displayed.design,displayed.room,option.id,'palette'));list.append(button);
  }
  const p=homePresentation(displayed),status=$('[data-home-variant-status]');status.replaceChildren();
  if(options.length&&!VARIANT_ROOMS.includes(displayed.room)){
   status.append('当前空间沿用原搭配。搭配对照位于：');
   for(const id of VARIANT_ROOMS){const b=document.createElement('button');b.type='button';b.dataset.variantRoom=id;b.textContent=ROOMS.find(r=>r.id===id).name;b.addEventListener('click',()=>select(displayed.design,id,displayed.variant,'palette'));status.append(b);}
  }else status.textContent=p.applied?p.variant.name+' · 家具、地面与织物整体成图，可点「原搭配」对照。':'原搭配 · 同一房间的整体软装与材质对照。';
  const shopping=$('[data-home-variant-shopping]');shopping.hidden=!isPieceView(displayed)&&!p.variant&&!p.home.purchaseKey;
  shopping.textContent=isPieceView(displayed)?'当前单品为原创设计概念款。下方品牌是材质与造型的选购参考，并非画面中的精确商品。':p.variant?'当前选择「'+p.variant.name+'」。下方为品牌选购参考，款型、颜色需按这组搭配另行选样。':p.home.purchaseKey?'这一套沿用相近材质的品牌候选；不是酒店同款或效果图中精确的商品。':'';
 }
 function renderPieces(){
  const on=isPieceView(displayed),groups=pieceGroups(displayed.room);
  $('[data-home-piece-panel]').hidden=!on;$('[data-home-layout]').dataset.pieces=String(on);
  $('[data-home-modebar]').hidden=displayed.design!=='dusk'||!PIECE_ROOMS.includes(displayed.room);
  for(const b of $$('[data-home-mode]'))b.setAttribute('aria-pressed',String(b.dataset.homeMode===displayed.mode));
  $('[data-home-mode-note]').textContent=on?'固定视角 · 按已完成的组合选配，保留相机与真实材质细节':'原搭配与此前整套配色保留在这里';
  const tabs=$('[data-home-piece-tabs]'),catalog=$('[data-home-piece-catalog]'),pins=$('[data-home-piece-pins]');tabs.replaceChildren();catalog.replaceChildren();pins.replaceChildren();
  if(!on)return;
  if(!groups.includes(category))category=groups[0];
  for(const kind of groups){
   const b=document.createElement('button');b.type='button';b.dataset.pieceCategory=kind;b.textContent=PIECE_GROUPS[kind].label;b.setAttribute('aria-pressed',String(category===kind));b.addEventListener('click',()=>{category=kind;renderPieces();});tabs.append(b);
   const pin=document.createElement('button');pin.type='button';pin.dataset.piecePin=kind;pin.className='home-piece-pin';pin.textContent='换'+PIECE_GROUPS[kind].label;pin.setAttribute('aria-label','在旁边选择'+PIECE_GROUPS[kind].label);pin.setAttribute('aria-pressed',String(category===kind));pin.addEventListener('click',()=>{category=kind;renderPieces();$('[data-home-piece-tabs]').querySelector(`[data-piece-category="${kind}"]`)?.focus();});pins.append(pin);
  }
  for(const item of PIECE_GROUPS[category].items){
   const b=document.createElement('button');b.type='button';b.className='home-piece-card';b.dataset.homePiece=item.id;b.dataset.pieceKind=category;b.setAttribute('aria-pressed',String(pieces[category]===item.id));b.setAttribute('aria-label',PIECE_GROUPS[category].label+'：'+item.name+'，'+item.finish);
   const previewSelection=changePiece(pieces,category,item.id),available=pieceAvailable(displayed.room,previewSelection),src=pieceAsset(displayed.room,available?previewSelection:{...previewSelection,table:'glass',floor:category==='floor'?previewSelection.floor:'stone',sofa:category==='floor'?'cognac':previewSelection.sofa},true);b.disabled=!available;b.title=available?item.note:pieceAvailabilityNote(displayed.room,previewSelection);
   const crop=document.createElement('span');crop.className='home-piece-crop';crop.dataset.crop=category;
   const im=document.createElement('img');im.src=src;im.alt='';im.width=360;im.height=240;im.loading='lazy';im.decoding='async';crop.append(im);
   const labels=document.createElement('span'),name=document.createElement('strong'),finish=document.createElement('small');name.textContent=item.name;finish.textContent=available?item.finish:'当前组合尚未成图';labels.append(name,finish);
   const peek=document.createElement('span');peek.className='home-piece-peek';peek.setAttribute('aria-hidden','true');const big=document.createElement('img');big.src=src;big.alt='';big.loading='lazy';const caption=document.createElement('span');caption.textContent=item.name+' · 场景预览';peek.append(big,caption);
   b.append(crop,labels,peek);b.addEventListener('click',()=>select(displayed.design,displayed.room,displayed.variant,'pieces',changePiece(intended.pieces,category,item.id)));catalog.append(b);
  }
  $('[data-home-piece-summary]').textContent=piecePresentation(displayed.room,pieces).label;
 }
 function renderInspiration(){
  const info=HOMES[displayed.design].inspiration,section=$('[data-home-inspiration]');section.hidden=!info;if(!info)return;
  $('[data-home-inspiration-title]').textContent=info.title;$('[data-home-inspiration-copy]').textContent=info.copy;
  const links=$('[data-home-inspiration-links]');links.replaceChildren();for(const link of info.links){const a=document.createElement('a');a.href=link.url;a.target='_blank';a.rel='noopener noreferrer';a.textContent=link.label+' ↗';links.append(a);}
 }
 function renderProducts(){
  const home=HOMES[displayed.design],room=home.rooms[displayed.room],list=$('[data-home-products]');list.replaceChildren();
  const candidates=PURCHASES.filter(x=>x.schemes.includes(home.purchaseKey||displayed.design)&&(allProducts||room.purchase.includes(x.category)));
  for(const item of candidates){
   const card=document.createElement('article');card.className='home-product';
   const top=document.createElement('span');top.className='home-product-brand';top.textContent=item.brand;
   const title=document.createElement('h4');title.textContent=item.product;
   const p=document.createElement('p');p.textContent=item.whyMatched;
   const material=document.createElement('small');material.textContent=item.materials?.length?'材质：'+item.materials.join('；'):'材质与饰面请向品牌确认';
   const size=document.createElement('small');size.textContent=typeof item.dimensions==='string'?item.dimensions:item.dimensions?item.dimensions.label+'：'+item.dimensions.text:'尺寸与饰面请在产品页核对';
   const note=document.createElement('small');note.textContent=item.purchaseNote||'';
   const a=document.createElement('a');a.href=item.url;a.target='_blank';a.rel='noopener noreferrer';a.textContent=(item.linkType||'产品官网')+' ↗';
   const links=document.createElement('div');links.className='home-product-links';links.append(a);for(const link of item.secondaryLinks||[]){const more=document.createElement('a');more.href=link.url;more.target='_blank';more.rel='noopener noreferrer';more.textContent=link.label+' ↗';links.append(more);}
   card.append(top,title,p,material,size,note,links);list.append(card);
  }
  $('[data-home-all-products]').setAttribute('aria-pressed',String(allProducts));$('[data-home-all-products]').textContent=allProducts?'仅看当前空间':'查看这套全屋清单';
 }
 function paint(){
  const p=homePresentation(displayed),{home,room,variant,applied}=p,individual=isPieceView(displayed),content=individual?piecePresentation(displayed.room,pieces):p.content;
  const label=supportsSceneObjects(displayed)?objectSceneLabel(displayed):individual?content.label:applied?variant.name:variant?'本空间沿用原搭配':'原搭配',path=assetFor(displayed);
  picture.src=path;picture.alt=`${home.name} · ${room.name} · ${label}整体概念效果图`;
  stage.dataset.design=displayed.design;stage.dataset.room=displayed.room;stage.dataset.variant=displayed.variant;stage.dataset.mode=displayed.mode;
  stage.dataset.sofa=pieces.sofa;stage.dataset.table=pieces.table;stage.dataset.bed=pieces.bed;
  $('[data-home-title]').textContent=home.name+' · '+room.name;$('[data-home-subtitle]').textContent=home.subtitle;
  $('[data-home-variant-label]').textContent=label;
  $('[data-home-count]').textContent=String(ROOMS.indexOf(room)+1).padStart(2,'0')+' / 08';$('[data-home-area]').textContent=room.area;
  $('[data-home-story-title]').textContent=content.title;$('[data-home-story]').textContent=content.copy;
  $('[data-design-copy]').textContent=home.description;
  renderMaterialList($('[data-home-materials]'),floorMaterialItems({...displayed,floorProduct:floorSelection()},objectSceneMaterials(displayed,content.materials)),{path,room:displayed.room});
  renderSceneObjectControls($('[data-home-object-controls]'),displayed,id=>{const base=intended.view.design===displayed.design?intended.view:displayed,next=id===null?{...base,removed:[]}:toggleSceneObject(base,id);select(displayed.design,displayed.room,displayed.variant,displayed.mode,intended.pieces,next.removed);});
  for(const b of $$('[data-home-design]'))b.setAttribute('aria-pressed',String(b.dataset.homeDesign===displayed.design));
  for(const b of $$('[data-design]'))b.setAttribute('aria-pressed','false');
  $('[data-home-large]').href=path;$('[data-home-save]').href=path;$('[data-home-save]').download=home.name+'-'+room.name.replace(' / ','-')+'-'+label+'.jpg';
  renderRooms();renderVariants();renderPieces();renderInspiration();renderProducts();
  renderFloorCatalog($('[data-home-floor-catalog]'),{...displayed,floorProduct:floorSelection()},id=>{floorBySpace[displayed.design+':'+displayed.room]=normalizeFloorProduct(id);if(['living','dining'].includes(displayed.room))floorBySpace[displayed.design+':'+(displayed.room==='living'?'dining':'living')]=normalizeFloorProduct(id);paint();});
  document.dispatchEvent(new CustomEvent('tingjian:home-view',{detail:{...displayed,floorProduct:floorSelection(),pieces:{...pieces},path,thumb:assetFor(displayed,pieces,true)}}));
 }
 async function select(design,room,variant=choices[design]||'original',mode=modes[design]||'palette',selection=intended.pieces,removed=removedByDesign[design]||[]){
  const next={...resolveVariantState(design,room,variant),mode:design==='dusk'&&mode==='pieces'?'pieces':'palette',removed:normalizeRemoved(removed)},snapshot=normalizePieces(selection),id=++requestId;
  if(isPieceView(next)&&!pieceAvailable(next.room,snapshot)){$('[data-home-load-status]').textContent=pieceAvailabilityNote(next.room,snapshot);return false;}
  intended={view:next,pieces:snapshot};showSurface();
  $('[data-home-loading]').hidden=false;stage.setAttribute('aria-busy','true');$('[data-home-load-status]').textContent='';
  document.dispatchEvent(new CustomEvent('tingjian:home-loading',{detail:true}));
  try{
   await getImage(assetFor(next,snapshot));if(id!==requestId||root.dataset.surface!=='home')return false;
   displayed=next;pieces=snapshot;choices[next.design]=next.variant;modes[next.design]=next.mode;removedByDesign[next.design]=normalizeRemoved(next.removed);paint();return true;
  }catch(error){
   if(id!==requestId||root.dataset.surface!=='home')return false;
   intended={view:{...displayed},pieces:{...pieces}};
   const status=$('[data-home-load-status]');status.textContent=error.message+'。保留当前画面。';const retry=document.createElement('button');retry.type='button';retry.textContent='重新载入';retry.addEventListener('click',()=>select(next.design,next.room,next.variant,next.mode,snapshot,next.removed));status.append(' ',retry);
   return false;
  }finally{if(id===requestId){$('[data-home-loading]').hidden=true;stage.setAttribute('aria-busy','false');document.dispatchEvent(new CustomEvent('tingjian:home-loading',{detail:false}));}}
 }
 for(const b of $$('[data-home-design]'))b.addEventListener('click',()=>select(b.dataset.homeDesign,displayed.room));
 for(const b of $$('[data-home-mode]'))b.addEventListener('click',()=>select(displayed.design,displayed.room,displayed.variant,b.dataset.homeMode));
 $('[data-open-home-rooms]').addEventListener('click',()=>select(displayed.design,displayed.room,displayed.variant,displayed.mode));
 $('[data-home-all-products]').addEventListener('click',()=>{allProducts=!allProducts;renderProducts();});
 document.addEventListener('tingjian:editor-open',()=>{requestId++;intended={view:{...displayed},pieces:{...pieces}};panel.hidden=true;$('[data-home-loading]').hidden=true;stage.setAttribute('aria-busy','false');for(const b of $$('[data-home-design]'))b.setAttribute('aria-pressed','false');});
 const dialog=$('[data-home-dialog]');
 $('[data-home-large]').addEventListener('click',event=>{
  if(typeof dialog.showModal!=='function')return;
  event.preventDefault();$('[data-home-dialog-image]').src=assetFor(displayed);$('[data-home-dialog-image]').alt=picture.alt;$('[data-home-dialog-title]').textContent=$('[data-home-title]').textContent+' · '+$('[data-home-variant-label]').textContent;
  $('[data-home-dialog-view]').classList.remove('is-native');$('[data-home-native]').setAttribute('aria-pressed','false');openImageDialog(dialog,window,{fullscreen:true});
 });
 $('[data-home-close]').addEventListener('click',()=>dialog.close());
 $('[data-home-native]').addEventListener('click',()=>{const on=$('[data-home-dialog-view]').classList.toggle('is-native');$('[data-home-native]').setAttribute('aria-pressed',String(on));});
 dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close();});
 showSurface();paint();
 picture.addEventListener('error',()=>{$('[data-home-load-status]').textContent='图片暂未载入，请点选右侧房间重试。';});
 return {syncFloor(design,room,id){floorBySpace[design+':'+room]=normalizeFloorProduct(id);if(displayed.design===design&&displayed.room===room)paint();},setRoomHandler:fn=>{roomHandler=fn;},syncRemovals(design,removed){removedByDesign[design]=normalizeRemoved(removed);if(displayed.design===design){displayed={...displayed,removed:normalizeRemoved(removed)};intended={view:{...displayed},pieces:{...pieces}};paint();}},open:()=>select(displayed.design,displayed.room,displayed.variant,displayed.mode),openView:select,getState:()=>({...displayed,floorProduct:floorSelection(),pieces:{...pieces},path:assetFor(displayed),thumb:assetFor(displayed,pieces,true)})};
}
