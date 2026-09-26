import * as photoFloorModule from '../src/legacy/photo-floor.mjs';
import {createFloorLive} from '../src/legacy/floor-live.mjs';
import {duskVrMatch} from '../src/vr/dusk-manifest.mjs';
// Production event handlers against DOM/render boundaries. Not a browser/GPU test.
import fs from 'node:fs/promises';import vm from 'node:vm';import assert from 'node:assert/strict';import {execFileSync} from 'node:child_process';
import * as stateModule from '../src/legacy/room-state.mjs';
import * as homeModule from '../src/legacy/home-designs.mjs';
import * as variantModule from '../src/legacy/home-variants.mjs';
import * as pieceModule from '../src/legacy/home-pieces.mjs';
import * as layoutModule from '../src/legacy/layout-options.mjs';
import * as sceneModule from '../src/legacy/scene-options.mjs';
import * as objectModule from '../src/legacy/scene-objects.mjs';
import * as materialModule from '../src/legacy/material-previews.mjs';
import * as floorModule from '../src/legacy/floor-catalog.mjs';
import * as dialogModule from '../src/legacy/dialog-view.mjs';
const PURCHASES=JSON.parse(await fs.readFile('src/legacy/purchase-data.json','utf8'));
const key=s=>s.slice(5).replace(/-([a-z])/g,(_,c)=>c.toUpperCase());let document;
class Element{
 constructor(tag='div',attrs={}){this.tagName=tag.toUpperCase();this.attrs={...attrs};this.children=[];this.dataset={};this.events={};this.style={setProperty(k,v){this[k]=v;}};this.hidden='hidden'in attrs;this.open='open'in attrs;this.disabled=false;this.value=attrs.value||'';this._text='';this.className=attrs.class||'';this.offsetWidth=300;this.offsetHeight=290;for(const[k,v]of Object.entries(attrs))if(k.startsWith('data-'))this.dataset[key(k)]=v;}
 get textContent(){return this._text;}set textContent(v){this._text=String(v);this.children=[];}
 get parentElement(){return this.parent;}
 append(...els){for(const v of els){if(typeof v==='string'){this._text+=v;continue;}v.parent?.children.splice(v.parent.children.indexOf(v),1);v.parent=this;this.children.push(v);}}
 replaceWith(el){const p=this.parent;if(!p)return;const i=p.children.indexOf(this);p.children[i]=el;el.parent=p;this.parent=null;}
 replaceChildren(...els){for(const c of this.children)c.parent=null;this.children=[];this.append(...els);}
 setAttribute(k,v){this.attrs[k]=String(v);if(k.startsWith('data-'))this.dataset[key(k)]=String(v);}getAttribute(k){return this.attrs[k]??null;}removeAttribute(k){delete this.attrs[k];}
 matches(sel){if(sel.includes(','))return sel.split(',').some(s=>this.matches(s));if(sel[0]==='#')return this.attrs.id===sel.slice(1);if(sel[0]==='.')return this.className.split(' ').includes(sel.slice(1));if(sel[0]==='['){const m=sel.match(/^\[([^=\]]+)(?:="([^"]*)")?\]$/);if(!m)return false;const v=m[1].startsWith('data-')?this.dataset[key(m[1])]:this.attrs[m[1]];return v!==undefined&&(m[2]===undefined||m[2]===v);}return this.tagName===sel.toUpperCase();}
 querySelectorAll(s){if(s.includes(' ')){const [first,...rest]=s.split(' ');return this.querySelectorAll(first).flatMap(el=>el.querySelectorAll(rest.join(' ')));}return this.children.flatMap(c=>[...(c.matches(s)?[c]:[]),...c.querySelectorAll(s)]);}querySelector(s){return this.querySelectorAll(s)[0]||null;}
 closest(s){for(let n=this;n;n=n.parent)if(n.matches(s))return n;return null;}
 contains(el){for(let n=el;n;n=n.parent)if(n===this)return true;return false;}
 addEventListener(k,fn){(this.events[k]??=[]).push(fn);}dispatchEvent(e){e.target??=this;e.currentTarget=this;e.preventDefault??=()=>{};for(const fn of this.events[e.type]||[])fn(e);}click(){if(!this.disabled)this.dispatchEvent({type:'click'});}
 focus(){document.activeElement=this;}scrollIntoView(){this.scrolled=true;}getBoundingClientRect(){return {left:0,top:0,width:900,height:600,right:900,bottom:600};}
 get classList(){return {remove:x=>{this.className=this.className.split(' ').filter(v=>v!==x).join(' ');},toggle:x=>{const yes=!this.className.split(' ').includes(x);this.className=yes?this.className+' '+x:this.className.split(' ').filter(v=>v!==x).join(' ');return yes;}};}
 showModal(){this.open=true;}close(){this.open=false;}
}
function make(t){const el=new Element(t.tag,t.attrs);el.textContent=t.text;for(const c of t.children)el.append(make(c));return el;}
document=make(JSON.parse(execFileSync('python',['scripts/legacy-dom-tree.py','dist/tour/legacy.html'],{encoding:'utf8'})));document.getElementById=id=>document.querySelector('#'+id);document.createElement=t=>new Element(t);
const root=document.getElementById('furniture-trial'),$=s=>root.querySelector(s),image=document.getElementById('render-image');let serial=0,renderCalls=[],fail=false,delay=1;const revoked=[];let walkCreates=0,walkDisposes=0,walkUpdates=[],walkTargets=[];
const context={duskVrMatch,...stateModule,document,window:Object.assign(new Element('window'),{innerWidth:1400,innerHeight:900}),CustomEvent:class{constructor(type,args={}){this.type=type;Object.assign(this,args);}},matchMedia:()=>({matches:false}),performance,Blob,console,structuredClone,setTimeout,clearTimeout,URL:{createObjectURL:()=>`blob:test-${++serial}`,revokeObjectURL:u=>revoked.push(u)},__loadRenderer:async()=>({renderRoom:async(snapshot,progress)=>{renderCalls.push(structuredClone(snapshot));progress({label:'Reading',loaded:2,total:4});await new Promise(r=>setTimeout(r,delay));if(fail)throw new Error('WebGL unavailable');return {blob:new Blob(['test']),duration:delay};}})};
let imageFail='',imageDelays={};const imageRequests=[];context.Image=class {set src(v){imageRequests.push(v);setTimeout(()=>{if(v===imageFail)this.onerror?.();else this.onload?.();},imageDelays[v]||1);}};Object.assign(context,photoFloorModule,{createFloorLive},homeModule,variantModule,pieceModule,layoutModule,sceneModule,objectModule,dialogModule,materialModule,floorModule,{CATALOG:floorModule.FLOOR_CATALOG,PURCHASES,exportEffectBook:async()=>{}});
context.__loadWalk=async()=>({createWalkViewer:async args=>{walkCreates++;await new Promise(r=>setTimeout(r,5));return {dispose(){walkDisposes++;},select(){},pick(){return 'rug';},walkTo(id){walkTargets.push(id);},reset(){},getPose(){return {yaw:.7,pitch:-.13,at:'aisle'};},update:async(snapshot,isCurrent)=>{await new Promise(r=>setTimeout(r,5));if(isCurrent())walkUpdates.push(structuredClone(snapshot));}};}});
const modelUpdates=[],modelVisible=[],modelRooms=[],modelViews=[],modelQualities=[];let modelLoads=0;context.__loadWholeModel=async()=>{modelLoads++;return {createWholeModel:async()=>({update:s=>modelUpdates.push(structuredClone(s)),select:r=>modelRooms.push(r),view:r=>modelViews.push(r),setQuality:q=>modelQualities.push(q),setVisible:v=>modelVisible.push(v)})};};
for(const b of document.querySelectorAll('[data-render]'))b.addEventListener('click',()=>{image.src='/original-'+b.dataset.render+'.jpg';document.dispatchEvent(new context.CustomEvent('tingjian:gallery',{detail:{key:b.dataset.render}}));});
let source=await fs.readFile('src/legacy/trial.mjs','utf8');source=source.replace(/^import[^\n]+\n/gm,'').replace("await import('./room-renderer.mjs')","await __loadRenderer()").replace("await import('./room-walk.mjs')","await __loadWalk()");const gallery=(await fs.readFile('src/legacy/home-gallery.mjs','utf8')).replace(/^import[^\n]+\n/gm,'').replace('export function initHomeGallery','function initHomeGallery');const journey=(await fs.readFile('src/legacy/design-journey.mjs','utf8')).replace(/^import[^\n]+\n/gm,'').replace('export function initDesignJourney','function initDesignJourney').replace("import('./whole-model.mjs')","__loadWholeModel()");const materialSource=(await fs.readFile('src/legacy/material-previews.mjs','utf8')).replace(/^import[^\n]+\n/gm,'').replace('export function renderMaterialList','function renderMaterialList');const objectControlsSource=(await fs.readFile('src/legacy/scene-objects.mjs','utf8')).split('export function renderSceneObjectControls')[1];const floorSource=(await fs.readFile('src/legacy/floor-catalog.mjs','utf8')).replace(/^import[^\n]+\n/gm,'').replace('const FLOOR_CATALOG=CATALOG','const FLOOR_CATALOG='+JSON.stringify(floorModule.FLOOR_CATALOG)).replaceAll('export ','');vm.runInNewContext(floorSource+'\nfunction renderSceneObjectControls'+objectControlsSource+'\n'+materialSource+'\n'+gallery+'\n'+journey+'\n'+source+'\nglobalThis.__inspect=()=>({state,last});globalThis.__journey=designJourney.getState;globalThis.__homeGallery=homeGallery;',context);
const wait=ms=>new Promise(r=>setTimeout(r,ms));async function click(sel,ms=100){assert($(sel),sel+' exists');$(sel).click();await wait(ms);}function input(sel,value){const e=$(sel);e.value=String(value);e.dispatchEvent({type:'change'});}
const checks=[];
assert.equal(context.__journey().step,'style');assert.equal(modelLoads,0);
await click('[data-confirm-style]',25);assert.equal(context.__journey().current.pieces.sofa,'cognac');assert.equal(context.__journey().step,'layout');await click('[data-layout-next]',10);assert.equal(context.__journey().step,'details');assert.equal($('[data-details-room-picks]').children.length,8);assert($('[data-details-next]').disabled);assert.equal(modelLoads,0);
await click('[data-edit-category="table"]',3);await click('[data-edit-piece="stone"]',15);await click('[data-edit-category="sofa"]',3);await click('[data-edit-piece="mink"]',15);await click('[data-edit-category="floor"]',3);
for(const floor of ['oak','smoked','stone']){assert(!$('[data-edit-piece="'+floor+'"]').disabled);await click('[data-edit-piece="'+floor+'"]',15);const cur=context.__journey().current;assert.equal(cur.pieces.floor,floor);assert.equal(cur.pieces.table,'stone');assert.equal(cur.pieces.sofa,'mink');assert.equal($('[data-details-image]').src,sceneModule.sceneAsset(cur));}
checks.push('All three floors switch under mink + stone table; no hidden sofa/table replacement; native scene path matches state.');
await click('[data-edit-piece="oak"]',15);await click('[data-confirm-room]',3);assert.deepEqual([...context.__journey().confirmedRooms],['living']);
for(const id of ['dining','balcony','master','second','kitchen','bath','utility']){await click('[data-details-room="'+id+'"]',15);assert.equal(context.__journey().step,'details');assert.equal(context.__journey().current.room,id);assert(!$('[data-journey-details]').hidden);assert($('[data-home-panel]').hidden);assert($('[data-editor-panel]').hidden);assert.equal(modelLoads,0);if(id!=='utility')assert($('[data-details-next]').disabled);
 if(id==='master'){await click('[data-edit-category="bed"]',3);await click('[data-edit-piece="wood"]',15);await click('[data-edit-category="bedding"]',3);await click('[data-edit-piece="olive"]',15);await click('[data-edit-category="window"]',3);await click('[data-edit-piece="clear"]',15);}
 await click('[data-confirm-room]',3);
}
assert.equal(context.__journey().confirmedRooms.length,8);assert(!$('[data-details-next]').disabled);assert.equal(context.__journey().step,'details');checks.push('Eight rooms remain in one workbench, have independent confirmation, and do not automatically advance; next step unlocks only after all eight.');
await click('[data-details-next]',40);assert.equal(context.__journey().step,'whole');assert.equal(modelLoads,1);assert.equal(modelUpdates.length,1);assert(!$('[data-current-model-panel]').hidden);assert($('[data-whole-mosaic]').hidden);assert.equal(modelUpdates[0].frames.length,8);const firstWhole=structuredClone(context.__journey().whole);assert.equal(firstWhole.frames.find(f=>f.id==='living').scene.pieces.floor,'oak');assert.equal(firstWhole.frames.find(f=>f.id==='master').scene.pieces.bedding,'olive');assert.equal(firstWhole.frames.find(f=>f.id==='master').scene.window,'clear');
assert(!$('[data-model-quality="photo"]').hidden);await click('[data-model-quality="photo"]',3);assert.equal(modelQualities.at(-1),'photo');await click('[data-model-quality="detailed"]',3);
assert.equal($('[data-dusk-vr-host]').children.length,0);
assert(!$('[data-whole-view="vr"]').hidden);await click('[data-whole-view="vr"]',5);
assert(!$('[data-dusk-vr-panel]').hidden);assert.equal($('[data-dusk-vr-host]').children.length,1);
assert($('[data-dusk-vr-host]').children[0].src.startsWith('/vr/dusk/#'));
assert($('[data-dusk-vr-selection]').textContent.includes('尚未重绘'));
await click('[data-whole-view="model"]',5);assert.equal($('[data-dusk-vr-host]').children.length,0);
checks.push('Dusk VR loads only on request; changed furniture is disclosed; switching away removes its iframe.');
await click('[data-model-room="master"]',5);assert.equal(modelRooms.at(-1),'master');assert.equal($('[data-current-model-photo]').src,firstWhole.frames.find(f=>f.id==='master').path);assert.equal(modelUpdates.length,1);await click('[data-current-model-focus]',3);assert.equal(modelViews.at(-1),'master');await click('[data-whole-view="overview"]',3);assert(!$('[data-whole-mosaic]').hidden);assert($('[data-current-model-panel]').hidden);assert.equal(modelVisible.at(-1),false);await click('[data-whole-view="model"]',5);assert.equal(modelLoads,1);
checks.push('Whole-home defaults to live 3D + exact selected photo. Room selection pairs correctly, no geometry rebuild on room clicks; collage is secondary; renderer stops when hidden.');
await click('[data-current-model-edit]',15);assert.equal(context.__journey().step,'details');assert.equal(context.__journey().current.room,'master');assert.equal(context.__journey().current.pieces.bedding,'olive');await click('[data-details-room="living"]',15);assert.equal(context.__journey().current.pieces.sofa,'mink');assert.equal(context.__journey().current.pieces.table,'stone');assert.equal(context.__journey().current.pieces.floor,'oak');
await click('[data-edit-category="floor"]',3);await click('[data-edit-piece="smoked"]',15);assert($('[data-details-next]').disabled);assert(!context.__journey().confirmedRooms.includes('living'));assert(!context.__journey().confirmedRooms.includes('dining'));assert(context.__journey().stale);assert.equal(context.__journey().whole.signature,firstWhole.signature);assert($('[data-whole-export]').disabled);
await click('[data-journey-step="whole"]',3);assert.equal(context.__journey().step,'details');await click('[data-confirm-room]',3);await click('[data-details-room="dining"]',15);await click('[data-confirm-room]',3);assert.equal(context.__journey().confirmedRooms.length,8);await click('[data-details-next]',30);assert.equal(modelUpdates.length,2);assert.equal(modelLoads,1);assert.equal(modelUpdates.at(-1).frames.find(f=>f.id==='living').scene.pieces.floor,'smoked');checks.push('Editing confirmed materials invalidates affected room confirmations and old whole snapshot; shared living/dining reconfirm together; re-entry uses same renderer with updated choices.');
await click('[data-whole-back]',5);await click('[data-details-room="living"]',10);await click('[data-edit-category="floor"]',3);const previous=$('[data-details-image]').src;imageFail=sceneModule.sceneAsset({...context.__journey().current,pieces:{...context.__journey().current.pieces,floor:'stone'}});await click('[data-edit-piece="stone"]',15); // previously cached stone image: exercise an uncached sofa combination instead
imageFail='';await click('[data-edit-category="sofa"]',3);const failureScene={...context.__journey().current,pieces:{...context.__journey().current.pieces,sofa:'wine'}};imageFail=sceneModule.sceneAsset(failureScene);const oldSofa=context.__journey().current.pieces.sofa;await click('[data-edit-piece="wine"]',15);assert.equal(context.__journey().current.pieces.sofa,oldSofa);assert($('[data-details-status]').textContent.includes('保留'));imageFail='';await click('[data-layout-retry]',15);assert.equal(context.__journey().current.pieces.sofa,'wine');
// Rapid different-category changes compose pending choices rather than lose the first one.
await click('[data-edit-category="sofa"]',3);imageDelays[sceneModule.sceneAsset({...context.__journey().current,pieces:{...context.__journey().current.pieces,sofa:'slim'}})]=80;await click('[data-edit-piece="slim"]',3);await click('[data-edit-category="floor"]',2);await click('[data-edit-piece="oak"]',120);assert.equal(context.__journey().current.pieces.sofa,'slim');assert.equal(context.__journey().current.pieces.floor,'oak');checks.push('Failed assets keep prior choice with retry; quick cross-category clicks compose intended choices and stale completions cannot overwrite the latest scene.');

// New schemes use all eight distinct room photos; batch confirmation is atomic and does not navigate.
for(const scheme of ['copper','amber','graphite']){
 await click('[data-journey-step="style"]',5);await click('[data-home-design="'+scheme+'"]',20);await click('[data-confirm-style]',20);await click('[data-layout-next]',5);
 assert.equal(context.__journey().confirmed,scheme);assert.equal(context.__journey().confirmedRooms.length,0);
 assert($('[data-details-next]').disabled);assert($('.room-material-record').open);assert($('.room-purchase-drawer').open);assert($('.home-plan').open);assert($('.whole-record').open);
 const preview=$('.material-thumb');assert(preview);preview.click();assert.equal(preview.getAttribute('aria-expanded'),'true');preview.dispatchEvent({type:'blur'});assert.equal(preview.getAttribute('aria-expanded'),'false');
 $('.room-material-record').open=false;await click('[data-details-room="master"]',15);assert.equal($('.room-material-record').open,false);$('.room-material-record').open=true;
 if(scheme==='copper'){
  imageFail='/tour/home-assets/copper/bath.jpg';await click('[data-confirm-all]',25);assert.equal(context.__journey().confirmedRooms.length,0);assert($('[data-details-status]').textContent.includes('未生效'));assert(!context.__journey().bulkBusy);imageFail='';
 }
 await click('[data-confirm-all]',30);assert.equal(context.__journey().confirmedRooms.length,8);assert.equal(context.__journey().step,'details');assert(!$('[data-details-next]').disabled);
 await click('[data-details-next]',30);assert.equal(context.__journey().step,'whole');const snap=context.__journey().whole;assert.equal(new Set(snap.frames.map(f=>f.path)).size,8);assert(snap.frames.every(f=>f.path.includes('/'+scheme+'/')));assert.equal(snap.frames.find(f=>f.id==='dining').path,homeModule.homeAsset(scheme,'dining'));
 await click('[data-model-quality="light"]',5);assert.equal(context.__journey().modelQuality,'light');assert.equal(modelQualities.at(-1),'light');await click('[data-model-quality="detailed"]',5);assert.equal(modelQualities.at(-1),'detailed');
}
checks.push('Seven schemes selectable; three latest homes retain eight distinct room photos and flow to whole-home. Bulk confirmation verifies all assets atomically, preserves current room, and never auto-advances. Failed load keeps confirmations unchanged.');
checks.push('Current detail sections open initially; manual collapse survives room changes. Material preview click/blur states work. Detailed/light model switch stays in the same whole-home workbench.');
// Previous custom choices survive using bulk confirmation after returning to an earlier scheme.
await click('[data-journey-step="style"]',5);await click('[data-home-design="dusk"]',20);await click('[data-confirm-style]',20);await click('[data-layout-next]',5);await click('[data-details-room="master"]',15);assert.equal(context.__journey().current.pieces.bed,'wood');assert.equal(context.__journey().current.pieces.bedding,'olive');await click('[data-confirm-all]',30);await click('[data-details-next]',30);assert.equal(context.__journey().whole.frames.find(f=>f.id==='master').scene.pieces.bedding,'olive');
checks.push('Bulk confirmation preserves previously edited bed and bedding when switching away and returning to a scheme.');
// Independent removal choices compose and remain consistent across both cameras and stages.
await click('[data-journey-step="style"]',5);await click('[data-home-design="copper"]',20);await click('[data-home-room="living"]',15);
const homeObject=id=>'[data-home-object-controls] [data-scene-object="'+id+'"]';
const detailObject=id=>'[data-details-object-controls] [data-scene-object="'+id+'"]';
await click(homeObject('decor'),15);assert.deepEqual([...context.__homeGallery.getState().removed],['decor']);assert($('[data-home-image]').src.endsWith('/living/01.jpg'));
imageDelays['/tour/home-assets/copper/objects/living/03.jpg']=65;
await click(homeObject('sofa'),2);await click(homeObject('rug'),90);assert.equal(objectModule.removalMask(context.__homeGallery.getState().removed),7);assert($('[data-home-image]').src.endsWith('/living/07.jpg'));
await click('[data-home-room="dining"]',20);assert($('[data-home-image]').src.endsWith('/dining/07.jpg'));
const oldHome=$('[data-home-image]').src;imageFail='/tour/home-assets/copper/objects/dining/15.jpg';await click(homeObject('cabinet'),20);assert.equal($('[data-home-image]').src,oldHome);assert($('[data-home-load-status]').textContent.includes('保留'));imageFail='';
await click('[data-confirm-style]',20);await click('[data-layout-next]',10);assert.equal(objectModule.removalMask(context.__journey().current.removed),7);
await click('[data-confirm-all]',30);assert.equal(context.__journey().confirmedRooms.length,8);await click('[data-details-next]',35);
for(const f of context.__journey().whole.frames.filter(f=>['living','dining'].includes(f.id))){assert.equal(objectModule.removalMask(f.scene.removed),7);assert(f.path.endsWith('/07.jpg'));assert(f.items.some(row=>row[0]==='墙面装饰'&&row[1].includes('已移除')));}
assert.equal(objectModule.removalMask(modelUpdates.at(-1).frames.find(f=>f.id==='living').scene.removed),7);
await click('[data-whole-back]',5);await click('[data-details-room="living"]',15);await click(detailObject('cabinet'),20);assert.equal(objectModule.removalMask(context.__journey().current.removed),15);assert.equal(context.__journey().confirmedRooms.length,6);assert(context.__journey().stale);assert($('[data-details-next]').disabled);
await click('[data-details-room="dining"]',15);assert($('[data-details-image]').src.endsWith('/dining/15.jpg'));assert.equal(objectModule.removalMask(context.__homeGallery.getState().removed),15);
imageFail='/tour/home-assets/copper/objects/dining/11.jpg';await click(detailObject('rug'),20);assert.equal(objectModule.removalMask(context.__journey().current.removed),15);assert($('[data-details-status]').textContent.includes('保留'));imageFail='';await click('[data-layout-retry]',20);assert.equal(objectModule.removalMask(context.__journey().current.removed),11);
await click('[data-details-object-controls] [data-scene-restore]',20);assert.equal(context.__journey().current.removed.length,0);assert.equal($('[data-details-image]').src,homeModule.homeAsset('copper','dining'));
await click('[data-details-room="living"]',15);assert.equal(context.__journey().current.removed.length,0);assert.equal($('[data-details-image]').src,homeModule.homeAsset('copper','living'));
await click('[data-confirm-all]',30);assert.equal(context.__journey().confirmedRooms.length,8);assert.equal(context.__journey().step,'details');
checks.push('Copper decor/sofa/rug/cabinets can be independently removed and added back in both editing stages. Fast clicks compose; both cameras and material lists share the choices. Failed image retains prior state with retry.');
checks.push('Changing a shared removal invalidates only living/dining confirmations (8 → 6), marks the whole-home snapshot stale, and refreshes both photo and model snapshots after reconfirmation. Restore-all is reversible.');
await click('[data-journey-step="style"]',5);await click('[data-home-design="graphite"]',20);assert($('[data-home-object-controls]').hidden);assert.equal($('[data-home-rooms]').children.length,8);
assert.equal(root.querySelectorAll('[data-home-design]').length,7);
const html=await fs.readFile('dist/index.html','utf8'),main=await fs.readFile('dist/tour/legacy.html','utf8'),css=await fs.readFile('dist/tour/furniture-trial.css','utf8');assert(html.includes('data-history-pane'));assert(html.includes('data-lab-frame'));assert(main.includes('data-room-edit-choices'));assert(css.includes('#archive-study'));await assert.rejects(fs.access('dist/tour/history.html'));checks.push('Historical VR removed; furniture lab retained; current editor unchanged.');

// The new catalog is orthogonal to photographs and furniture choices.
const floorHome='[data-home-floor-catalog] ',floorDetails='[data-details-floor-catalog] ';
assert.equal($('[data-home-floor-catalog]').querySelectorAll('[data-floor-product]').length,10);
assert.equal($('[data-home-floor-catalog]').querySelectorAll('[data-floor-product]').length,10);
await click('[data-home-room="living"]',15);
const beforeCatalog=$('[data-home-image]').src;
await click(floorHome+'[data-floor-product="listone-walnut"]',5);
assert.equal(context.__homeGallery.getState().floorProduct,'listone-walnut');assert.equal($('[data-home-image]').src,beforeCatalog);
await click('[data-home-room="master"]',15);assert.equal(context.__homeGallery.getState().floorProduct,null);
await click('[data-home-room="living"]',15);assert.equal(context.__homeGallery.getState().floorProduct,'listone-walnut');
await click('[data-confirm-style]',20);await click('[data-layout-next]',10);
assert.equal(context.__journey().current.floorProduct,'listone-walnut');
assert.equal($('[data-details-floor-catalog]').querySelectorAll('[data-floor-product]').length,10);
await click(floorDetails+'[data-floor-product="florim-pearl-travertine"]',15);assert.equal(context.__journey().current.floorProduct,'florim-pearl-travertine');
await click('[data-details-room="dining"]',15);assert.equal(context.__journey().current.floorProduct,'florim-pearl-travertine');
await click('[data-details-room="bath"]',15);assert.equal(context.__journey().current.floorProduct,null);
for(const b of $('[data-details-floor-catalog]').querySelectorAll('[data-floor-product]'))assert.equal(b.disabled,floorModule.floorProduct(b.dataset.floorProduct).category==='wood');
await click('[data-details-room="second"]',15);await click(floorDetails+'[data-floor-product="kahrs-limestone"]',15);
await click('[data-confirm-all]',30);await click('[data-details-next]',40);
let result=context.__journey().whole;assert.equal(result.frames.find(f=>f.id==='second').scene.floorProduct,'kahrs-limestone');
assert(result.products.some(x=>x.id==='kahrs-limestone'));assert(result.products.some(x=>x.id==='florim-pearl-travertine'));
assert(result.frames.find(f=>f.id==='second').items.some(row=>row[0]==='品牌地面'&&row[1].includes('Kährs')));
await click('[data-whole-back]',8);await click('[data-details-room="living"]',15);await click(floorDetails+'[data-floor-clear]',15);
assert.equal(context.__journey().current.floorProduct,null);assert(context.__journey().stale);assert.equal(context.__journey().confirmedRooms.length,6);
await click('[data-details-room="second"]',15);assert.equal(context.__journey().current.floorProduct,'kahrs-limestone');
assert.equal(root.querySelectorAll('[data-confirm-style]').length,1);assert.equal(root.querySelectorAll('[data-home-large]').length,1);
assert($('[data-home-design="dusk"]').closest('.studio-style-rail'));assert($('[data-home-panel]').closest('.studio-content'));assert($('[data-home-object-controls]').closest('.home-side'));
checks.push('10 official branded floors: category switching, room-specific choices, shared living/dining finish, wet-room restriction, precise shortlist links, confirmation invalidation and reversible restoration; photographs do not pretend to render the brand.');


await click('[data-journey-step="style"]',8);await click('[data-home-design="dusk"]',20);await click('[data-home-room="living"]',15);await click('[data-home-mode="pieces"]',15);await click('[data-confirm-style]',20);await click('[data-layout-next]',15);

await click('[data-edit-category="floor"]',3);assert(!$('[data-details-floor-catalog]').hidden);
await click(floorDetails+'[data-floor-product="quickstep-cala-oak"]',15);
assert.equal(context.__journey().current.floorProduct,'quickstep-cala-oak');
assert.equal($('[data-edit-piece="oak"]').getAttribute('aria-pressed'),'false');
await click('[data-edit-piece="oak"]',15);assert.equal(context.__journey().current.floorProduct,null);
assert.equal($('[data-edit-piece="oak"]').getAttribute('aria-pressed'),'true');
await click('[data-edit-category="sofa"]',3);assert($('[data-details-floor-catalog]').hidden);
checks.push('Brand floors share the lower floor category; brand and original finishes are mutually exclusive, both selection directions update state.');

await fs.mkdir('verification/v17',{recursive:true});await fs.writeFile('verification/v17/ui-checks.json',JSON.stringify({passed:true,method:'Production DOM-handler harness with mocked Image, DOM and renderer boundary; not browser/GPU validation',checks},null,2));console.log(JSON.stringify({passed:true,checks},null,2));
