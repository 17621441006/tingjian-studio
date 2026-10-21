// Original residential concepts: craft/material references, no branded product claims.
import {FLORA_ORIGINAL} from './flora-original.mjs';
import {VOYAGE_HOME,VOYAGE_COLORS,VOYAGE_PLANS} from './voyage-home.mjs';
export const ATELIER_IDS=['flora-original','verde-atelier','azure-silence'];
const purchases={living:['sofa','chair','table','floor','light'],dining:['table','chair','storage','light'],master:['bed','storage','floor','light'],second:['bed','storage','chair','light'],kitchen:['storage','panel','tile','light'],bath:['storage','panel','tile','light'],balcony:['chair','table','curtain','tile'],utility:['storage','panel','tile']};
function home(name,englishName,subtitle,description,rooms){return {name,englishName,subtitle,description,purchaseKey:'dusk',rooms:Object.fromEntries(Object.entries(rooms).map(([id,[title,copy,material,light,tradeoff]])=>[id,{title,copy,tradeoff,materials:[['布局与收纳',copy],['选材与软装',material],['光线与细节',light],['尺度',tradeoff]],purchase:purchases[id]}]))};}
export const ATELIER_HOMES={
 'flora-original':FLORA_ORIGINAL,
 'verde-atelier':home('翡织曲邸','VERDE ATELIER','翡翠漆色 · 宽带编织 · 奶油曲线','以皮革交织的结构感为线索，把奶油白、浅麦皮革与一抹鲜明翡翠绿放进明亮小宅。圆润家具与少量宽带编织彼此呼应，浅木和浅石承担大面；每个房间用不同的器物与构图表达手作。',{
  living:['一抹翡翠，落在柔软曲线之间','奶油色小体量曲线沙发沿原墙布置，浅麦色宽带编织单椅可移动。翡翠绿低柜收纳影音设备，浅石与木面套几按使用拆合；中央通路与玻璃开口保持完整。','奶油密织布、宽条皮革编织、浅橡木、浅洞石意向饰面与小面积翡翠漆色；沙发墙仅用一件浅木交织浮雕。','日光成为主角，织纹靠侧光显出深浅；阅读灯与柜边灯分开控制。器物只留一件钴蓝釉陶，避免重复花束。','单椅与套几按实际净宽试排；皮革织带的承重、张力与可更换性按成品核验，不把装饰编织当作承重结构。'],
  dining:['沿墙围坐，把余地还给过道','小椭圆桌配靠墙奶油软包卡座，座下分段抽屉收餐垫与备用餐具。两把轻木皮带椅可收进桌下，玄关薄柜兼作落物台。','浅橡木、浅麦皮革宽带、耐磨奶油织物与哑光浅石；吊灯取薄织带折转的轮廓，桌上仅放低矮釉陶果碗。','乳白折带灯柔和照桌面，柜内照明按需开启；卡座抽屉与桌脚错开，日常不必挪桌取物。','卡座、桌沿与椅背共同复核净距，先试坐再确定靠背角度；抽屉拉出不能挡住入户门与主通道。'],
  master:['把宽带的肌理，留给床头','浅麦色宽条编织床头搭奶油床品，窄翡翠绿床尾毯点出主题。浅橡木衣柜贴墙，原窗下薄抽屉榻收床品；床侧留轻巧抽屉柜。','封闭衬底皮革编织床头、浅橡木、棉麻与细羊毛；一幅留白几何纸艺区别于客厅木浮雕。','分控阅读灯不直射眼睛，窗帘采用纱与遮光双层；床头编织只在近人区域出现，不铺满整墙。','先以适合房间的床架外尺寸复尺；原转角窗、空调与柜门开启完整保留，床尾不再塞入厚长凳。'],
  second:['窄榻与薄桌，让编织也有秩序','单人日间床沿右墙纵向安放，床下抽屉分收床品和行李。左侧浅书桌与薄柜控制深度，柜门局部用宽带几何嵌片；中央留清晰通道。','温白墙、浅橡木、奶油坐垫与少量翡翠靠包；桌边小纸雕和线性灯具，让小空间避免浓重装饰。','任务光、床边阅读光分别控制，线缆进入桌后线槽；编织嵌面有封闭衬底，减少积灰。','不横放双人床，不改变原窄房比例；抽屉、椅子和房门开启一起试排，窄桌按实际设备选择深度。'],
  kitchen:['让交织，成为一段干净的几何','保留窗下水槽、右侧灶台与左侧浅备餐的U形关系。浅橡木下柜与奶油上柜相接，一组翡翠抽屉形成重点；深抽屉与窄拉篮归置锅具调料。','光滑暖白釉砖、少量平面交织几何砖、耐潮木纹门板、耐水浅色台面；湿热区不用真皮与开放藤编。','柜下连续任务光照洗切煮，交织几何仅在小段防溅墙出现，其余留白；备餐台面少摆装饰。','烟道、给排水与电器位置按现场核验，柜体转角设置可达储物；拉篮与抽屉开启不得互相碰撞。'],
  bath:['把织纹，转译成耐水釉色','淋浴、台盆、马桶与原窗关系保留。洗手区一段浅交织压纹翡绿釉陶成为重点，台盆下封闭抽屉与分类篮收纳日用品。','奶油防滑砖、封闭光滑翡绿釉陶、耐水浅木纹门板与薄香槟金属；湿区不使用真皮或开放藤编。','横向圆角镜与两侧均匀补光，柜下低位光单独控制；图案停在洗手区，不让整个浴室都变成格纹。','砖面实样检查擦洗与接缝，排水坡度、防滑及检修口现场深化；镜柜深度避免挤占站立位置。'],
  balcony:['一张翡绿小几，两把轻椅','两把浅麦色宽带轻椅与翡翠釉陶小边几靠右侧短墙放置，窗前保持通透。一株形态清楚的植物与一只茶杯即可，家具能按需要挪开。','耐晒耐候宽带编织、可拆洗奶油坐垫、釉陶或耐水复合小几与浅色瓷砖；阳台不直接沿用怕晒的室内皮革。','薄帘调节眩光，低位阅读灯在需要时点亮；浅色短墙反射日光，让翡绿成为一个清晰点位。','轻椅与植物不挡窗扇、清洁与防护通路；家具耐候性及原窗条件按现场核验。'],
  utility:['从洗烘，到折叠和归位','洗烘塔仍在尽端，右侧整理台配可取出分类篮与抽拉板。奶油色设备柜和浅橡木窄工具柜保持连续，日用消耗品收入上柜。','耐潮奶油饰面、浅木纹柜板、可洗宽带几何收纳篮与耐水台面；柜门平整闭合，图案只落在篮筐上。','均匀任务灯照整理区，充电与插座集中在干燥便于维护的位置；家务工具按长短分区。','按洗烘机型核对叠放、散热和检修要求；抽拉板使用后归位，中央通道保持空置。']
 }),
 'azure-silence':VOYAGE_HOME
};
export const ATELIER_COLORS={
 'flora-original':{wood:'#a47b4b',wall:'#f2e8d7',stone:'#e1d0b2',sofa:'#677251',textile:'#eee3ce',accent:'#7d3243',floor:'#c9b995'},
 'verde-atelier':{wood:'#c7aa7e',wall:'#f3ecd9',stone:'#e0d7c2',sofa:'#eee5cf',textile:'#e8dfcb',accent:'#16885a',floor:'#cdbb9c'},
 'azure-silence':VOYAGE_COLORS
};
export const ATELIER_PLANS={
 'flora-original':{second:'trundle',balcony:'bistro',kitchen:'u-cook',bath:'hamper',utility:'sorting',dining:'round'},
 'verde-atelier':{second:'permanent',balcony:'bistro',kitchen:'u-cook',bath:'hamper',utility:'sorting',dining:'wall-banquette'},
 'azure-silence':VOYAGE_PLANS
};
