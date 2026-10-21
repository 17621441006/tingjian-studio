import {FLORA_HOME,floraAsset} from '../legacy/flora-home.mjs';

const weave='repeating-linear-gradient(0deg,#fff3 0 1px,transparent 1px 4px),repeating-linear-gradient(90deg,#62583c20 0 1px,transparent 1px 5px)';
const relief='radial-gradient(ellipse at 35% 40%,#fff7,transparent 45%),repeating-linear-gradient(115deg,transparent 0 38px,#a89c7b22 40px,transparent 43px 85px)';
const glaze='radial-gradient(ellipse at 65% 32%,#fff7,transparent 45%),linear-gradient(130deg,#e4e1cb,#9ba68d 65%,#d9dcc7)';
const mat=(en,cn,note,color,texture)=>({en,cn,note,color,texture});
const roomNames={living:'客厅',dining:'餐厅 / 玄关',master:'主卧',second:'次卧 / 书房',kitchen:'厨房',bath:'卫生间',balcony:'景观阳台',utility:'生活阳台'};

export const FLORA_SELECTION={
 id:'flora',en:'FLORA SALON',cn:'花影绮居',group:'favorite',legacy:'silver-retreat',original:FLORA_HOME.name,
 layout:'stack',tone:'flora',tag:'玉兰浅浮雕 · 编织光影 · 拉花釉陶',
 poem:'让花，走出画框。\n让手作，住进日常。',
 intro:'花影不只在画里。它成为墙上一道浅浅的起伏、灯下交错的织纹，也成为釉色中轻轻散开的一瓣。柔绿、酒红与奶油白相接，亲近自然，也亲近手作。',
 copy:'延续柔绿座具、蜜色木作与明亮底色，把植物从重复的挂画和花束中释放出来。客厅的玉兰浅浮雕、餐厅的编织花瓣灯、卧室的暗纹提花各有表达；电视墙以浅色通顶柜收起日用，厨房以整面低对比拉花釉砖收住烟火，湿区用耐水材料转译编织肌理。',
 quote:'一室花影，各有自己的姿态。',
 galleryNote:'花卉、编织与手作融入八个空间；本次以浅通顶柜增加客厅收纳，将拉花釉陶延伸至整面灶台墙。',
 hero:floraAsset('living'),heroThumb:'/designs-v50/featured/flora-768.webp',
 principles:[['花影成为构造','浅浮雕、釉陶与提花墙布，让图案获得不同的深浅与触感。'],['编织组织光线','灯罩、椅背与小柜门，以疏密不同的织纹连接轻盈与秩序。'],['每一处都不同','织物艺术、水墨、线描和稀疏花艺各有位置，留白让细节被看见。']],
 materials:[
  mat('Magnolia Relief','玉兰浅浮雕','奶油色矿物墙面以同色浅起伏承接侧光，花与墙成为一个完整的面。','#e8dfcb',relief),
  mat('Petal Weave','花瓣编织','竹编灯罩与细藤背疏密相接；近水柜面采用封闭耐水的编织感材料。','#b59662',weave),
  mat('Floral Glaze','拉花釉陶','灰绿与微量烟莓釉色化成抽象花瓣，厨房选光滑、耐热、易擦的成品釉面。','#a5ad91',glaze),
  mat('Shadow Jacquard','暗纹提花','低对比蕨叶肌理藏在丝麻感墙布与床品中，柔绿和酒红只留给轻软的部分。','#d7cbb2',weave)
 ],
 roomSource:Object.entries(roomNames).map(([key,cn])=>{
  const r=FLORA_HOME.rooms[key];
  return {key,cn,title:r.title,copy:r.copy,description:r.copy,material:r.materials[1][1],storage:r.materials[0][1],light:r.materials[2][1],materials:r.materials,image:floraAsset(key),thumb:floraAsset(key,true),width:1536,height:1024,thumbWidth:480,...(key==='living'?{views:[{label:'看向餐厅',image:floraAsset('living'),thumb:floraAsset('living',true),width:1536,height:1024,thumbWidth:480},{label:'看向客厅',image:floraAsset('living2'),thumb:floraAsset('living2',true),width:1536,height:1024,thumbWidth:480}]}:{})};
 })
};
export const FLORA_PANEL={id:'flora',type:'a',title:'Flora',label:'WOVEN INTO LIGHT',tag:'花影绮居 · 织花入室',copy:'玉兰浅浮雕接住日光，花瓣编织投下柔影。柔绿、酒红与奶油白之间，让花走出画框，让手作进入日常。',tags:['花影浅浮雕','编织灯','拉花釉陶','暗纹提花']};
