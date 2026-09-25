import {floorProduct} from './floor-catalog.mjs';
// The 3D and photographic views consume the same immutable confirmed snapshot.
import {resolveScene} from './scene-options.mjs';
export const MODEL_ROOMS=[
 {id:'living',name:'客厅',p:[[3.48,2.16],[7.13,2.16],[7.13,5.25],[3.48,5.25]],center:[5.3,3.8]},
 {id:'dining',name:'餐厅 / 玄关',p:[[3.48,5.25],[7.13,5.25],[7.13,7.10],[1.85,7.10],[1.85,5.23],[3.48,5.23]],center:[4.9,6.2]},
 {id:'master',name:'主卧',p:[[7.13,.78],[8.37,.78],[8.37,0],[10.64,0],[10.64,4.40],[7.13,4.40]],center:[9,2.3]},
 {id:'second',name:'次卧 / 书房',p:[[7.13,4.40],[9.91,4.40],[9.91,7.10],[7.13,7.10]],center:[8.5,5.7]},
 {id:'kitchen',name:'厨房',p:[[1.20,2.16],[3.48,2.16],[3.48,5.23],[1.85,5.23],[1.85,4.56],[1.20,4.56]],center:[2.4,3.6]},
 {id:'bath',name:'卫生间',p:[[0,4.56],[1.85,4.56],[1.85,7.10],[0,7.10]],center:[.9,5.8]},
 {id:'balcony',name:'景观阳台',p:[[3.48,.57],[6.08,.57],[6.08,1.17],[7.13,1.17],[7.13,2.16],[3.48,2.16]],center:[5.1,1.3]},
 {id:'utility',name:'生活阳台',p:[[0,2.16],[1.20,2.16],[1.20,4.56],[0,4.56]],center:[.6,3.3]}
];
export const MODEL_COLORS={dusk:{wood:'#624736',wall:'#e7e0d3',stone:'#a79d8f',sofa:'#9a5833'},chinese:{wood:'#804732',wall:'#efe8dc',stone:'#cec6b5',sofa:'#99866f'},stone:{wood:'#655c4e',wall:'#dfdcd2',stone:'#a6a396',sofa:'#9f9683'},collector:{wood:'#4e362a',wall:'#e8e0d2',stone:'#bdb5a5',sofa:'#663735'},copper:{wood:'#665548',wall:'#dbd8cc',stone:'#656e65',sofa:'#4e5847'},amber:{wood:'#c3a77c',wall:'#eee7d9',stone:'#cfccc3',sofa:'#a96948'},graphite:{wood:'#46372e',wall:'#d0c9bd',stone:'#76716a',sofa:'#785235'}};
export function wholeModelSpec(snapshot){
 const scenes=Object.fromEntries(snapshot.frames.map(f=>[f.id,resolveScene(f.scene)]));const living=scenes.living,master=scenes.master,balcony=scenes.balcony,palette={...(MODEL_COLORS[snapshot.design]||MODEL_COLORS.dusk)};
 const independent=snapshot.design==='dusk'&&living.mode==='pieces';
 const sofa=independent?living.pieces.sofa:'design',table=independent?living.pieces.table:['copper','amber'].includes(snapshot.design)?'glass':'stone',floor=independent?living.pieces.floor:snapshot.design==='amber'?'oak':'stone';
 const sofaColors={cognac:'#98582f',blend:'#b4a18a',slim:'#847364',wine:'#703d37',mink:'#a9957c',design:palette.sofa};
 const variant=living.mode==='palette'?living.variant:'original';if(variant==='moss'){sofaColors.design='#61634c';}if(variant==='wine'){sofaColors.design='#6c3835';}if(variant==='linen'){sofaColors.design='#c3b7a4';}
 return {design:snapshot.design,scenes,floorByRoom:Object.fromEntries(Object.entries(scenes).map(([id,scene])=>[id,floorProduct(scene.floorProduct)])),palette,sofa,sofaColor:sofaColors[sofa],sofaTextile:['blend','slim','mink'].includes(sofa)||sofa==='design'&&['stone','chinese','copper'].includes(snapshot.design),sofaLength:snapshot.design==='amber'?2.05:sofa==='blend'?2.10:sofa==='slim'||snapshot.design==='graphite'?2.08:2.12,table,floor,removed:living.removed,
  secondPlan:({stone:'zen',collector:'library',copper:'work',amber:'dressing',graphite:'foldaway'})[snapshot.design]||'classic',balconyPlan:({stone:'lounge',collector:'record',copper:'tea-pair',amber:'woven',graphite:'reading'})[snapshot.design]||(balcony.layout==='glazing'?'tea':'bench'),
  livingLayout:living.layout,masterLayout:master.layout,light:living.light,
  bed:snapshot.design==='dusk'&&master.mode==='pieces'?master.pieces.bed:'linen',bedding:snapshot.design==='dusk'&&master.mode==='pieces'?master.pieces.bedding:'taupe',
  clearMaster:master.window==='clear'||snapshot.design==='amber',clearBalcony:true,clearUtility:true,signature:snapshot.signature};
}
