import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
// v19 removes old historical VR; all current panoramas now fit on the Site itself.
await fs.rm('build',{recursive:true,force:true});
await fs.cp('dist','build',{recursive:true,filter:p=>!p.includes('.openai')});
let bytes=0,count=0;async function walk(dir){for(const e of await fs.readdir(dir,{withFileTypes:true})){const p=path.join(dir,e.name);if(e.isDirectory())await walk(p);else{bytes+=(await fs.stat(p)).size;count++;}}}await walk('build');
assert(bytes<256*1024*1024-100000,'deployment exceeds platform budget');
console.log({hostingBytes:bytes,files:count,panoramas:'same-origin'});
