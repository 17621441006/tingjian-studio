import {HOMES,homeAsset} from './home-designs.mjs';

export const LAYOUT_ROOMS=[{id:'living',name:'客餐厅'},{id:'master',name:'主卧'},{id:'balcony',name:'景观阳台'}];
export const LIGHT_SCENES=[
 {id:'daylight',name:'日光 · 不开灯',hint:'只看自然采光'},
 {id:'daywarm',name:'日光 · 暖灯',hint:'白天补一点温暖'},
 {id:'daycool',name:'日光 · 冷白灯',hint:'清晰、偏冷的补光'},
 {id:'nightwarm',name:'夜晚 · 暖灯',hint:'局部照明与柔和暗部'},
 {id:'nightneutral',name:'夜晚 · 中性灯',hint:'更中性的夜间色彩'}
];
export const DUSK_LAYOUTS={
 living:[
  {id:'original',name:'经典观影',short:'右侧沙发 · 中央茶几',title:'先把熟悉的生活，留作参照',copy:'保留沿右墙的沙发、左侧电视与后方餐桌。以这张原布局为参照，再判断换排布是否真的更适合你们。',benefit:'电视、会客与餐区关系直接，家具选择容易延续。',tradeoff:'独立家具较多，收纳主要依靠成品柜；中心茶几占用活动面积。',checks:['复尺沙发、茶几与阳台通道','确认插座、电视与灯位','地毯边缘不妨碍门扇和清洁设备'],items:[['沙发','低靠背、窄扶手的三人位'],['茶几','轻薄烟玻璃，保留视线通透'],['收纳','沿墙矮柜与餐边柜分工']]},
  {id:'social',name:'转向会客',short:'沙发换边 · 圆桌餐区',title:'换一面墙坐，让客厅有新的关系',copy:'沙发换到左侧，电视与矮柜移到右墙。餐桌改为圆桌，小椅子补充会客位置，调整围坐与通行的关系。',benefit:'圆桌减少尖角和方向感，小单椅方便移动，客厅不再只有一种坐法。',tradeoff:'沙发换边可能占用靠窗通路，单椅也靠近入口；电视线路、圆桌和餐椅拉开后的通路需要一起复核。',checks:['核对左墙实际可用长度与门洞','确认电视墙线路及设备位置','试排餐椅拉开后的通行空间'],items:[['沙发','左墙紧凑皮沙发'],['餐桌','圆形单柱餐桌与轻餐椅'],['单椅','可移动的小尺度阅读椅']]},
  {id:'storage',name:'长榻收纳',short:'抽屉坐榻 · 卡座餐区',title:'把收纳放进坐下来的地方',copy:'右墙用带抽屉的长榻代替独立大沙发，餐区改为卡座。两只小圆几和一把轻椅可移动，家务与会客之间更容易切换。',benefit:'坐具兼收纳，小桌可以分开使用，餐区也增加储物位置。',tradeoff:'定制投入更多，坐榻的靠背和坐深需要试坐；抽屉开启不能占满过道。',checks:['确认坐榻舒适度与可拆洗软垫','抽屉与活动家具错开开启范围','卡座下设备、插座与通风便于检修'],items:[['坐榻','木作抽屉底座＋可拆软垫'],['餐区','紧凑卡座＋圆角餐桌'],['桌几','轻便嵌套圆几，可分开使用']]}
 ],
 master:[
  {id:'original',name:'原床位',short:'右侧床头 · 保留窗边',title:'先确认床边真正需要留多少空间',copy:'保留原方案的床位与衣柜关系，作为床柜换位和窗边收纳的对照。',benefit:'原有窗景与床侧关系容易辨认，改动相对集中。',tradeoff:'窗边空间仍以休闲为主，工作与储物功能有限。',checks:['复尺床架外轮廓与两侧通路','核对衣柜门及卧室门开启','确认空调风向与床头插座'],items:[['床','简洁软包床架'],['衣柜','保留原位置，优化内部层板'],['窗边','轻便坐垫与小边几']]},
  {id:'rotated',name:'床柜换位',short:'床头换墙 · 衣柜重排',title:'改变床的朝向，也改变醒来的视线',copy:'尝试把床头换到另一面实体墙，衣柜转到原床头一侧。窗与门仍按原图关系保留，用同一视角比较床柜交换后的空间。',benefit:'睡眠区的视线与动线发生实际变化，可以重新分配衣柜与床侧空间。',tradeoff:'这是未实测的排布设想；柜深、床尾距离、门扇和空调影响可能使它需要调整。',checks:['现场放线验证床柜能否同时放下','检查衣柜开启和入门通路','核对空调出风、阅读灯与插座'],items:[['床','换墙摆放，先定外尺寸'],['衣柜','转移到原床头侧'],['床头','插座与灯具随床位重新定位']]},
  {id:'storage',name:'窗边双用',short:'矮柜坐榻 · 拉出书桌',title:'窗边可以坐，也可以临时工作',copy:'床位向室内略调，窗边连续低柜兼坐席，左侧接一段可拉出的工作台。把偶尔办公、阅读和织物收纳放在同一处。',benefit:'不单独占用一整块书桌位置，窗边收纳和坐席可以共用。',tradeoff:'台面展开会占用活动空间；窗帘、窗扇与抽屉开启需要一起校核。',checks:['确认窗台构造，收纳柜独立设计','实测桌面展开及床侧距离','核对台面承托、窗扇和窗帘运行'],items:[['窗边柜','低矮抽屉与可拆坐垫'],['工作台','带可靠承托的拉出桌面'],['床边','薄搁板替代厚床头柜']]}
 ],
 balcony:[
  {id:'original',name:'窗边茶角',short:'长凳 · 活动边几',title:'把原来的窗边，留给坐与看',copy:'保留现有外窗与下部边界，以长凳和小边几营造日常茶角。',benefit:'建筑边界不因画面设想发生变化，家具可以灵活挪动。',tradeoff:'长凳占用一部分地面，观景通透度受原窗框与窗下部限制。',checks:['核对外窗开启、排水与渗漏状况','家具避开窗扇开启与通行范围','确认遮阳和夜间隐私需求'],items:[['坐席','可移动长凳或轻椅'],['边几','便于收起的小茶几'],['窗帘','纱帘与遮阳分开考虑']]},
  {id:'glazing',name:'整面窗景',short:'无横档主玻璃 · 侧边通风扇',title:'先比较通透感，再判断能不能实施',copy:'主观景面用没有中间横档的大面固定玻璃，窄开启扇留在侧边。保留窗侧与上方梁，轻量茶台把中央地面留出来。生活阳台继续采用可开启窗通风。',benefit:'看景和地面活动空间更开阔，茶台不用时可以收起。',tradeoff:'仅用于视觉比较。窗下部是否可改、外立面与防护要求均未核实，不能据图拆改。',checks:['查原始结构图并由专业人员核验窗下构造','确认物业及相关改造条件','专项核对玻璃、防护、排水、防水与热工性能'],items:[['外窗','方案待核验，不直接列采购型号'],['茶台','可收起墙面桌板，承托需深化'],['坐席','轻便活动椅，保留中间地面']]}
 ]
};
export function layoutsFor(design,room){
 if(!DUSK_LAYOUTS[room])return [{...DUSK_LAYOUTS.living[0],name:'本空间原方案',short:'保留这套风格',title:HOMES[design].rooms[room].title,copy:HOMES[design].rooms[room].copy,items:HOMES[design].rooms[room].materials}];
 const found=DUSK_LAYOUTS[room];
 return design==='dusk'?found:[{...found[0],name:'现有布局',short:'保留本套风格原排布',title:'先保留这套风格的空间关系',copy:'这一套先保留现有排布；新增的布局与五种光线对照目前在暮色私邸中。可以继续查看本套清单，也可以返回风格页选择暮色私邸试布局。',benefit:'所选风格、原有房间效果与选购参考继续保留。',tradeoff:'本套的新排布与灯光组合尚未开放，可先整理喜欢的单品与材料。',items:HOMES[design].rooms[room].materials,checks:['复尺家具外轮廓和通道','核对门扇、窗扇和柜门开启','结合实际采光进行材料看样']}];
}
export function resolveLayoutState(s={}){
 const design=HOMES[s.design]?s.design:'dusk',room=LAYOUT_ROOMS.some(r=>r.id===s.room)?s.room:'living';
 const layout=layoutsFor(design,room).some(l=>l.id===s.layout)?s.layout:'original';
 const light=design==='dusk'&&room==='living'&&LIGHT_SCENES.some(l=>l.id===s.light)?s.light:'daywarm';
 return {design,room,layout,light};
}
export function layoutInfo(s){return layoutsFor(s.design,s.room).find(l=>l.id===s.layout)||layoutsFor(s.design,s.room)[0];}
export function layoutAsset(value,thumb=false){
 const s=resolveLayoutState(value),suffix=thumb?'-thumb':'';
 if(s.design!=='dusk')return homeAsset(s.design,s.room,thumb);
 if(s.room==='balcony'&&s.layout==='glazing')return `/tour/home-assets/dusk/windows/balcony-clear${suffix}.jpg`;
 if(s.room==='living'){
  const sofa=value.sofa==='wine'?'wine':'cognac';
  if(s.layout==='original'&&s.light==='daywarm')return `/tour/home-assets/dusk/pieces/living/${sofa}-glass${suffix}.jpg`;
  if(sofa==='cognac')return `/tour/home-assets/dusk/cognac/${s.layout}/${s.light}${suffix}.jpg`;
 }
 if(s.layout==='original'&&s.room!=='living')return homeAsset('dusk',s.room,thumb);
 return `/tour/home-assets/dusk/layouts/${s.room}/${s.layout}/${s.light}${suffix}.jpg`;
}
