import fs from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {build} from 'esbuild';
await fs.mkdir('dist/lab',{recursive:true});
await build({entryPoints:['src/app.mjs'],bundle:true,minify:true,format:'esm',target:'es2022',outfile:'dist/app.js',legalComments:'linked'});
await fs.copyFile('src/app.css','dist/app.css');
await fs.copyFile('src/index.html','dist/lab/index.html');

await fs.rm('dist/tour/legacy-runtime',{recursive:true,force:true});
await build({entryPoints:{loader:'src/legacy/loader.mjs',trial:'src/legacy/trial.mjs'},bundle:true,minify:true,format:'esm',splitting:true,target:'es2022',outdir:'dist/tour/legacy-runtime'});
const legacyDigest=createHash('sha256').update(await fs.readFile('dist/tour/legacy-runtime/loader.js')).update(await fs.readFile('dist/tour/legacy-runtime/trial.js')).update(await fs.readFile('src/legacy/trial.css')).update(await fs.readFile('src/legacy/home-gallery.css')).update(await fs.readFile('src/legacy/design-journey.css')).update(await fs.readFile('src/legacy/design-journey.template.html')).update(await fs.readFile('src/legacy/space-model.template.html')).update(await fs.readFile('src/legacy/home-gallery.template.html')).update(await fs.readFile('src/legacy/gallery.js')).update(await fs.readFile('src/legacy/legacy.template.html')).update(await fs.readFile('src/legacy/trial.template.html')).digest('hex').slice(0,12);
let legacyTemplate=await fs.readFile('src/legacy/legacy.template.html','utf8');
legacyTemplate=legacyTemplate.replace('__TRIAL__',await fs.readFile('src/legacy/trial.template.html','utf8')).replace('__HOME_GALLERY__',await fs.readFile('src/legacy/home-gallery.template.html','utf8')).replace('__DESIGN_JOURNEY__',await fs.readFile('src/legacy/design-journey.template.html','utf8')).replace('__SPACE_MODEL__',await fs.readFile('src/legacy/space-model.template.html','utf8')).replaceAll('__LEGACY_VERSION__',legacyDigest);
await fs.writeFile('dist/tour/legacy.html',legacyTemplate);
await fs.writeFile('dist/tour/furniture-trial.css',(await fs.readFile('src/legacy/trial.css','utf8'))+'\n'+(await fs.readFile('src/legacy/home-gallery.css','utf8'))+'\n'+(await fs.readFile('src/legacy/design-journey.css','utf8')));
await fs.copyFile('src/legacy/gallery.js','dist/tour/legacy-gallery.js');

// Earlier features remain at a separate, lazily opened history route.
await fs.rm('dist/tour/history-runtime',{recursive:true,force:true});
await build({entryPoints:{loader:'src/history/loader.mjs',trial:'src/history/trial.mjs'},bundle:true,minify:true,format:'esm',splitting:true,target:'es2022',outdir:'dist/tour/history-runtime'});
let historyTemplate=await fs.readFile('src/history/legacy.template.html','utf8');
historyTemplate=historyTemplate.replace('__TRIAL__',await fs.readFile('src/history/trial.template.html','utf8')).replace('__HOME_GALLERY__',await fs.readFile('src/history/home-gallery.template.html','utf8')).replace('__DESIGN_JOURNEY__',await fs.readFile('src/history/design-journey.template.html','utf8')).replace('__SPACE_MODEL__',await fs.readFile('src/history/space-model.template.html','utf8')).replaceAll('__LEGACY_VERSION__','archive-v13').replaceAll('/tour/legacy-runtime/','/tour/history-runtime/').replaceAll('/tour/furniture-trial.css','/tour/history-trial.css').replaceAll('/tour/legacy-gallery.js','/tour/history-gallery.js');
await fs.writeFile('dist/tour/history.html',historyTemplate);
await fs.writeFile('dist/tour/history-trial.css',(await fs.readFile('src/history/trial.css','utf8'))+'\n'+(await fs.readFile('src/history/home-gallery.css','utf8'))+'\n'+(await fs.readFile('src/history/design-journey.css','utf8')));
await fs.copyFile('src/history/gallery.js','dist/tour/history-gallery.js');

await build({entryPoints:['src/tour/tour.js'],bundle:true,minify:true,outfile:'dist/tour/tour.js'});
const digest=createHash('sha256').update(await fs.readFile('dist/tour/tour.js')).digest('hex').slice(0,12);
const assets=JSON.parse(await fs.readFile('src/tour/assets-manifest.json','utf8'));
const template=await fs.readFile('src/tour/tour.template.html','utf8');
const content=template.replace('__ASSETS__',JSON.stringify(assets))
  .replace('<script type="application/octet-stream" data-legacy-source>__LEGACY__</script>','<script type="application/octet-stream" data-legacy-source data-url="/tour/legacy.html"></script>')
  .replace('<script>__BUNDLE__</script>',`<script src="/tour/tour.js?v=${digest}" defer></script>`);
const lab=await fs.readFile('src/index.html','utf8');
const icon=lab.match(/<link rel="icon"[^>]+>/)[0];
const page=`<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#f5f4ef"><meta name="description" content="庭间空间设计：先选风格，再比较布局、收纳与五种光线，再选家具材料，最后查看和下载全屋效果册。"><title>庭间 · 空间设计</title>${icon}<style>html{background:#edf0e9}body{margin:0;padding:14px 14px 40px;font-family:system-ui,-apple-system,'PingFang SC',sans-serif}.site-note{max-width:2156px;margin:18px auto 0;color:#69736a;font-size:12px;line-height:1.8}@media(max-width:700px){body{padding:0 0 24px}.site-note{padding:0 16px}}</style></head><body><main>${content}</main><footer class="site-note">庭间 · 一寸一物，慢慢成家。<br>设计效果参考；房屋尺寸、结构与家具摆放以现场复核为准。</footer></body></html>`;
await fs.writeFile('dist/index.html',page);
await fs.writeFile('dist/tour/index.html',page);
console.log('Built HD home + tour alias; furniture laboratory isolated at /lab/');
