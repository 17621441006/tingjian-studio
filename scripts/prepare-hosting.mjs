import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
// v19 removes old historical VR; all current panoramas now fit on the Site itself.
await fs.rm('build',{recursive:true,force:true});
await fs.cp('dist','build',{recursive:true,filter:p=>!p.includes('.openai')&&!p.includes('scene-edits-v25')&&!p.includes('designs-v26')&&!p.includes('designer-v34')&&!p.includes('final-v35')&&!p.includes('designs-v36')&&!p.includes('layouts-v37')&&!p.includes('designs-v37')});
// New full-size editorial media uses an immutable GitHub asset commit, like the existing gallery.
const collectionOrigin=JSON.parse(await fs.readFile('verification/v40/media-origin.json','utf8'));
const collectionBase=collectionOrigin.origin.replace('https://raw.githubusercontent.com/17621441006/tingjian-studio/','https://cdn.jsdelivr.net/gh/17621441006/tingjian-studio@');
const localPreviews=new Set(['stillwood-living-768.webp','nocturne-living-768.webp','inkcourt-living-768.webp','dusk-living-768.webp','cinnabar-living-768.webp','verdigris-living-768.webp','stillwood-hero-768.webp','nocturne-hero-768.webp','inkcourt-hero-768.webp']);
const offloaded=[];
for(const name of await fs.readdir('build/collection/assets'))if(!localPreviews.has(name)){offloaded.push('/collection/assets/'+name);await fs.rm('build/collection/assets/'+name);}
for(const name of ['index.html',...(await fs.readdir('build/collection')).filter(n=>n.endsWith('.html')).map(n=>'collection/'+n)]){
 const file='build/'+name;let html=await fs.readFile(file,'utf8');for(const asset of offloaded)html=html.replaceAll(asset,collectionBase+asset);await fs.writeFile(file,html);
}
const media=JSON.parse(await fs.readFile('verification/v25/media-origin.json','utf8'));
await fs.writeFile('build/scene-edit-origin.json',JSON.stringify(media));
const {origin:sourceOrigin}=JSON.parse(await fs.readFile('verification/v26/media-origin.json','utf8'));
const origin=sourceOrigin.replace(/https:\/\/raw\.githubusercontent\.com\/17621441006\/tingjian-studio\/([a-f0-9]{40})\/dist/, 'https://cdn.jsdelivr.net/gh/17621441006/tingjian-studio@$1/dist');
const {origin:v34Source}=JSON.parse(await fs.readFile('verification/v34/media-origin.json','utf8'));
const v34Origin=v34Source.replace('https://raw.githubusercontent.com/17621441006/tingjian-studio/', 'https://cdn.jsdelivr.net/gh/17621441006/tingjian-studio@');
const {origin:v35Source}=JSON.parse(await fs.readFile('verification/v35/media-origin.json','utf8'));
const v35Origin=v35Source.replace('https://raw.githubusercontent.com/17621441006/tingjian-studio/', 'https://cdn.jsdelivr.net/gh/17621441006/tingjian-studio@');
const {origin:v36Source}=JSON.parse(await fs.readFile('verification/v36/media-origin.json','utf8'));
const v36Origin=v36Source.replace('https://raw.githubusercontent.com/17621441006/tingjian-studio/', 'https://cdn.jsdelivr.net/gh/17621441006/tingjian-studio@');
const {origin:v37Origin}=JSON.parse(await fs.readFile('verification/v37/media-origin.json','utf8'));
const html=await fs.readFile('build/tour/legacy.html','utf8');
await fs.writeFile('build/tour/legacy.html',html.replace('</head>', '<script>globalThis.__TINGJIAN_V26_ORIGIN__='+JSON.stringify(origin).replaceAll('<','\\u003c')+';globalThis.__TINGJIAN_V34_ORIGIN__='+JSON.stringify(v34Origin).replaceAll('<','\\u003c')+';globalThis.__TINGJIAN_V35_ORIGIN__='+JSON.stringify(v35Origin).replaceAll('<','\\u003c')+';globalThis.__TINGJIAN_V36_ORIGIN__='+JSON.stringify(v36Origin).replaceAll('<','\\u003c')+';globalThis.__TINGJIAN_V37_ORIGIN__='+JSON.stringify(v37Origin).replaceAll('<','\\u003c')+';</script></head>'));
let bytes=0,count=0;async function walk(dir){for(const e of await fs.readdir(dir,{withFileTypes:true})){const p=path.join(dir,e.name);if(e.isDirectory())await walk(p);else{bytes+=(await fs.stat(p)).size;count++;}}}await walk('build');
// Reserve 1 MiB for tar headers, padding and the hosting manifest.
assert(bytes<256*1024*1024-1024*1024,'deployment exceeds platform budget including archive overhead');
console.log({hostingBytes:bytes,files:count,panoramas:'same-origin'});
