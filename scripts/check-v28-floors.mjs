import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {variantsFor,variantAsset} from '../src/legacy/home-variants.mjs';
import {assembleHome,resolveScene} from '../src/legacy/scene-options.mjs';
const assets=JSON.parse(await fs.readFile('verification/v28/assets.json','utf8'));
assert.equal(assets.length,10);
for(const a of assets){const b=await fs.readFile(a.path);assert.equal(createHash('sha256').update(b).digest('hex'),a.sha256);const info=JSON.parse(execFileSync('ffprobe',['-v','error','-show_entries','stream=width,height','-of','json',a.path])).streams[0];assert.equal(info.width,a.width);assert.equal(info.height,a.height);if(!a.thumb)assert.deepEqual([info.width,info.height],[1536,1024]);}
for(const v of variantsFor('milan')){for(const thumb of [false,true])await fs.access('dist'+variantAsset('milan','living',v.id,thumb));const scene=resolveScene({design:'milan',room:'living',variant:v.id}),frames=assembleHome('milan',new Map([['milan:living',scene]]));assert.equal(frames.length,8);assert.equal(frames[0].path,variantAsset('milan','living',v.id));assert.equal(frames[1].path,frames[0].path);assert(frames[1].shared);}
globalThis.__TINGJIAN_V26_ORIGIN__='https://example.test/dist';assert(variantAsset('milan','living','walnut').startsWith('https://example.test/dist/designs-v26/'));delete globalThis.__TINGJIAN_V26_ORIGIN__;
console.log('v28: warm balcony / reverse view and three floor alternatives decoded, SHA verified, native 1536×1024, room state and pinned-origin paths passed.');
