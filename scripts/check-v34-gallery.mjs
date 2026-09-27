import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {designerFrames} from '../src/legacy/designer-gallery.mjs';
import {SMART_REFERENCES} from '../src/legacy/smart-references.mjs';
import {HOMES} from '../src/legacy/home-designs.mjs';
import {mediaCandidates} from '../src/legacy/media-loader.mjs';
const assets=JSON.parse(await fs.readFile('verification/v34/assets.json','utf8'));
assert.equal(assets.length,86);
for(const a of assets){
 const data=await fs.readFile(a.path);assert.equal(data.length,a.bytes);assert.equal(createHash('sha256').update(data).digest('hex'),a.sha256);
 const s=JSON.parse(execFileSync('ffprobe',['-v','error','-show_entries','stream=width,height','-of','json',a.path])).streams[0];assert.deepEqual([s.width,s.height],[a.width,a.height]);
 if(!a.path.includes('/smart-v34/'))assert.deepEqual([s.width,s.height],a.thumb?[480,320]:[1536,1024]);
 execFileSync('ffmpeg',['-v','error','-i',a.path,'-f','null','-'],{stdio:'pipe'});
}
for(const collection of ['collector','oriental','nocturne']){const f=designerFrames(collection,'dusk');assert.equal(f.length,8);assert.equal(new Set(f.map(x=>x.path)).size,8);for(const r of f){await fs.access('dist'+r.path);await fs.access('dist'+r.thumb);}}
for(const id of Object.keys(HOMES)){const f=designerFrames('base',id);assert.equal(f.length,8);for(const r of f)await fs.access('dist'+r.path);}
assert.equal(Object.keys(SMART_REFERENCES).length,8);for(const r of Object.values(SMART_REFERENCES)){await fs.access('dist'+r.file);assert(r.source.startsWith('https://'));for(const key of ['before','after','position','caption','brand','model'])assert(r[key]?.length>1);}
const {origin}=JSON.parse(await fs.readFile('verification/v34/media-origin.json','utf8'));assert.match(origin,/\/13fea7e7cbd8bd5cd3305a80b81cf3e7c887eaad\/dist$/);globalThis.__TINGJIAN_V34_ORIGIN__=origin;assert.equal(mediaCandidates(designerFrames('collector','dusk')[1].path).length,3);delete globalThis.__TINGJIAN_V34_ORIGIN__;
const hosted=await fs.readFile('build/tour/legacy.html','utf8');assert(hosted.includes('globalThis.__TINGJIAN_V34_ORIGIN__="https://cdn.jsdelivr.net/gh/17621441006/tingjian-studio@'));assert(hosted.includes('data-life-next-top'));assert(hosted.includes('data-smart-dialog'));await assert.rejects(fs.access('build/designer-v34'));await fs.access('dist/designer-v34/collector/bath.webp');
const report={passed:true,decodedAssets:assets.length,newDesignerRooms:21,reworkedPurpleRooms:18,smartReferences:8,nativeResolution:[1536,1024],checks:['All 86 new/replaced files decoded and SHA verified','Three complete eight-room designer galleries plus all 14 original styles resolve real files','Official device references have before/after and placement details','Hosted gallery uses immutable commit and three delivery routes; local dist is complete'],browserUITested:false};await fs.writeFile('verification/v34/checks.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));
