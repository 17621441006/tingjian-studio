// Four authored schemes for the same apartment. Areas are from the supplied plan.
export const EXPANSION_IDS=['terracotta-atelier','tea-cuisine','silver-retreat','moss-garden'];
export const expansionAsset=(design,room,thumb=false)=>'/designs-v38/schemes/'+design+'/'+room+(thumb?'-thumb':'')+'.webp';
const purchases={living:['sofa','chair','table','floor','light'],dining:['table','chair','storage','light'],master:['bed','storage','floor','light'],second:['bed','storage','chair','light'],kitchen:['storage','panel','tile','light'],bath:['storage','panel','tile','light'],balcony:['chair','table','curtain','tile'],utility:['storage','panel','tile']};
const sharedCheck='沿用原户型墙体与开口；图中尺寸为概念试排，家具展开、通路及设备检修需现场复尺。';
function home(name,subtitle,description,palette,rooms){return {name,subtitle,description,purchaseKey:'dusk',rooms:Object.fromEntries(Object.entries(rooms).map(([room,[title,copy,tradeoff]])=>[room,{title,copy,tradeoff,materials:[['布局',copy],['材质',palette],['尺度',sharedCheck]],purchase:purchases[room]}]))};}
export const EXPANSION_HOMES={
 'terracotta-atelier':home('赤陶构所','赤陶墙面 · 烟橡木 · 拉丝银','把家当作能安静创作的地方。次卧优先留给工作，偶尔留宿用椅床解决；薄柜、折叠桌与小边几减少固定家具占地。','赤陶与锈红 · 中棕烟橡木 · 咖啡色柜体 · 拉丝不锈钢',{
  living:['小沙发与可分开的边几','紧凑双人沙发沿原沙发墙布置，两只小几分开使用，中央留给走动；艺术挂轨与薄柜承担展示。','分体桌几更灵活，但不能替代一张大工作台。'],
  dining:['展开才是一张餐桌','靠墙折叠餐桌配轻椅，收起后让出玄关附近地面；餐具放入浅餐边柜。','桌面展开与餐椅拉出时需同时检查入户通路。'],
  master:['床边薄台，接住日常小物','抽屉床配不对称薄床边台，梳妆与短时工作放在飘窗转角旁，保留原飘窗和侧窗。','床底抽屉开启范围与床侧桌椅需一起放线试排。'],
  second:['工作室优先，椅床偶尔展开','右墙长工作台接窗边短台，左侧放一只可展开的椅床；白天保留中央地面，书与工具集中在桌上方。','只适合偶尔留宿；椅床展开时应先移开工作椅，不同时使用两种功能。'],
  kitchen:['L形台面，对面只放浅储物','窗下水槽与右侧灶台组成L形操作区，左侧约25cm浅柜和挂轨收小物，避免两排深柜挤压过道。','浅柜适合食品与小器具，大件锅具仍依靠主操作柜收纳。'],
  bath:['盆下抽屉与抽拉脏衣篮','单台盆缩为紧凑柜体，抽屉避开存水弯，侧格放抽拉脏衣篮；左淋浴、右马桶的关系保留。','柜体宽度、存水弯与脏衣篮抽出距离按实际管线深化。'],
  balcony:['办公桌贴侧墙，窗前留空','短实墙上放可折桌板，配轻折椅；看景玻璃到地面，桌子不横跨窗面。','桌板需要可靠承托；日晒时加遮阳，窗扇开启范围保持空闲。'],
  utility:['熨衣板用完就收','尽端叠放洗烘，侧壁折叠熨衣板与窄清洁柜各司其职，上部柜体预留通风。','熨衣板展开时家务轮流进行，设备散热与检修不可封死。']
 }),
 'tea-cuisine':home('茶棕食邸','茶棕木作 · 墨石台面 · 烟草皮革','把餐厨的日常放在核心：卡座接住相聚，U形厨房集中备餐；次卧用带抽拉床的日间床服务偶尔来住的亲友。','深茶棕橡木 · 暗红棕柜面 · 墨色石面 · 烟草皮革 · 拉丝镍',{
  living:['会客围坐，给餐区留余地','烟草皮双人沙发配轻藤椅与错位圆几，后方卡座餐区延续茶棕木作。','轻椅和圆几可挪动，会客时仍要保留通往阳台的路线。'],
  dining:['卡座下方，收起聚餐用品','靠墙L形卡座配小圆形单柱餐桌，自由侧用轻椅；坐席下方做抽屉，茶咖柜控制深度。','卡座是定制家具，需试坐靠背角度并核对抽屉开启。'],
  master:['衣柜集中，床尾不再塞长凳','软包床头保留卧室的安静，衣柜集中入口附近，薄折叠梳妆板减少独立柜体。','梳妆板与门扇、衣柜门应错开使用。'],
  second:['一张日间床，藏一张偶用床','窄日间床纵向靠右，床下抽拉副床平时收起；左侧浅衣柜带拉出写字板，窗前不摆整排固定书桌。','副床展开后会占用通路，仅作临时留宿；需复核净宽，不视作常设双人卧室。'],
  kitchen:['U形备餐，常用物围在手边','窗下清洗、右侧烹饪、左侧备餐形成U形；抽拉备餐板按需打开，收起后恢复过道。','左台面深度与电器尺寸优先复核，不能为做满U形牺牲通道。'],
  bath:['一张悬空台，下方灵活装东西','单台盆台面下用独立抽屉箱与毛巾篮分区，留出可取放、可清洁的空隙；淋浴与马桶仍在原湿区。','活动收纳应耐潮且不遮住排水检修。'],
  balcony:['两把轻椅，留给早餐','小餐桌靠短侧墙，两把细腿椅可收拢；景观玻璃落地，桌椅不沿窗排成屏障。','同时坐两人时需检查桌椅与侧边开启窗的距离。'],
  utility:['洗烘并排，台面连成一段','洗衣与烘干设备尝试沿长实墙并排，台上整理衣物，上方用薄晾衣杆，左侧窗保持通透。','生活阳台空间紧凑，并排机型与剩余通道必须复尺；空间不足时不实施此排布。']
 }),
 'silver-retreat':home('银灰栖居','银灰矿物 · 烟熏木 · 炭色织物','这套把长期居住的从容放在前面：次卧保留固定单人床，浴室台盆下留空，厨房取消窗下连接柜，让走动和维护更直接。','银灰矿物面 · 中棕烟熏木 · 炭灰织物 · 鞍棕细节 · 锡色金属',{
  living:['少一张重茶几，多一条通路','浅进深沙发配轻边几，电视下只留薄悬空柜，减少客厅中央固定物件。','适合阅读和轻会客，餐饮与较多摆物转到餐桌。'],
  dining:['可伸展的餐桌，平时轻巧','小长桌与四把轻椅组成独立餐区，入口浅柜收纳日常物品；来客时再考虑伸展桌面。','展开后的桌长和椅背距离需现场检查。'],
  master:['标准床高，绕床更从容','标准高度软包床配薄悬空床边台，衣柜集中入口，飘窗前保持连续行走空间。','以实际床架外尺寸试排；此方案不宣称满足无障碍规范。'],
  second:['一间可以长期住的单人卧室','约1m单人床纵向靠左，右侧入口附近集中浅衣柜；窗边仅留一小段写字搁板，中央过道清楚。','工作台面积较小，优先保证睡眠、衣物收纳与日常通行。'],
  kitchen:['双排直线，中间和尽端都留空','洗涤放在靠窗的左排，烹饪在右排；取消窗下连接柜，两个工作面各自成线。','水槽调整仍在厨房内，但给排水与灶具条件必须核查后才能实施。'],
  bath:['盆下留空，收纳放在旁边','台盆下留出坐姿使用空间，另用窄活动柜收日用品；左侧淋浴加小折叠坐板与扶手。','支撑、扶手固定和防水需专业深化；只是舒适性概念，未做无障碍认证。'],
  balcony:['一把好坐的椅子就够了','有靠背的阅读椅放在短边角落，小边几只占一角，中央地面与整片落地窗景完整保留。','椅子应先试坐，轮廓避开窗扇和清洁路线。'],
  utility:['取放顺手，衣物分区','尽端洗烘塔配可下拉晾衣杆与浅台面，下方活动分类篮按需要移开。','拉杆承重、设备门开启与篮筐位置逐项复核。']
 }),
 'moss-garden':home('苔庭慢居','浓苔绿 · 油蜡橡木 · 赤褐陶面','让家里有一块真正空着的地面。次卧作为手作与轻运动室，阳台留给伸展和少量绿植；柜体贴实墙，窗前保留呼吸感。','浓苔绿柜面 · 中棕油蜡橡木 · 赤褐陶面 · 焦糖亚麻 · 黑化铜',{
  living:['绿意在侧，活动在中间','焦糖亚麻小沙发配曲木椅与两只嵌套小几；绿植集中在实墙薄架，不用植物隔断挡采光。','植物数量控制在日常能维护的范围，家具活动时保留通道。'],
  dining:['小椭圆桌，围出轻松的晚餐','窄椭圆餐桌配木椅，赤褐色浅餐边柜收餐具，柜上一小盆绿植延续全屋气质。','餐桌圆角改善转身感受，仍需要实测椅背与玄关距离。'],
  master:['木床底座承担织物收纳','较低橡木抽屉床配浅床头收纳，衣柜沿实墙集中，原飘窗只放一张可移坐垫。','低床不适合所有人，应按起身习惯确定最终高度。'],
  second:['手作与运动轮流发生','左墙窄柜收瑜伽垫和工具，右墙折叠手作桌配可收凳；小卧榻凳平时靠边，中央不设固定床。','主要是兴趣室，偶尔留宿依靠可展开家具，不能等同独立常住卧室。'],
  kitchen:['单排主台面，一辆小推车辅助','主要操作集中右侧一排，水槽靠窗、灶台靠入口并留出备餐段；左侧仅停一辆窄推车，窗下不加连接柜。','同排水火距离、烟道与给排水需现场校核，推车收纳量有限。'],
  bath:['小台盆旁边，另立一只布草柜','偏置单台盆下放可取出的篮子，入口侧窄高柜收布草；淋浴屏采用少占开门空间的移折方式。','高柜避开淋浴溅水与门洞，屏风导轨便于清洁。'],
  balcony:['一张瑜伽垫，窗景不被占满','中央只铺可收起的瑜伽垫，绿植薄架贴短实墙，折凳收在旁边；落地玻璃一直到底。','阳台净长需容纳伸展动作，绿植托盘与地面排水分开安排。'],
  utility:['家政与少量绿植，各有一边','洗烘塔在尽端，侧面浅架收清洁品，少量植物放在远离电器的一侧；可折晾架靠可开启上窗。','植物浇水与设备电源隔开，保留散热及检修空间。']
 })
};
export const EXPANSION_COLORS={
 'terracotta-atelier':{wood:'#70513c',wall:'#a2664f',stone:'#63625a',sofa:'#b08666',textile:'#bba58d',accent:'#804633',floor:'#87694f'},
 'tea-cuisine':{wood:'#50392b',wall:'#806453',stone:'#494b43',sofa:'#a5744c',textile:'#bdad96',accent:'#663c3b',floor:'#73543c'},
 'silver-retreat':{wood:'#645748',wall:'#94948d',stone:'#5a5c58',sofa:'#696962',textile:'#b1aaa0',accent:'#55474d',floor:'#79644e'},
 'moss-garden':{wood:'#8a6345',wall:'#687050',stone:'#896754',sofa:'#b68956',textile:'#b6a382',accent:'#3e5036',floor:'#886446'}
};
export const EXPANSION_PLANS={
 'terracotta-atelier':{second:'atelier',balcony:'side-office',kitchen:'l-shallow',bath:'hamper',utility:'ironing',dining:'folding'},
 'tea-cuisine':{second:'trundle',balcony:'bistro',kitchen:'u-cook',bath:'mobile',utility:'parallel',dining:'banquette'},
 'silver-retreat':{second:'permanent',balcony:'clear-reading',kitchen:'galley',bath:'open-basin',utility:'sorting',dining:'extendable'},
 'moss-garden':{second:'hobby',balcony:'yoga',kitchen:'single-run',bath:'linen',utility:'garden',dining:'oval'}
};
export function expansionLayout(design,room){const h=EXPANSION_HOMES[design],r=h?.rooms[room];return r?{id:'original',name:r.title,short:'独立排布方案',title:r.title,copy:r.copy,benefit:h.description,tradeoff:r.tradeoff,checks:[sharedCheck,...(room==='kitchen'?['给排水、烟道及用电条件先确认，再决定柜体排布。']:room==='balcony'?['落地外窗为效果设想；原结构、外立面和防护条件需核验。']:[])],items:r.materials}:null;}
