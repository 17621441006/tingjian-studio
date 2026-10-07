import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {HOMES,ROOMS,homeAsset} from '../src/legacy/home-designs.mjs';
import {livingReverseAsset} from '../src/legacy/wood-homes.mjs';
import {assembleHome} from '../src/legacy/scene-options.mjs';
import {floorRegions,floorMask} from '../src/legacy/photo-floor.mjs';
const records=JSON.parse(await fs.readFile('verification/v29/assets.json','utf8'));
assert.equal(records.length,36);assert.equal(Object.keys(HOMES).length,20);
for(const a of records){const b=await fs.readFile(a.path);assert.equal(createHash('sha256').update(b).digest('hex'),a.sha256);const d=JSON.parse(execFileSync('ffprobe',['-v','error','-show_entries','stream=width,height','-of','json',a.path])).streams[0];assert.deepEqual([d.width,d.height],a.thumb?[480,320]:[1536,1024]);}
for(const design of ['orange-court','oriental-hotel']){const frames=assembleHome(design,new Map());assert.equal(frames.length,8);assert.equal(new Set(frames.map(f=>f.path)).size,8);for(const room of ROOMS){await fs.access('dist'+homeAsset(design,room.id));await fs.access('dist'+homeAsset(design,room.id,true));assert(HOMES[design].rooms[room.id].materials.length>=3);const m=floorMask(128,86,floorRegions({design,room:room.id}));assert(m.some(x=>x));assert(m.filter(x=>x).length<128*86*.65);}await fs.access('dist'+livingReverseAsset(design));}
const html=await fs.readFile('dist/tour/legacy.html','utf8');assert.equal((html.match(/data-home-design=/g)||[]).length,20);assert(html.includes('data-extra-schemes hidden'));assert(html.includes('aria-controls="extra-home-schemes"'));assert(!html.includes('<header class="studio-heading">'));
const outer=await fs.readFile('dist/index.html','utf8');assert(outer.includes('data-studio-nav'));assert.equal((outer.match(/data-studio-step=/g)||[]).length,5);
console.log('v29: legacy schemes, 18 native full-resolution room views + 18 thumbs decoded, eight-room states, floor masks and compact expandable navigation passed.');
