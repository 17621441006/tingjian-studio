import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {HOMES,ROOMS,homeAsset} from '../src/legacy/home-designs.mjs';
import {livingReverseAsset} from '../src/legacy/wood-homes.mjs';
import {assembleHome} from '../src/legacy/scene-options.mjs';
import {wholeModelSpec} from '../src/legacy/whole-model-state.mjs';
import {floorRegions,floorMask} from '../src/legacy/photo-floor.mjs';
const records=JSON.parse(await fs.readFile('verification/v30/assets.json','utf8'));
assert.equal(records.length,36);assert.equal(Object.keys(HOMES).length,15);
for(const a of records){const b=await fs.readFile(a.path);assert.equal(createHash('sha256').update(b).digest('hex'),a.sha256);const d=JSON.parse(execFileSync('ffprobe',['-v','error','-show_entries','stream=width,height','-of','json',a.path])).streams[0];assert.deepEqual([d.width,d.height],a.thumb?[480,320]:[1536,1024]);}
for(const design of ['mauve-walnut','plum-gallery']){const frames=assembleHome(design,new Map());assert.equal(frames.length,8);assert.equal(new Set(frames.map(f=>f.path)).size,8);for(const room of ROOMS){await fs.access('dist'+homeAsset(design,room.id));await fs.access('dist'+homeAsset(design,room.id,true));assert(HOMES[design].rooms[room.id].materials.length>=3);const m=floorMask(128,86,floorRegions({design,room:room.id}));assert(m.some(x=>x));assert(m.filter(x=>x).length<128*86*.65);}await fs.access('dist'+livingReverseAsset(design));const spec=wholeModelSpec({design,frames});assert.equal(spec.secondPlan,design==='mauve-walnut'?'window-office':'classic');assert.equal(spec.balconyPlan,design==='mauve-walnut'?'breakfast':'reading');}
const html=await fs.readFile('dist/tour/legacy.html','utf8');assert.equal((html.match(/data-home-design=/g)||[]).length,15);assert(html.includes('另 5 套'));assert(html.includes('data-extra-schemes hidden'));
const css=await fs.readFile('src/legacy/design-journey.css','utf8');assert(css.includes('.home-room-nav button[aria-pressed=true]{background:#e9e0d2;color:#382f27;'));
console.log('v30 assets retained within 15 schemes; 18 native photos + 18 thumbnails decoded and hashed; distinct secondary-room plans, eight-room states, floor masks, selected-room contrast and expansion passed.');
