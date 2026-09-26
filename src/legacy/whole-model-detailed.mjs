import {applySceneDecor} from './scene-decor.mjs';
import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {buildWholeGeometry} from './whole-model-geometry.mjs';
import {MODEL_ROOMS} from './whole-model-state.mjs';
import {applyObjectVisibility} from './scene-objects.mjs';
import {furnishSecondary,furnishBalcony} from './room-furnishings.mjs';

// A separate, bounded-detail model. The original lightweight builder stays available.
// All dimensions are design estimates in metres, using the same room polygons and choices.
export function buildDetailedHome(snapshot,textures={}){
 const root=buildWholeGeometry(snapshot,textures,{shellOnly:true});root.name='detailed-confirmed-home';root.userData.quality='detailed';
 const {spec,rooms,objects,shellMaterials}=root.userData,amber=spec.design==='amber',copper=spec.design==='copper';
 const physical=(color,roughness=.6,extra={})=>new THREE.MeshPhysicalMaterial({color,roughness,...Object.fromEntries(Object.entries(extra).filter(([,v])=>v!==undefined))});
 const surface=(color,key,roughness=.65,extra={})=>physical(color,roughness,{map:textures[key]||null,...extra});
 const m={
  wood:surface(amber?'#f4e5d0':'#c4b5a6',amber?'oak':'wood',.44,{bumpMap:textures[amber?'oak':'wood'],bumpScale:.0015}),
  endwood:surface(amber?'#bda482':'#725d4a',amber?'oak':'wood',.52),
  stone:surface(spec.palette.stone,'stone',.5,{bumpMap:textures.stone,bumpScale:.001}),
  marble:surface(amber?'#bbc2c0':copper?'#5d6a60':'#ddd6c8','marble',.33,{normalMap:textures.marbleNormal,normalScale:new THREE.Vector2(.13,.13)}),
  metal:physical(copper?'#a38350':'#77664e',.27,{metalness:.86}),
  dark:physical('#262826',.38),wall:physical(spec.palette.wall,.93,{bumpMap:textures.stone,bumpScale:.001}),
  linen:surface('#f3eada','linen',.93,{normalMap:textures.woolNormal,normalScale:new THREE.Vector2(.10,.10),sheen:.65,sheenColor:new THREE.Color('#eae5db'),sheenRoughness:.88}),
  rug:surface(amber?'#e8e3d8':copper?'#b9b4a5':'#cbc2af','wool',.96,{normalMap:textures.woolNormal,normalScale:new THREE.Vector2(.25,.25),sheen:.5,sheenRoughness:.95}),
  accent:physical(amber?'#a86e4f':copper?'#696f59':'#817360',.9,{map:textures.linen,normalMap:textures.woolNormal,normalScale:new THREE.Vector2(.1,.1),sheen:.4}),
  white:physical('#eeeae2',.16,{clearcoat:.45,clearcoatRoughness:.17}),leaf:physical('#586b42',.64,{side:THREE.DoubleSide}),soil:physical('#40372c',1),
  glass:physical('#acb4aa',.12,{metalness:.18,transparent:true,opacity:.23,depthWrite:false,side:THREE.DoubleSide}),
  smokedGlass:physical(amber?'#a78d6c':'#76766a',.12,{metalness:.38,transparent:true,opacity:.68,depthWrite:false}),
  glow:physical('#e9d3af',.3,{emissive:'#ffd3a0',emissiveIntensity:spec.light==='daylight'?.06:.6})
 };
 m.sofa=physical(spec.sofaColor,spec.sofaTextile?.85:.43,{bumpMap:textures.linen,bumpScale:spec.sofaTextile?.0009:.00025,normalMap:spec.sofaTextile?textures.woolNormal:null,normalScale:new THREE.Vector2(.12,.12),sheen:spec.sofaTextile?.65:0,clearcoat:spec.sofaTextile?0:.13,clearcoatRoughness:.5});
 m.seam=physical(new THREE.Color(spec.sofaColor).multiplyScalar(.73),spec.sofaTextile?.9:.55);
 m.bedframe=spec.bed==='wood'?m.wood:spec.bed==='leather'?physical('#946442',.46,{bumpMap:textures.linen,bumpScale:.0002}):m.linen;
 m.throw=surface({taupe:amber?'#bc886b':'#998978',ivory:'#e9e3d6',olive:'#737b59'}[spec.bedding],'linen',.94,{normalMap:textures.woolNormal,normalScale:new THREE.Vector2(.15,.15),sheen:.55});
 m.floor=spec.floor==='stone'?surface(amber?'#e9e5dc':copper?'#969c92':spec.design==='graphite'?'#8c877e':'#c9c5b9','stone',.45,{bumpMap:textures.stone,bumpScale:.001}):surface(spec.floor==='oak'?'#ede3d0':'#71675b','oak',.49,{normalMap:textures.oakNormal,normalScale:new THREE.Vector2(.18,.18),roughnessMap:textures.oakArm});
 const bedfloor=surface(amber?'#ece0c9':'#948573','oak',.5,{normalMap:textures.oakNormal,normalScale:new THREE.Vector2(.16,.16)});
 const ownedMaterials=new Set(Object.values(m));root.userData.ownedMaterials=ownedMaterials;
 for(const room of MODEL_ROOMS){const floor=objects.get(room.id+'-floor'),choice=spec.floorByRoom[room.id];if(choice){ownedMaterials.add(floor.material);const mat=physical(choice.color,choice.category==='wood'?.60:.48);ownedMaterials.add(mat);floor.material=mat;continue;}floor.material=['living','dining'].includes(room.id)?m.floor:['master','second'].includes(room.id)?bedfloor:m.stone;}
 ownedMaterials.add(bedfloor);
 for(const room of rooms.values())for(const o of room.children)if(o.isMesh&&o.material===shellMaterials.wall)o.material=m.wall;
 for(const id of ['balcony-window','balcony-side','master-window','master-side','utility-window'])objects.get(id)?.traverse(o=>{if(o.isMesh){if(o.material===shellMaterials.glass){o.material=m.glass;o.castShadow=false;}else if(o.material===shellMaterials.wood)o.material=m.metal;}});
 const add=(geo,material,parent,x=0,y=0,z=0)=>{const mesh=new THREE.Mesh(geo,material);mesh.position.set(x,y,z);mesh.castShadow=mesh.receiveShadow=true;parent.add(mesh);return mesh;};
 function uv(geo,scale=1){const p=geo.attributes.position,n=geo.attributes.normal,u=geo.attributes.uv;if(!u)return geo;for(let i=0;i<p.count;i++){const nx=Math.abs(n.getX(i)),ny=Math.abs(n.getY(i)),nz=Math.abs(n.getZ(i));u.setXY(i,(ny>=nx&&ny>=nz?p.getX(i):nx>=nz?p.getZ(i):p.getX(i))*scale,(ny>=nx&&ny>=nz?p.getZ(i):p.getY(i))*scale);}return geo;}
 const box=(w,h,d,x,y,z,mat,p,r=.012)=>add(uv(r?new RoundedBoxGeometry(w,h,d,2,Math.min(r,w*.2,h*.2,d*.2)):new THREE.BoxGeometry(w,h,d)),mat,p,x,y,z);
 const cyl=(rt,rb,h,x,y,z,mat,p,n=28)=>add(new THREE.CylinderGeometry(rt,rb,h,n),mat,p,x,y,z);
 const sphere=(radius,x,y,z,mat,p)=>add(new THREE.SphereGeometry(radius,20,12),mat,p,x,y,z);
 const group=(id,room,x=0,z=0,yaw=0)=>{const g=new THREE.Group();g.name=id;g.userData.room=room;g.userData.objectId=id;g.position.set(x,0,z);g.rotation.y=yaw;rooms.get(room).add(g);objects.set(id,g);return g;};
 function tube(points,r,mat,p,closed=false){const path=new THREE.CatmullRomCurve3(points.map(v=>new THREE.Vector3(...v)),closed,'centripetal');return add(new THREE.TubeGeometry(path,Math.max(12,points.length*2),r,5,closed),mat,p);}
 function cushion(w,h,d,x,y,z,mat,p,seed=0,seam=true){
  const geo=new RoundedBoxGeometry(w,h,d,5,Math.min(.085,h*.4,w*.16,d*.16)),a=geo.attributes.position;
  for(let i=0;i<a.count;i++){const xx=a.getX(i),yy=a.getY(i),zz=a.getZ(i),nx=xx/(w/2),nz=zz/(d/2),edge=Math.pow(Math.max(Math.abs(nx),Math.abs(nz)),5),top=Math.max(0,yy/(h/2));a.setXYZ(i,xx+.0024*Math.sin(zz*41+seed)*edge,yy+top*(-.014*(1-nx*nx)*(1-nz*nz)+.0025*Math.sin(xx*75+zz*28+seed)*edge),zz);}
  geo.computeVertexNormals();const mesh=add(uv(geo,3),mat,p,x,y,z);mesh.userData.detail='soft-upholstery';
  if(seam){const pts=[],hw=w/2-.025,hd=d/2-.025,r=Math.min(.052,hw*.3,hd*.3);for(const [cx,cz,a]of[[hw-r,hd-r,0],[-hw+r,hd-r,Math.PI/2],[-hw+r,-hd+r,Math.PI],[hw-r,-hd+r,Math.PI*1.5]])for(let i=0;i<5;i++){const t=a+i/4*Math.PI/2;pts.push([x+cx+Math.cos(t)*r,y+h*.20,z+cz+Math.sin(t)*r]);}tube(pts,.0018,mat===m.sofa?m.seam:mat,p,true);}
  return mesh;
 }
 function cloth(w,l,x,y,z,mat,p,drop=.12){const geo=new THREE.PlaneGeometry(w,l,34,38),a=geo.attributes.position;for(let i=0;i<a.count;i++){const xx=a.getX(i),zz=a.getY(i),nx=xx/(w/2),nz=zz/(l/2),edge=Math.pow(Math.max(0,(Math.abs(nx)-.78)/.22),1.55),foot=Math.pow(Math.max(0,(nz-.83)/.17),1.4),loft=.028*Math.max(0,1-nx*nx)*(1-.45*nz*nz),ripples=.010*Math.sin(xx*24+zz*8)+.004*Math.cos(xx*51-zz*29);a.setXYZ(i,x+xx,y+loft+ripples-Math.max(edge,foot*.72)*drop,z+zz);}geo.computeVertexNormals();uv(geo,3);const material=mat.clone();material.side=THREE.DoubleSide;ownedMaterials.add(material);const mesh=add(geo,material,p);mesh.userData.detail='draped-textile';return mesh;}
 function vase(x,y,z,p,size=.13){const points=[[.44,0],[.69,.1],[1,.55],[.8,1.4],[.39,1.9],[.43,2.05]].map(([a,b])=>new THREE.Vector2(a*size,b*size));return add(new THREE.LatheGeometry(points,24),m.stone,p,x,y,z);}
 function books(x,y,z,p){for(let i=0;i<3;i++){const b=box(.22-i*.012,.023,.17,x,y+i*.025,z,i%2?m.endwood:m.linen,p,.003);b.rotation.y=i*.1;}}
 function plant(id,room,x,z,s=.8){const p=group(id,room,x,z);cyl(.15*s,.115*s,.28*s,0,.14*s,0,m.stone,p);cyl(.133*s,.133*s,.012,0,.284*s,0,m.soil,p);for(let j=0;j<5;j++){const a=j*2.4,h=(.58+j*.085)*s,bx=Math.cos(a)*.17*s,bz=Math.sin(a)*.17*s;tube([[0,.27*s,0],[bx*.45,h*.72,bz*.45],[bx,h,bz]],.003*s,m.endwood,p);for(let i=0;i<3;i++){const leaf=sphere(.10*s,bx+Math.cos(a+i)*.08*s,h-i*.075*s,bz+Math.sin(a+i)*.075*s,m.leaf,p);leaf.scale.set(.42,1.4,.09);leaf.rotation.set(.4,a+i,.8);}}return p;}
 function cabinet(id,room,x,z,w,d,h,yaw=0,open=false){const g=group(id,room,x,z,yaw);box(w,h-.12,d,0,h/2+.03,0,m.wood,g);box(w-.1,.10,d-.09,0,.05,0,m.dark,g);const count=Math.max(2,Math.round(w/.42));for(let i=0;i<count;i++){const xx=-w/2+(i+.5)*w/count;if(open&&i===0){box(w/count-.045,h*.33,.018,xx,h*.55,d/2+.016,m.dark,g);box(w/count-.04,.022,d*.63,xx,h*.39,d*.19,m.wood,g);books(xx,h*.405,d*.14,g);}else{box(w/count-.013,h-.14,.02,xx,h/2+.02,d/2+.017,m.wood,g,.004);box(.009,.18,.018,xx+w/count*.34,h*.58,d/2+.039,m.metal,g,.002);}}return g;}
 function chair(id,room,x,z,yaw=0){const g=group(id,room,x,z,yaw);for(const sx of [-1,1])for(const sz of [-1,1])tube([[sx*.21,.018,sz*.20],[sx*.19,.29,sz*.175],[sx*.18,.45,sz*.17]],.019,m.wood,g);cushion(.43,.065,.41,0,.45,0,m.linen,g,3);const pts=[];for(let i=0;i<15;i++){const a=-1.1+i/14*2.2;pts.push([Math.sin(a)*.265,.73,-.21+(.265-Math.cos(a)*.265)*.9]);}tube(pts,.032,m.wood,g);for(const x of [-.19,.19])tube([[x,.45,-.17],[x,.70,-.21]],.016,m.wood,g);return g;}
 function curtain(id,room,x,z,w,yaw=0){const g=group(id,room,x,z,yaw);for(const side of [-1,1]){const width=.30,geo=new THREE.PlaneGeometry(width,2.30,22,20),a=geo.attributes.position;for(let i=0;i<a.count;i++){const xx=a.getX(i),yy=a.getY(i);a.setXYZ(i,side*(w/2-width/2)+xx,yy+1.2,.047*Math.sin(xx/width*Math.PI*10)+.005*Math.sin(yy*9));}geo.computeVertexNormals();const mat=m.linen.clone();mat.side=THREE.DoubleSide;ownedMaterials.add(mat);add(geo,mat,g);}box(w,.03,.025,0,2.40,0,m.metal,g,.001);return g;}
 function floorLamp(id,room,x,z){const g=group(id,room,x,z);cyl(.12,.145,.025,0,.016,0,m.metal,g);cyl(.009,.012,1.27,0,.65,0,m.metal,g,12);cyl(.16,.235,.28,0,1.41,0,m.linen,g,40);cyl(.155,.21,.012,0,1.278,0,m.glow,g);return g;}
 function sideWindow(id,room,a,b,sill=.95,privacy=false){const w=Math.hypot(b[0]-a[0],b[1]-a[1]),top=2.35,g=group(id,room,a[0],a[1],-Math.atan2(b[1]-a[1],b[0]-a[0]));g.userData.clear=false;for(const x of [0,w,w-.32])box(.036,top-sill,.07,x,(top+sill)/2,0,m.metal,g,.002);for(const y of [sill,top])box(w,.035,.07,w/2,y,0,m.metal,g,.002);box(w+.055,.025,.16,w/2,sill-.018,0,m.stone,g,.003);const glass=privacy?m.glass.clone():m.glass;if(privacy){glass.opacity=.6;glass.roughness=.58;ownedMaterials.add(glass);}box(w-.06,top-sill-.05,.012,w/2,(top+sill)/2,0,glass,g,0);box(.012,.10,.024,w-.055,(top+sill)/2,.055,m.metal,g,.003);return g;}
 // These openings follow the window sides shown in the supplied floor plan.
 sideWindow('kitchen-window','kitchen',[2.03,2.17],[3.28,2.17],1.08);
 sideWindow('second-window','second',[9.90,4.78],[9.90,6.20],1.06);
 sideWindow('bath-window','bath',[.015,4.86],[.015,5.65],1.19,true);

 // Cabinet edges, tile joints and plinths make the same footprint legible at closer views.
 const foundation=new THREE.Group();foundation.name='floor-thickness';root.add(foundation);
 for(const r of MODEL_ROOMS){const sh=new THREE.Shape();r.p.forEach(([x,z],i)=>i?sh.lineTo(x,-z):sh.moveTo(x,-z));sh.closePath();const a=add(new THREE.ExtrudeGeometry(sh,{depth:.12,bevelEnabled:false}),m.wall,foundation);a.rotation.x=-Math.PI/2;a.position.y=-.12;}
 const joints=group('living-floor-joints','living');joints.visible=!spec.floorByRoom.living;const jointMat=physical(spec.floor==='stone'?'#a9a597':'#796f60',.9);ownedMaterials.add(jointMat);
 if(spec.floor==='stone'&&!spec.floorByRoom.living){for(let x=3.48+.9;x<7.13;x+=.9)box(.002,.001,4.91,x,.004,4.615,jointMat,joints,0);for(let z=2.16+.9;z<7.10;z+=.9)box(3.65,.001,.002,5.305,.004,z,jointMat,joints,0);}
 const opposite=spec.livingLayout==='social',storage=spec.livingLayout==='storage',length=spec.sofaLength;
 const sofa=group('living-sofa','living',opposite?4.02:6.59,3.64,opposite?0:Math.PI);sofa.userData.choice=spec.sofa;sofa.userData.layout=spec.livingLayout;
 if(storage){box(.81,.34,2.5,0,.17,0,m.wood,sofa);for(let i=0;i<3;i++)box(.012,.27,.77,.415,.18,-.84+i*.84,m.wood,sofa);}else{for(const x of [-.3,.3])for(const z of [-length/2+.14,length/2-.14])cyl(.014,.021,.16,x,.085,z,m.metal,sofa,14);box(.84,.105,length,0,.205,0,m.wood,sofa,.016);}
 const back=box(.145,.48,length-.045,-.365,.52,0,m.sofa,sofa,.045);back.rotation.z=-.08;
 const count=amber?2:3;
 for(let i=0;i<count;i++){const z=-length/2+length/(2*count)+i*length/count;cushion(.70,.165,length/count-.036,.045,.405,z,m.sofa,sofa,i*3);const g=new THREE.Group();g.position.set(-.245,.637,z);g.rotation.z=-Math.PI/2+.16;sofa.add(g);cushion(.355,.15,length/count-.032,0,0,0,m.sofa,g,i*5);}
 for(const z of [-length/2+.035,length/2-.035])cushion(.80,amber?.35:.28,amber?.13:.105,.012,.50,z,m.sofa,sofa,5);
 for(const [z,mat]of[[-.65,m.linen],[.58,m.accent]]){const g=new THREE.Group();g.position.set(-.12,.64,z);g.rotation.z=-1.2;g.rotation.x=.13;sofa.add(g);cushion(.37,.13,.37,0,0,0,mat,g,12);}
 cloth(.58,.49,.10,.52,.65,m.throw,sofa,.095);
 const rug=group('living-rug','living',5.21,3.80);box(2.06,.013,2.72,0,.014,0,m.rug,rug,.005);
 const edging=m.rug.clone();edging.color.multiplyScalar(.85);ownedMaterials.add(edging);for(const x of [-1.01,1.01])box(.018,.002,2.69,x,.022,0,edging,rug,.001);for(const z of [-1.34,1.34])box(2.04,.002,.018,0,.022,z,edging,rug,.001);
 if(amber)for(let i=0;i<3;i++)box(.016,.002,2.58,-.62+i*.026,.023,0,edging,rug,.001);
 const table=group('living-table','living',5.19,3.77);table.userData.choice=spec.table;
 if(spec.table==='glass'||amber||copper){const a=cyl(.55,.55,.025,0,.407,0,m.smokedGlass,table,48);a.scale.x=.65;for(const x of [-.23,.23])for(const z of [-.35,.35])cyl(.010,.015,.37,x,.195,z,m.metal,table,14);box(.42,.019,.74,0,.14,0,m.wood,table,.022);}
 else {box(.70,.043,1.05,0,.41,0,m.marble,table,.014);for(const z of [-.32,.32])box(.45,.365,.11,0,.195,z,m.wood,table,.02);}
 books(-.055,.446,-.20,table);vase(.055,.436,.22,table,.065);
 const media=cabinet('living-media','living',opposite?6.90:3.69,3.20,1.70,.30,.42,opposite?-Math.PI/2:Math.PI/2,true);const tv=group('living-tv','living',media.position.x,media.position.z,media.rotation.y);box(1.18,.68,.025,0,1.01,-.025,m.dark,tv,.006);box(1.14,.637,.008,0,1.01,-.006,m.smokedGlass,tv,.002);
 floorLamp('living-floorlamp','living',opposite?4.03:6.72,2.40);plant('living-plant','living',opposite?6.72:3.83,2.46,.84);
 const dining=group('dining-table','dining',5.16,6.08);if(opposite||amber){cyl(.59,.59,.046,0,.74,0,m.wood,dining,44);cyl(.16,.23,.69,0,.366,0,m.wood,dining);}else{box(1.34,.045,.77,0,.74,0,m.wood,dining,.017);for(const x of [-.55,.55])for(const z of [-.26,.26])cyl(.019,.026,.70,x,.37,z,m.wood,dining);}
 if(storage){cabinet('dining-bench','dining',5.18,6.81,1.61,.46,.42);cushion(1.59,.066,.43,5.18,.467,6.81,m.sofa,rooms.get('dining'));}else{chair('dining-chair-1','dining',4.78,6.67);chair('dining-chair-2','dining',5.56,6.67);}
 chair('dining-chair-3','dining',4.78,5.48,Math.PI);chair('dining-chair-4','dining',5.56,5.48,Math.PI);vase(.15,.771,0,dining,.07);cyl(.12,.07,.02,-.18,.778,0,m.white,dining);
 cabinet('entry-storage','dining',2.15,6.39,1.08,.38,.95,Math.PI/2,true);
 const entryArt=group('entry-art','dining',5.1,7.028,Math.PI);box(1.00,.57,.026,0,1.43,0,m.wood,entryArt);box(.955,.527,.017,0,1.43,.025,m.stone,entryArt);for(let i=0;i<7;i++){const xx=-.34+i*.11;box(.024,.26+Math.sin(i*.9)*.12,.019,xx,1.43,.039,copper?m.metal:m.endwood,entryArt,.005);}
 function bed(id,room,x,z,w,yaw,main=false){const g=group(id,room,x,z,yaw);g.userData.choice=main?spec.bed:'daybed';g.userData.bedding=main?spec.bedding:'taupe';const frame=main?m.bedframe:m.wood;box(w-.14,.15,1.83,0,.105,0,m.dark,g,.018);box(w+.06,.15,2.04,0,.23,0,frame,g,.035);cushion(w,.21,1.98,0,.40,0,m.linen,g,5,false);box(w+.12,.87,.125,0,.61,-1.03,frame,g,.032);if(spec.bed==='wood')cushion(w-.09,.05,.58,0,.85,-.953,m.linen,g,6,false).rotation.x=Math.PI/2;cloth(w+.12,1.55,0,.548,.21,m.linen,g,.14);cloth(w+.13,.47,0,.573,.67,main?m.throw:m.accent,g,.145);for(const px of w>1.5?[-.43,.43]:[0]){const p=cushion(w>1.5?.68:.77,.15,.43,px,.596,-.65,m.linen,g,2);p.rotation.x=.12;}return g;}
 const rotated=spec.masterLayout==='rotated';const bedGroup=bed('master-bed','master',rotated?8.90:9.40,rotated?2.60:2.68,1.64,rotated?0:-Math.PI/2,true);
 for(const x of [-1.05,1.05]){box(.35,.035,.32,x,.54,-.72,m.wood,bedGroup);cyl(.042,.060,.155,x,.64,-.71,m.glow,bedGroup,20);}
 cabinet('master-wardrobe','master',rotated?10.33:7.47,rotated?2.6:1.82,1.50,.56,1.66,rotated?-Math.PI/2:Math.PI/2);
 const bedroomRug=group('master-rug','master',9.20,2.65);box(2.11,.012,2.50,0,.013,0,m.rug,bedroomRug);
 if(spec.masterLayout==='storage'){cabinet('master-window-storage','master',9.45,.30,1.9,.5,.43);box(.95,.045,.48,8.07,.74,.99,m.wood,rooms.get('master'));}else if(!spec.clearMaster)box(2.05,.46,.43,9.45,.23,.24,m.stone,rooms.get('master'));
 curtain('master-curtains','master',9.48,.10,2.18);curtain('balcony-curtains','balcony',4.78,.69,2.55);
 const furnish={spec,rooms,group,box,seat:cushion,cylinder:(r,h,x,y,z,mat,p)=>cyl(r,r,h,x,y,z,mat,p),cabinet,chair,bed,m};if(!furnishSecondary(furnish)){bed('second-daybed','second',8.65,6.34,1.17,-Math.PI/2);cabinet('second-storage','second',7.97,4.77,1.23,.53,1.64,0,true);box(.48,.039,.98,9.60,.75,5.13,m.wood,rooms.get('second'));chair('second-chair','second',9.03,5.14,Math.PI/2);books(9.58,.785,4.95,rooms.get('second'));}
 const kitchen=cabinet('kitchen-cabinet','kitchen',3.12,3.83,2.19,.56,.84,-Math.PI/2);box(2.24,.027,.62,0,.87,0,m.marble,kitchen,.007);box(.56,.014,.40,.57,.89,0,m.dark,kitchen,.008);for(const x of [.39,.75])for(const z of [-.11,.11]){const ring=add(new THREE.TorusGeometry(.070,.002,5,28),m.metal,kitchen,x,.901,z);ring.rotation.x=Math.PI/2;}
 box(.5,.011,.37,-.46,.891,0,m.metal,kitchen,.01);box(.425,.005,.295,-.46,.899,0,m.dark,kitchen,.017);tube([[-.46,.90,-.20],[-.46,1.13,-.20],[-.46,1.17,-.13],[-.46,1.13,-.04]],.010,m.metal,kitchen);
 const ret=cabinet('kitchen-return','kitchen',2.28,2.49,1.56,.57,.84);box(1.59,.027,.62,0,.87,0,m.marble,ret,.007);box(.62,1.80,.62,1.62,.90,2.51,m.metal,rooms.get('kitchen'));box(.56,.007,.016,1.62,1.19,2.829,m.dark,rooms.get('kitchen'));
 const bath=cabinet('bath-vanity','bath',1.07,4.87,.98,.46,.65);bath.position.y=.14;box(1.04,.027,.51,0,.675,0,m.marble,bath,.008);const basin=cyl(.21,.17,.075,0,.728,0,m.white,bath,36);basin.scale.z=.74;cyl(.035,.035,.001,0,.769,0,m.metal,bath);tube([[.32,.69,-.09],[.32,.86,-.09],[.22,.88,-.04],[.18,.85,0]],.01,m.metal,bath);box(.70,.71,.026,1.08,1.4,4.61,m.metal,rooms.get('bath'),.012);box(.66,.67,.008,1.08,1.4,4.633,m.smokedGlass,rooms.get('bath'),.012);
 const wc=group('bath-wc','bath',1.3,6.50);const bowl=sphere(.23,0,.29,0,m.white,wc);bowl.scale.set(.8,.8,1.35);cyl(.12,.145,.22,0,.11,.07,m.white,wc);const seat=add(new THREE.TorusGeometry(.155,.025,8,32),m.white,wc,0,.445,-.025);seat.rotation.x=Math.PI/2;seat.scale.y=1.33;box(.33,.73,.16,0,.365,.34,m.white,wc,.025);
 const shower=group('bath-shower','bath');box(.01,1.85,1.05,.96,.935,6.48,m.glass,shower,0);box(.95,1.85,.01,.48,.935,5.95,m.glass,shower,0);tube([[.08,.18,6.47],[.08,1.84,6.47],[.30,1.84,6.47]],.012,m.metal,shower);const rose=cyl(.11,.11,.015,.30,1.82,6.47,m.metal,shower);box(.63,.004,.011,.46,.015,6.98,m.metal,shower,0);
 const laundry=group('utility-laundry','utility',.62,4.09);box(.78,1.95,.74,0,.975,0,m.wood,laundry);for(const y of [.455,1.31]){box(.615,.805,.63,0,y,-.08,m.white,laundry,.016);const ring=cyl(.222,.222,.033,0,y-.03,-.407,m.metal,laundry,40);ring.rotation.x=Math.PI/2;const glass=cyl(.181,.181,.039,0,y-.03,-.431,m.smokedGlass,laundry,40);glass.rotation.x=Math.PI/2;box(.19,.064,.007,.145,y+.306,-.406,m.dark,laundry,.004);const dial=cyl(.029,.029,.019,-.105,y+.306,-.412,m.metal,laundry);dial.rotation.x=Math.PI/2;}for(let i=0;i<5;i++)box(.62,.006,.012,0,1.80+i*.026,-.38,m.dark,laundry,0);
 if(!furnishBalcony(furnish)){if(spec.balconyPlan==='tea'){box(1.02,.032,.36,4.98,.745,.87,m.wood,rooms.get('balcony'));chair('balcony-chair','balcony',5.03,1.51);}else{const bench=cabinet('balcony-bench','balcony',5.0,1.0,1.59,.40,.42);cushion(1.54,.075,.38,0,.468,0,m.linen,bench,4);}
 }
 if(copper){const art=group('living-wall-art','living',7.04,3.64,Math.PI/2);tube([[-.60,1.48,0],[-.35,1.63,0],[-.1,1.52,0],[.20,1.64,0],[.58,1.58,0]],.022,m.metal,art);}
 plant('balcony-plant','balcony',6.60,1.54,.85);
 // Merge static draw calls within independent objects, retaining room/item identities.
 for(const item of objects.values()){if(!item.isGroup)continue;item.updateMatrixWorld(true);const inverse=new THREE.Matrix4().copy(item.matrixWorld).invert(),rows=new Map(),original=[];item.traverse(mesh=>{if(!mesh.isMesh||mesh.userData.straightWall)return;const geo=mesh.geometry.clone().applyMatrix4(new THREE.Matrix4().multiplyMatrices(inverse,mesh.matrixWorld));const list=rows.get(mesh.material)||[];list.push(geo);rows.set(mesh.material,list);original.push(mesh);});for(const mesh of original){mesh.removeFromParent();mesh.geometry.dispose();}for(const [material,geos]of rows){const inputs=geos.map(g=>g.index?g.toNonIndexed():g),merged=mergeGeometries(inputs);if(merged){const mesh=add(merged,material,item);if(material.transparent)mesh.castShadow=false;}for(const g of new Set([...geos,...inputs]))g.dispose();}}
 root.userData.detailFeatures=['upholstery-seams','cushion-creases','draped-bedding','pleated-curtains','cabinet-reveals','tile-joints','bathroom-fittings','textured-surfaces'];
 return applyObjectVisibility(applySceneDecor(root,spec),spec);
}
