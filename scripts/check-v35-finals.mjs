import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {FINAL_DESIGNS,finalAsset,collectionAsset,FINAL_ROOM_NOTES} from '../src/legacy/final-assets.mjs';
import {designerFrames} from '../src/legacy/designer-gallery.mjs';
import {HOMES} from '../src/legacy/home-designs.mjs';
import {COLLECTIONS} from '../src/legacy/lifestyle-data.mjs';
import {mediaCandidates} from '../src/legacy/media-loader.mjs';
const records=JSON.parse(await fs.readFile('verification/v35/assets.json','utf8'));
assert.equal(records.length,176);assert.deepEqual(FINAL_DESIGNS,Object.keys(HOMES).slice(0,8));
for(const a of records){const b=await fs.readFile(a.path);assert.equal(b.length,a.bytes);assert.equal(createHash('sha256').update(b).digest('hex'),a.sha256);const d=JSON.parse(execFileSync('ffprobe',['-v','error','-show_entries','stream=width,height','-of','json',a.path])).streams[0];assert.deepEqual([d.width,d.height],a.thumb?[480,320]:[1536,1024]);execFileSync('ffmpeg',['-v','error','-i',a.path,'-f','null','-'],{stdio:'pipe'});}
const unique=new Set();
for(const design of FINAL_DESIGNS){const frames=designerFrames('final',design);assert.equal(frames.length,8);for(const f of frames){assert.equal(f.path,finalAsset(design,f.id));unique.add(f.path);await fs.access('dist'+f.path);await fs.access('dist'+f.thumb);}assert.notEqual(frames[0].path,designerFrames('base',design)[0].path);}
assert.equal(unique.size,64);
for(const c of COLLECTIONS){assert.equal(c.image,collectionAsset(c.id,'living'));for(const f of designerFrames(c.id,'dusk')){await fs.access('dist'+f.path);await fs.access('dist'+f.thumb);}}
assert(FINAL_ROOM_NOTES.second.includes('7.2'));assert(FINAL_ROOM_NOTES.second.includes('纵向'));assert(FINAL_ROOM_NOTES.balcony.includes('落地玻璃'));
const media=JSON.parse(await fs.readFile('verification/v35/media-origin.json','utf8'));assert.match(media.commit,/^[a-f0-9]{40}$/);assert(media.origin.endsWith('/'+media.commit+'/dist'));globalThis.__TINGJIAN_V35_ORIGIN__=media.origin;assert.equal(mediaCandidates(finalAsset('dusk','living')).length,3);assert.equal(mediaCandidates(collectionAsset('oriental','balcony')).length,3);delete globalThis.__TINGJIAN_V35_ORIGIN__;
const html=await fs.readFile('build/tour/legacy.html','utf8');assert(html.includes('globalThis.__TINGJIAN_V35_ORIGIN__'));assert(html.includes('两房双阳台'));await assert.rejects(fs.access('build/final-v35'));const plan=await fs.readFile('dist/tour/legacy-assets/6fe2ce11b656bd7e.png');assert.equal(createHash('sha256').update(plan).digest('hex'),JSON.parse(await fs.readFile('verification/v35/constraints.json','utf8')).planSha256);
const report={passed:true,finalSchemes:8,finalRooms:64,correctedCollectionRooms:24,decodedFiles:176,mainResolution:[1536,1024],originalPlanRetained:true,browserUITested:false,scope:'Authored photo concepts constrained by original geometry and provided areas; no claim of measured CAD accuracy.'};await fs.writeFile('verification/v35/checks.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));
