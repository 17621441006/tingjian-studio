import {floorProductLabel,floorProduct} from './floor-catalog.mjs';
export function createFloorLive(root,prefix='floor-live'){
 const $=s=>root.querySelector(s.replaceAll('data-floor-live','data-'+prefix)),host=$('[data-floor-live]'),canvas=$('[data-floor-live-canvas]');
 let api=null,pending=null,version=0,lastRoom=null;
 return async function sync(scene,frames,visible){
  if(!host||typeof canvas?.getContext!=='function')return;
  const token=++version,p=floorProduct(scene.floorProduct),show=visible&&!!p;host.hidden=!show;
  if(!show){api?.setVisible(false);return;}
  $('[data-floor-live-title]').textContent='地面试铺 · '+floorProductLabel(p);
  const status=$('[data-floor-live-status]');
  if(!api&&!pending){status.textContent='正在载入房间试铺…';pending=import('./whole-model.mjs').then(m=>m.createWholeModel({stage:$('[data-floor-live-stage]'),canvas,labels:$('[data-floor-live-labels]'),status,onSelect(){}})).then(value=>api=value).catch(()=>{pending=null;status.textContent='三维试铺未能载入，请重新点击地面选项重试。';});}
  await pending;if(!api||token!==version)return;
  api.update({design:scene.design,frames});api.isolateRoom(scene.room);api.setVisible(true);
  if(lastRoom!==scene.room){api.view(scene.room);lastRoom=scene.room;}
  status.textContent=p.imageType==='场景图'?'方格端木纹为程序近似试铺；以品牌实物样板为准。':'按品牌样板近似试铺，可拖动查看。';
 };
}
