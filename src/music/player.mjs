import {TRACKS} from './catalog.mjs';
export function createMusicPlayer(audio,{onChange=()=>{},save=()=>{},volume=.3}={}){
 let index=0,enabled=false,theme=null,revision=0;
 audio.preload='none';audio.volume=volume;
 const state=()=>({index,enabled,theme,volume,track:TRACKS[index]});
 const notify=()=>{onChange(state());save({volume,enabled});};
 async function play(){const token=++revision;try{await audio.play();if(token!==revision&&!enabled)audio.pause();}catch{if(token===revision){enabled=false;notify();}}}
 function choose(i){index=(i+TRACKS.length)%TRACKS.length;revision++;audio.pause();audio.src=TRACKS[index].path;audio.currentTime=0;notify();if(enabled)play();}
 function toggle(){enabled=!enabled;if(enabled){if(!audio.getAttribute('src'))audio.src=TRACKS[index].path;play();}else{revision++;audio.pause();}notify();}
 function setTheme(id){if(theme===id||!TRACKS.some(t=>t.id===id))return;theme=id;choose(TRACKS.findIndex(t=>t.id===id));}
 audio.addEventListener('ended',()=>{if(enabled)choose(index+1);});
 audio.addEventListener('error',()=>{revision++;enabled=false;notify();});
 return {state,choose,toggle,setTheme,next:()=>choose(index+1),previous:()=>choose(index-1),setVolume(v){volume=Math.min(1,Math.max(0,Number(v)||0));audio.volume=volume;notify();}};
}
export function mountMusic(root){
 const audio=new Audio(),select=root.querySelector('[data-music-track]'),button=root.querySelector('[data-music-toggle]');
 for(const [i,t] of TRACKS.entries()){const o=document.createElement('option');o.value=i;o.textContent=t.title;select.append(o);}
 let prefs={};try{prefs=JSON.parse(localStorage.getItem('tingjian-music')||'{}');}catch{}
 const player=createMusicPlayer(audio,{volume:Number.isFinite(prefs.volume)?Math.min(1,Math.max(0,prefs.volume)):.3,onChange:s=>{select.value=s.index;button.textContent=s.enabled?'关闭音乐':'开启音乐';button.setAttribute('aria-pressed',String(s.enabled));root.querySelector('[data-music-state]').textContent=s.enabled?'正在播放 · 顺序循环':'轻触开启 · 纯音乐';},save:s=>{try{localStorage.setItem('tingjian-music',JSON.stringify(s));}catch{}}});
 button.addEventListener('click',player.toggle);select.addEventListener('change',()=>player.choose(Number(select.value)));root.querySelector('[data-music-prev]').addEventListener('click',player.previous);root.querySelector('[data-music-next]').addEventListener('click',player.next);
 const volume=root.querySelector('[data-music-volume]');volume.value=player.state().volume;volume.addEventListener('input',()=>player.setVolume(volume.value));
 player.setTheme('dusk');return player;
}
