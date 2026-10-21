import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {transform} from 'esbuild';
const source=await fs.readFile('src/collection/home-motion.mjs','utf8');
const css=await fs.readFile('src/collection/home.css','utf8');
assert.equal((await transform(css,{loader:'css'})).warnings.length,0);
await transform(source,{loader:'js'});

// Exercise production event handlers with a deterministic timer and DOM boundary.
function fixture({reduced=false,compact=false,withGSAP=false}={}){
 let document,clock=0,serial=0,timers=new Map();
 class El{
  constructor(attrs={}){this.attrs={...attrs};this.dataset={};this.events={};this.style={setProperty(k,v){this[k]=v;}};this.disabled=false;this.tabIndex=0;this.tagName='DIV';this.classList={add:(...c)=>c.forEach(x=>this.classes.add(x)),remove:(...c)=>c.forEach(x=>this.classes.delete(x)),contains:c=>this.classes.has(c),toggle:(c,on)=>{on??=!this.classes.has(c);on?this.classes.add(c):this.classes.delete(c);return on;}};this.classes=new Set();}
  addEventListener(type,fn){(this.events[type]??=[]).push(fn);}
  emit(type,data={}){const event={type,target:this,button:0,preventDefault(){this.prevented=true;},...data};for(const fn of this.events[type]||[])fn(event);return event;}
  getAttribute(k){return this.attrs[k]??null;}setAttribute(k,v){this.attrs[k]=String(v);}removeAttribute(k){delete this.attrs[k];}
  querySelector(q){if(q==='img')return this.img;throw Error(q);}
  focus(){document.activeElement=this;this.emit('focus');}
  remove(){this.removed=true;}
 }
 const panels=new El(),track=new El(),intro=new El(),range=new El(),skip=new El(),body=new El();
 const cards=Array.from({length:10},(_,i)=>{const c=new El({href:'/collection/'+['nocturne','cashmere-hush','dusk','saddle-weave','flora','cinnabar','verdigris','stillwood','amber','inkcourt'][i]+'.html'});c.tagName='A';c.img=new El({src:`/preview-${i}.webp`});c.img.dataset.full=`/full-${i}.webp`;return c;});
 const edges=[-1,1].map(d=>{const e=new El();e.tagName='BUTTON';e.dataset.shift=String(d);return e;});
 document=new El();document.body=body;document.activeElement=body;document.hidden=false;
 document.querySelector=s=>({'.panels':panels,'.panel-track':track,'.intro':intro,'.range':range,'.skip-link':skip}[s]);document.querySelectorAll=s=>s==='[data-panel]'?cards:edges;
 const media={reduced:new El(),compact:new El(),fine:new El()};media.reduced.matches=reduced;media.compact.matches=compact;media.fine.matches=true;
 const location={assigned:null,assign(url){this.assigned=url;}};
 const window=new El(),timelineCalls=[];let onComplete;
 const tl={timeScale:n=>{timelineCalls.push(['timeScale',n]);return tl;},from:(...a)=>{timelineCalls.push(['from',...a]);return tl;},to:(...a)=>{timelineCalls.push(['to',...a]);return tl;},progress:n=>{if(n===1)onComplete?.();return tl;}};
 if(withGSAP)window.gsap={timeline:opts=>{onComplete=opts.onComplete;return tl;},to:(els,opts)=>{for(const e of Array.isArray(els)?els:[els])e.tween=opts;opts.onComplete?.();},set:(els,opts)=>{for(const e of els)e.cleared=opts.clearProps;}};
 const ctx={document,window,location,innerWidth:1440,console,matchMedia:q=>q.includes('reduced-motion')?media.reduced:q.includes('860px')?media.compact:media.fine,setTimeout:(fn,ms)=>{const id=++serial;timers.set(id,{fn,at:clock+ms});return id;},clearTimeout:id=>timers.delete(id)};
 vm.runInNewContext(source,ctx);
 function advance(ms){const end=clock+ms;for(let i=0;i<100;i++){const pending=[...timers].filter(([,t])=>t.at<=end).sort((a,b)=>a[1].at-b[1].at)[0];if(!pending)break;clock=pending[1].at;timers.delete(pending[0]);pending[1].fn();}clock=end;}
 return {document,window,panels,track,intro,range,skip,cards,edges,media,location,advance,timelineCalls,complete:()=>onComplete?.(),timers};
}
const f=fixture();
const visible=f=>f.cards.flatMap((c,i)=>c.tabIndex===0?[i]:[]);
assert.deepEqual(visible(f),[0,1,2]);assert(f.intro.removed);assert(f.edges[0].disabled);
assert.equal(f.cards.filter(c=>c.img.dataset.hydrated).length,3);
f.cards[1].emit('pointerenter');assert(f.cards[1].classList.contains('is-expanded'));
f.edges[1].emit('pointerenter');f.advance(649);assert.deepEqual(visible(f),[0,1,2]);
f.edges[1].emit('pointerleave');f.advance(1000);assert.deepEqual(visible(f),[0,1,2]);
f.edges[1].emit('pointerenter');f.advance(650);assert.deepEqual(visible(f),[1,2,3]);
f.edges[1].emit('pointerleave');f.advance(1250);assert.equal(f.timers.size,0);
f.cards[1].focus();f.document.emit('keydown',{key:'ArrowRight'});assert.deepEqual(visible(f),[2,3,4]);assert.equal(f.document.activeElement,f.cards[2]);
f.advance(1250);f.edges[1].emit('click');f.advance(1250);assert.deepEqual(visible(f),[3,4,5]);assert(!f.edges[1].disabled);
for(let i=0;i<4;i++){f.edges[1].emit('click');f.advance(1250);}
assert.deepEqual(visible(f),[7,8,9]);assert(f.edges[1].disabled);assert.equal(f.range.textContent,'08 — 10 / 10');
f.edges[1].emit('click');assert.deepEqual(visible(f),[7,8,9]);f.edges[0].emit('click');f.advance(1250);assert.deepEqual(visible(f),[6,7,8]);f.edges[0].emit('click');f.advance(1250);assert.deepEqual(visible(f),[5,6,7]);
f.edges[0].emit('pointerenter');f.document.hidden=true;f.document.emit('visibilitychange');f.advance(3000);assert.deepEqual(visible(f),[5,6,7]);assert.equal(f.timers.size,0);
f.media.compact.matches=true;f.media.compact.emit('change');assert.deepEqual(visible(f),[0,1,2,3,4,5,6,7,8,9]);
f.edges[0].emit('click');assert.deepEqual(visible(f),[0,1,2,3,4,5,6,7,8,9]);
const g=fixture({withGSAP:true});assert(!g.intro.removed);assert.equal(g.timelineCalls[0][1],2.5);
assert.equal(g.timelineCalls.find(x=>x[0]==='to'&&x[1]==='.intro')[2].clipPath,'inset(0 0 100% 0)');
g.complete();assert(g.intro.removed);
assert(!g.cards[0].emit('click',{ctrlKey:true}).prevented);assert.equal(g.location.assigned,null);
g.cards[1].emit('click');assert.equal(g.location.assigned,'/collection/cashmere-hush.html');
g.window.emit('pageshow',{persisted:true});assert(!g.panels.classList.contains('is-leaving'));assert.deepEqual(visible(g),[0,1,2]);assert.equal(g.cards[1].cleared,'opacity,flexBasis');
const r=fixture({reduced:true,withGSAP:true});assert(r.intro.removed);assert.equal(r.timelineCalls.length,0);r.edges[1].emit('pointerenter');r.advance(5000);assert.deepEqual(visible(r),[0,1,2]);r.edges[1].emit('click');r.advance(0);assert.deepEqual(visible(r),[1,2,3]);
const interrupted=fixture({withGSAP:true});interrupted.skip.emit('click');assert(interrupted.intro.removed);assert.equal(interrupted.document.activeElement,interrupted.cards[0]);

for(const base of ['dist','build']){
 const home=await fs.readFile(base+'/index.html','utf8');
 assert.equal((home.match(/data-panel=/g)||[]).length,10);
 assert(home.includes('<span>夜廊</span></div><div class="s">NOCTURNE</div>'));
 assert(!/庭见|庭间|达安锦园|hero-home|scheme-grid|workbench-section/.test(home));
 assert(home.includes('夜廊 · 陈天涌私宅设计'));assert(home.includes('进入全套方案工作台'));
 assert.deepEqual([...home.matchAll(/href="\/collection\/([^"]+)\.html"/g)].map(m=>m[1]),['nocturne','cashmere-hush','dusk','saddle-weave','flora','cinnabar','verdigris','stillwood','amber','inkcourt']);
 for(const id of ['nocturne','cashmere-hush','dusk','saddle-weave','flora','cinnabar','verdigris','stillwood','amber','inkcourt'])assert(home.includes(`/collection/${id}.html`));
}
const report={passed:true,browserVisualTested:false,originalSourceCommit:'ff47fb2fc96a18c3e7ba0c0ec6cabe7e56566352',checks:['Original entrance sequence, timing and easing retained; no redesigned homepage sections.','Ten direct proposal links; three-panel window, bounded arrows, hover dwell and hover cancellation.','Keyboard focus stays visible; hidden-tab cancellation; no idle interaction timer.','Original vertical mobile presentation, reduced-motion click navigation, animation-library fallback.','Modified-click navigation, click expansion, back-forward cache reset, skip entrance.','Night-gallery naming and requested ten-proposal order across current homepage.']};
await fs.mkdir('verification/v50',{recursive:true});await fs.writeFile('verification/v50/home-checks.json',JSON.stringify(report,null,2)+'\n');console.log(report);
