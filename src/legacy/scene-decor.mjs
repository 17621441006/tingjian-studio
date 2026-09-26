import * as THREE from 'three';
// Separate decorative objects; furniture and structural walls are not rebuilt here.
export function applySceneDecor(root,spec){
 if(spec.scenes?.living?.partitionStyle!=='custom'&&spec.scenes?.dining?.partitionStyle!=='custom')return root;
 const design=spec.design,g=new THREE.Group();g.name='entry-partition';g.userData={objectId:g.name,room:'dining',customDecor:true};g.position.set(3.57,0,5.02);root.userData.rooms.get('dining').add(g);root.userData.objects.set(g.name,g);
 const colors={dusk:0x604632,chinese:0x74422d,stone:0xb39b76,collector:0x86704d,copper:0x695038,amber:0xc6975c,graphite:0x393936};
 const solid=new THREE.MeshStandardMaterial({color:colors[design]||colors.dusk,roughness:.55,metalness:['collector','copper','graphite'].includes(design)?.65:0});
 const insert=new THREE.MeshStandardMaterial({color:design==='stone'?0xe8dfc9:0xb8a488,roughness:.45,transparent:true,opacity:design==='stone'?.8:.3});
 root.userData.ownedMaterials??=new Set();root.userData.ownedMaterials.add(solid);root.userData.ownedMaterials.add(insert);
 const box=(w,h,d,x,y,z,mat=solid)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);m.position.set(x,y,z);m.castShadow=m.receiveShadow=true;m.userData.preserveMaterial=true;g.add(m);};
 if(design==='amber'){root.userData.rooms.get('living').add(g);g.userData.room='living';g.position.set(7.02,0,3.64);g.rotation.y=Math.PI/2;for(let i=0;i<9;i++)box(.065,.7-Math.abs(i-4)*.05,.04,(i-4)*.075,1.4,0);}
 else{g.rotation.y=Math.PI/2;for(const x of [-.29,.29])box(.026,2.05,.035,x,1.025,0);for(const y of [.03,2.04])box(.60,.026,.035,0,y,0);
 if(['collector','stone','graphite'].includes(design))box(.54,1.98,.012,0,1.03,0,insert);
 const count=design==='dusk'?7:design==='copper'?5:design==='collector'?16:design==='graphite'?12:4;
 for(let i=1;i<count;i++)box(design==='collector'?.008:.022,1.99,.035,-.29+i*.58/count,1.03,.012);
 if(design==='chinese')for(const y of [.48,1.02,1.58])box(.55,.022,.035,0,y,.014);
 }
 return root;
}
