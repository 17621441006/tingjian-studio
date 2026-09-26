import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {MODEL_ROOMS,wholeModelSpec} from './whole-model-state.mjs';
import {applyObjectVisibility} from './scene-objects.mjs';
import {furnishSecondary,furnishBalcony} from './room-furnishings.mjs';

export function buildWholeGeometry(snapshot,textures={},options={}){
 const spec=wholeModelSpec(snapshot),root=new THREE.Group(),rooms=new Map(),objects=new Map();root.name='confirmed-home';root.userData.spec=spec;
 const mat=(color,roughness=.7,extra={})=>new THREE.MeshStandardMaterial({color,roughness,...extra});
 const surface=(color,map,roughness=.7,extra={})=>mat(color,roughness,{map:textures[map]||null,...extra});
 const m={wall:mat(spec.palette.wall,.9),wood:surface(spec.palette.wood,'wood',.48),stone:surface('#a99f90','stone',.52),metal:mat('#66513c',.3,{metalness:.82}),dark:mat('#242521',.34),linen:surface('#f0e7d8','linen',.9),rug:surface('#b9a98e','linen',.98),white:mat('#f0efea',.22),leaf:mat('#4e6144',.85),glow:mat('#edcc9c',.5,{emissive:'#edbe81',emissiveIntensity:.55}),glass:mat('#807969',.15,{transparent:true,opacity:.34,depthWrite:false,metalness:.2,side:THREE.DoubleSide})};
 m.sofa=surface(spec.sofaColor,spec.sofaTextile?'linen':null,spec.sofaTextile?.87:.39,{bumpMap:spec.sofaTextile?(textures.linen||null):null,bumpScale:.0015});
 m.floor=spec.floor==='stone'?surface('#b7ac9b','stone',.5,{normalMap:textures.stoneNormal||null}):surface(spec.floor==='oak'?'#d9c4a1':'#6d4d36','oak',.57,{normalMap:textures.oakNormal||null});
 m.bedframe=spec.bed==='wood'?m.wood:spec.bed==='leather'?mat('#985b38',.42):surface('#d1c3ad','linen',.9);
 m.throw=surface({taupe:'#8e7862',ivory:'#ded6c3',olive:'#777f5e'}[spec.bedding],'linen',.92);
 const add=(mesh,parent)=>{mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;};
 function uv(geo,scale=1){const p=geo.attributes.position,n=geo.attributes.normal,u=geo.attributes.uv;if(!u)return geo;for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i),ny=Math.abs(n.getY(i)),nx=Math.abs(n.getX(i));u.setXY(i,(ny>.6?x:nx>.6?z:x)*scale,(ny>.6?z:y)*scale);}return geo;}
 const box=(w,h,d,x,y,z,material,parent)=>{const a=new THREE.Mesh(uv(new THREE.BoxGeometry(w,h,d)),material);a.position.set(x,y,z);return add(a,parent);};
 const round=(w,h,d,x,y,z,material,parent,r=.05)=>{const a=new THREE.Mesh(uv(new RoundedBoxGeometry(w,h,d,2,Math.min(r,w*.22,h*.3,d*.22)),material===m.sofa||material===m.linen?5:1),material);a.position.set(x,y,z);return add(a,parent);};
 const cylinder=(radius,h,x,y,z,material,parent)=>{const a=new THREE.Mesh(new THREE.CylinderGeometry(radius,radius,h,24),material);a.position.set(x,y,z);return add(a,parent);};
 function group(id,room,x=0,z=0,yaw=0){const g=new THREE.Group();g.name=id;g.userData.objectId=id;g.userData.room=room;g.position.set(x,0,z);g.rotation.y=yaw;rooms.get(room).add(g);objects.set(id,g);return g;}
 function polygon(points,material,parent){const shape=new THREE.Shape();points.forEach(([x,z],i)=>i?shape.lineTo(x,-z):shape.moveTo(x,-z));shape.closePath();const geo=new THREE.ShapeGeometry(shape);const mesh=new THREE.Mesh(geo,material);mesh.rotation.x=-Math.PI/2;add(mesh,parent);return mesh;}
 for(const room of MODEL_ROOMS){const g=new THREE.Group();g.name=room.id;g.userData.room=room.id;root.add(g);rooms.set(room.id,g);
  const choice=spec.floorByRoom[room.id];
  const fm=choice?mat(choice.color,choice.category==='wood'?.6:.48):['living','dining'].includes(room.id)?m.floor:['master','second'].includes(room.id)?surface('#73523d','oak',.6):m.stone;
  const floor=polygon(room.p,fm,g);floor.name=room.id+'-floor';floor.userData.floor=room.id==='living'||room.id==='dining'?spec.floor:['master','second'].includes(room.id)?'smoked':'stone';floor.userData.room=room.id;floor.userData.floorProduct=choice?.id||null;objects.set(floor.name,floor);
 }
 function wall(room,a,b,height=1.05){const length=Math.hypot(b[0]-a[0],b[1]-a[1]),mesh=box(length,height,.12,(a[0]+b[0])/2,height/2,(a[1]+b[1])/2,m.wall,rooms.get(room));mesh.rotation.y=-Math.atan2(b[1]-a[1],b[0]-a[0]);mesh.userData.straightWall=true;return mesh;}
 // Existing footprint and door gaps are retained. All wall heights are cut for the dollhouse view.
 const walls=[['utility',[0,2.16],[1.2,2.16]],['kitchen',[1.2,2.16],[3.48,2.16]],['utility',[0,2.16],[0,2.4]],['utility',[0,4.35],[0,4.56]],['bath',[0,4.56],[0,7.10]],['bath',[0,7.10],[1.85,7.10]],['dining',[1.85,7.10],[2.12,7.10]],['dining',[3.1,7.10],[7.13,7.10]],['second',[7.13,7.10],[9.91,7.10]],['second',[9.91,4.4],[9.91,7.1]],['master',[9.91,4.4],[10.64,4.4]],['master',[10.64,1.9],[10.64,4.4]],['master',[7.13,.78],[8.37,.78]],['master',[8.37,.78],[8.37,0]],['bath',[0,4.56],[1.85,4.56]],['utility',[1.2,2.16],[1.2,3.05]],['utility',[1.2,3.9],[1.2,4.56]],['kitchen',[1.85,5.23],[2.04,5.23]],['kitchen',[2.98,5.23],[3.48,5.23]],['kitchen',[3.48,2.16],[3.48,5.23]],['bath',[1.85,4.56],[1.85,5.38]],['bath',[1.85,6.24],[1.85,7.10]],['master',[7.13,1.17],[7.13,3.6]],['master',[7.13,4.37],[7.13,5.25]],['second',[7.13,6.25],[7.13,7.10]],['second',[7.13,4.4],[9.91,4.4]],['balcony',[3.48,2.16],[3.8,2.16]],['balcony',[6.73,2.16],[7.13,2.16]]];
 for(const args of walls)wall(...args);
 function windowUnit(id,room,a,b,clear=false,upperOpening=false){const g=group(id,room,a[0],a[1],-Math.atan2(b[1]-a[1],b[0]-a[0])),w=Math.hypot(b[0]-a[0],b[1]-a[1]),bottom=clear?.06:.65,top=2.43;g.userData.clear=clear;g.userData.upperOpening=upperOpening;
  if(!clear)box(w,.64,.12,w/2,.32,0,m.wall,g);for(const x of [0,w])box(.055,top-bottom,.09,x,(top+bottom)/2,0,m.wood,g);for(const y of [bottom,top])box(w,.052,.09,w/2,y,0,m.wood,g);
  if(upperOpening){box(w,.045,.09,w/2,1.30,0,m.wood,g);box(.036,top-1.30,.09,w-.50,(top+1.30)/2,0,m.wood,g);box(.02,.10,.035,w-.08,1.82,.06,m.metal,g);}
  else if(clear){box(.036,top-bottom,.09,w-.36,(top+bottom)/2,0,m.wood,g);}
  else {for(let i=1;i<Math.ceil(w/.85);i++)box(.035,top-bottom,.07,w*i/Math.ceil(w/.85),(top+bottom)/2,0,m.wood,g);box(w,.035,.07,w/2,1.45,0,m.wood,g);}
  if(upperOpening){box(w-.07,1.21,.012,w/2,.675,0,m.glass,g).castShadow=false;const sash=box(w-.07,1.07,.012,w/2,1.86,.10,m.glass,g);sash.rotation.x=-.14;sash.castShadow=false;}else box(w-.07,top-bottom-.07,.012,w/2,(top+bottom)/2,0,m.glass,g).castShadow=false;
 }
 windowUnit('balcony-window','balcony',[3.48,.57],[6.08,.57],spec.clearBalcony);windowUnit('balcony-side','balcony',[3.48,2.16],[3.48,.57],spec.clearBalcony);windowUnit('master-window','master',[8.37,0],[10.64,0],spec.clearMaster);windowUnit('master-side','master',[10.64,0],[10.64,1.9],spec.clearMaster);windowUnit('utility-window','utility',[0,2.4],[0,4.35],spec.clearUtility,true);
 if(options.shellOnly){root.userData.objects=objects;root.userData.rooms=rooms;root.userData.shellMaterials=m;return root;}
 function cabinet(id,room,x,z,w,d,h,yaw=0){const g=group(id,room,x,z,yaw);box(w,h,d,0,h/2,0,m.wood,g);for(let i=0;i<Math.round(w/.46);i++){const k=Math.round(w/.46),x=-w/2+(i+.5)*w/k;box(w/k-.012,h-.08,.025,x,h/2,d/2+.018,m.wood,g);box(.009,.24,.023,x+w/k*.36,h*.56,d/2+.044,m.metal,g);}return g;}
 function chair(id,room,x,z,yaw=0){const g=group(id,room,x,z,yaw);for(const xx of [-.19,.19])for(const zz of [-.18,.18])cylinder(.02,.45,xx,.225,zz,m.wood,g);round(.45,.08,.44,0,.45,0,m.sofa,g);round(.47,.28,.055,0,.64,-.18,m.wood,g);return g;}
 const opposite=spec.livingLayout==='social',storage=spec.livingLayout==='storage';
 const sofa=group('living-sofa','living',opposite?4.02:6.60,3.64,opposite?0:Math.PI);sofa.userData.choice=spec.sofa;sofa.userData.layout=spec.livingLayout;const length=spec.sofaLength;
 if(storage){box(.78,.34,2.5,0,.17,0,m.wood,sofa);for(let i=0;i<3;i++)box(.015,.27,.78,.40,.18,-.84+i*.84,m.wood,sofa);}else{for(const x of [-.30,.30])for(const z of [-length/2+.15,length/2-.15])cylinder(.017,.18,x,.09,z,m.metal,sofa);round(.82,.14,length,0,.22,0,m.wood,sofa);}
 round(.13,.54,length,-.34,.53,0,m.sofa,sofa);
 for(let i=0;i<3;i++){const z=-length/2+length/6+i*length/3;round(.70,.18,length/3-.016,.02,.40,z,m.sofa,sofa,.075);const cushion=round(.14,.34,length/3-.025,-.21,.63,z,m.sofa,sofa,.065);cushion.rotation.z=-.15;}
 for(const z of [-length/2+.025,length/2-.025])round(.82,.30,.085,0,.48,z,m.sofa,sofa,.03);
 for(const z of [-.63,.61]){const p=round(.12,.36,.36,-.15,.66,z,m.linen,sofa,.08);p.rotation.z=-.26;}
 const rug=group('living-rug','living',5.18,3.75);round(2.1,.018,2.7,0,.016,0,m.rug,rug,.02);
 const table=group('living-table','living',5.18,3.74);table.userData.choice=spec.table;
 if(spec.table==='glass'){const disc=cylinder(.54,.032,0,.405,0,m.glass,table);disc.scale.set(.69,1,1.10);}
 else round(.66,.047,1.03,0,.408,0,m.stone,table,.13);
 for(const x of [-.25,.25])for(const z of [-.35,.35])cylinder(.014,.38,x,.19,z,m.metal,table);
 box(.23,.035,.17,0,.45,0,m.linen,table);box(.25,.03,.18,.02,.482,.02,m.linen,table);
 const media=cabinet('living-media','living',opposite?6.91:3.69,3.1,1.65,.28,.40,opposite?-Math.PI/2:Math.PI/2);const tv=group('living-tv','living',media.position.x,media.position.z,media.rotation.y);box(1.2,.70,.025,0,.96,-.03,m.dark,tv);
 const dining=group('dining-table','dining',5.18,6.12);if(opposite){cylinder(.61,.055,0,.75,0,m.wood,dining);cylinder(.20,.71,0,.37,0,m.wood,dining);}else{round(1.34,.055,.77,0,.75,0,m.wood,dining);for(const x of [-.57,.57])for(const z of [-.28,.28])cylinder(.022,.71,x,.36,z,m.wood,dining);}
 if(storage){cabinet('dining-bench','dining',5.2,6.83,1.65,.46,.42);round(1.62,.07,.45,5.2,.46,6.83,m.sofa,rooms.get('dining'));}else{chair('dining-chair-1','dining',4.8,6.72);chair('dining-chair-2','dining',5.6,6.72);}
 chair('dining-chair-3','dining',4.8,5.54,Math.PI);chair('dining-chair-4','dining',5.6,5.54,Math.PI);cabinet('entry-storage','dining',2.14,6.39,1.05,.36,.9,Math.PI/2);
 function bed(id,room,x,z,w,yaw,main=false){const g=group(id,room,x,z,yaw);g.userData.choice=main?spec.bed:'daybed';g.userData.bedding=main?spec.bedding:'taupe';const f=main?m.bedframe:m.wood;round(w+.06,.20,2.04,0,.19,0,f,g);round(w,.20,2.01,0,.37,0,m.linen,g,.1);round(w+.12,.88,.13,0,.64,-1.04,f,g,.1);round(w+.04,.075,1.6,0,.505,.18,m.linen,g,.09);round(w+.06,.028,.58,0,.55,.66,main?m.throw:m.rug,g,.015);for(const px of w>1.5?[-.43,.43]:[0]){const a=round(w>1.5?.67:.78,.15,.43,px,.57,-.63,m.linen,g,.09);a.rotation.x=.12;}return g;}
 const rotated=spec.masterLayout==='rotated';bed('master-bed','master',rotated?8.9:9.4,rotated?2.6:2.68,1.64,rotated?0:-Math.PI/2,true);cabinet('master-wardrobe','master',rotated?10.33:7.47,rotated?2.6:1.82,1.5,.56,1.45,rotated?-Math.PI/2:Math.PI/2);
 if(spec.masterLayout==='storage'){cabinet('master-window-storage','master',9.45,.30,1.9,.5,.43);box(.95,.055,.48,8.07,.74,.99,m.wood,rooms.get('master'));}else if(!spec.clearMaster)box(2.08,.48,.43,9.45,.24,.24,m.stone,rooms.get('master'));
 round(2.10,.014,2.5,9.25,.012,2.7,m.rug,rooms.get('master'),.02);
 const furnish={spec,rooms,group,box,seat:round,cylinder,cabinet,chair,bed,m};if(!furnishSecondary(furnish)){bed('second-daybed','second',8.65,6.35,1.18,-Math.PI/2);cabinet('second-storage','second',7.97,4.77,1.23,.53,1.5);box(.48,.055,.98,9.60,.75,5.15,m.wood,rooms.get('second'));chair('second-chair','second',9.0,5.12,Math.PI/2);}
 const kitchen=cabinet('kitchen-cabinet','kitchen',3.12,3.83,2.19,.56,.83,-Math.PI/2);box(2.24,.04,.61,0,.86,0,m.stone,kitchen);box(.55,.022,.41,.56,.897,0,m.dark,kitchen);box(.51,.03,.38,-.46,.89,0,m.metal,kitchen);cabinet('kitchen-return','kitchen',2.3,2.48,1.62,.57,.82);box(.63,1.58,.64,1.64,.79,2.64,m.metal,rooms.get('kitchen'));
 const bath=cabinet('bath-vanity','bath',1.07,4.87,.99,.48,.68);box(1.03,.035,.51,0,.705,0,m.stone,bath);round(.41,.085,.3,0,.76,0,m.white,bath);box(.73,.70,.025,1.08,1.24,4.63,m.metal,rooms.get('bath'));
 round(.38,.42,.56,1.31,.23,6.55,m.white,rooms.get('bath'),.13);box(.34,.71,.16,1.31,.36,6.90,m.white,rooms.get('bath'));box(.012,1.6,1.03,.96,.81,6.46,m.glass,rooms.get('bath'));box(.92,1.6,.012,.48,.81,5.94,m.glass,rooms.get('bath'));
 const utility=cabinet('utility-laundry','utility',.63,4.07,.78,.74,1.92);for(const y of [.46,1.34]){box(.61,.79,.62,0,y,-.07,m.white,utility);const ring=cylinder(.218,.03,0,y,-.397,m.metal,utility);ring.rotation.x=Math.PI/2;const glass=cylinder(.179,.036,0,y,-.42,m.dark,utility);glass.rotation.x=Math.PI/2;}
 if(!furnishBalcony(furnish)){if(spec.balconyPlan==='tea'){box(.97,.035,.35,4.94,.75,.85,m.wood,rooms.get('balcony'));chair('balcony-chair','balcony',5.04,1.52);}else{cabinet('balcony-bench','balcony',5.0,.99,1.60,.4,.44);round(1.52,.065,.38,5.0,.50,.99,m.linen,rooms.get('balcony'));cylinder(.25,.045,6.38,.53,1.55,m.wood,rooms.get('balcony'));cylinder(.035,.50,6.38,.25,1.55,m.metal,rooms.get('balcony'));}
 }
 if(spec.design==='copper'){for(const [id,room,x,z,yaw]of [['entry-art','dining',5.1,7.03,0],['living-wall-art','living',7.04,3.55,Math.PI/2]]){const art=group(id,room,x,z,yaw);for(let i=0;i<7;i++)round(.18,.035,.025,-.54+i*.18,1.5+Math.sin(i)*.09,0,m.metal,art,.01);}}
 // Merge static submeshes per independent item/material; room and item identities survive picking.
 root.updateMatrixWorld(true);for(const item of objects.values()){if(!item.isGroup)continue;const byMaterial=new Map();for(const mesh of [...item.children]){if(!mesh.isMesh)continue;mesh.updateMatrix();const geo=mesh.geometry.clone().applyMatrix4(mesh.matrix);const rows=byMaterial.get(mesh.material)||[];rows.push(geo);byMaterial.set(mesh.material,rows);item.remove(mesh);mesh.geometry.dispose();}for(const [material,geos] of byMaterial){const nonIndexed=geos.map(g=>g.index?g.toNonIndexed():g),merged=mergeGeometries(nonIndexed);if(merged){const mesh=new THREE.Mesh(merged,material);mesh.castShadow=mesh.receiveShadow=true;item.add(mesh);}for(const g of new Set([...geos,...nonIndexed]))g.dispose();}}
 root.userData.objects=objects;root.userData.rooms=rooms;
 return applyObjectVisibility(root,spec);
}
export function disposeWholeGeometry(root){const materials=new Set(root?.userData.ownedMaterials||[]);if(root?.userData.shellMaterials)Object.values(root.userData.shellMaterials).forEach(m=>materials.add(m));root?.traverse(o=>{o.geometry?.dispose();if(o.material)materials.add(o.material);});materials.forEach(m=>m.dispose());}
