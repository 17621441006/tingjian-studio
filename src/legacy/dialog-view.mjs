// Fit to the visible parent viewport while the studio iframe grows with the page.
// Fullscreen is requested on the document, since dialogs cannot be fullscreen targets.
export function openImageDialog(dialog,host,{fullscreen=false}={}){
 let parent=null,ownsFullscreen=false,cleaned=false;
 try{if(host.frameElement&&host.parent!==host){void host.parent.innerHeight;parent=host.parent;}}catch{}
 const doc=host.document;
 function fit(){
  let height=host.innerHeight||800,top=0;
  if(parent&&!doc?.fullscreenElement){const r=host.frameElement.getBoundingClientRect();height=Math.max(250,Math.min(parent.innerHeight,r.bottom)-Math.max(0,r.top));top=Math.max(0,-r.top);}
  const h=fullscreen?height:Math.min(1000,Math.max(220,height*.9));
  dialog.style.height=h+'px';dialog.style.top=(top+(fullscreen?0:Math.max(10,(height-h)/2)))+'px';dialog.style.bottom='auto';dialog.style.margin='0 auto';
 }
 const clean=()=>{if(cleaned)return;cleaned=true;parent?.removeEventListener('scroll',fit);parent?.removeEventListener('resize',fit);host.removeEventListener('resize',fit);doc?.removeEventListener('fullscreenchange',onFullscreen);if(ownsFullscreen&&doc?.fullscreenElement)doc.exitFullscreen?.().catch(()=>{});};
 const onFullscreen=()=>{if(ownsFullscreen&&!doc.fullscreenElement&&dialog.open)dialog.close();else fit();};
 const show=()=>{dialog.classList.toggle('is-full-view',fullscreen);fit();parent?.addEventListener('scroll',fit,{passive:true});parent?.addEventListener('resize',fit);host.addEventListener('resize',fit);doc?.addEventListener('fullscreenchange',onFullscreen);dialog.addEventListener('close',clean,{once:true});host.addEventListener('pagehide',clean,{once:true});dialog.showModal();};
 if(fullscreen&&doc?.fullscreenEnabled&&!doc.fullscreenElement&&doc.documentElement?.requestFullscreen){
  return doc.documentElement.requestFullscreen().then(()=>{ownsFullscreen=true;show();}).catch(show);
 }
 show();return Promise.resolve();
}
