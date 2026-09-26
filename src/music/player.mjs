import {TRACKS} from './catalog.mjs';
export function createMusicPlayer(audio,{onChange=()=>{},save=()=>{},volume=.3}={}){
 let index=0,enabled=false,blocked=false,theme=null,revision=0;
 audio.preload='metadata';audio.volume=volume;
 const state=()=>({index,enabled,blocked,theme,volume,track:TRACKS[index]});
 const notify=()=>{onChange(state());save({volume,enabled});};
 async function play(){const token=++revision;try{await audio.play();if(token!==revision){if(!enabled)audio.pause();return;}blocked=false;notify();}catch(error){if(token===revision){if(error?.name==='NotAllowedError'){blocked=true;}else{enabled=false;blocked=false;}notify();}}}
 function choose(i){index=(i+TRACKS.length)%TRACKS.length;revision++;audio.pause();audio.src=TRACKS[index].path+'?v='+TRACKS[index].sha256.slice(0,10);audio.currentTime=0;notify();if(enabled)play();}
 function start(){enabled=true;if(!audio.getAttribute('src'))audio.src=TRACKS[index].path+'?v='+TRACKS[index].sha256.slice(0,10);play();notify();}
 function toggle(){if(!enabled){start();return;}enabled=false;blocked=false;revision++;audio.pause();notify();}
 function setTheme(id){if(theme===id||!TRACKS.some(t=>t.id===id))return;theme=id;choose(TRACKS.findIndex(t=>t.id===id));}
 audio.addEventListener('ended',()=>{if(enabled)choose(index+1);});
 audio.addEventListener('error',()=>{revision++;enabled=false;blocked=false;notify();});
 return {state,choose,toggle,start,setTheme,retryAutoplay(){if(enabled&&blocked)play();},next:()=>choose(index+1),previous:()=>choose(index-1),setVolume(v){volume=Math.min(1,Math.max(0,Number(v)||0));audio.volume=volume;notify();}};
}
export function mountMusic(root){
 const audio=new Audio(),select=root.querySelector('[data-music-track]'),button=root.querySelector('[data-music-toggle]');
 for(const [i,t] of TRACKS.entries()){const o=document.createElement('option');o.value=i;o.textContent=t.title+' · '+t.style.split(' / ')[0];select.append(o);}
 let prefs={};try{prefs=JSON.parse(localStorage.getItem('tingjian-music')||'{}');}catch{}
 const player=createMusicPlayer(audio,{volume:Number.isFinite(prefs.volume)?Math.min(1,Math.max(0,prefs.volume)):.3,onChange:s=>{select.value=s.index;button.textContent=s.enabled?'关闭音乐':'开启音乐';button.setAttribute('aria-pressed',String(s.enabled));root.classList.toggle('is-playing',s.enabled&&!s.blocked);root.querySelector('[data-disc-art]').src='/music/art/'+s.track.id+'.svg';root.querySelector('[data-disc-symbol]').textContent=s.enabled&&!s.blocked?'Ⅱ':'▶';root.querySelector('[data-disc-toggle]').setAttribute('aria-label',s.enabled?'暂停背景音乐':'播放背景音乐');root.querySelector('[data-music-title]').textContent=s.track.title;root.querySelector('[data-music-state]').textContent=s.blocked?'轻触页面即可播放':s.enabled?'正在播放 · 顺序循环':'音乐已关闭';},save:s=>{try{localStorage.setItem('tingjian-music',JSON.stringify(s));}catch{}}});
 const panel=root.querySelector('[data-music-panel]'),expand=root.querySelector('[data-music-expand]');const close=()=>{panel.hidden=true;expand.setAttribute('aria-expanded','false');};expand.addEventListener('click',()=>{panel.hidden=!panel.hidden;expand.setAttribute('aria-expanded',String(!panel.hidden));});document.addEventListener('pointerdown',e=>{if(!root.contains(e.target))close();});document.addEventListener('keydown',e=>{if(e.key==='Escape'){close();expand.focus();}});root.querySelector('[data-disc-toggle]').addEventListener('click',player.toggle);
 button.addEventListener('click',player.toggle);select.addEventListener('change',()=>player.choose(Number(select.value)));root.querySelector('[data-music-prev]').addEventListener('click',player.previous);root.querySelector('[data-music-next]').addEventListener('click',player.next);
 const volume=root.querySelector('[data-music-volume]');volume.value=player.state().volume;volume.addEventListener('input',()=>player.setVolume(volume.value));
 for(const type of ['pointerdown','keydown'])document.addEventListener(type,player.retryAutoplay,{capture:true});
 player.setTheme('dusk');player.start();return player;
}
