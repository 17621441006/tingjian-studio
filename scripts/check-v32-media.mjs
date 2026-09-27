import assert from 'node:assert/strict';
import {loadMediaImage,mediaCandidates,resolvedMediaURL} from '../src/legacy/media-loader.mjs';
const root='https://raw.githubusercontent.com/17621441006/tingjian-studio/'+'d'.repeat(40)+'/dist/designs-v26/test/';
let mode='hedge',requests=[];
class FakeImage {set src(url){this.url=url;if(!url)return;requests.push(url);if(mode==='hang'||mode==='hedge'&&url.includes('cdn.jsdelivr.net'))return;setTimeout(()=>mode==='fail'?this.onerror?.():this.onload?.(),1);}get src(){return this.url;}}
const options={ImageClass:FakeImage,timeoutMs:70,hedgeMs:5};
const p=loadMediaImage(root+'living.webp',options);assert.strictEqual(loadMediaImage(root+'living.webp',options),p);await p;assert(resolvedMediaURL(root+'living.webp').includes('fastly.jsdelivr.net'));assert.equal(mediaCandidates(root+'living.webp').length,3);
mode='fail';await assert.rejects(loadMediaImage(root+'second.webp',options));mode='ok';await loadMediaImage(root+'second.webp',options);assert(resolvedMediaURL(root+'second.webp').includes('cdn.jsdelivr.net'));
mode='hang';await assert.rejects(loadMediaImage(root+'bath.webp',options),/连接超时/);mode='ok';await loadMediaImage(root+'bath.webp',options);
const local='/tour/home-assets/dusk/living.jpg';assert.deepEqual(mediaCandidates(local),[local]);await loadMediaImage(local,options);assert.equal(resolvedMediaURL(local),local);
assert.deepEqual(mediaCandidates('https://unrelated.example/asset.webp'),['https://unrelated.example/asset.webp']);
console.log('v32: stalled primary rescued by full-resolution mirror; deduplicated requests, bounded all-route timeout, failure retry and same-origin assets passed.');
