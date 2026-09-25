// Each selectable combination is an authored scene. Never silently substitute a different item.
export const PIECE_GROUPS={
 sofa:{label:'沙发',items:[
  {id:'cognac',name:'干邑薄扶手',finish:'细纹皮革 · 低靠背 · 深铜细腿',note:'干邑色皮面保留自然褶皱，窄扶手与细腿减轻体量。'},
  {id:'blend',name:'皮框 · 燕麦细织',finish:'棕皮外框 · 灰燕麦坐垫 · 直排',note:'沿用你喜欢的皮革外框与织物坐垫，把贵妃位收成紧凑直排。建议从约 205–215cm 试排，图中为原创概念款，非精确比例或品牌型号。'},
  {id:'slim',name:'烟褐纤细框',finish:'暖烟褐细织 · 薄扶手 · 深铜脚',note:'低饱和烟褐织物与纤细支撑，用细节而不是体量表达品质。建议从约 208cm 试排，实际尺寸需要选型与复尺。'},
  {id:'wine',name:'深酒红皮',finish:'低饱和皮革 · 柔软坐垫',note:'压低饱和度的酒红皮面，以细微反光与深木拉开层次。'},
  {id:'mink',name:'暖褐细织',finish:'哑光 · 细密织纹 · 柔软坐感',note:'暖灰褐细织物提供柔和明度差，避免粗颗粒面料的膨胀感。'}
 ]},
 table:{label:'茶几',items:[
  {id:'glass',name:'烟玻璃椭圆几',finish:'烟色玻璃 · 细青铜支撑',note:'薄玻璃透出地毯与投影，用通透感为深色木作留白。'},
  {id:'stone',name:'深石薄面几',finish:'灰褐石纹 · 圆角 · 纤细深腿',note:'深灰褐石材观感的薄台面与细腿，保留纹理，收住体量。'}
 ]},
 floor:{label:'地面',items:[
  {id:'stone',name:'暖灰石面',finish:'细纹哑光 · 安静底色',note:'暖灰褐的石材观感，托住深木与皮革。'},
  {id:'oak',name:'自然浅橡木',finish:'顺铺 · 温暖浅木 · 低光泽',note:'浅橡木拉开明度，对家具保留真实接地阴影。仅替换当前客餐厅画面的露出地面。'},
  {id:'smoked',name:'烟熏胡桃木',finish:'顺铺 · 深棕层次 · 低光泽',note:'烟熏木色延续私人酒店感，用自然纹理与地毯区分层次。仅替换当前客餐厅画面的露出地面。'}
 ]},
 bed:{label:'床',items:[
  {id:'linen',name:'亚麻低床',finish:'细织灰米 · 低矮软包',note:'浅灰米色细织软包，让睡眠区轻下来。'},
  {id:'leather',name:'干邑翼背床',finish:'柔软皮革 · 翼形床头',note:'干邑色皮革包裹的翼形床头，呈现私人酒店感。'},
  {id:'wood',name:'胡桃木悬浮床',finish:'薄木框 · 织物嵌面',note:'轻薄胡桃木床框与软包嵌面，减少厚重软包的分量。'}
 ]},
 window:{label:'窗景',items:[
  {id:'original',name:'保留现有窗',finish:'现有开口 · 原窗型',note:'保留当前窗型，继续比较家具与床品。'},
  {id:'clear',name:'整面玻璃',finish:'无中间横档 · 侧边通风',note:'主观景面为连续固定玻璃，窄开启扇放在侧边。属于未复尺的外窗设想，需核对原结构、外立面与玻璃防护。'}
 ]},
 bedding:{label:'床品',items:[
  {id:'taupe',name:'白棉 · 暖褐搭毯',finish:'原搭配 · 白与褐的层次',note:'白色床品和暖褐搭毯，延续原方案的温度。'},
  {id:'ivory',name:'象牙亚麻',finish:'水洗褶皱 · 灰褐窄搭毯',note:'象牙白自然褶皱，少量灰褐收住边缘，安静而透气。'},
  {id:'olive',name:'灰橄榄',finish:'低饱和绿 · 象牙白 · 可可点缀',note:'灰橄榄引入微妙冷暖对比，保留深木的温暖。'}
 ]}
};
export const PIECE_ROOMS=['living','master'];
export function defaultPieces(){return {sofa:'cognac',table:'glass',floor:'stone',bed:'linen',bedding:'taupe',window:'original'};}
export function normalizePieces(selection={}){const result=defaultPieces();for(const kind of Object.keys(result))if(PIECE_GROUPS[kind].items.some(i=>i.id===selection[kind]))result[kind]=selection[kind];return result;}
export function changePiece(selection,kind,id){const result=normalizePieces(selection);if(PIECE_GROUPS[kind]?.items.some(i=>i.id===id))result[kind]=id;return result;}
export function pieceItem(kind,id){return PIECE_GROUPS[kind].items.find(i=>i.id===id)||PIECE_GROUPS[kind].items[0];}
export function pieceGroups(room){return room==='living'?['sofa','table','floor']:room==='master'?['bed','bedding','window']:[];}
export function isPieceView(view){return view.design==='dusk'&&view.mode==='pieces'&&PIECE_ROOMS.includes(view.room);}
export function pieceAvailable(room,selection){return true;}
export function pieceAvailabilityNote(room,selection){return '';}
export function pieceAsset(room,selection,thumb=false){
 const s=normalizePieces(selection),suffix=thumb?'-thumb':'';if(!pieceAvailable(room,s))return null;
 if(room==='master'&&s.window==='clear')return `/tour/home-assets/dusk/windows/master${s.bed==='linen'&&s.bedding==='taupe'?'':'-'+s.bed+'-'+s.bedding}-clear${suffix}.jpg`;
 if(room==='master')return s.bedding==='taupe'?`/tour/home-assets/dusk/pieces/master/${s.bed}${suffix}.jpg`:`/tour/home-assets/dusk/selections/master/${s.bed}-${s.bedding}${suffix}.jpg`;
 if(['blend','slim'].includes(s.sofa)||s.floor!=='stone')return `/tour/home-assets/dusk/selections/living/${s.sofa}-${s.table}-${s.floor}${suffix}.jpg`;
 return `/tour/home-assets/dusk/pieces/living/${s.sofa}-${s.table}${suffix}.jpg`;
}
export function piecePresentation(room,selection){
 const s=normalizePieces(selection),sofa=pieceItem('sofa',s.sofa),table=pieceItem('table',s.table),floor=pieceItem('floor',s.floor),bed=pieceItem('bed',s.bed),bedding=pieceItem('bedding',s.bedding);
 if(room==='master')return {label:bed.name+' × '+bedding.name+(s.window==='clear'?' × 整面窗景':''),title:'一张床，几种柔软的心情',copy:bed.note+bedding.note+' 保留原卧室的构图。',materials:[['床型',bed.finish+'；为设计概念款，尺寸与厂家款式需另行选定。'],['床品',bedding.finish],['窗景',pieceItem('window',s.window).name+'；'+pieceItem('window',s.window).note]]};
 return {label:sofa.name+' × '+table.name+' × '+floor.name,title:'单品各有性格，也能自然相处',copy:sofa.note+table.note+floor.note,materials:[['沙发',sofa.finish+'；原创概念款，非下方品牌精确商品。'],['茶几',table.finish],['地面',floor.finish+'；地毯保持细密短绒与薄收边。']]};
}
