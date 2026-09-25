export const ASSET='/tour/catalog-assets/';
export const ORIGINAL='/tour/trial-assets/original-room.jpg';
export const PHOTO={width:1536,height:1024,fov:61.6,camera:[0,1.33,2.27],target:[0,1.064,0]};
export const VIEWS={
 main:{name:'原视角',camera:[0,1.33,2.27],target:[0,1.064,0],fov:61.6},
 left:{name:'向左一步',camera:[-.20,1.33,2.23],target:[-.20,1.064,-.04],fov:61.6},
 right:{name:'向右一步',camera:[.20,1.33,2.23],target:[.20,1.064,-.04],fov:61.6},
 near:{name:'走近茶几',camera:[0,1.33,1.98],target:[0,1.064,-.29],fov:61.6}
};
export const CATEGORIES={table:{name:'桌几',objectName:'茶几',length:112,min:75,max:124,point:[.50,.79]},sofa:{name:'坐具',objectName:'坐具',length:234,min:65,max:270,point:[.82,.65]},rug:{name:'地毯',objectName:'地毯',length:240,min:180,max:280,point:[.33,.91]},floor:{name:'地面',objectName:'地面',length:100,min:50,max:150,point:[.25,.67]}};
export const SCENES={
 walnut:{name:'胡桃木私邸',plate:'/tour/trial-assets/room-clean-v4.png',floorName:'原胡桃木地板',description:'胡桃木、棕皮与天然粗织物。保留你喜欢的温润原方案。',palette:['#69503a','#a07a56','#dfd4c1'],defaults:{table:'original-table',sofa:'original-sofa',rug:'original-rug',floor:'original-floor'}},
 'edition-light':{name:'浅木静居',plate:'/tour/edition-assets/edition-light.jpg',floorName:'浅橡木地面',description:'EDITION 客房灵感。直纹浅橡木包裹空间，黑皮与石木茶几压住重心，细羊毛和柔光留下松弛感。',palette:['#c4a57d','#e6ddd0','#38342e'],defaults:{table:'edition-stone-table',sofa:'supplied-sofa',rug:'edition-oat-rug',floor:'original-floor'},exposure:1,environment:1.05},
 'edition-dark':{name:'暮色私邸',plate:'/tour/edition-assets/edition-dark.jpg',floorName:'暖灰石材地面',description:'EDITION 酒廊灵感。烟熏深木、皮革与哑光石面，保留明亮的顶面，以低位暖光营造安静的私邸氛围。',palette:['#493529','#867a6b','#b39365'],defaults:{table:'edition-smoked-table',sofa:'sofa-03',rug:'edition-smoke-rug',floor:'original-floor'},exposure:.93,environment:.92}
};
export function sceneFor(state){return SCENES[state.scene||'walnut'];}
export const ITEMS=[
 {id:'edition-stone-table',category:'table',name:'浅石 · 橡木茶几',kind:'model',file:'/tour/edition-assets/models/modern_coffee_table_01/modern_coffee_table_01_2k.gltf',thumb:'/tour/edition-assets/previews/stone-table.jpg',length:112,dimensions:[112,55.915,36.345],lengthAxis:'z',rotation:0,detail:'石材台面与木框 · 彩色、法线与粗糙度贴图 · CC0',source:'https://polyhaven.com/a/modern_coffee_table_01',collection:'edition'},
 {id:'edition-smoked-table',category:'table',name:'暮色 · 石木茶几',kind:'model',file:'/tour/edition-assets/models/modern_coffee_table_01/modern_coffee_table_01_2k.gltf',thumb:'/tour/edition-assets/previews/smoked-table.jpg',length:112,dimensions:[112,55.915,36.345],lengthAxis:'z',rotation:0,finish:'smoked',detail:'同款石木模型的深木饰面方案 · 保留原法线与粗糙度贴图',source:'https://polyhaven.com/a/modern_coffee_table_01',collection:'edition'},
 {id:'edition-oak-chair',category:'sofa',name:'橡木框 · 黑皮单椅',kind:'model',file:'/tour/edition-assets/models/modern_arm_chair_01/modern_arm_chair_01_2k.gltf',thumb:'/tour/edition-assets/previews/oak-chair.jpg',length:80,dimensions:[80,96.21,99.75],rotation:-90,detail:'橡木框与皮革座垫 · 真实三维单椅 · 替换当前坐具位置',source:'https://polyhaven.com/a/modern_arm_chair_01',collection:'edition'},
 {id:'edition-dark-chair',category:'sofa',name:'深木框 · 皮革单椅',kind:'model',file:'/tour/edition-assets/models/modern_arm_chair_01/modern_arm_chair_01_2k.gltf',thumb:'/tour/edition-assets/previews/dark-chair.jpg',length:80,dimensions:[80,96.21,99.75],rotation:-90,finish:'smoked',detail:'同款皮椅的烟熏木饰面方案 · 原皮纹与接缝保留',source:'https://polyhaven.com/a/modern_arm_chair_01',collection:'edition'},
 {id:'edition-oat-rug',category:'rug',name:'燕麦 · 细羊毛',kind:'material',material:'poly_wool_herringbone',thumb:'/tour/edition-assets/previews/oat-rug.jpg',length:240,dimensions:[160,240,1.2],tone:[.63,.57,.47],detail:'细密人字织纹 · 低反光 · 燕麦配色方案',source:'https://polyhaven.com/a/poly_wool_herringbone',collection:'edition'},
 {id:'edition-smoke-rug',category:'rug',name:'烟灰 · 人字织毯',kind:'material',material:'poly_wool_herringbone',thumb:'/tour/edition-assets/previews/smoke-rug.jpg',length:240,dimensions:[160,240,1.2],tone:[.27,.26,.24],detail:'暖烟灰织物 · 保留真实织纹与凹凸',source:'https://polyhaven.com/a/poly_wool_herringbone',collection:'edition'},
 {id:'edition-oak-floor',category:'floor',name:'静居 · 浅橡木',kind:'material',material:'wooden_floor_02',thumb:'/tour/edition-assets/previews/oak-floor.jpg',length:100,tone:[.48,.37,.25],detail:'浅橡木配色 · 同尺度木纹 · 哑光处理',source:'https://polyhaven.com/a/wooden_floor_02',collection:'edition'},
 {id:'edition-stone-floor',category:'floor',name:'私邸 · 暖灰石',kind:'material',material:'marble_01',thumb:'/tour/edition-assets/previews/stone-floor.jpg',length:100,tone:[.25,.235,.21],detail:'暖灰石纹 · 低反光饰面 · 保留天然纹理',source:'https://polyhaven.com/a/marble_01',collection:'edition'},
 {id:'original-table',category:'table',name:'原木石茶几',kind:'original',thumb:ORIGINAL,detail:'原方案 · 照片物件'},
 {id:'black-table',category:'table',name:'黑漆矮茶几',kind:'model',file:'/assets/models/table.glb',thumb:'/assets/models/table.jpg',length:112,dimensions:[112,81.36,26.21],rotation:90,detail:'你提供的真实三维模型',license:'用户提供'},
 {id:'round-table',category:'table',name:'白石圆茶几',kind:'model',file:ASSET+'models/coffee_table_round_01/coffee_table_round_01_2k.gltf',thumb:ASSET+'previews/coffee_table_round_01.jpg',length:90,dimensions:[90,90,33.98],rotation:0,detail:'大理石台面 · 金属脚 · CC0',source:'https://polyhaven.com/a/coffee_table_round_01'},
 {id:'original-sofa',category:'sofa',name:'原棕皮沙发',kind:'original',thumb:ORIGINAL,detail:'原方案 · 照片物件'},
 {id:'supplied-sofa',category:'sofa',name:'木框双人沙发',kind:'model',file:'/assets/models/sofa.glb',thumb:'/assets/models/sofa.jpg',length:210,dimensions:[210,109.95,94.4],rotation:-90,detail:'你提供的真实三维模型',license:'用户提供'},
 {id:'sofa-03',category:'sofa',name:'雕木皮沙发',kind:'model',file:ASSET+'models/sofa_03/sofa_03_2k.gltf',thumb:ASSET+'previews/sofa_03.jpg',length:234,dimensions:[234,79.25,95.79],rotation:-90,detail:'雕木 · 皮革 · CC0',source:'https://polyhaven.com/a/sofa_03'},
 {id:'sofa-02',category:'sofa',name:'复古拉扣沙发',kind:'model',file:ASSET+'models/sofa_02/sofa_02_2k.gltf',thumb:ASSET+'previews/sofa_02.jpg',length:234,dimensions:[234,105.93,91.81],rotation:-90,detail:'皮革 · 靠包 · CC0',source:'https://polyhaven.com/a/sofa_02'},
 {id:'original-rug',category:'rug',name:'原粗织地毯',kind:'original',thumb:ORIGINAL,detail:'原方案 · 照片物件'},
 {id:'rug-kilim',category:'rug',name:'赭橙织纹 · 模型 A',kind:'model',file:'/tour/user-assets/rug-kilim.glb',thumb:'/tour/user-assets/rug-kilim.jpg',length:260,dimensions:[145.648,260,.6],rotation:0,detail:'你提供的 carpet · 原 UV 与三张材质贴图；平面补 6mm 底层',license:'用户提供',provenance:'supplied'},
 {id:'rug-medallion',category:'rug',name:'金色花纹 · 模型 B',kind:'model',file:'/tour/user-assets/rug-medallion.glb',thumb:'/tour/user-assets/rug-medallion.jpg',length:240,dimensions:[180,240,.826],rotation:0,detail:'你提供的 Rectangular rug · 保留原边缘厚度与纹理',license:'用户提供',provenance:'supplied'},
 {id:'rug-geometric',category:'rug',name:'赭石拼色 · 图片试建',kind:'model',file:'/tour/user-assets/rug-geometric.glb',thumb:'/tour/user-assets/rug-geometric-texture.png',length:240,dimensions:[160,240,.8],rotation:0,detail:'按你的网店参考图试建 · 图案补全与 8mm 厚度均为估计',license:'用户参考图衍生设计',provenance:'image-reconstruction'},
 {id:'rug-wool',category:'rug',name:'人字纹羊毛',kind:'material',material:'poly_wool_herringbone',thumb:ASSET+'materials/poly_wool_herringbone/poly_wool_herringbone_diff_1k.jpg',length:240,dimensions:[160,240,1.2],detail:'织纹 · 凹凸与粗糙度',source:'https://polyhaven.com/a/poly_wool_herringbone'},
 {id:'rug-teddy',category:'rug',name:'燕麦卷绒',kind:'material',material:'curly_teddy_natural',thumb:ASSET+'materials/curly_teddy_natural/curly_teddy_natural_diff_1k.jpg',length:240,dimensions:[160,240,1.2],detail:'卷绒 · 凹凸与粗糙度',source:'https://polyhaven.com/a/curly_teddy_natural'},
 {id:'original-floor',category:'floor',name:'原胡桃木地板',kind:'original',thumb:ORIGINAL,detail:'原方案 · 保留原木色'},
 {id:'floor-wood',category:'floor',name:'浅橡木地板',kind:'material',material:'wooden_floor_02',thumb:ASSET+'materials/wooden_floor_02/wooden_floor_02_diff_1k.jpg',length:100,detail:'木地板 · CC0 材质',source:'https://polyhaven.com/a/wooden_floor_02'},
 {id:'floor-marble',category:'floor',name:'浅色大理石',kind:'material',material:'marble_01',thumb:ASSET+'materials/marble_01/marble_01_diff_1k.jpg',length:100,detail:'天然纹理 · CC0 材质',source:'https://polyhaven.com/a/marble_01'}
];
export function itemFor(id){return ITEMS.find(x=>x.id===id);}
export function initialState(scene='walnut'){const design=SCENES[scene];if(!design)throw new Error('未知设计方案');return {version:4,scene,view:'main',objects:Object.fromEntries(Object.entries(CATEGORIES).map(([key,c])=>{const id=design.defaults[key];return [key,{item:id,length:itemFor(id)?.length||c.length,angle:0,offset:0}];}))};}
export function validateState(input){
 const state=structuredClone(input);state.scene??='walnut';if(!SCENES[state.scene])throw new Error('未知设计方案');if(!VIEWS[state.view])throw new Error('未知视角');
 for(const [key,c]of Object.entries(CATEGORIES)){
  const s=state.objects?.[key];if(!s)throw new Error('方案缺少物件');
  if(s.item!=='none'&&itemFor(s.item)?.category!==key)throw new Error('物件品类不匹配');
  if(key==='floor'&&s.item==='none')throw new Error('地面支持换材质或恢复，不能删除建筑地面');
  for(const [field,min,max]of [['length',c.min,c.max],['angle',-15,15],['offset',-15,15]]){s[field]=Number(s[field]);if(!Number.isFinite(s[field])||s[field]<min||s[field]>max)throw new Error('尺寸或位置超出试摆范围');}
 }
 return state;
}
export function chooseItem(state,id){if(state.scene&&state.scene!=='walnut'&&id.startsWith('original-'))id=sceneFor(state).defaults[id.slice(9)]||id;const item=itemFor(id);if(!item)throw new Error('未找到物件');const next=structuredClone(state);next.objects[item.category]={item:id,length:item.length||CATEGORIES[item.category].length,angle:0,offset:0};return validateState(next);}
export function removeItem(state,category){if(!CATEGORIES[category])throw new Error('未知品类');const next=structuredClone(state);next.objects[category].item=category==='floor'?'original-floor':'none';return validateState(next);}
export function isOriginal(state){return (!state.scene||state.scene==='walnut')&&Object.entries(state.objects).every(([cat,s])=>s.item==='original-'+cat);}
export function signature(state){return JSON.stringify(validateState(state));}
export function dimensionsFor(item,length){if(!item?.dimensions)return null;const ref=item.category==='rug'?item.dimensions[1]:item.dimensions[0];return item.dimensions.map(x=>Number((x*length/ref).toFixed(1)));}
export function exportPlan(state){return {...validateState({...state,view:'main'}),sceneName:sceneFor(state).name+'·客厅',units:'cm',dimensionsVerified:false,calibration:'固定设计视角近似标定；家具比例以模型为准，房屋尺寸待实测',objectsAreIndependent:true,views:{main:VIEWS.main},assets:ITEMS.filter(i=>Object.values(state.objects).some(o=>o.item===i.id)).map(i=>({id:i.id,source:i.source||i.license||'原设计图',file:i.file||i.material,provenance:i.provenance||i.kind})),fullHouseRenderService:false};}
