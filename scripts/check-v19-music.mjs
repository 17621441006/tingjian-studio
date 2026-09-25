import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {TRACKS} from '../src/music/catalog.mjs';
import {createMusicPlayer} from '../src/music/player.mjs';
class Audio {constructor(){this.events={};this.src='';this.calls=0;this.pauses=0;}addEventListener(k,f){this.events[k]=f;}getAttribute(k){return this[k];}play(){this.calls++;return this.fail?Promise.reject(Error('blocked')):Promise.resolve();}pause(){this.pauses++;}}
const a=new Audio(),p=createMusicPlayer(a);p.setTheme('dusk');assert.equal(a.calls,0);p.toggle();assert.equal(a.calls,1);p.setTheme('chinese');assert.equal(p.state().index,1);assert.equal(a.calls,2);p.setTheme('chinese');assert.equal(a.calls,2);
a.events.ended();assert.equal(p.state().index,2);p.choose(7);a.events.ended();assert.equal(p.state().index,0);p.toggle();const calls=a.calls;p.setTheme('amber');assert.equal(a.calls,calls);assert(!p.state().enabled);p.previous();assert.equal(p.state().index,4);p.setVolume(5);assert.equal(a.volume,1);
a.fail=true;p.toggle();await new Promise(r=>setTimeout(r,0));assert(!p.state().enabled);a.events.error();assert(!p.state().enabled);
const auto=new Audio(),ap=createMusicPlayer(auto);auto.fail=true;auto.play=function(){this.calls++;return this.fail?Promise.reject(Object.assign(Error('gesture needed'),{name:'NotAllowedError'})):Promise.resolve();};ap.start();await new Promise(r=>setTimeout(r,0));assert(ap.state().enabled&&ap.state().blocked);auto.fail=false;ap.retryAutoplay();await new Promise(r=>setTimeout(r,0));assert(ap.state().enabled&&!ap.state().blocked);ap.toggle();const before=auto.calls;ap.retryAutoplay();assert.equal(auto.calls,before);
assert.equal(TRACKS.length,8);assert.equal(new Set(TRACKS.map(t=>t.style)).size,8);let bytes=0;const durations=[];
for(const track of TRACKS){const b=await fs.readFile('dist'+track.path);assert.equal(createHash('sha256').update(b).digest('hex'),track.sha256);bytes+=b.length;const info=JSON.parse(execFileSync('ffprobe',['-v','quiet','-show_entries','format=duration:stream=channels,sample_rate','-of','json','dist'+track.path],{encoding:'utf8'}));assert(Number(info.format.duration)>=119.9&&Number(info.format.duration)<=120.2);assert.equal(info.streams[0].channels,2);durations.push(Number(info.format.duration));}
const retired=JSON.parse(await fs.readFile('verification/v19/retired-assets.json','utf8'));for(const f of retired.files)await assert.rejects(fs.access(f.path));
for(const t of ['dist/lab/index.html','dist/vr/dusk/panos/living.png'])await fs.access(t);
const shell=await fs.readFile('dist/index.html','utf8');assert(shell.includes('data-music'));assert(!shell.includes('data-mode="vr"'));assert(shell.includes('data-lab-frame'));
const report={passed:true,musicTracks:8,musicBytes:bytes,durations,retiredFiles:retired.files.length,retiredBytes:retired.bytes,checks:['Autoplay attempt, browser-policy rejection, gesture retry, explicit-off respected','Theme switch does not restart same theme','Next track and full-list wrap','Manual previous / selection','Off remains off on theme change','Volume clamp','Autoplay rejection and media error handled','Retired assets absent; lab and current VR retained'],browserAudioAudition:false};await fs.writeFile('verification/v19/checks.json',JSON.stringify(report,null,2)+'\n');console.log(report);
