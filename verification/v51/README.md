# v51 · 驿金行邸与花影餐柜

本轮按用户要求替换浅蓝方案，并补足花影餐桌前的收纳墙。工作台保持 25 套，首页十套精选顺序、布局、加载与动效保持原样，花影仍为第 5 位。

## 驿金行邸 / VOYAGE ATELIER

第 25 套展示改为「驿金行邸」。内部 ID `azure-silence` 保留，以兼容已有深链接、选择与模型状态；当前图片全部指向 `dist/designs-v51/schemes/voyage-atelier/`，旧浅蓝图片保留在源码与 v50 历史，不再进入本轮发布包。

参考 Louis Vuitton 的旅行箱工艺、棕金花菱节奏：干邑皮革、奶油浅石、巧克力木色、细黄铜、箱式收纳与局部原创四瓣花／菱形纹。八个空间、九张视角，厨房和卫浴通过硬质可擦表面表达图案。图像为原创住宅概念意向，不代表品牌成品、联名或官方设计。

研究来源：
- [Louis Vuitton — The Art of the Trunk](https://en.louisvuitton.com/eng-nl/stories/louis-vuitton-trunks)：木框、皮革／帆布、金属包角与锁扣工艺。
- [ATIM — Evolution +39](https://www.atimspa.com/en/prodotto/evolution-39/)：浅柜抽拉桌与落地桥形支撑的构造参考。厂家产品有自己的安装和负载条件；本概念图不继承这些认证或参数。

## 花影餐柜

本次新增位置是餐桌正前方／客厅远端墙面。奶油通顶浅柜以花叶浮雕、细藤编嵌面与蜜色框组合，中部茶水格照明，下方容纳抽拉桌。展开图含可见落地桥形支撑；收起图同机位对照，桌面与支撑归入柜内，两椅停放两侧。餐柜有效深度、开口、展开长度、椅后净空、五金及固定方式仍需实测深化。

精选页与全套工作台都有「展开用餐 / 收起留白」。全屏、下载和全屋效果册包含对应视角；隐藏状态图只在选择后请求。客厅两个方向同步改成矩形木餐桌，厨房保留 v50 整面花釉，其他房间保留 v49。

## 资产与可复用提示词

- [generation-prompts.json](generation-prompts.json)：13 次生成的完整原文、参考图及选定输出。
- [assets.json](assets.json)：27 个发布用 WebP 的尺寸、字节数与 SHA-256。
- `dist/designs-v51/schemes/voyage-atelier/`：9 张主图与 9 张 480px 预览。
- `dist/designs-v51/schemes/silver-retreat/`：客厅双向、餐厅展开、餐厅收起；共 8 个文件。
- `dist/designs-v51/featured/flora-768.webp`：更新后的花影首屏预览。
- 主图 1536×1024，预览 480×320；图片经过生成工具编辑，Pillow 仅做等比例缩放和 WebP 导出。

## 回退

`rollback/` 保留 v50 花影内容模块与 v50 新方案模块；v49/v50 旧图片未覆盖。恢复旧模块、对应路由和展示文案，再按需要移除新餐桌状态入口，并重建。第 23 套「花影绮居 · 初版」保留其 v48 原图，不参与本轮修改。不要直接将含旧文件的目录增量覆盖发布目录，托管目录 `out/` 由 `prepare-hosting.mjs` 原子重建；`.openai/hosting.json` 指向该目录，以避开旧 `build/` 目录中反复恢复的历史程序文件。

## 验证

- `npm run build`、`npm run check`。
- `node scripts/check-v39-privacy.mjs`：25 套／50 个模型状态与现有资产隔离。
- `node scripts/check-v51-voyage.mjs`：23 套非目标方案、9 套其他精选与首页品牌／动效源文件哈希一致；历史图片未覆盖；27 个新文件一致。
- 真实共享视角控制器：按需加载、展开／收起、下载名称恢复、加载失败保留原图、快速反向操作与换房间时的异步竞争。
- `node scripts/check-v40-collection.mjs`、`node scripts/check-v41-home.mjs`：页面链接、房间画廊、灯光与材质交互、首页入场及滑动行为。
- 浏览器结果另见 `browser-qa.json`。没有声称测量手机 GPU 或现场施工适配。
