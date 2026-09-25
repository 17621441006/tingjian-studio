// sync-trigger: 2026-09-26 re-run after repository public/archive setup
import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';

const BASE=(process.env.TINGJIAN_LIVE_URL||'https://tingjian-space-lab.jackchen911006.chatgpt.site').replace(/\/$/,'');
const MAX_FILE_BYTES=95*1024*1024;
const ROOT='dist';
const queue=[];
const queued=new Set();
const downloaded=[];
const missing=[];
const skipped=[];

function cleanPath(value){
  if(typeof value!=='string')return null;
  let p=value.trim();
  if(!p||/^https?:\/\//i.test(p)||p.startsWith('data:'))return null;
  p=p.split('#')[0].split('?')[0];
  if(!p.startsWith('/'))return null;
  if(!/^\/(tour|assets)\//.test(p))return null;
  if(p.includes('${')||p.includes('..'))return null;
  if(/\.(?:zip|tar|tgz|gz|rar|7z)$/i.test(p))return null;
  if(/\/(?:previous|archive)\//i.test(p))return null;
  return p;
}
function add(value,reason='source'){
  const p=cleanPath(value);
  if(!p||queued.has(p))return;
  queued.add(p);queue.push({p,reason});
}
function walkValues(value,basePath='/'){
  if(Array.isArray(value)){for(const v of value)walkValues(v,basePath);return;}
  if(value&&typeof value==='object'){for(const v of Object.values(value))walkValues(v,basePath);return;}
  if(typeof value!=='string')return;
  if(value.startsWith('/')){add(value,'json');return;}
  if(/^https?:\/\//i.test(value)||value.startsWith('data:'))return;
  if(/^[A-Za-z0-9_.\/-]+\.(?:jpg|jpeg|png|webp|gif|svg|json|glb|gltf|bin|hdr|ktx2|wasm|obj|mtl)$/i.test(value)){
    add(path.posix.join(path.posix.dirname(basePath),value),'json-relative');
  }
}
async function addSourceLiterals(dir){
  const entries=await fs.readdir(dir,{withFileTypes:true});
  for(const entry of entries){
    const full=path.join(dir,entry.name);
    if(entry.isDirectory()){await addSourceLiterals(full);continue;}
    if(!/\.(?:mjs|js|json|html|css|md|txt)$/i.test(entry.name))continue;
    const text=await fs.readFile(full,'utf8');
    const re=/\/(?:tour|assets)\/[A-Za-z0-9_.\/-]+\.(?:jpg|jpeg|png|webp|gif|svg|json|glb|gltf|bin|hdr|ktx2|wasm|obj|mtl)/g;
    for(const m of text.matchAll(re))add(m[0],'literal:'+full);
  }
}
async function seedAssets(){
  const manifest=JSON.parse(await fs.readFile('src/tour/assets-manifest.json','utf8'));
  walkValues(manifest,'/tour/assets-manifest.json');

  const floors=JSON.parse(await fs.readFile('src/legacy/floor-catalog.json','utf8'));
  walkValues(floors,'/tour/floor-catalog/catalog.json');

  const {HOMES,ROOMS,homeAsset}=await import('../src/legacy/home-designs.mjs');
  for(const design of Object.keys(HOMES))for(const room of ROOMS){
    add(homeAsset(design,room.id,false),'home-base');
    add(homeAsset(design,room.id,true),'home-base-thumb');
  }

  const {VARIANTS,variantAsset}=await import('../src/legacy/home-variants.mjs');
  for(const [design,variants] of Object.entries(VARIANTS))for(const variant of variants)for(const room of Object.keys(variant.rooms||{})){
    add(variantAsset(design,room,variant.id,false),'variant');
    add(variantAsset(design,room,variant.id,true),'variant-thumb');
  }

  const {PIECE_GROUPS,pieceAsset}=await import('../src/legacy/home-pieces.mjs');
  for(const sofa of PIECE_GROUPS.sofa.items)for(const table of PIECE_GROUPS.table.items)for(const floor of PIECE_GROUPS.floor.items){
    const s={sofa:sofa.id,table:table.id,floor:floor.id};
    add(pieceAsset('living',s,false),'living-piece');
    add(pieceAsset('living',s,true),'living-piece-thumb');
  }
  for(const bed of PIECE_GROUPS.bed.items)for(const bedding of PIECE_GROUPS.bedding.items)for(const window of PIECE_GROUPS.window.items){
    const s={bed:bed.id,bedding:bedding.id,window:window.id};
    add(pieceAsset('master',s,false),'master-piece');
    add(pieceAsset('master',s,true),'master-piece-thumb');
  }

  const {DUSK_LAYOUTS,LIGHT_SCENES,layoutAsset}=await import('../src/legacy/layout-options.mjs');
  for(const item of DUSK_LAYOUTS.living)for(const light of LIGHT_SCENES)for(const sofa of ['cognac','wine']){
    const s={design:'dusk',room:'living',layout:item.id,light:light.id,sofa};
    add(layoutAsset(s,false),'living-layout');
    add(layoutAsset(s,true),'living-layout-thumb');
  }
  for(const item of DUSK_LAYOUTS.master){
    const s={design:'dusk',room:'master',layout:item.id,light:'daywarm'};
    add(layoutAsset(s,false),'master-layout');
    add(layoutAsset(s,true),'master-layout-thumb');
  }
  for(const item of DUSK_LAYOUTS.balcony){
    const s={design:'dusk',room:'balcony',layout:item.id,light:'daywarm'};
    add(layoutAsset(s,false),'balcony-layout');
    add(layoutAsset(s,true),'balcony-layout-thumb');
  }

  add('/tour/home-assets/dusk/windows/master-storage-clear.jpg','window-scene');
  add('/tour/home-assets/dusk/windows/master-storage-clear-thumb.jpg','window-scene');
  for(const room of ['living','dining'])for(let mask=1;mask<16;mask++){
    const id=String(mask).padStart(2,'0');
    add(`/tour/home-assets/copper/objects/${room}/${id}.jpg`,'object-scene');
    add(`/tour/home-assets/copper/objects/${room}/${id}-thumb.jpg`,'object-scene-thumb');
  }

  for(const p of [
    '/assets/models/catalog.json',
    '/tour/catalog-assets/credits.json',
    '/tour/floor-catalog/credits.json',
    '/tour/trial-assets/credits.json'
  ])add(p,'known-catalog');

  await addSourceLiterals('src');
  await addSourceLiterals('scripts');
}
async function fetchOne(item){
  const url=BASE+item.p;
  let response;
  try{
    response=await fetch(url,{redirect:'follow',headers:{'user-agent':'tingjian-dist-sync/1.0'}});
  }catch(error){
    missing.push({path:item.p,reason:'network',error:String(error)});return;
  }
  if(!response.ok){
    missing.push({path:item.p,status:response.status,reason:item.reason});return;
  }
  const declared=Number(response.headers.get('content-length')||0);
  if(declared>MAX_FILE_BYTES){
    skipped.push({path:item.p,bytes:declared,reason:'over-95MB'});return;
  }
  const buffer=Buffer.from(await response.arrayBuffer());
  if(buffer.byteLength>MAX_FILE_BYTES){
    skipped.push({path:item.p,bytes:buffer.byteLength,reason:'over-95MB'});return;
  }
  const target=path.join(ROOT,item.p.replace(/^\//,''));
  await fs.mkdir(path.dirname(target),{recursive:true});
  await fs.writeFile(target,buffer);
  const sha256=createHash('sha256').update(buffer).digest('hex');
  downloaded.push({path:item.p,bytes:buffer.byteLength,sha256,reason:item.reason});

  if(/\.json$/i.test(item.p)){
    try{walkValues(JSON.parse(buffer.toString('utf8')),item.p);}catch{}
  }
}
await fs.mkdir(ROOT,{recursive:true});
await seedAssets();
let cursor=0;
while(cursor<queue.length){
  const batch=queue.slice(cursor,cursor+10);cursor+=batch.length;
  await Promise.all(batch.map(fetchOne));
}
downloaded.sort((a,b)=>a.path.localeCompare(b.path));
missing.sort((a,b)=>a.path.localeCompare(b.path));
skipped.sort((a,b)=>a.path.localeCompare(b.path));
const totalBytes=downloaded.reduce((n,x)=>n+x.bytes,0);
const report={
  generatedAt:new Date().toISOString(),
  source:BASE,
  queued:queued.size,
  downloaded:downloaded.length,
  totalBytes,
  totalMiB:Number((totalBytes/1024/1024).toFixed(2)),
  missing,
  skipped,
  files:downloaded
};
await fs.mkdir('verification',{recursive:true});
await fs.writeFile('verification/live-dist-sync.json',JSON.stringify(report,null,2));
await fs.writeFile(path.join(ROOT,'.asset-sync-manifest.json'),JSON.stringify(report,null,2));
console.log(`Synced ${downloaded.length} live assets (${report.totalMiB} MiB); missing ${missing.length}; skipped ${skipped.length}.`);
if(downloaded.length<120)throw new Error('Too few assets were recovered; refusing to publish an incomplete dist.');
if(totalBytes>900*1024*1024)throw new Error('Recovered assets exceed the 900 MiB safety budget.');
