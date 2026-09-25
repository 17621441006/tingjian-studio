import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';

// The manifest was exported from the original v17 Site checkout, not from
// downloaded HTTP responses. This rejects login pages and LFS pointer stubs.
const manifest=JSON.parse(await fs.readFile('verification/v17/dist-manifest.json','utf8'));
assert.equal(manifest.fileCount,692);
let bytes=0,images=0,models=0,dependencies=0,files=0;
for(const entry of manifest.files){
  // HTML, JS and CSS are rebuilt in later versions; original media remain byte-identical.
  if(/\.(?:html|js|css)$/.test(entry.path))continue;
  files++;
  assert(entry.path.startsWith('dist/')&&!entry.path.includes('..'));
  const data=await fs.readFile(entry.path);
  assert.equal(data.length,entry.bytes,entry.path+' size');
  assert.equal(createHash('sha256').update(data).digest('hex'),entry.sha256,entry.path+' original SHA-256');
  assert(data.length<100_000_000,entry.path+' ordinary Git file limit');
  bytes+=data.length;
  if(entry.width){assert(entry.width>0&&entry.height>0);images++;}
  let gltf;
  if(entry.path.endsWith('.glb')){
    assert.equal(data.readUInt32LE(0),0x46546c67,entry.path+' GLB magic');
    assert.equal(data.readUInt32LE(4),2);
    assert.equal(data.readUInt32LE(8),data.length);
    assert.equal(data.readUInt32LE(16),0x4e4f534a);
    gltf=JSON.parse(data.subarray(20,20+data.readUInt32LE(12)).toString());
  }else if(entry.path.endsWith('.gltf'))gltf=JSON.parse(data);
  if(gltf){
    models++;assert(gltf.meshes?.length>0,entry.path+' meshes');
    for(const item of [...gltf.buffers||[],...gltf.images||[]]){
      if(!item.uri||item.uri.startsWith('data:'))continue;
      assert(!/^[a-z]+:/i.test(item.uri),entry.path+' external model dependency');
      const target=path.resolve(path.dirname(entry.path),decodeURIComponent(item.uri));
      assert(target.startsWith(path.resolve('dist')+path.sep));
      const asset=await fs.readFile(target);assert(asset.length>0,target);
      if(item.byteLength)assert(asset.length>=item.byteLength,target+' buffer length');
      dependencies++;
    }
  }
}
assert.equal(images,630);
assert(bytes<900*1024*1024);
const result={passed:true,sourceSiteCommit:manifest.sourceSiteCommit,files,images,models,modelDependencies:dependencies,bytes,MiB:Number((bytes/1024/1024).toFixed(2)),originalBytesPreserved:true};
await fs.mkdir('verification/v18',{recursive:true});
await fs.writeFile('verification/v18/original-asset-audit.json',JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify(result,null,2));
