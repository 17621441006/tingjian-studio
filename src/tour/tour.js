import {mountMusic} from '../music/player.mjs';
const root=document.querySelector('#daan-vr-v2'),frame=root.querySelector('[data-legacy-frame]'),lab=root.querySelector('[data-lab-frame]');
const player=mountMusic(root.querySelector('[data-music]'));
const studioNav=root.querySelector('[data-studio-nav]');let studioReady=false,historyMode=false;
const tellStudio=message=>frame.contentWindow?.postMessage(message,location.origin);
frame.addEventListener('load',()=>tellStudio({type:'tingjian:nav-host'}));
for(const b of root.querySelectorAll('[data-studio-step]'))b.addEventListener('click',()=>{if(!b.disabled)tellStudio({type:'tingjian:nav-select',step:b.dataset.studioStep});});
for(const b of root.querySelectorAll('[data-mode]'))b.addEventListener('click',()=>{
 const history=b.dataset.mode==='history';historyMode=history;studioNav.hidden=history||!studioReady;
 root.querySelector('[data-current-pane]').hidden=history;root.querySelector('[data-history-pane]').hidden=!history;
 for(const x of root.querySelectorAll('[data-mode]'))x.setAttribute('aria-pressed',String(x===b));
 if(history&&!lab.src)lab.src='/lab/';
 if(!history)lab.removeAttribute('src');
});
frame.src='/tour/legacy.html';
window.addEventListener('message',event=>{
 if(event.origin!==location.origin||event.source!==frame.contentWindow)return;
 if(event.data?.type==='tingjian:nav-state'&&Array.isArray(event.data.steps)){
  studioReady=true;studioNav.hidden=historyMode;
  for(const b of root.querySelectorAll('[data-studio-step]')){const step=event.data.steps.find(s=>s.id===b.dataset.studioStep);b.disabled=!step||step.disabled;b.setAttribute('aria-current',step?.current?'step':'false');}
  tellStudio({type:'tingjian:nav-host'});
 }
 if(event.data?.type==='tingjian:studio-height'){const h=Number(event.data.height);if(Number.isFinite(h))frame.style.height=Math.max(800,Math.ceil(h))+'px';}
 if(event.data?.type==='tingjian:studio-top')frame.scrollIntoView({block:'start',behavior:'auto'});
 if(event.data?.type==='tingjian:music-gesture')player.retryAutoplay();
 if(event.data?.type==='tingjian:music-theme')player.setTheme(event.data.design);
});
