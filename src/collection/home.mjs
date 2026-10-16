import {COLLECTION} from './catalog.mjs';
import {brandHead} from '../brand/meta.mjs';
const escape=value=>String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
// Original presentation: full-height images, three contrasting typographic voices.
const panels=[
 {id:'stillwood',type:'a',title:'Stillwood',label:'QUIET LUXURY',tag:'栖静 · 栖于静',copy:'以空为奢。洞石、灰洗白橡木、手工石灰墙与亚麻，把日常收进完整的木作背景——把家当作一处城市山居。',tags:['洞石','白橡木格栅','和纸灯','阅读榻']},
 {id:'nocturne',type:'e',title:'Nocturne',label:'THE NIGHT GALLERY',tag:'夜廊 · 夜色画廊',copy:'白昼是画廊，入夜是剧场。黑白石面、拉丝黄铜、祖母绿天鹅绒与浅灰织物，分层灯光重写城市夜晚。',tags:['黑金','祖母绿','夜景酒吧','精品衣帽间']},
 {id:'inkcourt',type:'z',title:'山居',label:'NEO-CHINESE',tag:'INKCOURT · 山居于市',copy:'借、框、对、隔。一道月洞门借来城市远山，胡桃木、宣纸格栅、青石与青瓷，茶室与枯山水，宋式的简与静。',tags:['月洞门','宣纸格栅','茶室','枯山水']},
 {id:'dusk',type:'e',title:'Vesper',label:'THE WARM RETREAT',tag:'暮色 · 日暮归家',copy:'干邑皮革、胡桃木与烟玻璃，让一天的余温慢慢留在家里。窄扶手、低靠背与局部暖光，为日常留出从容。',tags:['干邑皮革','胡桃木','烟玻璃','暖光']},
 {id:'cinnabar',type:'z',title:'绛天',label:'CONTEMPORARY HERITAGE',tag:'CINNABAR · 木色入画',copy:'绛木与温白相接，花格只留一处。熟悉的东方轮廓，用轻一点的尺度回到当代生活，收放之间，自有章法。',tags:['绛木','花格','浅石','棉麻']},
 {id:'verdigris',type:'a',title:'Verdigris',label:'THE PATINA OF TIME',tag:'铜绿 · 岁月成色',copy:'灰绿矿物色收住重心，古铜点亮近处的细节。石有山色，铜有时间，浅木与细织物让空间保持温度。',tags:['矿物绿','古铜','暖木','灰米织物']},
 {id:'amber',type:'a',title:'Amber Arc',label:'A SOFTER KIND OF LIGHT',tag:'琥珀曲光 · 浅橡与陶土',copy:'浅橡木托住一室日光，肉桂色曲线松开直角。琥珀玻璃、薄边茶几与象牙白墙，让温度保持轻盈。',tags:['浅橡木','陶土曲线','琥珀玻璃','象牙白']},
];
export function homePage(version){
 const cards=COLLECTION.map((s,i)=>{
  const p=panels.find(p=>p.id===s.id);
  return `<a class="p ${p.type}${i<3?' is-visible':''}" href="/collection/${s.id}.html" data-panel="${i}" aria-label="${s.en} · ${s.cn}，进入提案"><div class="bg"><img src="${s.heroThumb}" data-full="${s.hero}" width="1536" height="1024" alt="${s.cn} · 客厅氛围意向" loading="${i===0?'eager':'lazy'}" ${i===0?'fetchpriority="high"':''} decoding="async"></div><span class="no">NO.${s.index} — ${p.label}</span><div class="in"><h2>${p.title}</h2><div class="tag">${p.tag}</div><div class="more"><p>${escape(p.copy)}</p><ul>${p.tags.map(t=>`<li>${t}</li>`).join('')}</ul></div><span class="go"><i></i>${p.type==='z'?'入 园':'ENTER PROPOSAL'}</span></div></a>`;
 }).join('');
 return `<!doctype html>
<html lang="zh-CN"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>夜廊 · 陈天涌私宅设计 — NOCTURNE</title>
<meta name="description" content="夜廊 · 陈天涌私宅设计。NOCTURNE：夜廊、绛天、暮色、铜绿、栖静、琥珀曲光、山居，七种生活提案。">
<meta name="theme-color" content="#0d0c0b">
${brandHead}
<link rel="stylesheet" href="/collection/home.css?v=${version}">
<script src="/collection/vendor/gsap.min.js" defer></script>
<script src="/collection/home.js?v=${version}" defer></script>
<noscript><style>.intro,.edge-nav{display:none!important}html,body{height:auto;overflow:auto}.panels{height:auto;overflow:visible}.panel-track{display:flex;flex-direction:column;transform:none}.panels .p{flex:none!important;width:100%;height:80vh}.p .more{max-height:none;opacity:1;margin-top:26px}.foot{position:relative;background:#0d0c0b}</style></noscript>
</head><body>
<a class="skip-link" href="#collection">跳过开场，浏览方案</a>
<div class="grain" style="--grain:.06" aria-hidden="true"></div>
<div class="intro" id="intro" aria-hidden="true"><div><div class="t"><span>夜廊</span></div><div class="s">NOCTURNE</div></div></div>
<header class="top"><h1>夜廊 · 陈天涌私宅设计<small>NOCTURNE · SEVEN WAYS OF LIVING</small></h1><div class="meta"><span class="selection-count">七种气质 · 八个空间</span><br><a class="studio-entry" href="/tour/"><i aria-hidden="true"></i><span>进入全套方案工作台</span><b aria-hidden="true">↗</b></a></div></header>
<main class="panels" id="main" aria-label="七套生活提案">
 <div class="panel-track" id="collection" tabindex="-1">${cards}</div>
 <nav class="edge-nav" aria-label="左右浏览方案"><button class="edge edge-left" type="button" data-shift="-1" aria-label="向左浏览上一套" aria-controls="collection" disabled><span aria-hidden="true">‹</span></button><button class="edge edge-right" type="button" data-shift="1" aria-label="向右浏览下一套" aria-controls="collection"><span aria-hidden="true">›</span></button></nav>
</main>
<footer class="foot"><span class="browse-hint">七套风格 · 点击进入</span><span class="range" aria-live="polite" aria-atomic="true">01 — 03 / 07</span><span class="foot-detail">理念 · 空间 · 材质 · 光与智能 · 收纳</span></footer>
</body></html>`;
}
