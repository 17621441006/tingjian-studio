// Executes event handlers against a small DOM test double. This is not a browser or a visual UI test.
import fs from 'node:fs/promises';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {nodes} from '../src/tour/tour-data.mjs';
import {styles} from '../src/tour/styles.mjs';
const tree=JSON.parse(execFileSync('python',['scripts/dom-tree.py','dist/index.html'],{encoding:'utf8'}));
const withoutGL=process.argv.includes('--no-webgl');
let contextRequests=0,drawCalls=0;const imageRequests=[];
const frames=[];let serial=0;
const dataKey=s=>s.slice(5).replace(/-([a-z])/g,(_,c)=>c.toUpperCase());
const gl=new Proxy({COMPILE_STATUS:1,LINK_STATUS:2,getShaderParameter:()=>true,getProgramParameter:()=>true,createShader:()=>({}),createProgram:()=>({}),createBuffer:()=>({}),createTexture:()=>({}),drawArrays:()=>{drawCalls++;},getUniformLocation:()=>({}),getAttribLocation:()=>0},{get:(o,k)=>k in o?o[k]:(()=>{})});
class Element{
 constructor(tag='div',attrs={}){this.tagName=tag.toUpperCase();this.attrs={...attrs};this.children=[];this.dataset={};this.style={};this.events={};this.hidden='hidden'in attrs;this.textContent='';this.clientWidth=960;this.clientHeight=600;this.naturalWidth=0;this.naturalHeight=0;this._classes=new Set((attrs.class||'').split(' '));for(const[k,v]of Object.entries(attrs))if(k.startsWith('data-'))this.dataset[dataKey(k)]=v;this.classList={add:x=>this._classes.add(x),remove:x=>this._classes.delete(x),contains:x=>this._classes.has(x),toggle:(x,force)=>{const yes=force??!this._classes.has(x);yes?this._classes.add(x):this._classes.delete(x);return yes;}};}
 set className(v){this._classes=new Set(v.split(' '));}get className(){return[...this._classes].join(' ');}
 append(...els){for(const el of els){el.parent=this;this.children.push(el);}}
 prepend(el){el.parent=this;this.children.unshift(el);}
 replaceChildren(...els){this.children=[];this.append(...els);}
 replaceWith(el){const p=this.parent;p.children[p.children.indexOf(this)]=el;el.parent=p;}
 setAttribute(k,v){this.attrs[k]=String(v);if(k.startsWith('data-'))this.dataset[dataKey(k)]=String(v);}
 removeAttribute(k){delete this.attrs[k];if(k==='src')this._src=undefined;if(k==='srcdoc')delete this.srcdoc;}
 getAttribute(k){return this.attrs[k]??null;}
 matches(sel){if(sel.startsWith('[')){const m=sel.match(/^\[([^=\]]+)(?:="([^"]*)")?\]$/);const value=m[1].startsWith('data-')?this.dataset[dataKey(m[1])]:this.attrs[m[1]];return value!==undefined&&(m[2]===undefined||value===m[2]);}return this.tagName===sel.toUpperCase();}
 querySelectorAll(sel){return this.children.flatMap(c=>[...(c.matches(sel)?[c]:[]),...c.querySelectorAll(sel)]);}
 querySelector(sel){return this.querySelectorAll(sel)[0]||null;}
 addEventListener(name,fn){(this.events[name]??=[]).push(fn);}
 emit(name,event={}){for(const fn of this.events[name]||[])fn({currentTarget:this,target:this,button:0,preventDefault(){},...event});}
 setPointerCapture(){}
 getContext(type){contextRequests++;assert.equal(type,'webgl','CPU panorama fallback must not be used');return withoutGL?null:gl;}
 click(){this.emit('click');}
 set src(v){this._src=v;if(this.tagName==='IMG'||this.tagName==='DIV')imageRequests.push(v);this.naturalWidth=v?.includes(':pano')?1774:1586;this.naturalHeight=v?.includes(':pano')?887:992;this.width=this.naturalWidth;this.height=this.naturalHeight;queueMicrotask(()=>{this.onload?.();this.emit('load');});}get src(){return this._src;}
}
function make(t){const e=new Element(t.tag,t.attrs);e.textContent=t.text;for(const c of t.children)e.append(make(c));return e;}
const root=make(tree),document=new Element('document');document.append(root);document.hidden=false;
document.getElementById=id=>root.attrs.id===id?root:null;document.createElement=tag=>new Element(tag);document.createElementNS=(_,tag)=>new Element(tag);
const assets={};for(const s of styles){assets[s.id]={};for(const n of nodes)assets[s.id][n.id]={hd:`image:${s.id}:${n.id}:hd`,pano:`image:${s.id}:${n.id}:pano`,poster:`image:${s.id}:${n.id}:poster`,thumb:`image:${s.id}:${n.id}:thumb`};}
root.querySelector('[data-assets]').textContent=JSON.stringify(assets);root.querySelector('[data-legacy-source]').textContent=Buffer.from('<p>Legacy viewer retained</p>').toString('base64');
const context={document,Image:Element,matchMedia:()=>({matches:true}),ResizeObserver:class{observe(){}},IntersectionObserver:class{observe(){}},requestAnimationFrame:fn=>{frames.push(fn);return++serial;},cancelAnimationFrame:()=>{frames.length=0;},devicePixelRatio:2,console,Uint8Array,TextDecoder,atob:s=>Buffer.from(s,'base64').toString('binary'),setTimeout:fn=>{queueMicrotask(fn);return 1;},clearTimeout(){}};
const windowEvents={};context.window={addEventListener(name,fn){windowEvents[name]=fn;}};context.location={search:'',origin:'https://test.invalid'};context.URLSearchParams=URLSearchParams;
vm.runInNewContext(await fs.readFile(new URL('../dist/tour/tour.js',import.meta.url),'utf8'),context);
async function settle(){for(let i=0;i<15;i++){await new Promise(r=>setImmediate(r));const queued=frames.splice(0);queued.forEach(fn=>fn());}}
async function click(selector){const el=root.querySelector(selector);assert(el,'Missing '+selector);el.emit('click');await settle();return el;}
const results=[];
await settle();
assert(root.querySelector('[data-vr-pane]').hidden);
assert.equal(root.querySelector('[data-mode="legacy"]').getAttribute('aria-pressed'),'true');
assert.equal(root.querySelector('[data-legacy-frame]').src,'/tour/legacy.html');
assert.equal(contextRequests,0,'The design workspace must not initialize the panorama renderer');
assert(!imageRequests.some(x=>x.endsWith(':pano')||x.endsWith(':hd')),'The workspace must not load other browsing modes');
const studio=root.querySelector('[data-legacy-frame]');studio.contentWindow={};
windowEvents.message({source:studio.contentWindow,origin:context.location.origin,data:{type:'tingjian:studio-height',height:1240}});assert.equal(studio.style.height,'1240px');
windowEvents.message({source:{},origin:context.location.origin,data:{type:'tingjian:studio-height',height:2000}});assert.equal(studio.style.height,'1240px');
results.push('The design workspace is the default, with no panorama WebGL work and origin-checked automatic height');
await click('[data-mode="hd"]');
assert(root.classList.contains('dv-hd'));assert.equal(root.querySelector('canvas').hidden,true);
assert.equal(contextRequests,0,'Home must not initialize WebGL');
assert.equal(new Set(imageRequests.filter(x=>x.endsWith(':hd'))).size,1,'Only the selected full-size image loads');
assert(!imageRequests.some(x=>x.endsWith(':pano')||x.endsWith(':poster')),'Home must not request panorama/poster assets');
assert.equal(root.querySelector('[data-legacy-frame]').src,'/tour/legacy.html','The editing frame is retained while browsing');
assert(root.querySelector('[data-destinations]').children.length>0);
results.push('HD mode loads only the selected full image and never initializes panorama WebGL');
if(withoutGL){
 await click('[data-mode="vr"]');assert(root.classList.contains('dv-hd'));assert.equal(contextRequests,1);
 assert.equal(root.querySelector('[data-mode-notice]').hidden,false);assert(root.querySelector('[data-mode-notice]').textContent.includes('暂不可用'));
 assert(!imageRequests.some(x=>x.endsWith(':pano')));
 root.querySelector('[data-destinations]').children[0].emit('click');await settle();assert.notEqual(root.querySelector('[data-scene]').textContent,'客厅');
 console.log(JSON.stringify({passed:true,scenario:'No WebGL: HD fallback, visible explanation, room navigation intact, no CPU renderer'}));process.exit(0);
}
const route=root.querySelector('[data-destinations]').children[0];route.emit('click');await settle();assert.notEqual(root.querySelector('[data-scene]').textContent,'客厅');
results.push('Persistent neighboring-room buttons move through the home in HD');await click('[data-go="living"]');

for(const s of styles){await click(`[data-style="${s.id}"]`);for(const n of nodes){await click(`[data-go="${n.id}"]`);assert.equal(root.querySelector('[data-hd-image]').src,`image:${s.id}:${n.id}:hd`);assert.equal(root.querySelector('[data-scene]').textContent,n.name);assert.equal(root.querySelector('[data-stage]').getAttribute('aria-busy'),'false');assert.equal(root.querySelector('[data-hd-download]').download,`${s.id}-${n.id}-hd.jpg`);}}
results.push('All 32 style/room combinations load the intended HD image, caption and download');
await click('[data-hd-native]');assert.equal(root.querySelector('[data-hd-percent]').textContent,'100%');assert(root.querySelector('[data-hd-in]').disabled);
const wrap=root.querySelector('[data-hd-wrap]');wrap.emit('pointerdown',{pointerId:1,clientX:0,clientY:0});wrap.emit('pointermove',{pointerId:1,clientX:10000,clientY:-10000});await settle();assert(root.querySelector('[data-hd-image]').style.transform.includes('translate(313px,-196px)'));wrap.emit('pointerup');
await click('[data-hd-fit]');assert.equal(root.querySelector('[data-hd-percent]').textContent,'60%');assert(root.querySelector('[data-hd-out]').disabled);results.push('Native zoom, fit and extreme drags clamp correctly');
await click('[data-enter-vr]');assert.equal(contextRequests,1);assert(drawCalls>0);assert.equal(root.querySelector('[data-hd-wrap]').hidden,true);assert.equal(root.querySelector('canvas').hidden,false);assert.equal(root.querySelector('[data-hotspots]').hidden,false);assert.equal(root.querySelector('[data-scene]').textContent,'卫生间');assert.equal(root.querySelector('[data-style="future"]').getAttribute('aria-pressed'),'true');
const beforeIdle=drawCalls;await settle();assert.equal(drawCalls,beforeIdle,'Panorama must not run a continuous animation loop');
await click('[data-mode="hd"]');const afterHD=drawCalls;await settle();assert.equal(drawCalls,afterHD);assert.equal(root.querySelector('[data-hd-image]').src,'image:future:bath:hd');results.push('Switching HD / panorama retains room and style and restores the proper controls');
root.querySelector('[data-style="east"]').emit('click');root.querySelector('[data-style="wabi"]').emit('click');root.querySelector('[data-style="haipai"]').emit('click');await settle();assert.equal(root.querySelector('[data-hd-image]').src,'image:haipai:bath:hd');results.push('Rapid style changes commit only the final request');
await click('[data-mode="legacy"]');assert(root.querySelector('[data-vr-pane]').hidden);assert.equal(studio.src,'/tour/legacy.html');await click('[data-mode="hd"]');assert(!root.querySelector('[data-vr-pane]').hidden);assert.equal(studio.src,'/tour/legacy.html');await click('[data-mode="legacy"]');assert.equal(studio.src,'/tour/legacy.html');await click('[data-mode="hd"]');results.push('Changing browsing modes retains the editing frame and its unsaved scheme choices');
await click('[data-show-map]');assert(!root.querySelector('[data-map]').hidden);await click('[data-close-map]');assert(root.querySelector('[data-map]').hidden);
await click('[data-show-features]');assert(!root.querySelector('[data-detail-panel]').hidden);await click('[data-close-feature]');assert(root.querySelector('[data-detail-panel]').hidden);results.push('Map and design notes still open and close');
const report={passed:true,browserUITested:false,method:'Bundled application event handlers in a Node VM with DOM, image-loading and WebGL test doubles; verifies application state, not browser rendering.',checks:results};
await fs.writeFile(new URL('../verification/ui-state.json',import.meta.url),JSON.stringify(report,null,2));console.log(JSON.stringify(report));
