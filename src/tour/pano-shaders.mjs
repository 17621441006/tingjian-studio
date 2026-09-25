export const vertexShader = `
attribute vec2 position;
varying vec2 screen;
void main(){screen=position;gl_Position=vec4(position,0.0,1.0);}
`;
export const fragmentShader = `
precision highp float;
varying vec2 screen;
uniform sampler2D panorama;
uniform vec3 forwardV;
uniform vec3 rightV;
uniform vec3 upV;
uniform float tanHalf;
uniform float aspect;
uniform float verticalShift;
void main(){
  vec3 ray=normalize(forwardV+rightV*screen.x*tanHalf+upV*(screen.y*tanHalf/aspect+verticalShift));
  float u=fract(atan(ray.x,ray.z)/6.28318530718+0.5);
  float v=0.5-asin(clamp(ray.y,-1.0,1.0))/3.14159265359;
  gl_FragColor=texture2D(panorama,vec2(u,v));
}
`;
