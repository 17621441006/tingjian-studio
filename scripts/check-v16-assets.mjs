import fs from 'node:fs/promises';import assert from 'node:assert/strict';import {createHash} from 'node:crypto';
const files=JSON.parse(await fs.readFile('verification/v16/assets.json','utf8'));assert.equal(files.length,56);assert.equal(new Set(files.map(f=>f.path)).size,56);
for(const f of files){const bytes=await fs.readFile('dist'+f.path);assert.equal(createHash('sha256').update(bytes).digest('hex'),f.sha256,f.path);assert.equal(f.width,1536);assert.equal(f.height,1024);assert((await fs.stat('dist'+f.path.replace('.jpg','-thumb.jpg'))).size>1000);}
// Portable, byte-level baseline exported from the original Site Git history.
// This lets a fresh GitHub clone verify preservation without unrelated Git objects.
const baseline=JSON.parse(await fs.readFile('verification/v16/preservation-baseline.json','utf8'));
const oldFiles=baseline.filter(f=>f.path.startsWith('src/history/'));
assert.equal(oldFiles.length,39);assert.equal(baseline.length,47);
const privacy=JSON.parse(await fs.readFile('verification/v39/sanitized-history.json','utf8'));assert.equal(privacy.files.length,6);
for(const f of baseline){const bytes=await fs.readFile(f.path),redacted=privacy.files.find(r=>r.path===f.path);if(redacted){assert.equal(f.sha256,redacted.originalSHA256);assert(f.path.startsWith('src/history/'));assert(!/(?:\d+(?:\.\d+)?\s*(?:㎡|m²|平方米|sqm\b))|达安锦园/i.test(bytes.toString('utf8')));}assert.equal(createHash('sha256').update(bytes).digest('hex'),redacted?.privacySHA256||f.sha256,f.path+' original media or documented privacy-redacted source preserved');}
for(const path of ['dist/tour/legacy.html']){const html=await fs.readFile(path,'utf8'),ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);assert.equal(new Set(ids).size,ids.length);assert(!/__SPACE_MODEL__|__TRIAL__|__DESIGN_JOURNEY__|__HOME_GALLERY__/.test(html));}
const result={passed:true,nativeImages:56,historicalSourceFilesChecked:oldFiles.length,privacyRedactedSourceFiles:privacy.files.length,firstTwoCoreRoomPhotosUnchanged:true,method:'Byte-level asset identity and original/archive preservation with documented v39 text redactions; generated images visually reviewed separately'};await fs.writeFile('verification/v16/asset-checks.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));
