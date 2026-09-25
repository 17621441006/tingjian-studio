// The studio iframe grows with its page. Fit image dialogs to the parent's
// visible viewport, not halfway down a several-thousand-pixel iframe.
export function openImageDialog(dialog,host){
 let parent=null;
 try{if(host.frameElement&&host.parent!==host){void host.parent.innerHeight;parent=host.parent;}}catch{/* Native viewport fallback. */}
 function fit(){
  let height=host.innerHeight||800,top=0;
  if(parent){const r=host.frameElement.getBoundingClientRect();height=Math.max(250,Math.min(parent.innerHeight,r.bottom)-Math.max(0,r.top));top=Math.max(0,-r.top);}
  const h=Math.min(1000,Math.max(220,height*.9));dialog.style.height=h+'px';dialog.style.top=(top+Math.max(10,(height-h)/2))+'px';dialog.style.bottom='auto';dialog.style.margin='0 auto';
 }
 fit();if(parent){parent.addEventListener('scroll',fit,{passive:true});parent.addEventListener('resize',fit);const clean=()=>{parent.removeEventListener('scroll',fit);parent.removeEventListener('resize',fit);};dialog.addEventListener('close',clean,{once:true});host.addEventListener('pagehide',clean,{once:true});}dialog.showModal();
}
