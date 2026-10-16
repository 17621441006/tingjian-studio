const panels=document.querySelector('.panels');
const track=document.querySelector('.panel-track');
const cards=[...document.querySelectorAll('[data-panel]')];
const edges=[...document.querySelectorAll('[data-shift]')];
const intro=document.querySelector('.intro');
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const compact=matchMedia('(max-width:860px)');
const fine=matchMedia('(hover:hover) and (pointer:fine)');
const gsap=window.gsap;
let start=0,sliding=false,leaving=false,opening=false,hoverTimer=0,slideTimer=0,hoveredEdge=null,introTimeline=null;
const clearHover=()=>{clearTimeout(hoverTimer);hoverTimer=0;};
function collapse(){panels.classList.remove('is-expanded');cards.forEach(c=>c.classList.remove('is-expanded'));}
function expand(card){if(sliding||leaving||opening||compact.matches)return;collapse();panels.classList.add('is-expanded');card.classList.add('is-expanded');}
// First paint uses local images. Only visible panels request their full-resolution version.
function hydrateVisible(){
 for(const [i,card] of cards.entries()){
  if(!compact.matches&&(i<start||i>=start+3))continue;
  const img=card.querySelector('img');
  if(!img.dataset.full||img.dataset.hydrated)continue;
  img.dataset.hydrated='true';
  img.addEventListener('error',()=>{img.removeAttribute('srcset');},{once:true});
  img.sizes=compact.matches?'100vw':'(min-width:1800px) 60vw, 65vw';
  img.srcset=`${img.getAttribute('src')} 768w, ${img.dataset.full} 1536w`;
 }
}
function render(){
 track.style.setProperty('--start',start);
 cards.forEach((card,i)=>{
  const visible=compact.matches||(i>=start&&i<start+3);
  card.classList.toggle('is-visible',visible);
  card.tabIndex=visible?0:-1;
  if(visible)card.removeAttribute('aria-hidden');else card.setAttribute('aria-hidden','true');
 });
 edges[0].disabled=start===0;edges[1].disabled=start===cards.length-3;
 document.querySelector('.range').textContent=compact.matches?`01 — ${String(cards.length).padStart(2,'0')} / ${String(cards.length).padStart(2,'0')}`:`${String(start+1).padStart(2,'0')} — ${String(start+3).padStart(2,'0')} / ${String(cards.length).padStart(2,'0')}`;
 hydrateVisible();
}
function scheduleHover(delay=650){
 clearHover();
 if(!hoveredEdge||hoveredEdge.disabled||compact.matches||reduced.matches||!fine.matches||opening||leaving||document.hidden)return;
 hoverTimer=setTimeout(()=>shift(Number(hoveredEdge.dataset.shift)),delay);
}
function shift(direction){
 if(sliding||leaving||opening||compact.matches)return;
 const next=Math.max(0,Math.min(cards.length-3,start+direction));
 if(next===start){clearHover();return;}
 clearHover();collapse();sliding=true;panels.classList.add('is-sliding');
 const focused=document.activeElement;
 start=next;render();
 // Do not leave keyboard focus on a panel that just moved outside the viewport.
 if(cards.includes(focused)&&focused.tabIndex===-1)cards[start].focus({preventScroll:true});
 clearTimeout(slideTimer);
 slideTimer=setTimeout(()=>{sliding=false;panels.classList.remove('is-sliding');scheduleHover(800);},reduced.matches?0:1250);
}
cards.forEach(card=>{
 card.addEventListener('pointerenter',()=>{if(fine.matches)expand(card);});
 card.addEventListener('pointerleave',collapse);
 card.addEventListener('focus',()=>expand(card));
 card.addEventListener('blur',collapse);
 card.addEventListener('click',event=>{
  if(event.metaKey||event.ctrlKey||event.shiftKey||event.altKey||event.button>0)return;
  if(sliding||opening||leaving){event.preventDefault();return;}
  if(!gsap||reduced.matches||compact.matches)return;
  event.preventDefault();leaving=true;clearHover();collapse();panels.classList.add('is-leaving');
  const visible=cards.filter(c=>c.classList.contains('is-visible'));
  gsap.to(visible.filter(c=>c!==card),{opacity:0,flexBasis:0,duration:.5});
  gsap.to(card,{flexBasis:innerWidth,duration:.9,ease:'expo.inOut',onComplete:()=>location.assign(card.getAttribute('href'))});
 });
});
edges.forEach(edge=>{
 edge.addEventListener('click',()=>{clearHover();shift(Number(edge.dataset.shift));});
 edge.addEventListener('pointerenter',()=>{hoveredEdge=edge;collapse();scheduleHover();});
 edge.addEventListener('pointerleave',()=>{if(hoveredEdge===edge)hoveredEdge=null;clearHover();});
});
document.addEventListener('keydown',event=>{
 if(event.altKey||event.metaKey||event.ctrlKey||event.shiftKey||/^(INPUT|TEXTAREA|SELECT)$/.test(event.target.tagName))return;
 if(event.key==='ArrowLeft'||event.key==='ArrowRight'){event.preventDefault();hoveredEdge=null;shift(event.key==='ArrowRight'?1:-1);}
});
panels.addEventListener('wheel',event=>{if(Math.abs(event.deltaX)>35&&Math.abs(event.deltaX)>Math.abs(event.deltaY)){event.preventDefault();hoveredEdge=null;shift(Math.sign(event.deltaX));}},{passive:false});
// Horizontal swipes on touch laptops; phones retain the original vertical presentation.
let gesture=null;
panels.addEventListener('pointerdown',event=>{if(event.pointerType==='touch'&&!compact.matches)gesture={x:event.clientX,y:event.clientY};});
panels.addEventListener('pointerup',event=>{if(!gesture)return;const dx=event.clientX-gesture.x,dy=event.clientY-gesture.y;gesture=null;if(Math.abs(dx)>60&&Math.abs(dx)>Math.abs(dy)*1.5)shift(dx<0?1:-1);});
panels.addEventListener('pointercancel',()=>{gesture=null;});
function endOpening(){opening=false;intro?.remove();panels.classList.remove('is-opening');}
document.querySelector('.skip-link').addEventListener('click',()=>{introTimeline?.progress(1);endOpening();cards[start].focus({preventScroll:true});});
render();
if(gsap&&!reduced.matches){
 opening=true;panels.classList.add('is-opening');
 introTimeline=gsap.timeline({onComplete:endOpening});
 // Identical timing, easing and sequence to the original entrance.
 introTimeline.timeScale(2.5);
 introTimeline.from('.intro .t span',{yPercent:110,duration:1.3,ease:'expo.out'})
  .from('.intro .s',{opacity:0,y:10,duration:.9},'-=.7')
  .to('.intro',{clipPath:'inset(0 0 100% 0)',duration:1.3,ease:'expo.inOut',delay:.5})
  .from(cards.filter(c=>c.classList.contains('is-visible')),{yPercent:12,opacity:0,duration:1.4,ease:'expo.out',stagger:.12},'-=.8')
  .from('.top,.foot,.edge-nav',{opacity:0,duration:1},'-=.8')
  // Join the existing entrance at time zero without extending its sequence.
  .from('.intro-mark',{opacity:0,y:12,duration:1.3,ease:'expo.out'},0);
}else endOpening();
function reset(){clearHover();clearTimeout(slideTimer);hoveredEdge=null;sliding=false;leaving=false;collapse();panels.classList.remove('is-sliding','is-leaving');if(gsap)gsap.set(cards,{clearProps:'opacity,flexBasis'});render();}
compact.addEventListener('change',reset);
reduced.addEventListener('change',()=>{if(reduced.matches){introTimeline?.progress(1);endOpening();}reset();});
document.addEventListener('visibilitychange',()=>{document.body.classList.toggle('motion-paused',document.hidden);if(document.hidden){clearHover();hoveredEdge=null;}});
window.addEventListener('pagehide',()=>{clearHover();clearTimeout(slideTimer);});
window.addEventListener('pageshow',event=>{if(event.persisted){reset();endOpening();}});
