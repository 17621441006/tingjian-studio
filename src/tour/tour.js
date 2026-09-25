import {mountMusic} from '../music/player.mjs';
const root=document.querySelector('#daan-vr-v2'),frame=root.querySelector('[data-legacy-frame]'),lab=root.querySelector('[data-lab-frame]');
const player=mountMusic(root.querySelector('[data-music]'));
for(const b of root.querySelectorAll('[data-mode]'))b.addEventListener('click',()=>{
 const history=b.dataset.mode==='history';
 root.querySelector('[data-current-pane]').hidden=history;root.querySelector('[data-history-pane]').hidden=!history;
 for(const x of root.querySelectorAll('[data-mode]'))x.setAttribute('aria-pressed',String(x===b));
 if(history&&!lab.src)lab.src='/lab/';
 if(!history)lab.removeAttribute('src');
});
frame.src='/tour/legacy.html';
window.addEventListener('message',event=>{
 if(event.origin!==location.origin||event.source!==frame.contentWindow)return;
 if(event.data?.type==='tingjian:studio-height'){const h=Number(event.data.height);if(Number.isFinite(h))frame.style.height=Math.max(800,Math.min(9000,h))+'px';}
 if(event.data?.type==='tingjian:music-gesture')player.retryAutoplay();
 if(event.data?.type==='tingjian:music-theme')player.setTheme(event.data.design);
});
