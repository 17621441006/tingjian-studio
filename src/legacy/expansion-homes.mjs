import {RENEWED_IDS,RENEWED_HOMES} from './collector-homes.mjs';
import {CRAFT_IDS,CRAFT_HOMES,CRAFT_COLORS,CRAFT_PLANS} from './craft-homes.mjs';
// Independently authored complete schemes for the same apartment.
export const EXPANSION_IDS=['terracotta-atelier','tea-cuisine','silver-retreat','moss-garden',...CRAFT_IDS];
export const expansionAsset=(design,room,thumb=false)=>{
 const base=CRAFT_IDS.includes(design)?'/designs-v47/schemes/':RENEWED_IDS.includes(design)?'/designs-v46/schemes/':'/designs-v38/schemes/';
 const origin=!thumb&&['tea-cuisine','moss-garden'].includes(design)?globalThis.__TINGJIAN_V38_ORIGIN__||'':'';
 return origin+base+design+'/'+room+(thumb?'-thumb':'')+'.webp';
};
const purchases={living:['sofa','chair','table','floor','light'],dining:['table','chair','storage','light'],master:['bed','storage','floor','light'],second:['bed','storage','chair','light'],kitchen:['storage','panel','tile','light'],bath:['storage','panel','tile','light'],balcony:['chair','table','curtain','tile'],utility:['storage','panel','tile']};
const sharedCheck='沿用原户型墙体与开口；图中尺寸为概念试排，家具展开、通路及设备检修需现场复尺。';
function home(name,subtitle,description,palette,rooms){return {name,subtitle,description,purchaseKey:'dusk',rooms:Object.fromEntries(Object.entries(rooms).map(([room,[title,copy,tradeoff]])=>[room,{title,copy,tradeoff,materials:[['布局',copy],['材质',palette],['尺度',sharedCheck]],purchase:purchases[room]}]))};}
export const EXPANSION_HOMES={
 'terracotta-atelier':RENEWED_HOMES['terracotta-atelier'],
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
 'silver-retreat':RENEWED_HOMES['silver-retreat'],
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
Object.assign(EXPANSION_HOMES,CRAFT_HOMES);
export const EXPANSION_COLORS={
 'terracotta-atelier':{wood:'#76543b',wall:'#e8dec9',stone:'#c6b9a2',sofa:'#e2d7c2',textile:'#e5daca',accent:'#74404a',floor:'#967455'},
 'tea-cuisine':{wood:'#50392b',wall:'#806453',stone:'#494b43',sofa:'#a5744c',textile:'#bdad96',accent:'#663c3b',floor:'#73543c'},
 'silver-retreat':{wood:'#4d3527',wall:'#eee4d2',stone:'#c3b59d',sofa:'#202d3c',textile:'#eee3cf',accent:'#6f273a',floor:'#886347'},
 'moss-garden':{wood:'#8a6345',wall:'#687050',stone:'#896754',sofa:'#b68956',textile:'#b6a382',accent:'#3e5036',floor:'#886446'}
};
Object.assign(EXPANSION_COLORS,CRAFT_COLORS);
export const EXPANSION_PLANS={
 'terracotta-atelier':{second:'atelier',balcony:'side-office',kitchen:'l-shallow',bath:'hamper',utility:'ironing',dining:'extendable'},
 'tea-cuisine':{second:'trundle',balcony:'bistro',kitchen:'u-cook',bath:'mobile',utility:'parallel',dining:'banquette'},
 'silver-retreat':{second:'permanent',balcony:'clear-reading',kitchen:'galley',bath:'open-basin',utility:'sorting',dining:'extendable'},
 'moss-garden':{second:'hobby',balcony:'yoga',kitchen:'single-run',bath:'linen',utility:'garden',dining:'oval'}
};
Object.assign(EXPANSION_PLANS,CRAFT_PLANS);
export function expansionLayout(design,room){const h=EXPANSION_HOMES[design],r=h?.rooms[room];return r?{id:'original',name:r.title,short:'独立排布方案',title:r.title,copy:r.copy,benefit:h.description,tradeoff:r.tradeoff,checks:[sharedCheck,...(room==='kitchen'?['给排水、烟道及用电条件先确认，再决定柜体排布。']:room==='balcony'?['落地外窗为效果设想；原结构、外立面和防护条件需核验。']:[])],items:r.materials}:null;}
