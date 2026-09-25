export const DEFAULT_SELECTION=Object.freeze({choice:'original',length:112,angle:0,offset:0});
export const PHOTO={width:1536,height:1024,fov:61.6,camera:[0,1.33,2.27],target:[0,1.064,0],objectPosition:[-.035,.005,-.20]};
export function selection(input={}){
  const value={...DEFAULT_SELECTION,...input};
  if(!['original','table','none'].includes(value.choice))throw new Error('请选择本轮提供的茶几方案');
  for(const [key,min,max] of [['length',90,124],['angle',-12,12],['offset',-8,8]]){
    value[key]=Number(value[key]);
    if(!Number.isFinite(value[key])||value[key]<min||value[key]>max)throw new Error('尺寸或位置超出本轮试验范围');
  }
  return value;
}
export function dimensions(state){const scale=selection(state).length/112;return {length:112*scale,depth:81.36*scale,height:26.21*scale};}
export function renderBrief(state){return {version:1,scene:'胡桃木私邸·客厅固定视角',selection:selection(state),dimensionsCm:dimensions(state),dimensionsVerified:false,model:'/assets/models/table.glb',interactivePreviewModel:'/tour/trial-assets/table-preview.glb',background:'/tour/trial-assets/table-removed.png',camera:PHOTO,calibration:'单张设计图人工估计；非测量标定',renderServiceConnected:false};}
