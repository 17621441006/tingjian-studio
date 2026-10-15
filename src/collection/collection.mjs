const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const data=JSON.parse($('#collection-data')?.textContent||'null');
let horizontalTrigger=null,horizontalTween=null,gsapMedia=null;

// The deployed copy uses an immutable image commit, with independent fallback routes.
function collectionMediaRoutes(path){
 const m=path.match(/^https:\/\/(?:raw\.githubusercontent\.com\/17621441006\/tingjian-studio\/([a-f0-9]{40})\/dist|(?:cdn|fastly)\.jsdelivr\.net\/gh\/17621441006\/tingjian-studio@([a-f0-9]{40})\/dist)(\/collection\/assets\/[^?#]+)$/);
 if(!m)return [];const sha=m[1]||m[2],tail=m[3];return [`https://cdn.jsdelivr.net/gh/17621441006/tingjian-studio@${sha}/dist${tail}`,`https://fastly.jsdelivr.net/gh/17621441006/tingjian-studio@${sha}/dist${tail}`,`https://raw.githubusercontent.com/17621441006/tingjian-studio/${sha}/dist${tail}`];
}
const imageAttempts=new WeakMap();
document.addEventListener('error',event=>{
 const img=event.target;if(img?.tagName!=='IMG')return;const src=img.currentSrc||img.src,routes=collectionMediaRoutes(src);if(!routes.length)return;
 const key=routes[0];let state=imageAttempts.get(img);if(state?.key!==key){state={key,tried:new Set()};imageAttempts.set(img,state);}state.tried.add(src);const next=routes.find(url=>!state.tried.has(url));img.removeAttribute('srcset');
 if(next){img.src=next;return;}const previewPath=img.getAttribute('data-preview');
 if(previewPath?.startsWith('/')){img.src=previewPath;if(img.hasAttribute('data-large-image'))$('#lightbox-title').textContent+=' · 暂显示预览';}
},true);

// Content is visible without JavaScript; reveals are progressive enhancements.
if(!reduced.matches&&'IntersectionObserver' in window){
 const observer=new IntersectionObserver(entries=>{for(const e of entries)if(e.isIntersecting){e.target.classList.remove('pending');e.target.classList.add('ready');observer.unobserve(e.target);}},{rootMargin:'0px 0px 45px 0px',threshold:.06});
 for(const el of $$('.reveal')){if(el.getBoundingClientRect().top>innerHeight){el.classList.add('pending');observer.observe(el);}}
 reduced.addEventListener('change',()=>{if(reduced.matches){observer.disconnect();for(const el of $$('.reveal.pending'))el.classList.remove('pending');}});
}

// Native scrolling and ScrollTrigger sleep when idle; no perpetual smooth-scroll RAF.
if(data&&window.gsap&&window.ScrollTrigger){
 const {gsap,ScrollTrigger}=window;gsap.registerPlugin(ScrollTrigger);gsapMedia=gsap.matchMedia();
 gsapMedia.add('(prefers-reduced-motion: no-preference)',()=>{
  const lead=$('[data-text-reveal]');
  if(lead){const text=lead.textContent;lead.setAttribute('aria-label',text);lead.replaceChildren(...Array.from(text,ch=>{const span=document.createElement('span');span.textContent=ch;span.setAttribute('aria-hidden','true');return span;}));gsap.fromTo(lead.children,{opacity:.23},{opacity:1,stagger:.08,ease:'none',scrollTrigger:{trigger:lead,start:'top 83%',end:'bottom 44%',scrub:.6}});}
  return()=>{if(lead){lead.textContent=lead.getAttribute('aria-label');lead.removeAttribute('aria-label');}};
 });
 gsapMedia.add('(min-width:1101px) and (min-height:720px) and (pointer:fine) and (prefers-reduced-motion:no-preference)',()=>{
  if(data.layout==='horizontal'){
   const shell=$('.horizontal-shell'),track=$('.gallery-track'),bar=$('.gallery-progress i');shell.classList.add('is-pinned');
   const distance=()=>Math.max(0,track.scrollWidth-shell.clientWidth);
   horizontalTween=gsap.to(track,{x:()=>-distance(),ease:'none',scrollTrigger:{trigger:shell,start:'top 68px',end:()=>'+='+distance(),pin:true,scrub:.65,invalidateOnRefresh:true,onUpdate:self=>bar.style.transform=`scaleX(${self.progress})`}});
   horizontalTrigger=horizontalTween.scrollTrigger;
   return()=>{horizontalTrigger=null;horizontalTween=null;shell.classList.remove('is-pinned');bar.style.transform='';};
  }
  if(data.layout==='stack'){
   const gallery=$('[data-gallery]');gallery.classList.add('stack-enabled');const cards=$$('.room-card');
   for(let i=0;i<cards.length-1;i++)gsap.to(cards[i],{scale:.965,transformOrigin:'center top',ease:'none',scrollTrigger:{trigger:cards[i+1],start:'top 82%',end:'top 90px',scrub:true}});
   return()=>gallery.classList.remove('stack-enabled');
  }
 });
 const refresh=()=>ScrollTrigger.refresh();
 if(document.readyState==='complete')refresh();else window.addEventListener('load',refresh,{once:true});
 document.fonts?.ready.then(refresh);
}

function goToRoom(index){
 const room=$(`[data-room-index="${index}"]`);if(!room)return;
 if(horizontalTrigger){const track=$('.gallery-track'),max=track.scrollWidth-innerWidth;const x=Math.max(0,Math.min(max,room.offsetLeft-parseFloat(getComputedStyle(track).paddingLeft)));const p=max?x/max:0;window.scrollTo({top:horizontalTrigger.start+p*(horizontalTrigger.end-horizontalTrigger.start),behavior:reduced.matches?'auto':'smooth'});}
 else room.scrollIntoView({block:'start',behavior:reduced.matches?'auto':'smooth'});
}
for(const a of $$('[data-room-jump]'))a.addEventListener('click',e=>{const index=data?.rooms.findIndex(r=>r.key===a.dataset.roomJump);if(index>=0){e.preventDefault();history.replaceState(null,'',a.getAttribute('href'));goToRoom(index);}});
for(const a of $$('[data-lightbox]'))a.addEventListener('focus',()=>{if(horizontalTrigger)goToRoom(Number(a.dataset.lightbox));});
if(data&&location.hash.startsWith('#room-'))window.addEventListener('load',()=>{const i=data.rooms.findIndex(r=>'#room-'+r.key===location.hash);if(i>=0)goToRoom(i);},{once:true});

if('IntersectionObserver' in window){
 const chapters=new IntersectionObserver(entries=>{for(const e of entries)if(e.isIntersecting){for(const a of $$('.chapter-nav a[href^="#"]'))a.setAttribute('aria-current',String(a.hash==='#'+e.target.id));}},{rootMargin:'-12% 0px -68% 0px',threshold:0});for(const el of $$('[data-chapter]'))chapters.observe(el);
}

// Accessible native dialog; only the opened original is requested.
const dialog=$('.lightbox');let currentImage=0,lastFocus=null;
function showImage(index){if(!data)return;currentImage=(index+data.rooms.length)%data.rooms.length;const r=data.rooms[currentImage],img=$('[data-large-image]');imageAttempts.delete(img);img.setAttribute('data-preview',r.thumb);img.src=r.image;img.alt=data.cn+' · '+r.cn+'设计意向';$('#lightbox-title').textContent=`${String(currentImage+1).padStart(2,'0')} / ${r.cn}`;$('[data-original]').href=r.image;}
for(const a of $$('[data-lightbox]'))a.addEventListener('click',e=>{if(typeof dialog?.showModal!=='function')return;e.preventDefault();lastFocus=a;showImage(Number(a.dataset.lightbox));dialog.showModal();document.body.style.overflow='hidden';});
$('[data-close]')?.addEventListener('click',()=>dialog.close());
dialog?.addEventListener('close',()=>{document.body.style.overflow='';$('[data-large-image]').removeAttribute('src');lastFocus?.focus({preventScroll:true});});
dialog?.addEventListener('click',e=>{if(e.target===dialog)dialog.close();});
dialog?.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'){e.preventDefault();showImage(currentImage-1);}if(e.key==='ArrowRight'){e.preventDefault();showImage(currentImage+1);}});
$('[data-prev]')?.addEventListener('click',()=>showImage(currentImage-1));$('[data-next]')?.addEventListener('click',()=>showImage(currentImage+1));

// Texture preview follows only while moving. Clamp it to the viewport, cancel when hidden.
const preview=$('.material-preview');let raf=0,px=-300,py=-300,tx=0,ty=0,materialActive=false;
const hover=matchMedia('(hover:hover) and (pointer:fine) and (min-width:761px)');
function hideMaterial(){materialActive=false;preview?.classList.remove('active');cancelAnimationFrame(raf);raf=0;}
function animateMaterial(){raf=0;if(!materialActive)return;px+=(tx-px)*.2;py+=(ty-py)*.2;preview.style.transform=`translate3d(${px}px,${py}px,0) rotate(-4deg)`;if(Math.abs(px-tx)+Math.abs(py-ty)>.4)raf=requestAnimationFrame(animateMaterial);}
function aim(x,y){tx=Math.max(12,Math.min(innerWidth-238,x+28));ty=Math.max(12,Math.min(innerHeight-282,y-120));if(!raf)raf=requestAnimationFrame(animateMaterial);}
function showMaterial(row,x,y){if(!hover.matches||reduced.matches||!preview)return;const m=data.materials[Number(row.dataset.material)];preview.style.setProperty('--swatch',m.color);preview.style.setProperty('--texture',m.texture);preview.querySelector('span').textContent=m.en+' / '+m.cn;materialActive=true;tx=Math.max(12,Math.min(innerWidth-238,x+28));ty=Math.max(12,Math.min(innerHeight-282,y-120));px=tx;py=ty;preview.style.transform=`translate3d(${px}px,${py}px,0) rotate(-4deg)`;preview.classList.add('active');}
for(const row of $$('[data-material]')){row.addEventListener('pointerenter',e=>showMaterial(row,e.clientX,e.clientY));row.addEventListener('pointermove',e=>{if(materialActive)aim(e.clientX,e.clientY);});row.addEventListener('pointerleave',hideMaterial);row.addEventListener('focus',()=>{const r=row.getBoundingClientRect();showMaterial(row,r.left+30,r.top+40);});row.addEventListener('blur',hideMaterial);}
window.addEventListener('scroll',hideMaterial,{passive:true});window.addEventListener('resize',hideMaterial,{passive:true});document.addEventListener('visibilitychange',()=>{if(document.hidden)hideMaterial();});reduced.addEventListener('change',hideMaterial);

for(const button of $$('[data-scene]'))button.addEventListener('click',()=>{const scene=data.scenes.find(s=>s.id===button.dataset.scene);if(!scene)return;for(const b of $$('[data-scene]'))b.setAttribute('aria-pressed',String(b===button));const picture=$('[data-scene-picture]');for(const key of ['brightness','warmth','contrast'])picture.style.setProperty('--'+key,scene[key]);$('[data-scene-label]').textContent=scene.en;$('[data-scene-title]').textContent=scene.title;$('[data-scene-copy]').textContent=scene.copy;});

let storageRequest=0;
for(const button of $$('[data-storage]'))button.addEventListener('click',async()=>{
 const i=Number(button.dataset.storage),room=data.rooms[i],request=++storageRequest;
 for(const b of $$('[data-storage]')){const expanded=b===button;b.setAttribute('aria-expanded',String(expanded));b.querySelector('span').textContent=expanded?'−':'＋';document.getElementById(b.getAttribute('aria-controls')).hidden=!expanded;}
 const picture=$('.storage-image img'),candidate=new Image();candidate.src=room.thumb;
 try{await candidate.decode();if(request!==storageRequest)return;picture.removeAttribute('srcset');picture.removeAttribute('sizes');picture.src=room.thumb;picture.alt=data.cn+' · '+room.cn+'收纳意向';$('[data-storage-caption]').textContent=room.cn+' / '+room.title;}catch{if(request===storageRequest)$('[data-storage-caption]').textContent=room.cn+' / 图片暂未载入，可在上方空间画廊查看。';}
});
window.addEventListener('pagehide',()=>{hideMaterial();if(dialog?.open)dialog.close();});
