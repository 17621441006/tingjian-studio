import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {RoomEnvironment} from 'three/examples/jsm/environments/RoomEnvironment.js';
import {RoundedBoxGeometry} from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import {ROOM} from './state.mjs';

export async function createScene({viewport,canvas,catalog,onSelect,onMove,onDragStart,onDragEnd,onProgress,getState}){
 const scene=new THREE.Scene();scene.background=new THREE.Color('#e5e5d9');
 const camera=new THREE.PerspectiveCamera(48,1,.035,120);const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:false,powerPreference:'high-performance'});
 renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.7));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.02;renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
 const controls=new OrbitControls(camera,canvas);controls.enableDamping=true;controls.dampingFactor=.11;controls.minDistance=.45;controls.maxDistance=15;controls.maxPolarAngle=Math.PI*.495;controls.minPolarAngle=.01;controls.rotateSpeed=.6;controls.panSpeed=.6;
 const environment=new RoomEnvironment();const pmrem=new THREE.PMREMGenerator(renderer);scene.environment=pmrem.fromScene(environment,.035).texture;scene.environmentIntensity=.65;environment.dispose();pmrem.dispose();
 scene.add(new THREE.HemisphereLight(0xfffcf0,0x8a7764,1.9));
 const sun=new THREE.DirectionalLight(0xffead3,3.6);sun.position.set(-3.8,6,-5.2);sun.target.position.set(.2,0,.2);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-6,right:6,top:6,bottom:-6,near:.1,far:25});sun.shadow.bias=-.0002;sun.shadow.normalBias=.012;sun.shadow.radius=3;scene.add(sun,sun.target);
 const fill=new THREE.DirectionalLight(0xeaf1fc,1.1);fill.position.set(2,4,5);scene.add(fill);
 const texloader=new THREE.TextureLoader(),textures=new Map();let request;
 function texture(name,rx=1,ry=1){const t=texloader.load('/assets/textures/'+name+'.jpg',()=>request?.());t.colorSpace=THREE.SRGBColorSpace;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(rx,ry);t.anisotropy=Math.min(renderer.capabilities.getMaxAnisotropy(),8);return t;}
 const woodTex=texture('wood',1,1),stoneTex=texture('stone',1,1),rugTex=texture('rug',6,5),linenTex=texture('linen',2,6);
 const mats={wall:new THREE.MeshStandardMaterial({color:'#e9e4d6',roughness:.96}),wood:new THREE.MeshStandardMaterial({map:woodTex,color:'#c5a47b',roughness:.53}),darkwood:new THREE.MeshStandardMaterial({map:woodTex,color:'#806243',roughness:.48}),stone:new THREE.MeshStandardMaterial({map:stoneTex,color:'#d5d0c2',roughness:.47}),metal:new THREE.MeshStandardMaterial({color:'#514c3c',metalness:.7,roughness:.34}),linen:new THREE.MeshStandardMaterial({map:linenTex,color:'#fcf8e8',roughness:.93,side:THREE.DoubleSide}),rug:new THREE.MeshStandardMaterial({map:rugTex,color:'#d9c5a3',roughness:1}),pot:new THREE.MeshStandardMaterial({color:'#9c8d75',roughness:.97}),leaf:new THREE.MeshStandardMaterial({color:'#637149',roughness:.89,side:THREE.DoubleSide})};
 const room=new THREE.Group(),walls=new THREE.Group(),floor=new THREE.Group(),decor=new THREE.Group();scene.add(room);room.add(walls,floor,decor);
 function box(parent,w,h,d,x,y,z,mat,round=0){const g=round?new RoundedBoxGeometry(w,h,d,3,round):new THREE.BoxGeometry(w,h,d);const m=new THREE.Mesh(g,mat);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
 function slab(points,y,mat){const shape=new THREE.Shape();points.forEach(([x,z],i)=>i?shape.lineTo(x,-z):shape.moveTo(x,-z));shape.closePath();const g=new THREE.ShapeGeometry(shape);const m=new THREE.Mesh(g,mat);m.rotation.x=-Math.PI/2;m.position.y=y;m.receiveShadow=true;room.add(m);return m;}
 slab(ROOM.polygon,-.05,mats.stone);slab(ROOM.balcony,-.05,mats.stone);
 // A tiled surface follows the same L-shaped room used by the earlier layout.
 const tiles=[];for(let x=-3.4;x<1.82;x+=.59)for(let z=-4.04;z<2.47;z+=.59){const inLiving=x>=-1.82&&z>=-2.47||x< -1.82&&z>=.60;const inBalcony=z< -2.47&&x>=-1.82&&(x<.775||z>=-3.46);if(!inLiving&&!inBalcony)continue;const w=Math.min(.585,1.825-x),d=Math.min(.585,2.47-z);if(w<.01||d<.01)continue;const mesh=box(floor,w,.035,d,x+w/2,-.025,z+d/2,mats.stone);mesh.castShadow=false;tiles.push(mesh);}
 // Main walls, left dining recess, balcony return: original boundaries retained.
 box(walls,.12,2.65,3.07,-1.885,1.325,-.935,mats.wall);box(walls,1.63,2.65,.12,-2.64,1.325,.54,mats.wall);box(walls,.12,2.65,1.93,-3.515,1.325,1.565,mats.wall);box(walls,.12,2.65,4.94,1.885,1.325,0,mats.wall);
 box(walls,.12,2.65,1.59,-1.885,1.325,-3.265,mats.wall);box(walls,1.05,2.65,.12,1.30,1.325,-3.52,mats.wall);box(walls,.12,2.65,.6,.835,1.325,-3.76,mats.wall);
 // Rear entry and ceiling close the room for the eye-level views.
 box(walls,3.945,2.65,.12,-.1475,1.325,2.53,mats.wall);box(walls,.455,2.65,.12,-3.2275,1.325,2.53,mats.wall);box(walls,.88,.55,.12,-2.56,2.375,2.53,mats.wall);
 box(walls,3.65,.10,4.94,0,2.70,0,mats.wall);box(walls,1.63,.10,1.87,-2.64,2.70,1.535,mats.wall);box(walls,2.6,.10,1.59,-.525,2.70,-3.265,mats.wall);
 box(walls,1.05,.10,.99,1.30,2.70,-2.965,mats.wall);
 // Low window sill and fine mullions give the balcony depth without wall removal.
 box(walls,2.6,.60,.13,-.525,.3,-4.1,mats.wall);box(walls,2.6,.13,.14,-.525,2.59,-4.1,mats.wall);
 for(const x of [-1.78,-.9,.01,.73])box(walls,.035,1.88,.045,x,1.56,-4.09,mats.metal);
 for(const y of [.69,1.16,2.50])box(walls,2.56,.025,.04,-.525,y,-4.09,mats.metal);
 box(walls,3.65,.20,.2,0,2.55,-2.47,mats.wall);for(const x of [-1.74,1.74])box(walls,.10,2.45,.14,x,1.225,-2.47,mats.darkwood);
 // Open sliding panels remain parked at the edges of the original opening.
 const glass=new THREE.MeshPhysicalMaterial({color:'#dbe3dd',transparent:true,opacity:.14,roughness:.05,metalness:.1,depthWrite:false});
 for(const x of [-1.49,1.49]){box(walls,.40,2.25,.018,x,1.20,-2.48,glass).castShadow=false;for(const y of [.08,2.35])box(walls,.41,.023,.026,x,y,-2.48,mats.metal);}
 const backSky=new THREE.Mesh(new THREE.PlaneGeometry(18,10),new THREE.MeshBasicMaterial({color:'#d6e2e0'}));backSky.position.set(0,3,-9);scene.add(backSky);
 // Abstract distant skyline, kept outside the room (not a claimed real view).
 const city=new THREE.Group();scene.add(city);for(let i=0;i<20;i++){const w=.27+(i%4)*.15,h=.9+((i*7)%11)*.21,x=-7+i*.68,z=-7.4-(i%3)*.18;box(city,w,h,.5,x,h/2-.2,z,new THREE.MeshStandardMaterial({color:i%2?'#becbc8':'#c8d3cc',roughness:1})).castShadow=false;}
 // A restrained circular relief and wood frame above the sofa.
 box(decor,.025,.92,1.38,-1.808,1.73,-.60,mats.darkwood,.005);
 box(decor,.007,.82,1.28,-1.790,1.73,-.60,mats.linen);
 const relief=new THREE.Mesh(new THREE.TorusGeometry(.25,.018,10,80),mats.darkwood);relief.rotation.y=Math.PI/2;relief.position.set(-1.779,1.77,-.55);relief.castShadow=true;decor.add(relief);
 // Built-in media ledge and a quiet ink-like relief.
 box(decor,.29,.27,1.72,1.62,.38,-.72,mats.darkwood,.015);box(decor,.28,.045,1.74,1.62,.538,-.72,mats.stone,.008);
 box(decor,.024,.78,1.26,1.806,1.36,-.72,new THREE.MeshStandardMaterial({color:'#393c36',roughness:.48}),.01);
 const rug=box(decor,2.75,.018,2.63,-.10,.006,-.71,mats.rug,.025);rug.castShadow=false;
 // Full-height wood screen at the entry, with air between slats.
 for(let i=0;i<14;i++)box(decor,.032,2.52,.036,-3.35+i*.055,1.26,.626,mats.wood);
 box(decor,.72,.72,.34,-2.77,.36,.83,mats.darkwood,.008);box(decor,.73,.035,.36,-2.77,.737,.83,mats.stone,.008);
 // Window bench / tea shelf.
 box(decor,1.58,.065,.38,-.51,.66,-3.75,mats.wood,.014);for(const x of [-1.12,.10])box(decor,.065,.63,.31,x,.315,-3.75,mats.wood);
 const points=[new THREE.Vector2(.13,0),new THREE.Vector2(.15,.03),new THREE.Vector2(.18,.18),new THREE.Vector2(.15,.30),new THREE.Vector2(.08,.35)];
 function vase(x,y,z,scale=1){const v=new THREE.Mesh(new THREE.LatheGeometry(points,48),mats.pot);v.scale.setScalar(scale);v.position.set(x,y,z);v.castShadow=true;v.receiveShadow=true;decor.add(v);return v;}
 vase(-2.79,.76,.84,.45);vase(-.95,.70,-3.77,.28);
 function branch(a,b,r){const delta=new THREE.Vector3().subVectors(b,a);const m=new THREE.Mesh(new THREE.CylinderGeometry(r*.48,r,delta.length(),7),mats.darkwood);m.position.copy(a).add(b).multiplyScalar(.5);m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),delta.normalize());m.castShadow=true;decor.add(m);}
 const plantRoot=new THREE.Vector3(.40,0,-3.48);vase(...plantRoot.toArray(),1.15);branch(plantRoot.clone().add(new THREE.Vector3(0,.25,0)),plantRoot.clone().add(new THREE.Vector3(-.09,1.54,0)),.018);
 for(let i=0;i<10;i++){const angle=i*2.4,start=plantRoot.clone().add(new THREE.Vector3(-.06,.65+i*.085,0)),end=start.clone().add(new THREE.Vector3(Math.cos(angle)*(.22+i*.015),.23,Math.sin(angle)*.19));branch(start,end,.005);for(let j=0;j<4;j++){const leaf=new THREE.Mesh(new THREE.SphereGeometry(.075,10,6),mats.leaf);leaf.scale.set(1,.14,2.3);leaf.position.copy(end).add(new THREE.Vector3(Math.cos(angle+j)*.055,j*.012,Math.sin(angle+j)*.07));leaf.rotation.set(.3+j*.24,angle+j*.5,.3);leaf.castShadow=true;decor.add(leaf);}}
 // Soft linen drapes have real folded geometry.
 for(const x of [-1.67,1.65])for(let i=0;i<6;i++){const g=new THREE.CylinderGeometry(.07,.065,2.32,10,1,true,.05,Math.PI*1.4),m=new THREE.Mesh(g,mats.linen);m.position.set(x+i*.035*(x<0?1:-1),1.2,-2.36);m.castShadow=true;m.receiveShadow=true;decor.add(m);}
 const baseLamp=new THREE.Mesh(new THREE.CylinderGeometry(.14,.16,.035,40),mats.metal);baseLamp.position.set(-1.52,.035,.65);decor.add(baseLamp);box(decor,.016,1.50,.016,-1.52,.76,.65,mats.metal);const shade=new THREE.Mesh(new THREE.CylinderGeometry(.15,.26,.35,48,1,true),mats.linen);shade.position.set(-1.52,1.53,.65);shade.castShadow=true;decor.add(shade);const bulb=new THREE.PointLight(0xffddaa,4.5,2.5,2);bulb.position.set(-1.52,1.5,.65);scene.add(bulb);
 const models=new Map(),pickables=[],dimensions=new THREE.Group(),labels=[];scene.add(dimensions);const labelHost=document.getElementById('dimension-labels');let selected='sofa',view='room',tool='look',station='entry',drag=null,down=null,moving=null,raf=0,drawFrames=0,paused=false;
 const outline=new THREE.BoxHelper(undefined,0x8a9b6c);outline.material.depthTest=false;outline.material.transparent=true;outline.material.opacity=.7;outline.renderOrder=5;scene.add(outline);outline.visible=false;
 function queue(){drawFrames=25;if(!raf&&!paused)raf=requestAnimationFrame(render);}request=queue;
 function render(){raf=0;if(paused)return;const changed=controls.update();if(moving){const t=Math.min(1,(performance.now()-moving.start)/650),q=1-Math.pow(1-t,3);camera.position.lerpVectors(moving.from,moving.to,q);controls.target.lerpVectors(moving.fromTarget,moving.toTarget,q);if(t===1)moving=null;controls.update();}
  if(view==='room'){// A tripod view rotates around the chosen eye point, preventing an orbit through walls.
  }
  renderer.render(scene,camera);for(const l of labels){const v=l.point.clone().project(camera);const visible=getState().showDimensions&&v.z>-1&&v.z<1&&Math.abs(v.x)<.97&&Math.abs(v.y)<.88;l.el.hidden=!visible;if(visible){l.el.style.left=(v.x*.5+.5)*viewport.clientWidth+'px';l.el.style.top=(-v.y*.5+.5)*viewport.clientHeight+'px';}}
  if(moving||changed||drawFrames-->0)raf=requestAnimationFrame(render);
 }
 const stations={entry:{eye:[1.35,1.62,2.16],target:[-.12,1.1,-1.6]},living:{eye:[1.35,1.62,-.35],target:[-1.02,.85,-.55]},balcony:{eye:[-.55,1.62,-3.6],target:[-.3,.9,.20]}};
 function setView(next,which=station,animate=true){view=next;station=which;let to,target;controls.enablePan=next!=='room';controls.enableZoom=next!=='room';controls.maxPolarAngle=next==='room'?Math.PI*.75:Math.PI*.497;controls.minPolarAngle=next==='room'?Math.PI*.20:.005;
  if(next==='room'){const st=stations[which]||stations.entry;to=st.eye;target=st.target;controls.enabled=false;}else{controls.enabled=true;if(next==='top'){to=[-.60,10.8,-.65];target=[-.60,0,-.7];}else{to=[5.8,5.1,7.2];target=[-.40,.7,-.75];}}
  const dest=new THREE.Vector3(...to),tar=new THREE.Vector3(...target);if(animate&&!matchMedia('(prefers-reduced-motion:reduce)').matches)moving={from:camera.position.clone(),to:dest,fromTarget:controls.target.clone(),toTarget:tar,start:performance.now()};else{camera.position.copy(dest);controls.target.copy(tar);camera.lookAt(tar);moving=null;}walls.traverse(o=>{if(o.isMesh)o.visible=next==='room';});if(next!=='room'){// Cut-away returns keep the plan readable without hiding furniture.
   walls.children.forEach(o=>{o.visible=o.position.z< -2.7&&o.position.y<1.35;});
  }document.getElementById('stations').hidden=next!=='room';queue();}
 function setTool(next){tool=next;viewport.classList.toggle('is-moving',next==='move');if(next==='move'&&view==='room')setView('top');}
 function sync(state,selection=selected){selected=selection;for(const [id,g]of models){const i=state.items[id];g.position.set(i.x,0,i.z);g.rotation.y=i.rotation*Math.PI/180;g.scale.setScalar(i.scale);g.visible=i.visible;}const g=models.get(selected);outline.visible=!!g?.visible&&tool==='move';if(g)outline.setFromObject(g);for(const m of tiles)m.material=state.floor==='wood'?mats.wood:mats.stone;updateDimensions(state);queue();}
 function world(id,v){return models.get(id).localToWorld(new THREE.Vector3(...v));}
 function addLabel(text,point,main=false){const el=document.createElement('div');el.className='dim-label'+(main?' main-label':'');el.textContent=text;labelHost.append(el);labels.push({el,point});}
 function updateDimensions(state){while(dimensions.children.length){const old=dimensions.children[0];old.geometry?.dispose();old.material?.dispose();dimensions.remove(old);}labelHost.replaceChildren();labels.length=0;if(!state.showDimensions)return;scene.updateMatrixWorld(true);
  for(const c of catalog){if(!models.has(c.id)||!state.items[c.id].visible)continue;const i=state.items[c.id],fmt=x=>Math.round(x*i.scale*100);if(c.id!==selected){addLabel(c.name+' · '+fmt(c.width)+'×'+fmt(c.depth)+'×'+fmt(c.height)+' cm',world(c.id,[0,c.height+.13,0]));continue;}const w=c.width/2,d=c.depth/2,h=c.height;
   const lines=[[[-w,.015,d+.12],[w,.015,d+.12],'宽 '+fmt(c.width)+' cm'],[[w+.13,.015,-d],[w+.13,.015,d],'深 '+fmt(c.depth)+' cm'],[[-w-.12,0,-d],[-w-.12,h,-d],'高 '+fmt(c.height)+' cm']];
   for(const [a,b,text]of lines){const v1=world(c.id,a),v2=world(c.id,b);const geo=new THREE.BufferGeometry().setFromPoints([v1,v2]);const line=new THREE.Line(geo,new THREE.LineBasicMaterial({color:0x6a7e53,depthTest:false,transparent:true,opacity:.95}));line.renderOrder=10;dimensions.add(line);addLabel(text,v1.clone().add(v2).multiplyScalar(.5),true);}
  }
 }
 const raycaster=new THREE.Raycaster(),mouse=new THREE.Vector2(),plane=new THREE.Plane(new THREE.Vector3(0,1,0),0);
 function ray(e){const r=canvas.getBoundingClientRect();mouse.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);raycaster.setFromCamera(mouse,camera);}
 function pick(e){ray(e);const hits=raycaster.intersectObjects(pickables,false);for(const hit of hits){let g=hit.object;while(g&&!g.userData.furnitureId)g=g.parent;if(g?.visible)return g;}return null;}
 function floorPoint(e){ray(e);return raycaster.ray.intersectPlane(plane,new THREE.Vector3());}
 canvas.addEventListener('pointerdown',e=>{if(e.button!==0)return;moving=null;const hit=pick(e);down={x:e.clientX,y:e.clientY,id:e.pointerId,hit:hit?.userData.furnitureId,eye:camera.position.clone(),target:controls.target.clone()};
  if(tool==='move'&&hit){const p=floorPoint(e);if(!p)return;onSelect(hit.userData.furnitureId);onDragStart();drag={id:hit.userData.furnitureId,dx:hit.position.x-p.x,dz:hit.position.z-p.z};controls.enabled=false;canvas.setPointerCapture(e.pointerId);e.stopImmediatePropagation();}
  else if(view==='room')canvas.setPointerCapture(e.pointerId);
 },{capture:true});
 canvas.addEventListener('pointermove',e=>{if(!down||down.id!==e.pointerId)return;if(drag){const p=floorPoint(e);if(p)onMove(drag.id,Math.max(-5,Math.min(4,p.x+drag.dx)),Math.max(-5,Math.min(4,p.z+drag.dz)));return;}if(view==='room'){
    const delta=down.target.clone().sub(down.eye),spherical=new THREE.Spherical().setFromVector3(delta);spherical.theta-=(e.clientX-down.x)*.0035;spherical.phi=Math.max(.48,Math.min(2.55,spherical.phi+(e.clientY-down.y)*.0035));controls.target.copy(down.eye).add(new THREE.Vector3().setFromSpherical(spherical));camera.position.copy(down.eye);camera.lookAt(controls.target);queue();
  }});
 function release(e){if(!down||down.id!==e.pointerId)return;const wasDrag=!!drag;if(drag){onDragEnd();drag=null;controls.enabled=view!=='room';}if(!wasDrag&&Math.hypot(e.clientX-down.x,e.clientY-down.y)<5&&down.hit)onSelect(down.hit);down=null;queue();}
 canvas.addEventListener('pointerup',release);canvas.addEventListener('pointercancel',release);controls.addEventListener('change',queue);controls.addEventListener('start',()=>{moving=null;});
 canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();paused=true;document.getElementById('load-error').hidden=false;document.getElementById('error-message').textContent='三维显示被浏览器暂停，请重新载入。'});
 const resize=()=>{const w=viewport.clientWidth,h=viewport.clientHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.fov=w<h?2*Math.atan(Math.tan(48*Math.PI/360)/(w/h))*180/Math.PI:48;camera.updateProjectionMatrix();queue();};new ResizeObserver(resize).observe(viewport);resize();setView('room','entry',false);queue();
 const loader=new GLTFLoader();let loaded=0;await Promise.all(catalog.map(async c=>{onProgress('载入 '+c.name+'…');const gltf=await loader.loadAsync('/assets/models/'+c.file);const g=new THREE.Group();g.userData.furnitureId=c.id;g.add(gltf.scene);g.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;pickables.push(o);for(const m of (Array.isArray(o.material)?o.material:[o.material])){if(m.map)m.map.anisotropy=Math.min(renderer.capabilities.getMaxAnisotropy(),8);}}});scene.add(g);models.set(c.id,g);loaded++;onProgress(loaded+' / '+catalog.length+' 件家具就绪');sync(getState());}));
 sync(getState());return {sync,setTool,setView,getView:()=>view,getStation:()=>station,renderer,scene,camera};
}
