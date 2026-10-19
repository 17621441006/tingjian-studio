# NOCTURNE v48 · 精选扩展与三套重设计

## 本轮交付
- 首页精选共 9 套，顺序：夜廊 → 绒光静邸 → 暮色 → 鞍影织序 → 绛天（工作台：绛木雅居）→ 铜绿 → 栖静 → 琥珀曲光 → 山居。
- 绒光静邸与鞍影织序沿用既有精选模板，补齐理念、材料、八空间、双向客厅图集、灯光预览和工作台链接；所有 v47 原效果图逐文件哈希不变。
- 原三联画、入场时间线、悬停展开、左右切换、滚动呈现、Logo 与主字体系统保留。新页面只增加对应色调与长英文标题的局部尺寸规则。
- 工作台总数保持 22，原编号与 ID 保留，其余 19 套内容不变。

| 工作台位置 / ID | 原方案 | 新方案 | 设计转译 |
|---|---|---|---|
| 13 / mauve-walnut | 墨紫木邸 | 苔织艺邸 · WOVEN MUSE | LOEWE 的编织和手作研究，转为苔绿织物、浅梣木、皮带编织、钴蓝陶器 |
| 16 / pine-library | 松烟书邸 | 石序光廊 · PALE ATELIER | CELINE 店铺建筑的材料秩序，转为浅石、烟木、驼皮、原创黑白构成 |
| 19 / silver-retreat | 漆夜藏珍 | 花影绮居 · FLORA SALON | GUCCI 家居的植物色彩与折衷搭配，转为奶油白、橄榄绿、酒红、原创植物图案 |

三套均为独立概念设计，无品牌 Logo、产品型号或官方联名表述。每套 8 空间 / 9 视角，包含看向客厅的反向图，共 27 张新效果图与 27 张缩略图。保留户型开口与紧凑房间的参考关系；效果图不是测绘或施工图。现有 3D 模块只同步配色、材质类型与可用布局参数，没有新建高精度模型。

## 图像与复现
- 使用内置 image_gen.imagegen，参考已有房间图和新方案客厅主图生成。
- 完整提示词、参考图路径、每张生成图路径：[generation-prompts.json](generation-prompts.json)。
- 网站资源：[../../dist/designs-v48/schemes](../../dist/designs-v48/schemes)，每套 living、living2、dining、master、second、kitchen、bath、balcony、utility。
- 主图 1536×1024，缩略图 480×320；54 个 WebP 共 5,548,060 字节。没有把生成的原始 PNG 塞入首屏。
- [assets.json](assets.json) 记录各文件 SHA-256、尺寸与体积；export-assets.py 按生成清单导出。
- floor-qa 文件为地材预览遮罩的人工检查图，仅框定可见地面，避开家具与地毯。

## 材料与布局差异
- 苔织：圆桌；次卧椅床与手作桌；阅读阳台；浅 L 形操作区；分类家务柜。
- 石序：椭圆桌；次卧纵向单人床；侧墙薄写字台阳台；双排厨房；可收熨衣板。
- 花影：圆桌；次卧日间床加抽拉床；双人早餐阳台；U 形厨房；分类家务柜。
- 厨卫使用易清洁、防潮的瓷质与耐水饰面；编织、皮革、植物织物集中在干区软装。

## 研究来源
以下是设计研究参考，不是与品牌合作或使用其专有图案。
- LOEWE Weave, Restore, Renew: https://www.loewe.com/usa/en/pd/stories-collection/weave-restore-renew.html
- LOEWE Weaves: https://www.loewe.com/eur/en/stories-collection/loewe-weaves.html
- Casper Mueller Kneer, CELINE Cheongdam: https://www.caspermuellerkneer.com/project/celine-cheongdam
- GUCCI Décor 2021: https://www.gucci.com/au/en_au/st/stories/article/gucci-decor-2021-collection

## 验证与发布
已运行 npm run build、npm run check、check-v39-privacy、check-v40-collection、check-v41-home、check-v48-couture。
- 9 个精选页、72 空间、81 视角；链接、全屏图集、视角按钮、材质悬停、灯光和导航事件验证通过。
- 22 套工作台、44 个现有模型变体、逐房间隔离、三套新图路由、布局与配色联动通过。
- 其余 19 套、36 个已获认可的 v47 图片文件及入场/主交互/品牌源文件哈希保持一致。
- 原始全图、缩略图与底部跳转使用同一方案 ID，不创建重复方案。
- build 为发布目录；新增 v47/v48 图保留同源，已替换的旧 v46 图片退出发布包。旧方案 terracotta-atelier 的 9 张全图固定至已有 GitHub 提交，由其原图提供；缩略图仍同源。内容与 Git blob SHA 已核对（offload-verified.json）。
- 当前环境没有可用浏览器交互测试能力；未声称浏览器布局、设备性能或移动端 GPU 实测。生成图和地材遮罩已人工查看。

