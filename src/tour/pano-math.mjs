export const RAD = Math.PI / 180;
export const clamp = (value, low, high) => Math.max(low, Math.min(high, value));
export const wrap = angle => ((angle + 180) % 360 + 360) % 360 - 180;
export function basis(yaw, pitch) {
  const y = yaw * RAD, p = pitch * RAD;
  return {
    forward: [Math.sin(y)*Math.cos(p), Math.sin(p), Math.cos(y)*Math.cos(p)],
    right: [Math.cos(y), 0, -Math.sin(y)],
    up: [-Math.sin(y)*Math.sin(p), Math.cos(p), -Math.cos(y)*Math.sin(p)]
  };
}
export function direction(yaw, pitch) { return basis(yaw, pitch).forward; }
export const DEFAULT_FOV = 68;
export const MIN_FOV = 44;
export const MAX_FOV = 82;
export function cameraFrame(camera, aspect) {
  // Architectural lens shift keeps verticals parallel around normal eye level.
  // Beyond +/-24 degrees, rotate the camera too, to retain comfortable up/down looking.
  const shiftPitch=clamp(camera.pitch,-24,24);
  const b=basis(camera.yaw,camera.pitch-shiftPitch);
  return {...b,shift:Math.tan(shiftPitch*RAD),tan:Math.tan(camera.fov*RAD/2)*Math.min(1,aspect)};
}
export function horizontalFov(camera,aspect){return 2*Math.atan(cameraFrame(camera,aspect).tan)/RAD;}
export function project(yaw, pitch, camera, width, height) {
  const b = cameraFrame(camera,width/height), d = direction(yaw, pitch);
  const dot = v => v.reduce((sum, x, i) => sum + x*d[i], 0);
  const depth = dot(b.forward);
  if (depth <= .025) return null;
  const tan = b.tan;
  const nx = dot(b.right) / (depth * tan);
  const ny = (dot(b.up)/depth-b.shift) / (tan / (width/height));
  return {x:(nx+1)*width/2, y:(1-ny)*height/2, visible:Math.abs(nx)<.95 && Math.abs(ny)<.89};
}
export function rayUV(nx, ny, camera, aspect) {
  const b=cameraFrame(camera,aspect), t=b.tan;
  const r=b.forward.map((v,i)=>v+b.right[i]*nx*t+b.up[i]*(ny*t/aspect+b.shift));
  const len=Math.hypot(...r);
  return {u:((Math.atan2(r[0],r[2])/(2*Math.PI)+.5)%1+1)%1, v:.5-Math.asin(clamp(r[1]/len,-1,1))/Math.PI};
}
export function canvasPanorama(ctx, source, width, height, camera) {
  const data = source.data, iw = source.width, ih = source.height;
  const result=ctx.createImageData(width,height), out=result.data;
  const aspect=width/height,b=cameraFrame(camera,aspect),t=b.tan;
  for (let y=0;y<height;y++) {
    const dy=(1-2*(y+.5)/height)*t/aspect+b.shift;
    for(let x=0;x<width;x++) {
      const dx=(2*(x+.5)/width-1)*t;
      const a=b.forward[0]+b.right[0]*dx+b.up[0]*dy;
      const q=b.forward[1]+b.right[1]*dx+b.up[1]*dy;
      const c=b.forward[2]+b.right[2]*dx+b.up[2]*dy;
      const u=clamp((Math.atan2(a,c)/(2*Math.PI)+.5)*iw-.5,0,iw-1);
      const v=clamp((.5-Math.asin(q/Math.hypot(a,q,c))/Math.PI)*ih-.5,0,ih-1);
      const x0=Math.floor(u), y0=Math.floor(v), fx=u-x0, fy=v-y0;
      const xx=x0, xn=Math.min(xx+1,iw-1), yy=y0, yn=Math.min(yy+1,ih-1);
      const a0=(yy*iw+xx)*4,a1=(yy*iw+xn)*4,a2=(yn*iw+xx)*4,a3=(yn*iw+xn)*4,o=(y*width+x)*4;
      for(let k=0;k<3;k++)out[o+k]=(data[a0+k]*(1-fx)+data[a1+k]*fx)*(1-fy)+(data[a2+k]*(1-fx)+data[a3+k]*fx)*fy;
      out[o+3]=255;
    }
  }
  ctx.putImageData(result,0,0);
}
