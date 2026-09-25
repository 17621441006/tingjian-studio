"""v20: eight separately authored two-minute arrangements, sampled instruments.
Requires numpy, scipy, ffmpeg and FluidR3 MIDI.js files in TINGJIAN_SAMPLES.
Instrument samples CC BY 3.0; attribution is shipped in dist/music/CREDITS.txt.
No existing composition or recording is used as a melodic source.
"""
from pathlib import Path
import os,json,re,base64,subprocess,hashlib,concurrent.futures
import numpy as np
from scipy.signal import lfilter
SR=24000;SECONDS=120;SAMPLES=Path(os.environ.get('TINGJIAN_SAMPLES','../music-samples'))
# Each row is one bar. Durations are in the track's own pulse, not a universal pattern.
SCORES=[
 dict(id='dusk',title='暮色 · 午夜会客厅',style='爵士休闲 / Jazz lounge',bpm=80,meter=4,bars=38,lead='clarinet',
 chords=[[48,55,59,64,67],[45,52,55,59,62],[50,57,60,64,67],[43,53,57,59,64],[48,55,59,62,66],[53,57,60,64,67],[50,55,59,64,69],[43,53,57,59,62]],
 A=['64:1 67:.5 69:.5 71:1.5 69:.5','67:2 64:1 62:1','64:.5 65:.5 69:1 67:1.5 64:.5','62:3 -1:1','67:1.5 71:.5 74:1 72:1','71:2 69:.5 67:.5 64:1','65:1 64:.5 62:.5 59:1 62:1','60:3.5 -1:.5'],
 B=['76:1 74:.5 72:.5 71:2','69:1.5 67:.5 64:2','65:.5 69:.5 72:1 74:1 72:1','71:2 67:1 65:1','64:1 67:1 71:1 74:1','76:2.5 74:.5 72:1','71:1 69:1 67:.5 65:.5 62:1','60:4']),
 dict(id='chinese',title='绛木 · 江南长卷',style='中国风室内乐 / Chinese chamber',bpm=72,meter=4,bars=34,lead='flute',
 chords=[[50,57,62,66],[47,54,59,62],[43,50,55,59],[45,52,57,62]],
 A=['74:1.5 76:.5 78:2','81:1 78:.5 76:.5 74:2','71:1 74:1 76:.5 74:.5 71:1','69:3 66:1','67:1 69:.5 71:.5 74:2','76:1.5 78:.5 76:1 74:1','71:1 69:1 66:.5 69:.5 71:1','74:3 -1:1'],
 B=['81:2 83:.5 81:.5 78:1','76:1 78:.5 81:.5 78:2','74:1.5 76:.5 78:1 74:1','71:3 69:1','74:.5 76:.5 78:1 81:2','83:1 81:1 78:1 76:1','74:1 71:1 69:.5 71:.5 74:1','74:4']),
 dict(id='stone',title='石庭 · 京都晚风',style='京都庭院 / Shakuhachi & koto',bpm=62,meter=4,bars=29,lead='shakuhachi',
 chords=[[38,50,57,62],[43,50,55,62],[39,51,58,63],[45,50,57,62]],
 A=['74:3 75:1','79:2.5 77:.5 75:1','74:4','69:2 70:1.5 74:.5','75:2 79:2','81:3 79:1','75:1.5 74:.5 70:2','69:3 -1:1'],
 B=['81:2 82:1 81:1','79:3 75:1','74:2 75:.5 79:.5 81:1','79:4','75:1 74:1 70:2','69:2.5 67:.5 69:1','70:2 74:2','74:4']),
 dict(id='collector',title='藏品 · 沙龙圆舞曲',style='古典室内圆舞曲 / Chamber waltz',bpm=90,meter=3,bars=56,lead='violin',
 chords=[[48,55,60,64],[45,52,57,60],[53,60,65,69],[43,55,59,62],[50,57,62,65],[47,54,59,62],[43,53,59,62],[48,55,60,64]],
 A=['72:1 76:.5 79:.5 76:1','74:1.5 72:.5 71:1','69:1 72:.5 76:.5 79:1','77:2 76:1','74:1 77:.5 81:.5 79:1','78:1 76:1 74:1','71:1.5 74:.5 77:1','76:2 72:1'],
 B=['79:1 81:.5 83:.5 84:1','83:1.5 81:.5 79:1','77:1 76:.5 74:.5 72:1','71:2 74:1','77:.5 79:.5 81:1 84:1','83:1 81:1 78:1','79:1.5 77:.5 74:1','72:3']),
 dict(id='copper',title='云岚 · 悬浮铜影',style='氛围电子 / Downtempo electronica',bpm=96,meter=4,bars=44,lead='electric_piano_1',
 chords=[[45,52,57,60,64],[41,48,53,57,60],[48,55,60,64,67],[43,50,55,59,62]],
 A=['76:2.5 72:.5 71:1','69:3 67:1','72:1.5 76:.5 79:2','74:4','76:1 79:1 81:2','79:1.5 76:.5 72:2','71:2 67:1 69:1','69:4'],
 B=['81:3 79:1','76:2 72:2','79:1 76:1 72:1 71:1','74:4','76:.5 79:.5 81:1 84:2','83:2 79:2','76:1.5 74:.5 72:1 71:1','69:4']),
 dict(id='amber',title='琥珀 · 午后巴萨',style='巴萨诺瓦 / Bossa nova',bpm=112,meter=4,bars=52,lead='flute',
 chords=[[53,60,64,67,69],[50,57,60,64,65],[55,62,65,69,72],[48,58,62,64,67],[57,64,67,71,72],[50,60,64,66,69],[55,62,65,69,72],[48,58,62,64,67]],
 A=['77:.5 76:1 72:.5 69:1.5 72:.5','74:1.5 76:.5 77:1 76:1','74:.5 72:.5 69:1 67:1.5 69:.5','72:3 -1:1','76:.5 79:.5 81:1.5 79:.5 76:1','78:1.5 76:.5 74:1 72:1','74:.5 77:1 76:.5 72:1 69:1','65:3 -1:1'],
 B=['81:1.5 79:.5 77:.5 76:1 74:.5','76:2 72:1 69:1','74:.5 77:.5 81:1 79:1.5 77:.5','76:3 72:1','79:.5 81:.5 84:2 83:1','81:1.5 78:.5 76:1 74:1','77:1 76:.5 74:.5 72:1 69:1','65:4']),
 dict(id='graphite',title='墨棕 · 城市雨幕',style='电影慢拍 / Cinematic trip-hop',bpm=76,meter=4,bars=36,lead='cello',
 chords=[[43,50,55,58,62],[39,46,51,55,58],[46,53,58,62,65],[41,48,53,57,60]],
 A=['67:3 65:1','62:2 63:1 65:1','67:1.5 70:.5 69:2','65:4','62:2 58:2','60:3 62:1','63:1 62:1 60:1 58:1','55:4'],
 B=['70:2 74:2','75:3 74:1','70:1.5 69:.5 67:2','65:4','67:2 70:1 74:1','72:2.5 70:.5 69:1','67:1 65:1 62:2','55:4']),
 dict(id='home',title='归家 · 灯火长明',style='弦乐抒情 / Lyrical orchestral',bpm=126,meter=6,bars=40,lead='violin',
 chords=[[48,55,60,64],[43,50,55,59],[45,52,57,60],[41,48,53,57],[50,57,62,65],[43,53,59,62],[48,55,60,64],[48,55,60,67]],
 A=['72:3 76:2 79:1','79:2 77:1 74:3','76:3 72:2 69:1','72:5 69:1','74:2 77:1 81:3','79:3 77:2 74:1','76:2 74:1 72:2 71:1','72:6'],
 B=['79:3 84:3','83:2 81:1 79:3','81:3 79:2 76:1','77:5 76:1','74:2 77:1 81:3','83:3 81:2 79:1','76:2 74:1 72:3','72:6'])]
CACHE={};RAW={}
def sample(instrument,midi):
 key=(instrument,midi)
 if key in CACHE:return CACHE[key]
 if instrument not in RAW:
  text=(SAMPLES/(('piano' if instrument=='piano' else instrument)+'.js')).read_text()
  RAW[instrument]=dict(re.findall(r'"([A-G][b#]?\d)"\s*:\s*"data:audio/mp3;base64,([^"\s]+)',text))
 name=['C','Db','D','Eb','E','F','Gb','G','Ab','A','Bb','B'][midi%12]+str(midi//12-1)
 b=base64.b64decode(RAW[instrument][name]);r=subprocess.run(['ffmpeg','-v','error','-i','pipe:0','-f','f32le','-ac','1','-ar',str(SR),'pipe:1'],input=b,stdout=subprocess.PIPE,check=True)
 x=np.frombuffer(r.stdout,dtype='<f4').copy();CACHE[key]=x;return x

def render(spec):
 ident=spec['id'];rng=np.random.default_rng(sum(map(ord,ident)));mix=np.zeros((SR*SECONDS,2),np.float32);events=[];pulse=60/spec['bpm'];meter=spec['meter'];bars=spec['bars'];sustained={'violin','cello','flute','shakuhachi','clarinet','string_ensemble_1','pad_2_warm'}
 def put(x,start,pan,gain):
  at=max(0,int(start*SR));n=min(len(x),len(mix)-at)
  if n<=0:return
  mix[at:at+n,0]+=x[:n]*gain*np.sqrt((1-pan)/2);mix[at:at+n,1]+=x[:n]*gain*np.sqrt((1+pan)/2)
 def note(inst,pitch,at,dur,vel=.22,pan=0):
  if pitch<0:return
  x=sample(inst,pitch);want=int((dur+.25)*SR)
  if inst in sustained and want>int(2.25*SR):
   # Sustain a stable interior region with overlapping crossfades; keep natural attack.
   base=x[:int(1.8*SR)].copy();loop=x[int(.8*SR):int(1.8*SR)];cross=int(.09*SR)
   while len(base)<want:
    fade=np.linspace(0,1,cross);base[-cross:]=base[-cross:]*(1-fade)+loop[:cross]*fade;base=np.concatenate([base,loop[cross:]])
   x=base[:want].copy()
  else:x=x[:want].copy()
  n=len(x);env=np.ones(n);release=min(n,int((.20 if inst in sustained else .38)*SR));env[-release:]*=np.linspace(1,0,release)
  attack=min(n,int(.025*SR));env[:attack]*=np.linspace(0,1,attack)
  if inst in sustained:env*=.86+.14*np.sin(np.linspace(0,np.pi,n))
  put(x*env,at,pan,vel);events.append([inst,pitch,round(at,3),round(dur,3),round(vel,3)])
 def drum(kind,at,vel=.04):
  duration={'kick':.28,'snare':.18,'hat':.055,'rim':.035,'brush':.20}[kind];t=np.arange(int(SR*duration))/SR
  if kind=='kick':x=np.sin(2*np.pi*(48*t+38*.03*(1-np.exp(-t/.03))))*np.exp(-t*18)
  elif kind=='rim':x=(np.sin(2*np.pi*1800*t)+np.sin(2*np.pi*830*t))*.3*np.exp(-t*120)
  else:
   noise=rng.normal(0,.4,len(t));x=np.r_[0,np.diff(noise)]*np.exp(-t*(55 if kind=='hat' else 22))
  put(x,at,.25 if kind=='hat' else 0,vel)
 intro={'dusk':2,'chinese':2,'stone':2,'collector':4,'copper':4,'amber':4,'graphite':4,'home':4}[ident]
 for bar in range(bars):
  t=bar*meter*pulse;ch=spec['chords'][bar%len(spec['chords'])];body=bar>=intro;ending=bar>=bars-4;dynamic=(.62 if not body else 1)*(.8 if ending else 1)
  if ident=='dusk':
   for pos in [0,1.5,2.75]:
    for p in ch[1:]:note('electric_piano_1',p,t+pos*pulse,1.15*pulse,.18*dynamic,-.3)
   for j,p in enumerate([ch[0]-12,ch[0]-5,ch[0]-12,ch[0]-2]):note('acoustic_bass',p,t+j*pulse,.87*pulse,.44,.05)
   if body:
    for j in range(4):drum('brush',t+j*pulse,.025);drum('hat',t+(j+.66)*pulse,.02)
  elif ident=='chinese':
   for pos,p in zip([0,.75,1.5,2.5,3.25],[ch[1],ch[2],ch[3],ch[2],ch[1]+12]):note('koto',p,t+pos*pulse,1.4*pulse,.26*dynamic,-.4)
   for p in ch[1:3]:note('string_ensemble_1',p,t,meter*pulse,.055*dynamic,.4)
   if body and bar%4==3:
    for j,p in enumerate([74,76,78,81]):note('koto',p,t+(3+j*.18)*pulse,.5,.14,-.25)
  elif ident=='stone':
   # No drum grid. Spacious koto punctuation and a continuously breathed shakuhachi line.
   for pos,p in zip([0,1.7,3.3] if bar%2==0 else [.7,2.8],[ch[1],ch[2]+12,ch[3]]):note('koto',p,t+pos*pulse,2.5,.26,-.35)
   if bar%2==0:note('pad_2_warm',ch[0],t,8*pulse,.09,.4)
  elif ident=='collector':
   note('cello',ch[0],t,pulse*.95,.22,-.2)
   for pos in [1,2]:
    for p in ch[1:]:note('piano',p,t+pos*pulse,.85*pulse,.22*dynamic,-.4)
   if body and 20<=bar<44:
    for p in ch[1:3]:note('string_ensemble_1',p,t,3*pulse,.10,.35)
  elif ident=='copper':
   for p in ch:note('pad_2_warm',p,t,4.1*pulse,.08*dynamic,(-.45 if p%2 else .45))
   note('electric_piano_1',ch[0]-12,t,3.8*pulse,.28,0)
   if body and not 20<=bar<24:
    for pos in [0,2.5]:drum('kick',t+pos*pulse,.12)
    for pos in [1,3]:drum('rim',t+pos*pulse,.035)
    for j in range(8):drum('hat',t+j*.5*pulse,.018 if j%2 else .011)
   for j,p in enumerate([ch[2]+12,ch[3]+12,ch[-1]+12]):note('vibraphone',p,t+(j+.5)*pulse,.7*pulse,.11,-.45)
  elif ident=='amber':
   # Brazilian syncopation, alternating bass, offbeat guitar and shaker.
   for pos in [0,1.5,2,3.5]:
    for j,p in enumerate(ch[1:]):note('acoustic_guitar_nylon',p,t+pos*pulse+j*.012,.7*pulse,.29*dynamic,-.25)
   for pos,p in [(0,ch[0]-12),(1.5,ch[0]-5),(2,ch[0]-12),(3.5,ch[0]-5)]:note('acoustic_bass',p,t+pos*pulse,.7*pulse,.34,.1)
   if body:
    for j in range(8):drum('hat',t+j*.5*pulse,.018 if j%2 else .012)
    for pos in [1,2.5,3.5]:drum('rim',t+pos*pulse,.026)
  elif ident=='graphite':
   for p in ch[1:]:note('electric_piano_1',p,t+.06,4*pulse,.21*dynamic,-.25)
   note('acoustic_bass',ch[0]-12,t,3.8*pulse,.39,.05)
   if body and not 16<=bar<20:
    for pos in [0,1.75,2.5]:drum('kick',t+pos*pulse,.13)
    for pos in [1,3]:drum('snare',t+pos*pulse,.055)
    for j in range(8):drum('hat',t+(j*.5+(.08 if j%2 else 0))*pulse,.018)
  else:
   for j in range(6):note('piano',ch[[0,1,2,3,2,1][j]],t+j*pulse,1.8*pulse,.22*dynamic,-.35)
   for p in ch[1:]:note('string_ensemble_1',p,t,6*pulse,.13*dynamic,.35)
   if body and 16<=bar<32:note('cello',ch[0],t,5.8*pulse,.21,-.15)
  if body and bar<bars-2:
   section=(bar-intro)//8;pattern=spec['B'] if section%3==2 else spec['A'];row=pattern[(bar-intro)%8];offset=0
   for token in row.split():
    pitch,dur=token.split(':');pitch=int(pitch);dur=float(dur)
    length=dur*pulse*(1.035 if spec['lead'] in sustained else .95)
    note(spec['lead'],pitch,t+offset*pulse,length,.32*dynamic if ident not in ('copper','graphite') else .36*dynamic,.15)
    offset+=dur
   assert abs(offset-meter)<1e-6,(ident,row,offset)
  # Different orchestral answers in the middle section, not transposed copies.
  if ident=='home' and 20<=bar<32:
   note('flute',spec['chords'][bar%8][-1]+12,t+3*pulse,2.8*pulse,.16,.4)
  if ident=='collector' and 24<=bar<40:note('clarinet',ch[-1],t,2.9*pulse,.17,.35)
 # Cadence before the 120-second tail; no repeated audio block.
 end=bars*meter*pulse
 for p in spec['chords'][0]:note('string_ensemble_1' if ident in ('home','collector') else 'pad_2_warm',p,end,min(5,118-end),.075,0)
 dry=mix.copy()
 for delay,g in [(.073,.12),(.149,.10),(.293,.075),(.467,.055),(.733,.04),(.977,.025)]:
  n=int(delay*SR);mix[n:]+=dry[:-n,::-1]*g
 mix=lfilter([.55,.45],[1],mix,axis=0).astype(np.float32)
 mix*=np.minimum(1,np.arange(len(mix))/(SR*1.2))[:,None];mix*=np.minimum(1,(len(mix)-np.arange(len(mix)))/(SR*5))[:,None]
 mix*=.8/max(float(np.max(np.abs(mix))),.01)
 target=Path('dist/music')/(ident+'.mp3');temp=target.with_suffix('.tmp.mp3')
 subprocess.run(['ffmpeg','-v','error','-y','-f','f32le','-ar',str(SR),'-ac','2','-i','pipe:0','-af','loudnorm=I=-20:TP=-2:LRA=10','-t','120','-codec:a','libmp3lame','-b:a','128k','-ar','44100',str(temp)],input=mix.astype('<f4').tobytes(),check=True);temp.replace(target)
 b=target.read_bytes();result={k:spec[k] for k in ['id','title','style','bpm','meter','bars']};result.update(duration=120,path='/music/'+ident+'.mp3',bytes=len(b),sha256=hashlib.sha256(b).hexdigest(),form='intro / A / variation / B / reprise / cadence',instruments=sorted(set(e[0] for e in events)),score=events);print(ident,'completed',len(events),'notes',flush=True);return result
if __name__=='__main__':
 Path('dist/music').mkdir(parents=True,exist_ok=True)
 result=[render(s) for s in SCORES]
 Path('src/music/scores.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
 Path('src/music/catalog.mjs').write_text('export const TRACKS='+json.dumps([{k:v for k,v in r.items() if k!='score'} for r in result],ensure_ascii=False)+';\n')
