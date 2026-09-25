"""Eight original miniature scores, deterministic additive synthesis; no sampled recordings."""
from pathlib import Path
import numpy as np, wave, subprocess, json, hashlib
SR=44100
# Distinct harmony, meter, melody and timbre; 12 bars in three phrases.
scores=[
 ('dusk','暮色 · 木与光',66,4,48,[[0,4,7,11],[9,12,16,19],[5,9,12,16],[7,11,14,17]],[19,16,14,12,16,11,9,7], 'felt'),
 ('chinese','绛木 · 窗间月',62,4,50,[[0,7,12,16],[7,14,19,21],[9,12,16,21],[5,12,17,21]],[12,14,19,16,14,9,7,12], 'pluck'),
 ('stone','石庭 · 听见留白',54,3,48,[[0,7,14,19],[5,12,19,21],[2,9,14,21],[0,7,12,19]],[19,14,12,7,14,9,7,12], 'bell'),
 ('collector','藏品 · 天鹅绒午后',72,3,46,[[0,4,7,11],[5,9,12,16],[2,5,9,12],[7,11,14,17]],[16,19,23,21,19,16,14,11], 'piano'),
 ('copper','云岚 · 铜绿微雨',60,4,45,[[0,3,7,10],[5,8,12,15],[8,12,15,19],[7,10,14,17]],[19,15,14,10,12,7,10,14], 'mallet'),
 ('amber','琥珀 · 浮光曲线',78,3,53,[[0,4,7,14],[5,9,12,16],[9,12,16,19],[7,11,14,19]],[16,19,14,12,9,12,16,14], 'pluck'),
 ('graphite','墨棕 · 夜的低语',58,4,43,[[0,3,7,14],[8,12,15,19],[5,8,12,15],[7,10,14,17]],[19,14,10,7,10,12,14,7], 'felt'),
 ('home','归家 · 灯火渐安',64,4,48,[[0,4,7,14],[5,9,12,16],[9,12,16,19],[0,7,12,16]],[16,14,12,19,16,14,9,12], 'piano')]
out=Path('dist/music');out.mkdir(parents=True,exist_ok=True);meta=[]
for idx,(id,title,bpm,meter,key,chords,motif,timbre) in enumerate(scores):
 rng=np.random.default_rng(1900+idx);beat=60/bpm;duration=12*meter*beat+5;mix=np.zeros((int(duration*SR),2),np.float64);events=[]
 def note(at,midi,length,vel,kind,pan=0):
  at=max(0,at);length=min(length,duration-at);n=int(length*SR);t=np.arange(n)/SR;f=440*2**((midi-69)/12);waveform=np.zeros(n)
  if kind=='pad':
   for k in range(1,6):waveform+=np.sin(2*np.pi*f*k*t+.004*np.sin(t*3))/(k*k)
   env=(1-np.exp(-t/.8))*np.exp(-t/6)*np.minimum(1,(length-t)/.9)
  else:
   decay={'felt':1.5,'piano':2.0,'pluck':.85,'bell':2.4,'mallet':1.3}[kind]
   for k in range(1,9):
    ratio=k*(1+.00016*k*k) if kind in ('piano','felt') else (k if kind=='pluck' else [1,2,3.98,5.43,7.1,8.5,10,12][k-1])
    weight=(1/k**(1.8 if kind=='felt' else 1.35))*np.exp(-t*(1+k*.33)/decay)
    waveform+=np.sin(2*np.pi*f*ratio*t)*weight
   env=(1-np.exp(-t/.009))*np.minimum(1,(length-t)/.13)
  signal=waveform*env*vel;start=int(at*SR);n=min(n,len(mix)-start)
  mix[start:start+n,0]+=signal[:n]*np.sqrt((1-pan)/2);mix[start:start+n,1]+=signal[:n]*np.sqrt((1+pan)/2)
  events.append({'beat':round(at/beat,3),'midi':midi,'seconds':round(length,3),'velocity':round(vel,3),'instrument':kind})
 for bar in range(12):
  chord=chords[bar%4];start=bar*meter*beat;phrase=bar//4
  note(start,key+chord[0]-12,meter*beat+2,.12,'felt',-.15)
  for j,n in enumerate(chord):note(start+.07*j,key+n,meter*beat+2,.023,'pad',(-.5+j/3))
  # broken accompaniment with breathing space in the third phrase
  for j in range(meter*2):
   if phrase==2 and j%3==2:continue
   midi=key+chord[[0,2,1,3][j%4]];at=start+j*.5*beat+rng.uniform(-.015,.015)
   note(at,midi,3,.063*(.8+rng.random()*.3),timbre,(-.35 if j%2 else .3))
  # Melodic antecedent / answer. Last bar resolves to the home note.
  lead=[motif[(bar*2)%8],motif[(bar*2+1)%8]]
  if bar==11:lead=[14 if id!='copper' else 10,12]
  for j,pitch in enumerate(lead):
   if id=='stone' and bar%3==1 and j==1:continue
   note(start+(j*meter/2+.12)*beat,key+pitch+12,3.4,.11 if phrase!=1 else .14,timbre,.15)
 # Room reflections, filtered tails, no percussion/voice. Four sparse stereo taps.
 dry=mix.copy()
 for delay,gain in [(.071,.12),(.137,.10),(.283,.08),(.421,.055),(.719,.035)]:
  n=int(delay*SR);mix[n:]+=dry[:-n,::-1]*gain
 mix*=np.minimum(1,np.arange(len(mix))/(SR*.4))[:,None];mix*=np.minimum(1,(len(mix)-np.arange(len(mix)))/(SR*3.5))[:,None]
 peak=np.max(np.abs(mix));mix*=.72/max(peak,.001)
 wav=Path('/tmp')/('tingjian-'+id+'.wav')
 with wave.open(str(wav),'wb') as f:f.setnchannels(2);f.setsampwidth(2);f.setframerate(SR);f.writeframes((mix*32767).astype('<i2').tobytes())
 target=out/(id+'.mp3');subprocess.run(['ffmpeg','-v','error','-y','-i',str(wav),'-af','loudnorm=I=-21:TP=-3:LRA=9','-codec:a','libmp3lame','-b:a','128k','-ar','44100',str(target)],check=True);wav.unlink()
 b=target.read_bytes();meta.append({'id':id,'title':title,'bpm':bpm,'meter':meter,'duration':round(duration,2),'path':'/music/'+id+'.mp3','bytes':len(b),'sha256':hashlib.sha256(b).hexdigest(),'instrument':timbre,'score':events});print(id,round(duration,1),len(b),flush=True)
Path('src/music/scores.json').write_text(json.dumps(meta,ensure_ascii=False,indent=2)+'\n')
Path('src/music/catalog.mjs').write_text('export const TRACKS='+json.dumps([{k:v for k,v in a.items() if k!='score'} for a in meta],ensure_ascii=False)+';\n')
