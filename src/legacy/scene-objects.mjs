import {setSceneEditImage} from './scene-edit-location.mjs';
import {SCENE_EDIT_ASSETS} from './scene-edit-assets.mjs';
// Authored, same-camera combinations. Bits are stable across both living-room views.
export const SCENE_OBJECTS=[
 {id:'decor',bit:1,name:'墙面装饰',category:'软装饰品',detail:'两处云纹饰件与背光',position:'70% 24%'},
 {id:'sofa',bit:2,name:'沙发',category:'坐具',detail:'橄榄软包、靠包与搭毯',position:'85% 65%'},
 {id:'rug',bit:4,name:'地毯',category:'织物',detail:'保留时为细密灰米羊毛毯',position:'55% 88%'},
 {id:'cabinet',bit:8,name:'客餐厅柜体',category:'收纳',detail:'电视矮柜、餐边柜及台面摆件',position:'5% 76%'}
];
export const OBJECT_NAMES={decor:'墙面装饰',sofa:'沙发',rug:'地毯',cabinet:'柜体',table:'茶几 / 边几',diningSet:'餐桌与餐椅',displayShelf:'展示架',tv:'电视',plant:'绿植与花器',lamp:'灯具',bed:'床与床品',wardrobe:'衣柜',desk:'书桌 / 梳妆台',chair:'座椅',curtain:'窗帘',vanity:'浴室台盆柜',toilet:'坐便器',shower:'淋浴屏风',laundry:'洗烘设备',mirror:'镜面',partition:'装饰隔断'};
export const roomScope=room=>['living','dining'].includes(room)?'social':room;
export const supportsSceneObjects=s=>Boolean(SCENE_EDIT_ASSETS[s?.design]?.[s?.room])||(s?.design==='copper'&&['living','dining'].includes(s.room));
export function sceneObjectIds(s){const ids=Object.keys(SCENE_EDIT_ASSETS[s.design]?.[s.room]?.objects||{});return s.design==='copper'&&['living','dining'].includes(s.room)?[...new Set([...SCENE_OBJECTS.map(o=>o.id),...ids])]:ids;}
export const supportsOriginalEdits=s=>(!s.layout||s.layout==='original')&&(!s.variant||s.variant==='original');
export function normalizeRemoved(value){const ids=new Set(Array.isArray(value)?value:[]);return Object.keys(OBJECT_NAMES).filter(id=>ids.has(id));}
export const removalMask=value=>SCENE_OBJECTS.reduce((n,o)=>n+(normalizeRemoved(value).includes(o.id)?o.bit:0),0);
export function toggleSceneObject(scene,id){if(id?.startsWith('partition:'))return {...scene,partitionStyle:id.split(':')[1],removed:normalizeRemoved(scene.removed).filter(x=>x!=='partition')};const ids=new Set(normalizeRemoved(scene.removed));ids.has(id)?ids.delete(id):ids.add(id);return {...scene,removed:normalizeRemoved([...ids])};}
export function objectSceneAsset(scene,thumb=false){if(scene.design!=='copper'||!['living','dining'].includes(scene.room))return null;const mask=removalMask(scene.removed);return mask?`/tour/home-assets/copper/objects/${scene.room}/${String(mask).padStart(2,'0')}${thumb?'-thumb':''}.jpg`:null;}
export function objectSceneLabel(scene){const removed=normalizeRemoved(scene.removed);return removed.length?'已移除 '+removed.map(id=>OBJECT_NAMES[id]).join('、'):'保留全部单品';}
export function objectSceneMaterials(scene,fallback){
 if(scene.design!=='copper'||!['living','dining'].includes(scene.room))return [...fallback,...(scene.removed?.length?[['单品调整',objectSceneLabel(scene)]]:[]),...(scene.partitionStyle==='custom'?[['装饰方案',SCENE_EDIT_ASSETS[scene.design]?.[scene.room]?.partition?.label||'新装饰']]:[])];
 const removed=normalizeRemoved(scene.removed),status=id=>removed.includes(id);
 return [
  ['墙面装饰',status('decor')?'已移除云纹饰件与背光，保留连续墙面。':'古铜云纹饰件与局部背光；可单独移除。'],
  ['沙发',status('sofa')?'已移除坐具、靠包和搭毯。':'橄榄色细密软包，紧凑轮廓与柔圆扶手。'],
  ['地毯',status('rug')?'已移除，露出下方连续石纹地面。':'灰米色细密羊毛毯，薄边与自然绒向。'],
  ['柜体',status('cabinet')?'电视矮柜、餐边柜及其摆件已移除；挂墙电视与固定书架保留。':'木皮电视矮柜与餐边柜，分担客餐厅收纳。'],
  ['茶几与地面',status('table')?'茶几已移除，保留当前地面。':'烟玻璃、细古铜支撑；温灰哑光石纹地面。'],
  ['单品调整',objectSceneLabel(scene)],
  ['隔断装饰',scene.partitionStyle==='custom'?(SCENE_EDIT_ASSETS[scene.design]?.[scene.room]?.partition?.label||'新装饰'):'保留原款']
 ];
}
export function applyObjectVisibility(root,spec){
 const mapping={decor:['entry-art','living-wall-art'],sofa:['living-sofa','second-loveseat','balcony-lounge','balcony-bench'],rug:['living-rug','master-rug'],cabinet:['living-media','entry-storage','dining-sideboard','second-storage','kitchen-cabinet','kitchen-return','balcony-record-cabinet'],table:['living-table','balcony-side-table'],diningSet:['dining-table','dining-chair-1','dining-chair-2','dining-chair-3','dining-chair-4','dining-bench'],displayShelf:['second-library','balcony-book-shelf','entry-display-shelf'],tv:['living-tv'],plant:['living-plant','balcony-plant'],lamp:['living-floorlamp'],bed:['master-bed','second-daybed','second-low-bed','second-guest-bed','second-foldaway-bed'],wardrobe:['master-wardrobe','second-storage'],desk:['second-work-desk','second-work-return','second-fold-desk','second-listening-desk','second-vanity','second-desk'],chair:['second-chair','second-vanity-stool','balcony-chair','balcony-chair-left','balcony-chair-right','balcony-lounge'],curtain:['master-curtains','balcony-curtains'],vanity:['bath-vanity'],toilet:['bath-wc'],shower:['bath-shower'],laundry:['utility-laundry'],mirror:['bath-mirror'],partition:['entry-partition']};
 for(const name of new Set(Object.values(mapping).flat())){const o=root.userData.objects.get(name);if(o)o.visible=true;}
 for(const [id,names]of Object.entries(mapping))for(const name of names){const o=root.userData.objects.get(name);if(!o)continue;const room=o.userData.room||o.parent?.userData.room,removed=normalizeRemoved(spec.scenes?.[room]?.removed||(['living','dining'].includes(room)?spec.removed:[]));if(removed.includes(id))o.visible=false;}
 root.userData.removed=normalizeRemoved(spec.removed);return root;
}
export function renderSceneObjectControls(container,scene,onChange,{disabled=false}={}){
 if(!container)return;container.hidden=!supportsSceneObjects(scene);container.replaceChildren();if(container.hidden)return;
 const heading=document.createElement('div');heading.className='scene-object-heading';
 const title=document.createElement('strong');title.textContent='把不需要的，轻轻拿走';
 const note=document.createElement('p');note.textContent='单品可移除、加回。客餐厅联动，其余房间独立保留。';heading.append(title,note);container.append(heading);
 const list=document.createElement('div');list.className='scene-object-list';
 for(const id of sceneObjectIds(scene)){const item=SCENE_OBJECTS.find(o=>o.id===id)||{id,name:OBJECT_NAMES[id]||id,category:'当前空间',detail:'可移除与还原',position:'50% 50%'};
  const absent=normalizeRemoved(scene.removed).includes(item.id),button=document.createElement('button');button.type='button';button.dataset.sceneObject=item.id;button.disabled=disabled||!supportsOriginalEdits(scene);button.setAttribute('aria-pressed',String(!absent));button.setAttribute('aria-label',(absent?'加回':'移除')+item.name);button.className='scene-object-card';
  const preview=document.createElement('span');preview.className='scene-object-thumb';const img=document.createElement('img');img.src=SCENE_EDIT_ASSETS[scene.design]?.[scene.room]?.source||`/tour/home-assets/copper/${scene.room}-thumb.jpg`;img.alt='';img.width=60;img.height=60;img.loading='lazy';img.style.objectPosition=item.position;preview.append(img);
  const copy=document.createElement('span'),name=document.createElement('strong'),meta=document.createElement('small');name.textContent=item.name;meta.textContent=item.category+' · '+(absent?'已移除':item.detail);copy.append(name,meta);
  const action=document.createElement('span');action.className='scene-object-action';action.textContent=absent?'＋ 加回':'− 移除';button.append(preview,copy,action);button.addEventListener('click',()=>onChange(item.id));list.append(button);
 }
 container.append(list);
 const alternative=SCENE_EDIT_ASSETS[scene.design]?.[scene.room]?.partition;
 if(alternative){const group=document.createElement('div');group.className='partition-options';for(const custom of [false,true]){const b=document.createElement('button');b.type='button';b.className='partition-option';b.disabled=disabled||!supportsOriginalEdits(scene);b.dataset.partitionStyle=custom?'custom':'original';b.setAttribute('aria-pressed',String((scene.partitionStyle==='custom')===custom));const im=document.createElement('img');setSceneEditImage(im,custom?alternative.path:SCENE_EDIT_ASSETS[scene.design][scene.room].source);im.alt='';im.loading='lazy';const name=document.createElement('strong');name.textContent=custom?alternative.label:'保留原装饰';b.append(im,name);b.addEventListener('click',()=>onChange('partition:'+(custom?'custom':'original')));group.append(b);}container.append(group);}
 const restore=document.createElement('button');restore.type='button';restore.dataset.sceneRestore='';restore.className='scene-object-restore';restore.textContent='恢复此空间全部单品';restore.disabled=disabled||!normalizeRemoved(scene.removed).length;restore.addEventListener('click',()=>onChange(null));container.append(restore);
 const foot=document.createElement('p');foot.className='scene-object-note';foot.textContent=supportsOriginalEdits(scene)?'移除后补全遮挡区域，局部光影与边缘为近似效果。固定门窗与结构保留。':'请切回原布局、原搭配后调整单品；当前方案已保留。';container.append(foot);
}
