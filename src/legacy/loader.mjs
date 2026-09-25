// The retained 3D study starts only when the user expands it in Step 4.
let pending,started=false;
const modelRoot=document.getElementById('daan-spaces');
function start(){
 if(!pending){modelRoot.querySelector('[data-model-status]').textContent='正在准备三维空间…';pending=import('./model.js').then(()=>{started=true;}).catch(()=>{modelRoot.querySelector('[data-model-status]').textContent='三维视图暂时无法载入；收起后再次展开可重试。上方效果图仍可查看。';pending=null;});}return pending;
}
for(const button of modelRoot.querySelectorAll('[data-style]'))button.addEventListener('click',()=>{modelRoot.dataset.requestedStyle=button.dataset.style;start();});
document.addEventListener('tingjian:model-visible',event=>{if(event.detail){start();}if(started)window.dispatchEvent(new Event('resize'));});
document.addEventListener('tingjian:coffee-change',()=>{modelRoot.dataset.requestedStyle='sculpt';});
