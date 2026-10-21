# v50 · 花影收纳优化与两套全屋新作

首页仍为原有十套精选，花影保持第 5 位；开场、布局、横向浏览、材质动效及品牌标识保持原样。全套方案由 22 套增至 25 套。

## 本次交付

| 入口 | 内容 |
| --- | --- |
| 精选第 5 位 · 花影绮居 | 客厅电视墙改为奶油色浅通顶柜，局部编织与同色花卉门片；保留沙发侧玉兰浮雕。厨房拉花釉砖扩展到整段灶台墙，低对比灰绿、少量烟莓与大面积奶油底控制繁复感。 |
| 全套第 23 套 · 花影绮居 · 初版 | 保留 v48 原始花影的八个空间、九张视角和原始房间说明；独立方案 ID `flora-original`，不替换当前精选。 |
| 全套第 24 套 · 翡织曲邸 / VERDE ATELIER | 奶油色、浅麦皮革、浅橡木与翡翠漆色，宽带编织、圆润家具、卡座收纳。八个空间、九张视角。 |
| 全套第 25 套 · 雾蓝云邸 / AZURE SILENCE | 珍珠白、雾蓝细织物、少量烟木与香槟细边，简洁比例、浅色柜面和柔光。八个空间、九张视角。 |

两套新作共用原户型参照与各自客厅材质锚点，保留窄次卧纵向单人床、厨房边界和双阳台关系。图像为概念意向，家具精确尺寸与施工构造仍按现场深化。本轮沿用既有 3D 结构，仅接入新方案配色与排布元数据。

## 灵感依据

- Bottega Veneta 的 [Home Collection](https://www.bottegaveneta.com/en-gb/home-content.html) 将皮革、编织、织物和陶瓷的手工技艺带入家居。本项目由此设计翡织曲邸的宽带与圆润体量。
- Armani/Casa 的 [Experience](https://www.armani.com/en-es/armani-casa/experience/) 强调简洁线条、比例、精细饰面与织物。本项目由此设计雾蓝云邸的浅褶、水平线与柔光。

上述配色、家具组合、纹样和房间设计是本项目的原创转译，不表示使用品牌成品，亦非品牌官方住宅设计。

## 图像与提示词

本轮使用 **builtin imagegen（内置图像生成）**，共选用 21 张新图：花影 3 张，两套新作各 9 张。网页文件为 1536 × 1024 主图、480 × 320 缩略图及 768 × 512 花影首页预览，共 43 个 WebP 文件。

- [完整生成提示词与参考路径](generation-prompts.json)
- [定向调整提示词](generation-refinements.json)：翡织客厅反向图重试、厨房翡翠抽屉与交织砖调整、雾蓝餐厅去除重复挂画。
- [最终图片路径、尺寸与 SHA-256](assets.json)

最终资产位于 `dist/designs-v50/schemes/silver-retreat/`、`dist/designs-v50/schemes/verde-atelier/`、`dist/designs-v50/schemes/azure-silence/` 和 `dist/designs-v50/featured/flora-768.webp`。花影其余六张图继续使用已认可的 v49 文件。

全部新增主图与缩略图同源，原始 v48 三套完整图由已存在的固定 GitHub 提交供图，保留三条加载线路；其缩略图仍在站内。首页仍按可见卡片加载，不一次启动全套工作台或 3D。

## 回退花影本轮优化

v49 已获认可的“织花入室”版本单独保存于 `rollback/flora-home-v49.mjs` 和 `rollback/flora-selection-v49.mjs`，对应原图仍完整保留于 `dist/designs-v49/`。

仅回退本轮花影时：恢复上述两个模块到各自原路径；将 `scripts/prepare-hosting.mjs` 中 `supersededFlora` 改为恒为 false，使 v49 全套图重新随站发布；重新构建并部署。保留 `atelier-homes.mjs` 与初版入口，两套新方案和 25 套工作台不受影响。不要回滚整站提交。

## 复验

`npm run build` → `node scripts/prepare-hosting.mjs` → `npm run check` → `node scripts/check-v39-privacy.mjs` → `node scripts/check-v40-collection.mjs` → `node scripts/check-v41-home.mjs` → `node scripts/check-v50-ateliers.mjs`。

具体结果见 [checks.json](checks.json)、[collection-checks.json](collection-checks.json)、[home-checks.json](home-checks.json)。发布目录采用新建暂存目录后整体替换，文件清单与哈希见 [hosting-inventory.json](hosting-inventory.json)。
