import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {HOMES} from '../src/legacy/home-designs.mjs';
import {LAYOUT_ROOMS,LIGHT_SCENES,layoutsFor,resolveLayoutState,layoutAsset,layoutInfo} from '../src/legacy/layout-options.mjs';
const states=[];
for(const design of Object.keys(HOMES))for(const room of LAYOUT_ROOMS)for(const layout of layoutsFor(design,room.id)){
 for(const light of design==='dusk'&&room.id==='living'?LIGHT_SCENES:[{id:'daywarm'}]){
  const state={design,room:room.id,layout:layout.id,light:light.id};
  assert.deepEqual(resolveLayoutState(state),state);assert.equal(layoutInfo(state).id,layout.id);
  for(const thumbnail of [false,true])await fs.access('dist'+layoutAsset(state,thumbnail));
  states.push({...state,url:layoutAsset(state),thumb:layoutAsset(state,true)});
 }
}
assert.equal(states.filter(x=>x.design==='dusk').length,20);assert.equal(states.length,29);
assert.equal(resolveLayoutState({design:'chinese',layout:'social',light:'nightwarm'}).layout,'original');
assert.equal(resolveLayoutState({room:'master',light:'nightwarm'}).light,'daywarm');
const dimensions=JSON.parse(execFileSync('python',['-c',`import sys,json
from PIL import Image
out=[]
for s in json.load(sys.stdin):
 for key in ['url','thumb']:
  with Image.open('dist'+s[key]) as im:
   out.append({'url':s[key],'size':list(im.size)})
print(json.dumps(out))`,],{input:JSON.stringify(states),encoding:'utf8'}));
for(const image of dimensions){if(image.url.includes('-thumb.')){assert([360,480].includes(image.size[0]),image.url);assert.equal(image.size[0]/image.size[1],1.5);}else assert.deepEqual(image.size,[1536,1024],image.url);}
const manifest=JSON.parse(await fs.readFile('verification/v12/image-manifest.json','utf8'));
assert.equal(manifest.images.length,17);
for(const im of manifest.images){const bytes=await fs.readFile('dist'+im.url);assert.equal(createHash('sha256').update(bytes).digest('hex'),im.sha256);assert.equal(bytes.length,im.bytes);}
const publicHTML=await fs.readFile('dist/tour/legacy.html','utf8');
assert(!publicHTML.includes('__DESIGN_JOURNEY__'));assert(publicHTML.includes('data-journey-step="layout"'));
assert(publicHTML.includes('data-journey-step="details"'));assert(publicHTML.includes('data-details-status'));
const css=await fs.readFile('dist/tour/furniture-trial.css','utf8');
assert(css.includes('.design-journey'));assert(css.includes('[data-journey-step=layout] .home-gallery'));assert(css.includes('.atelier .journey-primary'));
const {transform}=await import('esbuild');const parsed=await transform(css,{loader:'css'});assert.equal(parsed.warnings.length,0,JSON.stringify(parsed.warnings));
const report={passed:true,browserUITested:false,uniqueDuskViews:20,allStyleStates:29,newNativeImages:17,newFullImageBytes:manifest.images.reduce((a,b)=>a+b.bytes,0),checks:['Every advertised state resolves to an available image and thumbnail; unsupported combinations normalize explicitly','All full-size sources are native 1536×1024; new thumbnails 480×320 and preserved original thumbnails 360×240 or 480×320','All 17 integrated image hashes match the inspected manifest','Three-step markup and visibility rules present; CSS parses without warnings'],states};
await fs.writeFile('verification/v12/layout-assets.json',JSON.stringify(report,null,2));
console.log(JSON.stringify({...report,states:undefined}));
