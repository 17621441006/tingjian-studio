export function hdFrame(width,height,imageWidth,imageHeight,view={zoom:1,x:0,y:0}){
  const fit=Math.min(1,width/imageWidth,height/imageHeight);
  const zoom=Math.max(1,Math.min(1/fit,view.zoom));
  const scale=fit*zoom;
  const maxX=Math.max(0,(imageWidth*scale-width)/2);
  const maxY=Math.max(0,(imageHeight*scale-height)/2);
  return {fit,zoom,scale,maxX,maxY,x:Math.max(-maxX,Math.min(maxX,view.x)),y:Math.max(-maxY,Math.min(maxY,view.y))};
}
