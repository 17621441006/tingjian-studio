// Original, full-resolution files on independent delivery routes; no image substitution.
const mediaResolved=new Map(),mediaPending=new Map(),mediaTokens=new WeakMap();
export function mediaCandidates(path){
 const m=path.match(/^https:\/\/(?:raw\.githubusercontent\.com\/17621441006\/tingjian-studio\/([a-f0-9]{40})\/dist|(?:cdn|fastly)\.jsdelivr\.net\/gh\/17621441006\/tingjian-studio@([a-f0-9]{40})\/dist)(\/(?:designs-v26|designer-v34|smart-v34|final-v35|designs-v36|layouts-v37|designs-v37)\/[^?#]+)$/);
 if(!m)return [path];
 const sha=m[1]||m[2],tail=m[3];
 return [...new Set([mediaResolved.get(path),`https://cdn.jsdelivr.net/gh/17621441006/tingjian-studio@${sha}/dist${tail}`,`https://fastly.jsdelivr.net/gh/17621441006/tingjian-studio@${sha}/dist${tail}`,`https://raw.githubusercontent.com/17621441006/tingjian-studio/${sha}/dist${tail}`].filter(Boolean))];
}
export function resolvedMediaURL(path){return mediaResolved.get(path)||path;}
export function loadMediaImage(path,{ImageClass=globalThis.Image,timeoutMs=12000,hedgeMs=1200}={}){
 if(!path)return Promise.reject(Error('这张图片暂不可用，请重新选择'));
 if(mediaPending.has(path))return mediaPending.get(path);
 const candidates=mediaCandidates(path),attempts=[],timers=[];
 const promise=new Promise((resolve,reject)=>{
  let settled=false,failed=0;const started=new Set();
  const clean=()=>{for(const t of timers)clearTimeout(t);for(const im of attempts){im.onload=im.onerror=null;if(!im.loadedURL)im.src='';}};
  const finish=(im,url)=>{if(settled)return;settled=true;if(im){im.loadedURL=url;mediaResolved.set(path,url);clean();resolve(im);}else{clean();reject(Error('图片连接超时或暂不可用，已保留当前选择。请重试或先查看其他方案'));}};
  const start=i=>{if(settled||started.has(i)||!candidates[i])return;started.add(i);const im=new ImageClass();attempts.push(im);im.decoding='async';im.crossOrigin='anonymous';im.onload=()=>finish(im,candidates[i]);im.onerror=()=>{if(settled)return;failed++;if(failed===candidates.length)finish(null);else start(i+1);};im.src=candidates[i];};
  timers.push(setTimeout(()=>finish(null),timeoutMs));
  for(let i=1;i<candidates.length;i++)timers.push(setTimeout(()=>start(i),hedgeMs*i));
  start(0);
 });
 mediaPending.set(path,promise);promise.finally(()=>mediaPending.delete(path)).catch(()=>{});return promise;
}
export function setMediaImage(img,path){
 const token={};mediaTokens.set(img,token);img.src=resolvedMediaURL(path);
 if(!/^https:\/\//.test(path))return;
 loadMediaImage(path).then(()=>{if(mediaTokens.get(img)===token)img.src=resolvedMediaURL(path);}).catch(()=>{});
}
