import fs from 'node:fs/promises';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import assert from 'node:assert/strict';
// CI uses a full Git clone. LFS pointer sizes count archived payloads separately.
assert.equal(execFileSync('git',['rev-parse','--is-shallow-repository'],{encoding:'utf8'}).trim(),'false');
const gitDir=execFileSync('git',['rev-parse','--git-dir'],{encoding:'utf8'}).trim();
async function bytes(dir){let n=0;for(const e of await fs.readdir(dir,{withFileTypes:true})){const p=path.join(dir,e.name);if(e.isDirectory())n+=await bytes(p);else if(e.isFile())n+=(await fs.stat(p)).size;}return n;}
const pointer=execFileSync('git',['show','refs/remotes/origin/archive/history-v17:archive/heavy/history-v17.tar.gz'],{encoding:'utf8'});assert(pointer.startsWith('version https://git-lfs.github.com/spec/v1'));const archiveBytes=Number(pointer.match(/^size (\d+)$/m)?.[1]);assert(archiveBytes>100_000_000);const gitBytes=await bytes(gitDir),distBytes=await bytes('dist');assert(gitBytes+archiveBytes<1_000_000_000);assert(distBytes<900*1024*1024);console.log(JSON.stringify({passed:true,fullClone:true,ordinaryGitBytes:gitBytes,archiveLfsPayloadBytes:archiveBytes,gitPlusLfsBytes:gitBytes+archiveBytes,distBytes,limitBytes:1_000_000_000,archivePointer:true}));
