// Authored, same-camera combinations. Bits are stable across both living-room views.
export const SCENE_OBJECTS=[
 {id:'decor',bit:1,name:'墙面装饰',category:'软装饰品',detail:'两处云纹饰件与背光',position:'70% 24%'},
 {id:'sofa',bit:2,name:'沙发',category:'坐具',detail:'橄榄软包、靠包与搭毯',position:'85% 65%'},
 {id:'rug',bit:4,name:'地毯',category:'织物',detail:'保留时为细密灰米羊毛毯',position:'55% 88%'},
 {id:'cabinet',bit:8,name:'客餐厅柜体',category:'收纳',detail:'电视矮柜、餐边柜及台面摆件',position:'5% 76%'}
];
export const supportsSceneObjects=s=>s?.design==='copper'&&['living','dining'].includes(s.room);
export function normalizeRemoved(value){const ids=new Set(Array.isArray(value)?value:[]);return SCENE_OBJECTS.filter(o=>ids.has(o.id)).map(o=>o.id);}
export const removalMask=value=>SCENE_OBJECTS.reduce((n,o)=>n+(normalizeRemoved(value).includes(o.id)?o.bit:0),0);
export function toggleSceneObject(scene,id){const ids=new Set(normalizeRemoved(scene.removed));ids.has(id)?ids.delete(id):ids.add(id);return {...scene,removed:normalizeRemoved([...ids])};}
export function objectSceneAsset(scene,thumb=false){if(!supportsSceneObjects(scene))return null;const mask=removalMask(scene.removed);return mask?`/tour/home-assets/copper/objects/${scene.room}/${String(mask).padStart(2,'0')}${thumb?'-thumb':''}.jpg`:null;}
export function objectSceneLabel(scene){const removed=normalizeRemoved(scene.removed);return removed.length?'已移除 '+SCENE_OBJECTS.filter(o=>removed.includes(o.id)).map(o=>o.name).join('、'):'保留全部单品';}
export function objectSceneMaterials(scene,fallback){
 if(!supportsSceneObjects(scene))return fallback;
 const removed=normalizeRemoved(scene.removed),status=id=>removed.includes(id);
 return [
  ['墙面装饰',status('decor')?'已移除云纹饰件与背光，保留连续墙面。':'古铜云纹饰件与局部背光；可单独移除。'],
  ['沙发',status('sofa')?'已移除坐具、靠包和搭毯。':'橄榄色细密软包，紧凑轮廓与柔圆扶手。'],
  ['地毯',status('rug')?'已移除，露出下方连续石纹地面。':'灰米色细密羊毛毯，薄边与自然绒向。'],
  ['柜体',status('cabinet')?'电视矮柜、餐边柜及其摆件已移除；挂墙电视与固定书架保留。':'木皮电视矮柜与餐边柜，分担客餐厅收纳。'],
  ['茶几与地面','烟玻璃、细古铜支撑；温灰哑光石纹地面。']
 ];
}
export function applyObjectVisibility(root,spec){
 const mapping={decor:['entry-art','living-wall-art'],sofa:['living-sofa'],rug:['living-rug'],cabinet:['living-media','entry-storage','dining-sideboard']},removed=normalizeRemoved(spec.removed);
 for(const [id,objects]of Object.entries(mapping))for(const name of objects){const object=root.userData.objects.get(name);if(object)object.visible=!removed.includes(id);}
 root.userData.removed=removed;return root;
}
export function renderSceneObjectControls(container,scene,onChange,{disabled=false}={}){
 if(!container)return;container.hidden=!supportsSceneObjects(scene);container.replaceChildren();if(container.hidden)return;
 const heading=document.createElement('div');heading.className='scene-object-heading';
 const title=document.createElement('strong');title.textContent='把不需要的，轻轻拿走';
 const note=document.createElement('p');note.textContent='四类单品可分别移除、加回；客厅与餐厅两个角度同步。';heading.append(title,note);container.append(heading);
 const list=document.createElement('div');list.className='scene-object-list';
 for(const item of SCENE_OBJECTS){
  const absent=normalizeRemoved(scene.removed).includes(item.id),button=document.createElement('button');button.type='button';button.dataset.sceneObject=item.id;button.disabled=disabled;button.setAttribute('aria-pressed',String(!absent));button.setAttribute('aria-label',(absent?'加回':'移除')+item.name);button.className='scene-object-card';
  const preview=document.createElement('span');preview.className='scene-object-thumb';const img=document.createElement('img');img.src=`/tour/home-assets/copper/${scene.room}-thumb.jpg`;img.alt='';img.width=60;img.height=60;img.loading='lazy';img.style.objectPosition=item.position;preview.append(img);
  const copy=document.createElement('span'),name=document.createElement('strong'),meta=document.createElement('small');name.textContent=item.name;meta.textContent=item.category+' · '+(absent?'已移除':item.detail);copy.append(name,meta);
  const action=document.createElement('span');action.className='scene-object-action';action.textContent=absent?'＋ 加回':'− 移除';button.append(preview,copy,action);button.addEventListener('click',()=>onChange(item.id));list.append(button);
 }
 container.append(list);const restore=document.createElement('button');restore.type='button';restore.dataset.sceneRestore='';restore.className='scene-object-restore';restore.textContent='恢复本套全部单品';restore.disabled=disabled||!normalizeRemoved(scene.removed).length;restore.addEventListener('click',()=>onChange(null));container.append(restore);
 const foot=document.createElement('p');foot.className='scene-object-note';foot.textContent='同一构图的组合效果已预先成图，点击加载；局部纹理可能有细微差异。';container.append(foot);
}
