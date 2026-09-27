import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {COLLECTIONS,LIFE_SCENES,normalizeLifestyle} from './lifestyle-data.mjs';
// Lightweight independent design objects, not scans of the catalog or photo assets.
export function applyLifestyle(root,snapshot){
 const v=normalizeLifestyle(snapshot.lifestyle,snapshot.design),{rooms,objects}=root.userData,c=COLLECTIONS.find(c=>c.id===v.collection),scene=LIFE_SCENES.find(s=>s.id===v.scene);
 const material=(color,extra={})=>new THREE.MeshStandardMaterial({color,roughness:.6,...extra});
 const m={metal:material(c.colors[1],{metalness:.7,roughness:.32}),cloth:material(c.colors[0]),stone:material(c.colors[2]),dark:material('#211e1b'),glow:material('#e5cba1',{emissive:'#ffdca3',emissiveIntensity:scene.light/100}),ceramic:material(v.collection==='oriental'?'#758776':c.colors[0],{roughness:.35})};
 root.userData.ownedMaterials??=new Set();Object.values(m).forEach(mat=>root.userData.ownedMaterials.add(mat));
 const anchors={living:[6.55,4.82],dining:[3.1,6.82],master:[10.24,3.93],second:[7.47,6.73],balcony:[3.8,1.15],kitchen:[2.02,2.63],bath:[.32,5.25],utility:[.61,2.6]};
 const walls={living:[7.02,4.75,Math.PI/2],dining:[4.1,7.02,Math.PI],master:[10.54,3.77,Math.PI/2],second:[8.35,7.02,Math.PI],balcony:[3.57,1.43,-Math.PI/2],kitchen:[2.08,2.23,0],bath:[.09,5.8,-Math.PI/2],utility:[.09,3.05,-Math.PI/2]};
 const add=(geo,mat,g,x=0,y=0,z=0)=>{const mesh=new THREE.Mesh(geo,mat);mesh.position.set(x,y,z);mesh.castShadow=mesh.receiveShadow=true;mesh.userData.preserveMaterial=true;g.add(mesh);return mesh;};
 const box=(w,h,d,g,x,y,z,mat=m.metal)=>add(new RoundedBoxGeometry(w,h,d,2,Math.min(.02,w/5,h/5,d/5)),mat,g,x,y,z);
 const cyl=(a,b,h,g,x,y,z,mat=m.metal)=>add(new THREE.CylinderGeometry(a,b,h,20),mat,g,x,y,z);
 const sphere=(r,g,x,y,z,mat=m.ceramic)=>add(new THREE.SphereGeometry(r,18,12),mat,g,x,y,z);
 const group=(room,id,wall=false)=>{const g=new THREE.Group(),a=wall?walls[room]:anchors[room];g.name='life-'+room+'-'+id;g.position.set(a[0],0,a[1]);g.rotation.y=a[2]||0;g.userData={room,objectId:g.name,lifestyleItem:id};rooms.get(room).add(g);objects.set(g.name,g);return g;};
 const toObject=(g,id)=>{const anchor=objects.get(id);if(!anchor)return false;g.position.copy(anchor.position);g.rotation.copy(anchor.rotation);g.visible=anchor.visible;return true;};
 for(const [room,ids] of Object.entries(v.rooms))for(const id of ids){if(id==='climate')continue;const wall=['artwork','lighting','presence','panel','audio','mirror'].includes(id),g=group(room,id,wall);
  if(id==='lamp'){box(.36,.50,.36,g,0,.25,0,m.stone);cyl(.075,.10,.20,g,0,.6,0);if(v.collection==='nocturne')sphere(.18,g,0,.85,0,m.glow);else cyl(.13,.23,.22,g,0,.83,0,v.collection==='collector'?m.metal:m.glow);cyl(.19,.19,.01,g,0,.718,0,m.glow);}
  if(id==='sculpture'){g.position.x+=room==='balcony'?.35:-.42;box(.24,.55,.24,g,0,.275,0,m.stone);if(v.collection==='oriental'){const points=[[.08,0],[.13,.08],[.12,.22],[.04,.31],[.05,.36]].map(p=>new THREE.Vector2(...p));add(new THREE.LatheGeometry(points,20),m.ceramic,g,0,.56,0);const branch=cyl(.003,.005,.30,g,0,1.02,0);branch.rotation.z=.24;}else{box(.14,.035,.13,g,0,.57,0,m.dark);const ring=add(new THREE.TorusGeometry(.10,.032,10,30),v.collection==='collector'?m.metal:m.ceramic,g,0,.735,0);ring.scale.y=1.35;ring.rotation.y=.4;}}
  if(id==='textile'){const anchor=room==='living'?'living-sofa':room==='master'?'master-bed':room==='second'?'second-daybed':'balcony-bench';if(toObject(g,anchor)){if(room==='living'){for(const z of [-.60,.55]){const pillow=box(.17,.36,.36,g,-.12,.73,z,m.cloth);pillow.rotation.z=.15;}}else box(.85,.035,.39,g,0,.58,.55,m.cloth);}else{g.position.x+=.3;box(.55,.04,.30,g,0,.5,0,m.cloth);}}
  if(id==='curtain'){let pos=room==='master'?[9.48,.10,2.18,0]:room==='second'?[9.83,5.5,1.4,Math.PI/2]:[4.78,.69,2.55,0];if(room==='living')pos=[5.3,2.09,3.15,0];g.position.set(pos[0],0,pos[1]);g.rotation.y=pos[3];objects.get(room+'-curtains')?.traverse(o=>{o.visible=false;});const width=pos[2],spread=scene.curtain/100,panelWidth=width/2*(1-spread)+.20;for(const side of [-1,1]){const geo=new THREE.PlaneGeometry(panelWidth,2.25,20,15),p=geo.attributes.position;for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i);p.setXYZ(i,x+side*(width/2-panelWidth/2),y+1.19,.035*Math.sin(x*50));}geo.computeVertexNormals();const mat=m.cloth.clone();mat.side=THREE.DoubleSide;root.userData.ownedMaterials.add(mat);add(geo,mat,g);}box(width,.035,.045,g,0,2.37,0);g.userData.openPercent=scene.curtain;}
  if(id==='artwork'||id==='art-tv'){if(id==='art-tv'){toObject(g,'living-tv');objects.get('living-tv').visible=false;}if(id==='artwork'&&room==='dining')objects.get('entry-art')?.traverse(o=>{o.visible=false;});const y=id==='art-tv'?1.01:1.38;box(1.05,.66,.04,g,0,y,0);box(.99,.60,.045,g,0,y,.027,id==='art-tv'&&['cinema','away','night'].includes(v.scene)?m.dark:m.stone);if(!(id==='art-tv'&&['cinema','away','night'].includes(v.scene))){const disk=cyl(.18,.18,.005,g,-.18,y+.045,.054,m.cloth);disk.rotation.x=Math.PI/2;box(.36,.026,.007,g,.21,y-.11,.06,m.dark);}}
  if(id==='lighting'){box(.9,.025,.025,g,0,v.scene==='night'?.12:.94,.04,m.glow);g.userData.brightness=scene.light;}
  if(id==='presence'){sphere(.034,g,0,1.92,.04,m.stone);}
  if(id==='panel'){box(.085,.15,.016,g,.17,1.08,.025);for(let i=0;i<3;i++)box(.065,.025,.008,g,.17,1.12-i*.038,.038,m.dark);}
  if(id==='audio'){box(.10,.20,.06,g,-.20,1.5,.035,m.dark);}
  if(id==='mirror'){g.position.set(1.07,0,4.66);g.rotation.y=0;box(.70,.68,.02,g,0,1.4,0,m.glow);box(.66,.64,.03,g,0,1.4,.019,m.metal);}
  if(id==='coffee'){g.position.set(room==='kitchen'?2.10:2.36,0,room==='kitchen'?2.54:6.8);box(.31,.35,.28,g,0,1.06,0,m.dark);box(.27,.29,.018,g,0,1.08,.15);box(.22,.12,.02,g,0,1.04,.165,m.dark);cyl(.03,.025,.06,g,.04,.94,.2,m.stone);}
  if(id==='laundry'){g.position.set(.25,0,3.70);box(.25,.75,.16,g,0,.39,0,m.dark);cyl(.025,.025,.55,g,0,1.03,0);box(.20,.03,.15,g,0,.03,.05,m.stone);}
  if(id==='cleaning'){g.position.set(room==='utility'?.61:2.30,0,room==='utility'?2.83:5.62);box(.43,.43,.34,g,0,.235,0,m.dark);cyl(.17,.17,.085,g,0,.057,.26,m.stone);}
 }
 root.userData.lifestyle=v;return root;
}
