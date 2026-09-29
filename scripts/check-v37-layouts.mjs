import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {HOMES,ROOMS,homeAsset} from '../src/legacy/home-designs.mjs';
import {REPLAN_DATA,replanAsset} from '../src/legacy/layout-v37.mjs';
import {layoutsFor} from '../src/legacy/layout-options.mjs';
import {resolveScene,sceneAsset,sceneAvailable,assembleHome} from '../src/legacy/scene-options.mjs';
import {supportsSceneObjects} from '../src/legacy/scene-objects.mjs';
import {designerFrames} from '../src/legacy/designer-gallery.mjs';
import {floorRegions,floorMask} from '../src/legacy/photo-floor.mjs';
import {livingReverseAsset} from '../src/legacy/wood-homes.mjs';
assert.equal(Object.keys(HOMES).length,16);
const rows=JSON.parse(await fs.readFile('verification/v37/assets.json','utf8'));assert.equal(rows.length,66);
for(const r of rows){const b=await fs.readFile(r.path);assert.equal(b.length,r.bytes);assert.equal(createHash('sha256').update(b).digest('hex'),r.sha256);const d=JSON.parse(execFileSync('ffprobe',['-v','error','-show_entries','stream=width,height','-of','json',r.path])).streams[0];assert.deepEqual([d.width,d.height],r.thumb?[480,320]:[1536,1024]);execFileSync('ffmpeg',['-v','error','-i',r.path,'-f','null','-'],{stdio:'pipe'});}
for(const [design,rooms]of Object.entries(REPLAN_DATA))for(const room of Object.keys(rooms)){assert(layoutsFor(design,room).some(l=>l.id==='replan'));const s=resolveScene({design,room,layout:'replan',removed:['bed']});assert(sceneAvailable(s));assert.equal(sceneAsset(s),replanAsset(design,room));assert(!supportsSceneObjects(s));assert.equal(s.removed.length,0);assert.notEqual(sceneAsset(s),sceneAsset({...s,layout:'original'}));assert.equal(designerFrames('final',design).find(f=>f.id===room).path,replanAsset(design,room));assert(floorMask(128,86,floorRegions(s)).some(x=>x));}
for(const r of ROOMS){await fs.access('dist'+homeAsset('pine-library',r.id));assert(floorMask(128,86,floorRegions({design:'pine-library',room:r.id})).some(x=>x));}await fs.access('dist'+livingReverseAsset('pine-library'));assert.equal(new Set(assembleHome('pine-library',new Map()).map(f=>f.path)).size,8);
const outer=await fs.readFile('dist/index.html','utf8');assert(!outer.includes('历史案例'));assert(!outer.includes('/lab/'));
const report={passed:true,schemes:16,changedSchemes:8,replannedRooms:24,newHomeViews:9,nativeResolution:[1536,1024],historyArchive:'archive/history-v36',browserVisualTested:false,scope:'Authored concept photographs; structural boundaries and clearances require site measurement.'};await fs.writeFile('verification/v37/checks.json',JSON.stringify(report,null,2)+'\n');console.log(report);
