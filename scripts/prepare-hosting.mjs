import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createHash,randomUUID} from 'node:crypto';
const offloadedV38Main=p=>/designs-v38\/schemes\/(tea-cuisine|moss-garden)\/[^/]+(?<!-thumb)\.webp$/.test(p);
const offloadedV48Main=p=>/designs-v48\/schemes\/(silver-retreat|mauve-walnut|pine-library)\/[^/]+(?<!-thumb)\.webp$/.test(p);
const supersededFlora=p=>/designs-v49\/schemes\/silver-retreat\/(living|living2|kitchen|dining)(-thumb)?\.webp$/.test(p)||p.endsWith('designs-v49/featured/flora-768.webp');
const supersededV50=p=>p.includes('designs-v50/schemes/azure-silence')||/designs-v50\/schemes\/silver-retreat\/(living2|dining)(-thumb)?\.webp$/.test(p)||p.endsWith('designs-v50/featured/flora-768.webp');
const supersededV51=p=>p.includes('designs-v51/schemes/voyage-atelier')||/designs-v51\/schemes\/silver-retreat\/living(-thumb)?\.webp$/.test(p)||p.endsWith('designs-v51/featured/flora-768.webp');
const supersededV52=p=>/designs-v52\/schemes\/voyage-atelier\/(living|living2|dining|master)(-thumb)?\.webp$/.test(p);
const supersededV53=p=>/designs-v53\/schemes\/voyage-atelier\/(living|living2)(-thumb)?\.webp$/.test(p);
const offloadedV46Main=p=>/designs-v46\/schemes\/terracotta-atelier\/[^/]+(?<!-thumb)\.webp$/.test(p);
const localPreviews=new Set(['v42-amber-hero-768.webp','stillwood-living-768.webp','inkcourt-living-768.webp','dusk-living-768.webp','cinnabar-living-768.webp','verdigris-living-768.webp','stillwood-hero-768.webp','inkcourt-hero-768.webp']);
const offloaded=(await fs.readdir('dist/collection/assets')).filter(name=>!localPreviews.has(name)).map(name=>'/collection/assets/'+name);
const offloadedCollection=p=>offloaded.some(asset=>p.endsWith(asset));
// Use the current entrypoints' import graph; stale synchronized chunks must
// never re-enter the publication archive after an incremental rebuild.
const runtimeFiles=new Set(),queue=['loader.js','trial.js'];
while(queue.length){const name=queue.pop();if(runtimeFiles.has(name))continue;runtimeFiles.add(name);const source=await fs.readFile('dist/tour/legacy-runtime/'+name,'utf8');for(const match of source.matchAll(/["']\.\/([^"'\/]+\.js)["']/g))queue.push(match[1]);}
const obsoleteRuntime=p=>p.includes('tour/legacy-runtime/')&&p.endsWith('.js')&&!runtimeFiles.has(path.basename(p));
// Retain rollback and full-resolution artwork in source, not in the runtime package.
const unusedBrandExport=p=>/icons\/nocturne-v43/.test(p)||/icons\/nocturne-v55-(1024|48)\.png$/.test(p)||/icons\/nocturne-v55\.(svg|ico)$/.test(p);
const syncFragment=p=>path.basename(p).startsWith('.');
// v19 removes old historical VR; all current panoramas now fit on the Site itself.
// Prepare in a fresh directory so preview/file synchronization cannot repopulate pruned media.
await fs.mkdir('.sites-runtime',{recursive:true});
const stage=await fs.mkdtemp('.sites-runtime/hosting-');
await fs.cp('dist',stage,{recursive:true,filter:p=>!unusedBrandExport(p)&&!syncFragment(p)&&!obsoleteRuntime(p)&&!offloadedCollection(p)&&!offloadedV48Main(p)&&!supersededFlora(p)&&!supersededV50(p)&&!supersededV51(p)&&!supersededV52(p)&&!supersededV53(p)&&!p.includes('designs-v46/schemes/silver-retreat')&&!offloadedV46Main(p)&&!offloadedV38Main(p)&&!p.includes('.openai')&&!p.includes('designs-v38/schemes/terracotta-atelier')&&!p.includes('designs-v38/schemes/silver-retreat')&&!p.includes('scene-edits-v25')&&!p.includes('designs-v26')&&!p.includes('designer-v34')&&!p.includes('final-v35')&&!p.includes('designs-v36')&&!p.includes('layouts-v37')&&!p.includes('designs-v37')});
// New full-size editorial media uses an immutable GitHub asset commit, like the existing gallery.
const collectionOrigin=JSON.parse(await fs.readFile('verification/v40/media-origin.json','utf8'));
const collectionBase=collectionOrigin.origin.replace('https://raw.githubusercontent.com/17621441006/tingjian-studio/','https://cdn.jsdelivr.net/gh/17621441006/tingjian-studio@');
const v42Media=JSON.parse(await fs.readFile('verification/v42/media-origin.json','utf8'));
const v42CollectionBase=v42Media.origin.replace('https://raw.githubusercontent.com/17621441006/tingjian-studio/','https://cdn.jsdelivr.net/gh/17621441006/tingjian-studio@');

for(const name of ['index.html',...(await fs.readdir(stage+'/collection')).filter(n=>n.endsWith('.html')).map(n=>'collection/'+n)]){
 const file=stage+'/'+name;let html=await fs.readFile(file,'utf8');for(const asset of offloaded)html=html.replaceAll(asset,(asset.startsWith('/collection/assets/v42-')?v42CollectionBase:collectionBase)+asset);await fs.writeFile(file,html);
}
const media=JSON.parse(await fs.readFile('verification/v25/media-origin.json','utf8'));
await fs.writeFile(stage+'/scene-edit-origin.json',JSON.stringify(media));
const {origin:sourceOrigin}=JSON.parse(await fs.readFile('verification/v26/media-origin.json','utf8'));
const origin=sourceOrigin.replace(/https:\/\/raw\.githubusercontent\.com\/17621441006\/tingjian-studio\/([a-f0-9]{40})\/dist/, 'https://cdn.jsdelivr.net/gh/17621441006/tingjian-studio@$1/dist');
const {origin:v34Source}=JSON.parse(await fs.readFile('verification/v34/media-origin.json','utf8'));
const v34Origin=v34Source.replace('https://raw.githubusercontent.com/17621441006/tingjian-studio/', 'https://cdn.jsdelivr.net/gh/17621441006/tingjian-studio@');
const {origin:v35Source}=JSON.parse(await fs.readFile('verification/v35/media-origin.json','utf8'));
const v35Origin=v35Source.replace('https://raw.githubusercontent.com/17621441006/tingjian-studio/', 'https://cdn.jsdelivr.net/gh/17621441006/tingjian-studio@');
const {origin:v36Source}=JSON.parse(await fs.readFile('verification/v36/media-origin.json','utf8'));
const v36Origin=v36Source.replace('https://raw.githubusercontent.com/17621441006/tingjian-studio/', 'https://cdn.jsdelivr.net/gh/17621441006/tingjian-studio@');
const {origin:v37Origin}=JSON.parse(await fs.readFile('verification/v37/media-origin.json','utf8'));
const {origin:v38Origin}=JSON.parse(await fs.readFile('verification/v47/media-origin.json','utf8'));
const {origin:v48Origin}=JSON.parse(await fs.readFile('verification/v50/media-origin.json','utf8'));
const {origin:v46Origin}=JSON.parse(await fs.readFile('verification/v48/media-origin.json','utf8'));
const html=await fs.readFile(stage+'/tour/legacy.html','utf8');
await fs.writeFile(stage+'/tour/legacy.html',html.replace('</head>', '<script>globalThis.__TINGJIAN_V48_ORIGIN__='+JSON.stringify(v48Origin).replaceAll('<','\\u003c')+';globalThis.__TINGJIAN_V46_ORIGIN__='+JSON.stringify(v46Origin).replaceAll('<','\\u003c')+';globalThis.__TINGJIAN_V38_ORIGIN__='+JSON.stringify(v38Origin).replaceAll('<','\\u003c')+';globalThis.__TINGJIAN_V26_ORIGIN__='+JSON.stringify(origin).replaceAll('<','\\u003c')+';globalThis.__TINGJIAN_V34_ORIGIN__='+JSON.stringify(v34Origin).replaceAll('<','\\u003c')+';globalThis.__TINGJIAN_V35_ORIGIN__='+JSON.stringify(v35Origin).replaceAll('<','\\u003c')+';globalThis.__TINGJIAN_V36_ORIGIN__='+JSON.stringify(v36Origin).replaceAll('<','\\u003c')+';globalThis.__TINGJIAN_V37_ORIGIN__='+JSON.stringify(v37Origin).replaceAll('<','\\u003c')+';</script></head>'));
let bytes=0,count=0;const files=[];async function walk(dir){for(const e of await fs.readdir(dir,{withFileTypes:true})){const p=path.join(dir,e.name);if(syncFragment(p)){await fs.rm(p,{recursive:true,force:true});continue;}if(e.isDirectory())await walk(p);else{const b=await fs.readFile(p);bytes+=b.length;count++;files.push({path:'dist/'+path.relative(stage,p),bytes:b.length,sha256:createHash('sha256').update(b).digest('hex')});}}}await walk(stage);
// Reserve 768 KiB for tar headers, padding and the hosting manifest.
// The final archive is also checked against the full expanded 256 MiB limit.
assert(bytes<256*1024*1024-768*1024,'deployment exceeds platform budget including archive overhead');
await fs.writeFile('verification/v55/hosting-inventory.json',JSON.stringify({bytes,count,files},null,2)+'\n');
await fs.mkdir('.output',{recursive:true});
const retired='.sites-runtime/retired-'+randomUUID();
try{await fs.rename('.output/public',retired);}catch(e){if(e.code!=='ENOENT')throw e;}
await fs.rename(stage,'.output/public');
await fs.rm(retired,{recursive:true,force:true,maxRetries:5,retryDelay:100});
console.log({hostingBytes:bytes,files:count,panoramas:'same-origin'});
