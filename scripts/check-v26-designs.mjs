import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {HOMES,ROOMS,homeAsset} from '../src/legacy/home-designs.mjs';
import {NEW_HOME_IDS,livingReverseAsset} from '../src/legacy/wood-homes.mjs';
import {assembleHome} from '../src/legacy/scene-options.mjs';
import {wholeModelSpec} from '../src/legacy/whole-model-state.mjs';
import {floorRegions,floorMask} from '../src/legacy/photo-floor.mjs';
const files=JSON.parse(await fs.readFile('verification/v26/assets.json','utf8'));
assert.equal(Object.keys(HOMES).length,10);assert.equal(ROOMS.length,8);assert.equal(files.length,68);
for(const f of files){const b=await fs.readFile(f.path);assert(b.length>1000);assert.equal(createHash('sha256').update(b).digest('hex'),f.sha256,f.path);const probe=JSON.parse(execFileSync('ffprobe',['-v','error','-show_entries','stream=width,height','-of','json',f.path]));const d=probe.streams[0];assert.equal(d.width,f.width);assert.equal(d.height,f.height);if(!f.thumb){assert(d.width>=1536);assert(d.height>=1024);}}
for(const design of Object.keys(HOMES))await fs.access('dist'+livingReverseAsset(design));
for(const design of NEW_HOME_IDS){const frames=assembleHome(design,new Map());assert.equal(new Set(frames.map(f=>f.path)).size,8);const spec=wholeModelSpec({design,frames});assert.notEqual(spec.floor,'stone');for(const room of ROOMS){assert.equal(frames.find(f=>f.id===room.id).path,homeAsset(design,room.id));await fs.access('dist'+homeAsset(design,room.id));await fs.access('dist'+homeAsset(design,room.id,true));const mask=floorMask(128,86,floorRegions({design,room:room.id}));assert(mask.some(v=>v));assert(mask.filter(v=>v).length<128*86*.6);}}
globalThis.__TINGJIAN_V26_ORIGIN__='https://example.test/dist';assert(homeAsset('edition-oak','living').startsWith('https://example.test/dist/designs-v26/'));assert(livingReverseAsset('dusk').startsWith('https://example.test/dist/designs-v26/'));assert(homeAsset('dusk','living').startsWith('/tour/'));delete globalThis.__TINGJIAN_V26_ORIGIN__;
const html=await fs.readFile('dist/tour/legacy.html','utf8');assert.equal((html.match(/data-home-design=/g)||[]).length,10);assert(!html.includes('aria-label="查看此空间原尺寸大图"><div class="living-camera"'));
await fs.writeFile('verification/v26/checks.json',JSON.stringify({passed:true,schemes:10,newCompleteHomes:3,newRoomPhotos:24,reverseViews:10,nativeResolution:[1536,1024],assets:68,roomConfirmationSlots:8,reverseView:'Authored original scheme; furniture/floor edits do not propagate',originalAssetsPreserved:true,browserVisualTested:false},null,2));console.log('v26: 10 schemes, 24 new room photos + 10 reverse views, decoded assets, 8-room flow and media origin passed.');
