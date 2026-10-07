import {EXPANSION_IDS,EXPANSION_HOMES,expansionAsset} from './expansion-homes.mjs';
import {hasReplan,replanAsset,replanInfo} from './layout-v37.mjs';
import {pineAsset} from './pine-home.mjs';
import {MINERAL_IDS,mineralAsset} from './mineral-homes.mjs';
// Authored final images: one complete, fixed styling treatment per selected scheme.
export const FINAL_DESIGNS=['dusk','chinese','stone','collector','copper','amber','graphite','edition-oak',...MINERAL_IDS,'pine-library',...EXPANSION_IDS];
export const v35Asset=path=>(globalThis.__TINGJIAN_V35_ORIGIN__||'')+path;
export function finalAsset(design,room,thumb=false){if(EXPANSION_IDS.includes(design))return expansionAsset(design,room,thumb);if(design==='pine-library')return pineAsset(room,thumb);if(hasReplan(design,room))return replanAsset(design,room,thumb);if(MINERAL_IDS.includes(design))return mineralAsset(design,room,thumb);return v35Asset('/final-v35/schemes/'+design+'/'+room+(thumb?'-thumb':'')+'.webp');}
export function collectionAsset(collection,room,thumb=false){return v35Asset('/final-v35/collections/'+collection+'/'+room+(thumb?'-thumb':'')+'.webp');}
export const FINAL_ROOM_NOTES={living:'沿用客厅与餐厅的原有关系，补齐灯光、织物与器物。',dining:'餐厅与客厅相连，保留玄关与房门通道。',master:'主卧保留原窗位与衣柜、床边通路。',second:'次卧：窄床沿侧墙纵向放置，窗下轻薄书桌，保留中间通道。',kitchen:'厨房保留独立厨房边界、窗位与紧凑操作区。',bath:'卫生间保留紧凑淋浴、台盆与马桶关系。',balcony:'景观阳台：落地玻璃到地面，轻家具侧置，不用半墙或整排坐榻挡窗。',utility:'生活阳台叠放洗烘与窄柜保留检修和操作空间。'};

export const finalRoomNote=(design,room)=>EXPANSION_HOMES[design]?(room==='second'?'次卧。':room==='balcony'?'景观阳台落地玻璃。':'')+EXPANSION_HOMES[design].rooms[room].copy+' '+EXPANSION_HOMES[design].rooms[room].tradeoff:hasReplan(design,room)?(room==='second'?'次卧。':room==='kitchen'?'厨房。':'主卧。')+replanInfo(design,room).copy:design==='pine-library'&&room==='second'?'次卧：右侧翻床收起成为书房，左侧薄桌借窗光，展开床前需收妥活动家具。':FINAL_ROOM_NOTES[room];
