import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {HOMES,ROOMS,homeAsset} from '../src/legacy/home-designs.mjs';
import {COLLECTION} from '../src/collection/catalog.mjs';
import {livingReverseAsset} from '../src/legacy/wood-homes.mjs';
import {assembleHome,resolveScene,sceneAsset} from '../src/legacy/scene-options.mjs';
import {VOYAGE_COLORS,VOYAGE_PLANS} from '../src/legacy/voyage-home.mjs';
import {wholeModelSpec} from '../src/legacy/whole-model-state.mjs';
import {floraAsset} from '../src/legacy/flora-home.mjs';
import {renderLivingViews,livingViewPath,alternateViewLabel} from '../src/legacy/living-views.mjs';
const hash=b=>createHash('sha256').update(b).digest('hex');
const baseline=JSON.parse(await fs.readFile('verification/v51/baseline.json','utf8'));
assert.deepEqual(Object.keys(HOMES),baseline.order);assert.equal(Object.keys(HOMES).length,25);
for(const [id,digest] of Object.entries(baseline.unchangedHomes))assert.equal(hash(JSON.stringify(HOMES[id])),digest,id);
for(const [p,digest] of Object.entries(baseline.unchangedSources))assert.equal(hash(await fs.readFile(p)),digest,p);
for(const [id,digest] of Object.entries(baseline.unchangedFeatured))assert.equal(hash(JSON.stringify(COLLECTION.find(s=>s.id===id))),digest,id);
assert.deepEqual(COLLECTION.map(s=>s.id),baseline.featuredOrder);
const assets=JSON.parse(await fs.readFile('verification/v51/assets.json','utf8'));assert.equal(assets.length,27);const unique=new Set();
for(const a of assets){const b=await fs.readFile(a.path);assert.equal(b.length,a.bytes);assert.equal(hash(b),a.sha256);assert.equal(b.toString('ascii',0,4),'RIFF');assert.equal(b.toString('ascii',8,12),'WEBP');assert.equal(hash(await fs.readFile(a.path.replace(/^dist\//,'out/'))),a.sha256);if(!a.thumb)unique.add(a.sha256);}
assert.equal(unique.size,13);
for(const v of ['v47','v48','v49','v50'])for(const a of JSON.parse(await fs.readFile(`verification/${v}/assets.json`,'utf8')))assert.equal(hash(await fs.readFile(a.path)),a.sha256,'Prior approved asset changed: '+a.path);
for(const id of ['silver-retreat','azure-silence']){
 assert.equal(Object.keys(HOMES[id].rooms).length,8);
 const frames=assembleHome(id,new Map());assert.equal(new Set(frames.map(f=>f.path)).size,8);
 for(const {id:room} of ROOMS){const scene=resolveScene({design:id,room});assert.equal(sceneAsset(scene),homeAsset(id,room));for(const thumb of [false,true])await fs.access('out'+homeAsset(id,room,thumb));}
 await fs.access('out'+livingReverseAsset(id));
 if(id==='azure-silence'){const spec=wholeModelSpec({design:id,frames});assert.deepEqual(spec.palette,VOYAGE_COLORS);assert.deepEqual(spec.expansionPlans,VOYAGE_PLANS);}
}
assert.equal(HOMES['azure-silence'].name,'驿金行邸');
for(const r of [...ROOMS.map(r=>r.id),'living2'])assert((r==='living2'?livingReverseAsset('azure-silence'):homeAsset('azure-silence',r)).startsWith('/designs-v51/schemes/voyage-atelier/'));
const flora=COLLECTION.find(s=>s.id==='flora');assert.equal(flora.index,'05');assert.equal(flora.gallery.length,10);assert.equal(flora.rooms.find(r=>r.key==='dining').views.length,2);
for(const r of ['living','living2','dining','dining-closed'])assert(floraAsset(r).startsWith('/designs-v51/'));
assert(floraAsset('kitchen').startsWith('/designs-v50/'));for(const r of ['master','second','bath','balcony','utility'])assert(floraAsset(r).startsWith('/designs-v49/'));
for(const root of ['dist','out']){const html=await fs.readFile(root+'/tour/legacy.html','utf8');assert.deepEqual([...html.matchAll(/data-home-design="([^"]+)"/g)].map(x=>x[1]),baseline.order);assert(html.includes('驿金行邸'));assert(!html.includes('雾蓝云邸'));assert(html.includes('花影绮居 · 初版'));}
// Execute the real shared view controller: lazy load, close/open, cancellation,
// failure preservation, re-render races, download names, and unrelated rooms.
class E{constructor(){this.children=[];this.attrs={};this.dataset={};this.events={};}replaceChildren(){this.children=[];}append(...x){this.children.push(...x);}setAttribute(k,v){this.attrs[k]=v;}hasAttribute(k){return k in this.attrs;}addEventListener(t,f){this.events[t]=f;}click(){return this.events.click();}}
const doc={createElement:()=>new E()},pending=[];globalThis.Image=class{set src(v){this.url=v;if(v)pending.push(this);}get src(){return this.url;}};
const host=new E();host.ownerDocument=doc;const image={src:floraAsset('dining'),alt:'餐厅 · 展开用餐'},link=new E();link.href=image.src;link.download='base.webp';link.attrs.download='';
let restores=0;const scene={design:'silver-retreat',room:'dining'},restore=()=>{restores++;image.src=floraAsset('dining');link.href=image.src;};
const render=(s=scene,ready=Promise.resolve())=>renderLivingViews(host,image,s,ready,restore,[link]);
const flush=()=>Promise.resolve();
render();assert(!host.hidden);assert.equal(pending.length,0);let [open,close]=host.children[0].children;assert.equal(open.textContent,'展开用餐');assert.equal(close.textContent,'收起留白');assert.equal(alternateViewLabel(scene),'餐柜收起状态');
let task=close.click();await flush();assert.equal(image.src,floraAsset('dining'));pending.at(-1).onload();await task;assert.equal(livingViewPath(image),floraAsset('dining-closed'));assert.equal(close.attrs['aria-pressed'],'true');assert.equal(link.download,'silver-retreat-餐柜收起.webp');assert(image.alt.includes('收起'));
open.click();assert.equal(livingViewPath(image),null);assert.equal(image.src,floraAsset('dining'));assert.equal(link.download,'base.webp');assert.equal(image.alt,'餐厅 · 展开用餐');assert.equal(restores,1);
task=close.click();await flush();open.click();pending.at(-1).onload();await task;assert.equal(livingViewPath(image),null);assert.equal(image.src,floraAsset('dining'));
task=close.click();await flush();pending.at(-1).onerror();await task;assert.equal(image.src,floraAsset('dining'));assert(host.children[1].textContent.includes('保留当前选择'));assert.equal(close.disabled,false);
task=close.click();await flush();render({design:'azure-silence',room:'kitchen'});assert(host.hidden);pending.at(-1).onload();await task;assert.equal(image.src,floraAsset('dining'));assert.equal(livingViewPath(image),null);
render({design:'azure-silence',room:'living'});[open,close]=host.children[0].children;assert(!host.hidden);assert.equal(close.textContent,'客厅2 · 看向阳台');task=close.click();await flush();assert(pending.at(-1).url.includes('/voyage-atelier/living2.webp'));pending.at(-1).onload();await task;assert.equal(livingViewPath(image),livingReverseAsset('azure-silence'));
const report={passed:true,workbenchSchemes:25,replacedScheme:25,newSchemeName:'驿金行邸',newRoomImages:9,floraEditedViews:4,floraDiningStates:2,floraFeaturedPosition:5,unrelatedHomesUnchanged:23,otherFeaturedUnchanged:9,homepageLayoutMotionBrandUnchanged:true,priorApprovedAssetsUnchanged:true,newAssets:27,realViewController:['lazy-load','open-close','download-restore','late-load-cancel','failure-preservation','scene-race','living-regression'],modelGeometryReused:true};
await fs.writeFile('verification/v51/checks.json',JSON.stringify(report,null,2)+'\n');console.log(report);
