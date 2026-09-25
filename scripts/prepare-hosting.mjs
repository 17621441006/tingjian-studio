import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
// Keep the complete offline dist in GitHub. Sites has a 256 MiB expanded limit;
// only the eight new panoramas are loaded from their immutable GitHub commit.
const commit='3f5de0e2bc3bb5a282735c115f6b71514322bf6b';
const origin=`https://raw.githubusercontent.com/17621441006/tingjian-studio/${commit}/dist`;
await fs.rm('build',{recursive:true,force:true});
await fs.cp('dist','build',{recursive:true,filter:p=>!p.includes('vr/dusk/panos')&&!p.includes('.openai')});
const target='build/vr/dusk/index.html';let html=await fs.readFile(target,'utf8');
html=html.replace(/"pano":"(\/vr\/dusk\/panos\/[^"<>]+)"/g,(_,p)=>'"pano":"'+origin+p+'"');
assert.equal((html.match(/raw\.githubusercontent\.com/g)||[]).length,8);
await fs.writeFile(target,html);
let bytes=0,count=0;async function walk(dir){for(const e of await fs.readdir(dir,{withFileTypes:true})){const p=path.join(dir,e.name);if(e.isDirectory())await walk(p);else{bytes+=(await fs.stat(p)).size;count++;}}}await walk('build');
assert(bytes<256*1024*1024-100000,'deployment exceeds platform budget');
console.log({hostingBytes:bytes,files:count,panoramaOrigin:origin});
