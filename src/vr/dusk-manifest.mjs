export const DUSK_VR={
 id:'dusk-vr-v18',title:'暮色私邸',version:1,
 description:'依据暮色基准设计图生成的 360° 全景。未展示的区域经过 AI 合理补全；家具细节与跨房间关系可能存在差异，不作为测量或施工依据。',
 rooms:[
  {id:'living',name:'客厅',source:'/tour/home-assets/dusk/pieces/living/cognac-glass.jpg',caption:'干邑色皮沙发 · 烟玻璃茶几 · 暖石地面',neighbors:['dining','balcony']},
  {id:'dining',name:'餐厅 / 玄关',source:'/tour/home-assets/dusk/dining.jpg',caption:'胡桃木餐桌 · 皮面餐椅 · 玄关收纳',neighbors:['living','kitchen','master']},
  {id:'balcony',name:'景观阳台',source:'/tour/home-assets/dusk/v16/balcony.jpg',caption:'窗边坐席 · 暖石与深木',neighbors:['living']},
  {id:'master',name:'主卧',source:'/tour/home-assets/dusk/pieces/master/linen.jpg',caption:'亚麻低床 · 原床品 · 胡桃木床头',neighbors:['dining','second','bath']},
  {id:'second',name:'次卧 / 书房',source:'/tour/home-assets/dusk/second.jpg',caption:'书桌、窄榻与木作收纳',neighbors:['master','dining']},
  {id:'kitchen',name:'厨房',source:'/tour/home-assets/dusk/kitchen.jpg',caption:'深木柜门 · 灰褐石面',neighbors:['dining','utility']},
  {id:'bath',name:'卫生间',source:'/tour/home-assets/dusk/bath.jpg',caption:'暖石 · 木色台盆柜 · 柔光镜',neighbors:['master','dining']},
  {id:'utility',name:'生活阳台',source:'/tour/home-assets/dusk/v16/utility.jpg',caption:'洗烘柜 · 家务收纳',neighbors:['kitchen']}
 ].map(r=>({...r,pano:`/vr/dusk/panos/${r.id}.png`,yaw:0}))
};

export function duskVrMatch(snapshot){
 if(snapshot?.design!=='dusk')return {available:false,changed:[]};
 const living=snapshot.frames.find(f=>f.id==='living');
 const changed=snapshot.frames.filter(f=>{
  const base=DUSK_VR.rooms.find(r=>r.id===f.id);
  const shared=f.id==='dining'&&f.shared&&living?.path===DUSK_VR.rooms[0].source;
  return !base||(!shared&&f.path!==base.source)||!!f.scene?.floorProduct;
 }).map(f=>f.name);
 return {available:true,changed};
}
