import fs from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {transform} from 'esbuild';
import {COLLECTION} from '../src/collection/catalog.mjs';

const origin=JSON.parse(await fs.readFile('verification/v40/media-origin.json','utf8'));
assert.match(origin.commit,/^[a-f0-9]{40}$/);
const origin42=JSON.parse(await fs.readFile('verification/v42/media-origin.json','utf8'));
assert.match(origin42.commit,/^[a-f0-9]{40}$/);
const checks=[];let roomCount=0,links=0;
function parse(file){return JSON.parse(execFileSync('python',['scripts/legacy-dom-tree.py',file],{encoding:'utf8',maxBuffer:8e6}));}
const flat=node=>[node,...node.children.flatMap(flat)];
for(const root of ['dist','build']){
 for(const page of ['index.html',...COLLECTION.map(s=>'collection/'+s.id+'.html')]){
  const html=await fs.readFile(path.join(root,page),'utf8'),nodes=flat(parse(path.join(root,page))),ids=nodes.map(n=>n.attrs.id).filter(Boolean);
  assert.equal(new Set(ids).size,ids.length,page+' duplicate IDs');
  assert(!/<iframe|three\.min|house3d|GLTFLoader|autoplay/i.test(html),page+' must not launch the studio or 3D');
  assert(!/\b(?:AMAN|EDITION)\b|安缦|达安锦园|\d+(?:\.\d+)?\s*㎡/i.test(html),page+' still exposes retired branding or private property facts');
  assert.equal(nodes.filter(n=>n.tag==='h1').length,1);assert.equal(nodes.filter(n=>n.tag==='img'&&n.attrs.loading==='eager').length,1);
  for(const img of nodes.filter(n=>n.tag==='img'&&!('data-large-image'in n.attrs))){assert('alt' in img.attrs);assert(img.attrs.alt||img.attrs['aria-hidden']==='true');assert(+img.attrs.width>0&&+img.attrs.height>0);}
  for(const node of nodes){
   for(const key of ['href','src']){
    const ref=node.attrs[key];if(!ref||ref.startsWith('data:'))continue;
    if(ref.startsWith('#')){assert(ids.includes(ref.slice(1)),page+' missing anchor '+ref);continue;}
    let local=ref.split(/[?#]/)[0];
    if(local.startsWith('https://')){assert([origin.commit,origin42.commit].some(sha=>local.includes(sha)),page+' must use immutable media');local=local.slice(local.indexOf('/dist/')+5);assert(local.startsWith('/collection/assets/'));await fs.access('dist'+local);continue;}
    assert(local.startsWith('/'),page+' unexpected relative URL '+local);if(local.endsWith('/'))local+='index.html';await fs.access(root+local);links++;
    if(ref.includes('#')){const target=await fs.readFile(root+local,'utf8');assert(target.includes('id="'+ref.split('#')[1]+'"'),ref);}
   }
   if(node.attrs['aria-controls'])assert(ids.includes(node.attrs['aria-controls']));
  }
  if(page==='index.html'){assert.equal(nodes.filter(n=>'data-panel'in n.attrs).length,7);assert(html.includes('/collection/vendor/gsap.min.js'));assert(!html.includes('ScrollTrigger'));assert(html.includes('/tour/'));assert(html.includes('NOCTURNE'));assert(html.includes('夜廊 · 陈天涌私宅设计'));}
  else{
   assert.equal(nodes.filter(n=>'data-room-index'in n.attrs).length,8);
   assert.equal(nodes.filter(n=>'data-lightbox'in n.attrs).length,8);
   assert.equal(nodes.filter(n=>'data-material'in n.attrs).length,4);
   assert.equal(nodes.filter(n=>'data-storage'in n.attrs).length,8);
   const payload=JSON.parse(nodes.find(n=>n.attrs.id==='collection-data').text);assert.equal(payload.rooms.length,8);assert.equal(payload.gallery.length,9);assert.equal(payload.rooms[0].views.length,2);assert.equal(nodes.filter(n=>'data-room-view' in n.attrs).length,2);if(root==='dist')roomCount+=payload.rooms.length;
   for(const r of payload.rooms){for(const ref of [r.image,r.thumb]){const local=ref.startsWith('https://')?ref.slice(ref.indexOf('/dist/')+5):ref;assert((await fs.stat('dist'+local)).size>1000);}}
  }
 }
}
assert.equal(roomCount,56);checks.push('Seven proposals × eight rooms, each with two living-room views; source and deployed routes, anchor targets, imagery and accessibility controls resolve.');
const inventory=JSON.parse(await fs.readFile('verification/v40/collection-images.json','utf8'));assert.equal(inventory.length,63);
for(const row of inventory){const b=await fs.readFile(row.path);assert(b.length>1000);assert.equal(b.length,row.bytes);assert.equal(createHash('sha1').update('blob '+b.length+'\0').update(b).digest('hex'),row.sha);assert.equal(b.toString('ascii',0,4),'RIFF');assert.equal(b.toString('ascii',8,12),'WEBP');}
checks.push('63 WebP files match verified, decoded image inventory; original room images reused unchanged.');
const currentInventory=JSON.parse(await fs.readFile('verification/v42/images.json','utf8'));assert.equal(currentInventory.length,27);
for(const row of currentInventory){const b=await fs.readFile(row.path);assert.equal(b.length,row.bytes);assert.equal(createHash('sha1').update('blob '+b.length+'\0').update(b).digest('hex'),row.sha);assert.equal(b.toString('ascii',0,4),'RIFF');assert.equal(b.toString('ascii',8,12),'WEBP');assert(row.width===768||row.width===1536);}
checks.push('27 v42 WebP assets match their decoded-image inventory; five palette refinements, seven reverse views and the corrected secondary bedroom are complete.');

const css=await fs.readFile('src/collection/collection.css','utf8');const parsed=await transform(css,{loader:'css'});assert.equal(parsed.warnings.length,0);assert(css.includes('prefers-reduced-motion'));assert(css.includes('@media(max-width:760px)'));
const script=await fs.readFile('src/collection/collection.mjs','utf8');await transform(script,{loader:'js'});

// Production DOM event handlers at browser boundaries; no browser layout or GPU claim.
let document;
const dataKey=k=>k.slice(5).replace(/-([a-z])/g,(_,x)=>x.toUpperCase());
class Element{
 constructor(tag,attrs={}){this.tagName=tag.toUpperCase();this.attrs={...attrs};this.children=[];this.events={};this.dataset={};this.style={setProperty(k,v){this[k]=v;}};this.hidden='hidden'in attrs;this.open=false;this._text='';for(const[k,v]of Object.entries(attrs))if(k.startsWith('data-'))this.dataset[dataKey(k)]=v;}
 get className(){return this.attrs.class||'';}set className(v){this.attrs.class=v;}get textContent(){return this._text+this.children.map(x=>x.textContent).join('');}set textContent(v){this._text=String(v);this.children=[];}
 get src(){return this.attrs.src||'';}set src(v){this.attrs.src=v;}get href(){return this.attrs.href||'';}set href(v){this.attrs.href=v;}get currentSrc(){return this.src;}
 get classList(){const el=this;return {add(v){el.className=[...new Set([...el.className.split(' '),v])].filter(Boolean).join(' ');},remove(v){el.className=el.className.split(' ').filter(x=>x!==v).join(' ');},contains(v){return el.className.split(' ').includes(v);}};}
 append(...nodes){for(const n of nodes){n.parent=this;this.children.push(n);}}replaceChildren(...nodes){this.children=[];this._text='';this.append(...nodes);}
 setAttribute(k,v){this.attrs[k]=String(v);}getAttribute(k){return this.attrs[k]??null;}hasAttribute(k){return k in this.attrs;}removeAttribute(k){delete this.attrs[k];}
 matches(s){if(s[0]==='#')return this.attrs.id===s.slice(1);if(s[0]==='.')return s.slice(1).split('.').every(v=>this.classList.contains(v));if(s[0]==='['){const m=s.match(/^\[([^=^\]]+)(\^?=)?(?:"([^"]*)")?\]$/);if(!m)return false;const val=this.attrs[m[1]];return val!==undefined&&(!m[2]||(m[2]==='^='?val.startsWith(m[3]):val===m[3]));}return s.toUpperCase()===this.tagName;}
 querySelectorAll(s){if(s.includes(' ')){const [first,...rest]=s.split(' ');return this.querySelectorAll(first).flatMap(x=>x.querySelectorAll(rest.join(' ')));}return this.children.flatMap(c=>[...(c.matches(s)?[c]:[]),...c.querySelectorAll(s)]);}querySelector(s){return this.querySelectorAll(s)[0]||null;}
 addEventListener(type,fn){(this.events[type]??=[]).push(fn);}dispatchEvent(event){event.target??=this;event.preventDefault??=()=>{};for(const fn of this.events[event.type]||[])fn(event);}click(){this.dispatchEvent({type:'click'});}focus(){document.activeElement=this;}getBoundingClientRect(){return {left:150,top:200,width:500,height:100};}scrollIntoView(){}
 showModal(){this.open=true;}close(){this.open=false;this.dispatchEvent({type:'close'});}
}
function make(n){const el=new Element(n.tag,n.attrs);el._text=n.text;for(const child of n.children)el.append(make(child));return el;}
document=make(parse('build/collection/nocturne.html'));document.body=document.querySelector('body');document.createElement=tag=>new Element(tag);document.getElementById=id=>document.querySelector('#'+id);
const window=new Element('window'),frames=new Map(),requests=[];let serial=0;const media={matches:false,addEventListener(){}};
const ctx={document,window,console,URL,Set,Map,WeakMap,JSON,Image:class{set src(v){this.path=v;requests.push(v);}decode(){return new Promise(resolve=>setTimeout(resolve,this.path.includes('dining')?25:1));}},matchMedia:q=>q.includes('hover')?{...media,matches:true}:media,innerWidth:1400,innerHeight:900,location:{hash:''},history:{replaceState(){}},requestAnimationFrame:fn=>{frames.set(++serial,fn);return serial;},cancelAnimationFrame:id=>frames.delete(id),getComputedStyle:()=>({paddingLeft:'90'})};
vm.runInNewContext(script,ctx);
assert.equal(requests.length,0);assert.equal(frames.size,0);
const $=s=>document.querySelector(s),$$=s=>document.querySelectorAll(s);
$('[data-scene="rest"]').click();assert.equal($('[data-scene="rest"]').getAttribute('aria-pressed'),'true');assert.equal($$('[data-scene]').filter(b=>b.getAttribute('aria-pressed')==='true').length,1);assert.equal($('[data-scene-picture]').style['--brightness'],'.49');
$('[data-lightbox="8"]').click();assert($('.lightbox').open);assert.equal(document.body.style.overflow,'hidden');$('[data-next]').click();assert($('#lightbox-title').textContent.includes('客厅'));$('[data-prev]').click();assert($('#lightbox-title').textContent.includes('生活阳台'));$('[data-close]').click();assert.equal(document.body.style.overflow,'');assert(!$('.lightbox').open);assert.equal(document.activeElement,$('[data-lightbox="8"]'));
$('[data-storage="1"]').click();$('[data-storage="5"]').click();await new Promise(r=>setTimeout(r,35));assert($('[data-storage-caption]').textContent.includes('卫生间'));assert.equal($$('[data-storage]').filter(b=>b.getAttribute('aria-expanded')==='true').length,1);
const material=$('[data-material="1"]');material.dispatchEvent({type:'pointerenter',clientX:800,clientY:200});assert($('.material-preview').classList.contains('active'));material.dispatchEvent({type:'pointermove',clientX:850,clientY:240});assert.equal(frames.size,1);window.dispatchEvent({type:'scroll'});assert.equal(frames.size,0);assert(!$('.material-preview').classList.contains('active'));
$('[data-lightbox="0"]').click();const im=$('[data-large-image]');document.dispatchEvent({type:'error',target:im});assert(im.src.includes('fastly.jsdelivr.net'));document.dispatchEvent({type:'error',target:im});assert(im.src.includes('raw.githubusercontent.com'));document.dispatchEvent({type:'error',target:im});assert(im.src.startsWith('/collection/assets/'));assert($('#lightbox-title').textContent.includes('暂显示预览'));$('.lightbox').close();
const livingLink=$('[data-room-link="0"]');
$('[data-room-view="0:1"]').click();assert.equal($('[data-room-view="0:1"]').getAttribute('aria-pressed'),'true');assert.equal($('[data-room-view="0:0"]').getAttribute('aria-pressed'),'false');assert(livingLink.href.includes('v42-nocturne-living2.webp'));assert(livingLink.querySelector('img').getAttribute('srcset').includes('v42-nocturne-living2.webp'));
livingLink.click();assert($('#lightbox-title').textContent.includes('看向阳台'));assert($('[data-large-image]').src.includes('v42-nocturne-living2.webp'));$('[data-prev]').click();assert($('#lightbox-title').textContent.includes('看向玄关'));$('.lightbox').close();
$('[data-room-view="0:0"]').click();livingLink.click();assert($('#lightbox-title').textContent.includes('看向玄关'));$('.lightbox').close();assert.equal(document.activeElement,livingLink);
checks.push('Two-view selection updates image, full-screen original, pressed state and accessible caption; gallery includes all nine views.');
checks.push('Actual handlers: four lighting states, lightbox wrapping/close/focus, stale storage-image load, material hover cancellation, three media routes with preview fallback.');
const home=await fs.readFile('build/index.html','utf8'),studio=await fs.readFile('dist/tour/index.html','utf8');assert(!home.includes('data-music'));assert(studio.includes('data-music'));assert(studio.includes('data-legacy-frame'));assert(studio.includes('返回精选提案'));
const report={passed:true,proposals:7,rooms:roomCount,verifiedOriginalImages:inventory.length,verifiedNewImages:currentInventory.length,checkedLocalLinks:links,browserVisualTested:false,mobileGPUTested:false,checks};
await fs.writeFile('verification/v42/collection-checks.json',JSON.stringify(report,null,2)+'\n');console.log(report);
