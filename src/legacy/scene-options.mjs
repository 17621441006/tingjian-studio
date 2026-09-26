import {floorMaterialItems,normalizeFloorProduct,floorAllowed,floorProduct} from './floor-catalog.mjs';
import {HOMES,ROOMS} from './home-designs.mjs';
import {variantAsset,resolveVariantState,homePresentation} from './home-variants.mjs';
import {resolveLayoutState,layoutAsset,layoutInfo} from './layout-options.mjs';
import {normalizePieces,pieceAsset,pieceAvailable,pieceGroups,pieceItem,piecePresentation} from './home-pieces.mjs';
import {supportsSceneObjects,normalizeRemoved,objectSceneAsset,objectSceneLabel,objectSceneMaterials} from './scene-objects.mjs';
export function resolveScene(s={}){
 const design=HOMES[s.design]?s.design:'dusk',room=ROOMS.some(r=>r.id===s.room)?s.room:'living',base=resolveLayoutState({...s,design,room});
 const pieces=normalizePieces(s.pieces),window=design==='dusk'&&s.mode!=='palette'&&room==='master'&&(s.window??pieces.window)==='clear'?'clear':'original';pieces.window=window;
 return {...base,room,floorProduct:floorAllowed(room,floorProduct(s.floorProduct))?normalizeFloorProduct(s.floorProduct):null,mode:design==='dusk'&&s.mode!=='palette'?'pieces':'palette',variant:resolveVariantState(design,room,s.variant).variant,pieces,window,removed:supportsSceneObjects({design,room})?normalizeRemoved(s.removed):[]};
}
export function sceneAvailable(value){
 const s=resolveScene(value);if(s.design!=='dusk'||!['living','master','balcony'].includes(s.room))return true;
 if(s.mode==='palette')return s.layout==='original'&&s.light==='daywarm'&&s.window==='original';
 if(s.room==='balcony')return true;
 if(s.room==='living')return s.layout==='original'&&s.light==='daywarm'?pieceAvailable('living',s.pieces):['cognac','wine'].includes(s.pieces.sofa)&&s.pieces.table==='glass'&&s.pieces.floor==='stone';
 if(s.window==='clear')return s.layout==='original'||s.layout==='storage'&&s.pieces.bed==='linen'&&s.pieces.bedding==='taupe';
 return s.layout==='original'||s.pieces.bed==='linen'&&s.pieces.bedding==='taupe';
}
export function sceneAsset(value,thumb=false){
 const s=resolveScene(value);if(!sceneAvailable(s))return null;
 const objectPath=objectSceneAsset(s,thumb);if(objectPath)return objectPath;
 if(s.design!=='dusk'||s.mode==='palette'||!['living','master','balcony'].includes(s.room))return variantAsset(s.design,s.room,s.variant,thumb);
 if(s.room==='master'&&s.window==='clear'&&s.layout==='original')return pieceAsset('master',s.pieces,thumb);
 if(s.room==='master'&&s.window==='clear')return `/tour/home-assets/dusk/windows/master${s.layout==='storage'?'-storage':''}-clear${thumb?'-thumb':''}.jpg`;
 if(s.layout==='original'&&s.light==='daywarm'&&['living','master'].includes(s.room))return pieceAsset(s.room,s.pieces,thumb);
 return layoutAsset({...s,sofa:s.pieces.sofa},thumb);
}
export function sceneNote(value){
 const s=resolveScene(value);if(supportsSceneObjects(s))return '第三步可分别移除或加回墙面装饰、沙发、地毯、柜体，两个客餐厅视角同步保留。';if(s.mode==='palette')return '正在保留这组整体搭配。若想独立换单品，请在第三步选择原布局的单品搭配。';
 if(s.room==='living')return '换排布和五种光线目前支持干邑／酒红＋烟玻璃＋石地面。其他单品组合保留原布局、日光暖灯；未完成的组合不会替换你的选择。';
 if(s.room==='master')return '床柜换位和窗边双用目前配亚麻低床＋原床品。原床位可独立搭配三种床架、三组床品与整面窗景。';
 return '未完成的组合暂不可选，已选效果会保留。';
}
function originalSceneItems(value){
 const s=resolveScene(value);
 if(supportsSceneObjects(s))return objectSceneMaterials(s,[]);
 if(s.mode==='palette')return homePresentation(s).content.materials;
 if(s.design==='dusk'&&s.mode==='pieces'&&s.layout==='original'&&['living','master'].includes(s.room))return [...pieceGroups(s.room).map(k=>[k==='bedding'?'床品':k==='floor'?'地面':k==='sofa'?'沙发':k==='table'?'茶几':k==='window'?'窗景':'床架',pieceItem(k,s.pieces[k]).name])];
 if(['living','master','balcony'].includes(s.room)){const entries=layoutInfo(s).items.map(x=>[...x]);if(s.design==='dusk'&&s.room==='living'&&s.mode==='pieces')entries[0]=[s.layout==='storage'?'坐榻软垫':'沙发',pieceItem('sofa',s.pieces.sofa).name+(s.layout==='storage'?' · 木作抽屉底座':'')];return entries;}
 return HOMES[s.design].rooms[s.room].materials;
}
export function sceneItems(value){const s=resolveScene(value);return floorMaterialItems(s,originalSceneItems(s));}
function baseSceneLabel(value){const s=resolveScene(value);if(supportsSceneObjects(s))return objectSceneLabel(s);if(s.mode==='palette'){const p=homePresentation(s);return p.applied?p.variant.name:'原搭配';}if(s.design==='dusk'&&s.mode==='pieces'&&s.layout==='original'&&['living','master'].includes(s.room))return piecePresentation(s.room,s.pieces).label;return ['living','master','balcony'].includes(s.room)?layoutInfo(s).name:'沿用风格原方案';}
export function sceneFromGallery(view){return resolveScene({...view,layout:'original',light:'daywarm',window:view.pieces?.window||'original'});}
export function assembleHome(design,saved,seed={}){
 const list=ROOMS.map(r=>{const scene=resolveScene(saved.get(design+':'+r.id)||{...seed,design,room:r.id,floorProduct:null,layout:'original',light:'daywarm',window:'original'});return {id:r.id,name:r.name,area:r.area,scene,path:sceneAsset(scene),thumb:sceneAsset(scene,true),label:sceneLabel(scene),items:sceneItems(scene),changed:saved.has(design+':'+r.id)};});
 const living=list.find(f=>f.id==='living'),dining=list.find(f=>f.id==='dining');
 if(living.changed&&(living.scene.mode==='pieces'||living.scene.variant!=='original'||living.scene.layout!=='original'||living.scene.light!=='daywarm')){Object.assign(dining,{path:living.path,thumb:living.thumb,label:'与客厅共用已选视角',items:floorMaterialItems(dining.scene,[['客餐厅','共用当前客餐厅画面，餐区位于画面后方']]),shared:true,changed:true});}
 return list;
}

export function sceneLabel(value){const label=baseSceneLabel(value),p=floorProduct(value.floorProduct);return p?label.replace(/ × (暖灰石面|自然浅橡木|烟熏胡桃木)/,'')+' × '+p.brand+' · '+p.name:label;}
