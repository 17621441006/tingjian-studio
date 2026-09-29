import {MINERAL_IDS,mineralAsset} from './mineral-homes.mjs';
// Authored final images: one complete, fixed styling treatment per selected scheme.
export const FINAL_DESIGNS=['dusk','chinese','stone','collector','copper','amber','graphite','edition-oak',...MINERAL_IDS];
export const v35Asset=path=>(globalThis.__TINGJIAN_V35_ORIGIN__||'')+path;
export function finalAsset(design,room,thumb=false){if(MINERAL_IDS.includes(design))return mineralAsset(design,room,thumb);return v35Asset('/final-v35/schemes/'+design+'/'+room+(thumb?'-thumb':'')+'.webp');}
export function collectionAsset(collection,room,thumb=false){return v35Asset('/final-v35/collections/'+collection+'/'+room+(thumb?'-thumb':'')+'.webp');}
export const FINAL_ROOM_NOTES={living:'沿用客厅与餐厅的原有关系，补齐灯光、织物与器物。',dining:'餐厅与客厅共用约21.4㎡，保留玄关与房门通道。',master:'主卧约13.5㎡，保留原窗位与衣柜、床边通路。',second:'次卧约7.2㎡：窄床沿侧墙纵向放置，窗下轻薄书桌，保留中间通道。',kitchen:'厨房约6.6㎡，保留独立厨房边界、窗位与紧凑操作区。',bath:'卫生间约4.3㎡，保留紧凑淋浴、台盆与马桶关系。',balcony:'景观阳台约5㎡：落地玻璃到地面，轻家具侧置，不用半墙或整排坐榻挡窗。',utility:'生活阳台约2.5㎡，叠放洗烘与窄柜保留检修和操作空间。'};
