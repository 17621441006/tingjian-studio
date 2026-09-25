import {DEFAULT_FOV} from './pano-math.mjs';
export function arrivalCamera(current,node,{preserve=false,arrivalYaw,fromNorth=0}={}){
 // A room's panorama has a local zero. Preserve WORLD heading across nodes,
 // including the balcony's 180° and study's 90° calibration offsets.
 return preserve?{...current,yaw:((current.yaw+fromNorth-(node.north||0)+540)%360)-180}:{yaw:arrivalYaw??node.yaw,pitch:node.pitch,fov:current?.fov??DEFAULT_FOV};
}
