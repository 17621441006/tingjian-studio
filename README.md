# 庭间 v20 · 八种独立配乐与自动播放

- 按用户批评重写上一版配乐：每首120秒，八种独立编排（爵士休闲、中国室内乐、京都庭院、古典圆舞曲、氛围电子、巴萨诺瓦、电影慢拍、弦乐抒情）。对应映射及配器见 `verification/v20/arrangements.md`。
- 采用 FluidR3 采样音色加原创打击乐，完整乐谱在 `src/music/scores.json`；采样来源和 CC BY 3.0 署名在 `dist/music/CREDITS.txt`。本轮没有采用第三方现成歌曲或旋律。
- 进入网站立即尝试播放；若浏览器要求交互，父页/工作台首次点击或按键重试。主动关闭后保持关闭。曲目使用内容哈希避免缓存旧音乐。
- 原有素材清理、暮色VR和家具实验室保持原有边界。构建、音频时长/SHA、自动播放拒绝及恢复、手动关闭和换曲状态继续检查；未声称完成真实浏览器试听。
- 重渲染需要 Python numpy/scipy、ffmpeg 和 TINGJIAN_SAMPLES 指向 FluidR3 MIDI.js 音色缓存；普通 npm build 直接使用已提交的八首MP3，无需下载音色库。

---

# 庭间 v19 · 八首空间配乐与历史素材清理

- 7 种当前设计各对应一首原创纯音乐，加《归家·灯火渐安》共 8 首。每首约 33–55 秒，独立和声、旋律与音色，电脑合成演奏，无人声、无借用录音。乐谱与可复现生成器在 `src/music/scores.json` / `scripts/compose-music.py`。
- 首次点“开启音乐”；切换风格自动换曲，同一风格内换房间不重启。播放结束按 8 首列表循环。支持上一首、下一首、手动选曲、音量和关闭。关闭后不会因换风格重新开启；音量记忆，刷新后不强制有声播放。
- 第二分类只保留家具自由试摆入口和嵌入页面。删除 139 个历史全景/高清图及旧浏览器运行文件，共 40,858,131 bytes。精确删除清单见 `verification/v19/retired-assets.json`；旧 Git 提交和已有 LFS 归档仍可恢复，没有重写仓库历史。
- 当前效果图不降分辨率。剩余 502 张原图片、13 个模型和 24 项模型依赖仍按 v17 SHA-256 校验；新增暮色 8 张全景单独校验。
- 本次减重后，暮色全景改回同源加载，部署包包含全部当前素材，无需 GitHub 图片外链。当前 dist 约 237 MiB。
- 核验：npm ci/build/check、check-assets、check-v18-vr、check-v19-music、check-v17-ui、check-v17-floors、check-v16-assets/model；部署前 prepare-hosting。
- 静态项目无受支持的浏览器预览，本轮使用真实媒体文件、播放状态和素材校验，未声称已完成浏览器试听或头显实测。

以下为历史记录；v19 的删除授权优先于早期“完整保留所有旧素材”的要求。

---

# 庭间 v18 · 暮色写实全景 VR

- 新入口：空间设计 → 暮色 → 确认全屋 → 暮色写实 VR；独立地址 `/vr/dusk/`。
- 八个空间支持拖动/触控环顾、缩放、房间跳转、原图对照和下载单文件离线 HTML。兼容设备可通过 WebXR 进入单目头显模式。
- 用户授权合理补全未展示区域。全景为生成式固定站位影像，非测量复原或自由行走模型；几何、接缝、跨房间一致性仍有偏差。阳台视向客厅的沙发颜色与客厅基准不同。后续家具修改不会自动重绘，入口会列出与基准不同的房间。
- 新全景原生 1774×887，未放大冒充高分辨率；原有 630 张图片、13 个模型和 24 项模型依赖逐字节保留。来源、提示词、尺寸与 SHA-256 见 `verification/v18/panorama-assets.json`。
- `check-assets.mjs` 继续核验 v17 的 660 个非 HTML/JS/CSS 原始文件，允许本轮代码重建；v17 原始完整清单保持不变。
- 核验：`npm ci && npm run build && npm run check`，`node scripts/check-assets.mjs`、`check-v18-vr.mjs`、`check-v17-ui.mjs`、`check-v17-floors.mjs`、`check-v16-assets.mjs`、`check-v16-model.mjs`。
- 验证覆盖素材、离线打包、应用状态与延迟加载边界；当前静态项目无受支持的浏览器预览，未做真实浏览器或头显体验验收。
- `archive/history-v17` 和其 LFS 快照保留原状。不要对 v18 手动运行旧的 `verify-and-archive-v17.yml`，它是 v17 一次性恢复流程；新增 CI 只读验证当前版本。

- 发布额外运行 `node scripts/prepare-hosting.mjs`，在忽略的 `build/` 中生成低于平台 256 MiB 的部署包。完整 `dist/` 不删减；仅线上新增八张 PNG 从 GitHub 固定提交加载，保留原字节及跨域支持。原有图片与模型全部仍由站点直接提供。网络必须能访问 raw.githubusercontent.com，离线 HTML 下载完成后不再依赖网络。

---

# 庭间 · 空间设计工作室

用于达安锦园 75.1㎡住宅的设计比较与选材网站。当前版本 v17（2026-09-25）。

## 运行

需要 Node.js 22.12+。GitHub main 已恢复 v17 完整 `dist/`，可直接克隆、构建、检查和离线运行。692 个部署文件共 254.46 MiB，630 张图片、13 个模型及 24 项模型外部依赖均有原始 SHA-256 校验。当前图片不重压缩、不降分辨率。

main 保留所有运行时必需资源（包括历史页、第二标签页和家具实验室引用的共享图片/模型），不存储重复压缩包。重复的历史运行快照只存放于 `archive/history-v17` 分支的 `archive/heavy/`，超过 100 MB 的快照使用 Git LFS。该快照不计入 main 日常克隆所需的 LFS 下载。

```sh
npm ci
npm run build
npm run check
node scripts/check-assets.mjs
python3 -m http.server 8000 --directory dist
```

访问 `http://localhost:8000`。页面使用绝对资源路径，请用 HTTP 服务运行；直接双击 HTML 不能完整加载模块。

## 当前功能

- 七套完整风格，桌面端左侧竖排；中间原尺寸效果图；右侧选材、增减单品与房间工具。
- 全屏看图、原图 100%、图片下载；浏览器拒绝全屏时仍打开大图弹窗。
- 确定风格 → 布局与光线 → 单品与清单 → 全屋效果。八个空间可分别或一键确认，改动会使相关确认与旧全屋结果失效。
- 10 款官方品牌地面候选，5 木 / 5 瓷质与陶瓷地面。悬停查看官方样板，选中保留到房间清单、采购链接和全屋三维的近似配色。客厅与餐厅共用地面。实际规格、表面和图片出处见 `src/legacy/floor-catalog.json` 与 `dist/tour/floor-catalog/credits.json`。
- 精选预制家具组合、绿色方案可移除/加回软装，以及八空间三维与对应效果图。历史方案与实验室仍单独保留。

品牌样板来自官网，不是实测 PBR 材质。新品牌选材不会假装已在原照片中精准渲染；效果图和官方样板分别标注。三维户型为现有资料推演，尺寸未经现场测量。选材和确认保存在当前页面会话，尚未接入账户存档。

## 代码结构

- `src/tour`：外层导航与历史漫游。
- `src/legacy`：当前设计流程、选材、固定视角图片和三维全屋。
- `src/history`：保留的早期工作区，不与当前选择混用。
- `src/app.mjs`：独立家具实验室。
- `dist`：静态部署目录，包含预制图片、真实模型与材质。构建脚本仅重建代码，不删除这些资产。
- `scripts`：构建和验证；`verification`：版本记录与检查结果。

```sh
npm run build
npm run check
node scripts/check-v17-ui.mjs
node scripts/check-v17-floors.mjs
node scripts/check-v16-model.mjs
node scripts/check-v16-assets.mjs
node scripts/check-assets.mjs
```

验证包含生产事件处理、选材保留、异步加载、全屋确认、真实 Three.js 几何与材质数据、原始资产保留。此轮没有浏览器像素级或设备帧率测试。

## 素材说明

住宅设计项目；仓库沿用本次操作前已公开的访问状态。品牌图片版权归品牌及相关权利人，素材来源和已有许可记录分别保存在各 `credits.json` 与 `manifest.json`；没有为第三方品牌图授予开源许可。

---

<details><summary>此前版本的开发记录</summary>

# Tingjian v13 · from exact selections to a whole-home effect book / 2026-09-25

The main workspace is now **确定风格 → 布局与光线 → 单品与清单 → 全屋效果**.

- Fixes the reported cognac-to-red sofa regression. Style confirmation copies the displayed scene and pieces; no wine fallback. Every room has its own committed state. Selected palettes retain their exact authored image. Failed image requests preserve the current scene; the latest request wins.
- Adds 2 compact sofa concepts inspired by the supplied leather-shell/fabric-cushion reference and restrained metal frames. Total living catalog: 5 sofas, 2 tables and 3 floors, with 16 explicitly supported combinations. Unsupported combinations stay disabled with an explanation; they never replace another chosen item.
- Master catalog: 3 bed frames × 3 bedding sets × 2 window conditions = 18 authored choices. Clear glazing uses uninterrupted main glass and a narrow side vent; no eye-level horizontal divider. Utility balcony remains openable. Alternative bed layouts retain their own clearly scoped assets.
- Adds 14 cognac living layout/light images, preserving existing wine images for deliberate selection. There are five light conditions across three layouts for cognac/wine with the supported glass table and stone-floor baseline.
- Adds clear-glazing balcony, master and storage-master concepts, plus eight glazing/bed/bedding combinations. These are unmeasured visual concepts, not structural or window fabrication specifications.
- Official Camerich candidate cards include EASYTIME C01F0902 (190×97×62cm) and MODA C01G0203 (216×92×73cm). ELAN's two 100cm end modules are presented as a nominal 200cm **planning inference**, not a verified complete-sofa size. Product and official dimension-diagram links are retained. Authored concept furniture is not sold as an exact branded product.
- Step 4 assembles the actual chosen scenes into an eight-space overview, single-room original-size view and self-contained downloadable HTML effect book. Dining shares the chosen living/dining view rather than showing the stale reverse-view sofa or floor. Applied scene items and purchase candidates are separate. Edits mark the prior book stale and require an explicit refresh; partial failures never replace a complete book.
- This is an authored-image selection/assembly workflow, not an arbitrary shopping-list-to-render backend. Cross-room material joins/lighting and measured geometry are not unified. No fake rendering timer or generated wait estimate is used: the progress indicator counts actual loaded image resources.
- The existing **走近看空间** study is moved into Step 4 behind an explicit expand control. It stays unloaded on the first three steps and continues to represent the retained original three material studies, not the newly selected scene pieces. The furniture laboratory is unchanged.
- 41 new native 1536×1024 images, quality-95 JPEG/4:4:4, separate 480×320 thumbnails. No upscaling or filter-only relighting. Exact prompts, source chains, output hashes and visual QA are in `verification/v13/prompts/` and `verification/v13/image-manifest.json`.

## Current verification

`npm run build`, `npm run check`, `node scripts/check-trial-ui.mjs`, `node scripts/check-v13-assets.mjs`.

Production DOM-handler tests cover confirmation, asynchronous request races, room-specific choices, failure/retry, candidate isolation, immutable/stale effect books and model deferral. Asset tests inspect all advertised combinations and run the actual exporter with local file-fetch and DOM boundaries. Native outputs were visually reviewed. This managed static Site has no supported live browser preview; no browser screenshot, WebGL visual fidelity or user-device frame-rate claim is made.

---

## Prior v12 notes (historical)

# Tingjian · style → layout/light → shortlist / 2026-09-25

The main workspace now guides the user through **确定风格 → 布局与光线 → 单品与清单**. Browsing does not silently confirm a style. Confirmation loads an available layout before entering the next step.

- All four whole-home styles and their eight room views remain. The new layout/light trial is scoped to **暮色私邸**. Other styles explicitly retain only their existing layouts.
- Living room: 3 layouts × 5 lighting states. Original viewing layout, reversed sofa/TV with round dining table, and a drawer daybed with dining banquette. Daylight with lamps off, warm daytime lamps, cool-white daytime lamps, warm evening lamps, and neutral evening lamps each have an authored image.
- Master: original position, bed/wardrobe exchange, window bench with pull-out worktop. Balcony: original tea corner and a full-height glazing / fold-away tea ledge concept. These areas use one daytime warm-light view each.
- The 17 new images are native 1536×1024; production JPEGs retain that resolution at quality 94 / 4:4:4, with separate 480×320 thumbnails. They total 8.6 MB. Selection loads only the required full image; no new 3D renderer or simulated render timer is involved.
- Layout and lighting choices compose even while loading. Latest selection wins, failure retains the prior frame and retries the exact failed choice. Each room's committed choice remains available across steps during the page session.
- Step 3 shows the selected layout, suggested item types, existing verified brand reference links, and a per-style candidate shortlist. The shortlist is explicitly session-only. Original-layout single-item comparisons are retained in a separate subview; they do **not** claim to regenerate or combine with the new layouts.
- Window changes, cabinetry and clearances are unmeasured concepts. The glazing condition is shown beside the image and expanded in its verification notes. Lighting labels describe intended appearance, not measured CCT, illuminance or an optical simulation. Image generation can introduce small local detail drift.

## Current verification

`npm run build`, `npm run check`, `node scripts/check-trial-ui.mjs`, and `node scripts/check-layout-assets.mjs` cover assets and production DOM handlers, sequential confirmation, all 20 Dusk layout/light views, per-room memory, shortlist filters, original-item subview, failures and late-load races. Prior 32 whole-home views, 18 palettes, 9 item combinations and the retained editor still pass.

Selected generated images were inspected by the asset agents and integration contact sheets reviewed. Native dimensions, encoding, prompts and provenance are in `verification/v12/`. This managed environment has no supported browser preview for plain static Sites; no browser screenshot, visual layout test or device frame-rate claim is made.

---

## Prior fixed-camera selections (v11)

The default workspace now opens **暮色私邸 → 单品选配**. These are authored, pre-rendered image combinations, not an arbitrary live AI editing service or a 3D viewer.

- Living room: three sofas × two coffee tables, six combinations. Each selection modifies only its state key; rapid edits in different categories combine before image commit. The chosen sofa and table persist while visiting other rooms and designs.
- Main bedroom: three bed designs, independent of the living-room choices. Fixed-camera composition is retained; generative microtexture and small local detail variations are disclosed next to the controls.
- Visible object labels open the matching inline category. Hover previews, native-size dialog and image download use the selected combination. Loading reports actual image loading, never a simulated render progress percentage. A failed image retains the prior view and retries the exact selection.
- The previous whole-room palettes, including originals, remain under **整套对照**. The rejected blue palette is not the default. Prior model workspaces remain secondary links.
- **石庭隐居** (Aman Kyoto inspiration) and **藏品公馆** (Rosewood Hong Kong inspiration) each have eight original room concepts. Official inspiration references appear on the page. Product links are candidate references, not exact render products or hotel endorsements.
- 25 generated images, each natively 1536×1024. Site copies are quality-94 JPEGs at the same resolution; 480×320 thumbnails are separate. No output has been upscaled. The full-size image set totals approximately 12.8 MB and is loaded by selection, not as a WebGL scene.

## Current verification

`npm run build`, `npm run check`, and `node scripts/check-trial-ui.mjs` cover production handlers, all nine object combinations, 32 whole-home room views, the previous 18 palettes, error recovery, racing selections and the retained editor. Asset manifests and visual reviews are in `verification/v11/`.

All 25 source images and integration contact sheets were visually inspected. This managed environment does not provide a supported browser preview for plain static Sites; no browser screenshot or device performance result is claimed. No additional renderer is loaded for the new selections.

---

## Earlier implementation notes (historical)

# Tingjian · v5 / 2026-09-24

Updated the existing owner-private Site, preserving the inline catalog and original image/style archive.

## New work
- Imports both user-supplied OBJ rugs as GLBs, retaining UVs and source textures. The zero-thickness kilim receives an estimated 6 mm backing; its top is separated to avoid z-fighting. The medallion rug retains its original thickness ratio.
- Adds an explicitly labelled image-based rug reconstruction from the user's rust/cream shop reference. The hidden pattern and 8 mm thickness are inferred, not manufacturer geometry.
- Re-traces table/sofa silhouettes and the full visible floor, including the space between dining chairs. Fine green branch alpha is retained separately from the old floor. Replacement floors use a low-frequency projected light field and new model shadows.
- Four independent editing slots: table, sofa, rug, floor. The original full-house study is also organised into named room groups and component objects; it is a separate representation.
- Adds event-driven living/dining walking, with 6 floor nodes, aisle routing, ray-picked object editing, continuous camera-position interpolation and mouse/keyboard look. Walking never changes the current yaw, pitch or field of view.
- Whole-home panorama arrivals now preserve world heading across local 90/180-degree panorama offsets.
- WebGL initializes only on edits or entering walking; dragging retains model assets, uses a bounded drawing resolution and frozen shadows, then restores resolution on idle. Exiting walking releases the renderer/context and re-entry uses a fresh canvas.

## Product boundaries
The front design image is 1536×1024. It is not a scan. The 1774×887 surround is generated and has limited local detail, not 4K or 8K. The enclosure and unseen sides are approximate. Original photo furniture stays photographic in fixed views; in walking mode originals use reconstructed/substitute meshes. User-selected GLBs remain the same objects as the camera moves. The other rooms' existing panorama tour does not yet inherit the living-room furniture configuration. There is no background rendering service, manufacturer-verified dimensional model or faithful general single-photo-to-3D service.

## Verification
- `npm run build` and `npm run check`.
- `node scripts/check-room-trial.mjs`: actual Three GLTFLoader/UV material dependencies, dimensions and source resolution.
- `node scripts/check-trial-ui.mjs`: production UI handlers with DOM/render doubles, including walking lifecycle, stale jobs, restoration and original style gallery.
- `node scripts/check-walk.mjs`: clear routes, position-only movement and all 64 full-home world-heading transitions.
- `node scripts/check-tour.mjs`: existing home/tour isolation and image navigation.
- Native EGL model thumbnails and floor/table mask renders reviewed. This is not browser screenshot QA. The managed environment has no supported preview for this static Site; browser/GPU appearance and user-device frame rate were not measured.

---

## Prior implementation notes (v4, retained for provenance)

# 庭间 · 空间实验室

高清设计浏览首页，保留四风格、八节点环视与原有三套方案；家具试摆原型独立放在后面的入口。

## 使用

- 家具实验室：选择左侧家具；右侧修改宽度、旋转及 X/Z 位置；“摆放”自动切到俯视，可直接拖动模型。
- “人在屋内”可拖动环视，并切换玄关、客厅、阳台三个站位；“环绕观察”和“俯视摆放”可拖动及滚轮调整。
- “显示尺寸”显示模型宽深高；输入实物宽度为等比校准，深高仍应核实。
- “保存方案”只保存于当前浏览器；导出 JSON 可备份或导入另一浏览器。
- `/` 与 `/tour/` 默认进入高清看屋，可用相邻空间按钮、户型图或房间卡片移动。点击“360° 环视”才初始化全景渲染；此模式仍可使用地面热点。
- 家具实验室位于 `/lab/`，首页不导入 Three.js、模型或实验室样式；实验室内部的渲染、编辑与存档代码保持不变。
- 原有三套方案只在点开时载入，切回高清或环视时卸载 iframe，避免隐藏页面继续运行。
- 高清图保留原始 1586 × 992 像素，不放大超过 100%。现有整圈全景为 1774 × 887，切取一个方向的实际像素有限；当前没有宣称提升底图分辨率。

## 木与光：照片侧栏与局部漫游（v4）

进入“原有三套方案 → 住进木与光”。原来的写实效果图旁直接显示分类素材、尺寸、右键操作，无需滚到三维图下方。

- 品类：桌几、沙发、地毯、地板。保留原图物件，接入用户黑漆茶几/木框沙发，另有 Poly Haven 的两款沙发、一款白石圆茶几、两种织物和两种地板材质。新增来源及许可见 `dist/tour/catalog-assets/credits.json`（CC0）。素材缩略图为本地模型渲染，没有使用其受限网站示例图。
- 点击卡片或拖到对应区域自动出图。右键画面（手机长按）选择替换/删除/恢复；地面为建筑构件，删除操作恢复原地面。卡片悬停放大。尺寸与角度变化也会重新出图，原图物件不提供伪精确尺寸。
- 提供原视角、左移、右移、走近四个客厅局部位置。真实新增模型共用同一世界坐标、尺寸和状态；切换位置后按新相机重新计算。原房间由单张概念图作近似摄影投影；原家具仍是照片轮廓和深度代理，未见背面无法恢复。这是局部试验，不是全屋扫描或完整自由漫游。
- 背景清理使用内置 imagegen 一次编辑制作，完整提示词见 `src/legacy/room-clean-prompt.txt`，图在 `dist/tour/trial-assets/room-clean-v4.png`（1536×1024）。可能存在少量背景纹理漂移。原茶几预制写实样张保留于侧栏说明中，明确区分于按参数生成的三维效果。
- 一个时刻只运行一个出图任务；每次使用真实 GLB/glTF、原贴图和凹凸/粗糙度贴图，以 1536×1024 输出 PNG，再释放 WebGL 上下文。没有持续动画循环；首页不下载这些模型。进度条显示实际资源计数和阶段，未知耗时阶段用不确定进度，不伪造百分比。快速操作只提交最后选择；已出图视角在当前页面有限缓存。
- 当前用单图估计透视、光照和原物件深度；不具备完整场景全局光照、全反射或经过测量的房屋几何。尺寸按实际网格比例计算，但摆放数值尚未核对厂家规格和房屋实测。
- 精细整屋后台渲染未连接，不能承诺等待时间。可以保存效果图、导出当前布置和所显示结果参数；未新增服务器或用户模型上传。

`node scripts/check-trial.mjs` 验证模型解析、依赖、尺寸、相机和资源；`node scripts/check-trial-ui.mjs` 执行实际事件处理器，覆盖分类、悬停、拖放、右键、自动渲染、切换视角保留家具、对比、失败重试、缓存与异步结果竞争。DOM 和渲染边界使用测试替身，未做浏览器/GPU 视觉或帧率实测；不能把模型缩略图当作浏览器截图。

## 模型与比例

四件家具均取自用户上传的 OBJ/MTL 与贴图。三份 FurniMesh 文件原坐标约归一到 1，没有厂家单位依据；木椅的原坐标也没有可信单位说明。默认宽度是方案标定：沙发 210cm、单椅 78cm、茶几 112cm、木椅 46cm。全尺寸由原始模型比例算出，不是厂家规格。

木椅移除了原 OBJ 中独立的 Studio 拍摄背景几何，并恢复 Legs / Cover 分别对应的原始两张纹理。其余模型几何和 UV 未简化。纹理从 4096px 转为 2048px JPEG，保留三维网格细节；GLB 内嵌纹理。

房间依据前版户型坐标搭建，客餐厅与景观阳台边界保留，净高按 2.65m 估算，非测绘图。75.10㎡是建筑面积。门洞、窗框、背景街景、木作和软装为概念建模。材质图集沿用此前方案的生成素材；家具粗糙度为渲染假设。页面不声称可直接用于厂家下单或施工。

## 开发

`npm ci` → `npm run build` → `npm run check` → `node scripts/check-tour.mjs` → `node scripts/check-tour.mjs --no-webgl`。

- `src/`：三维房间、家具状态、网页、交互源代码。
- `src/tour/`：看屋与漫游源代码；`assets-manifest.json` 记录原图的绝对 URL。构建自动更新首页和 `/tour/` 页面；原场景资产已完整保存在 `dist/tour/assets`。
- `dist/`：可直接发布的完整静态网站，包括所有模型、贴图、漫游和原版三套方案。
- `scripts/convert_models.py`：使用 trimesh/Pillow 转换本地原模型。将上传模型目录作为参数。
- `scripts/build-tour.mjs /path/to/daan-vr`：最初导入离线素材的工具，日常修改使用 `npm run build`。

## 验证范围

模型通过实际 Three.js GLTFLoader 解析，几何边界与页面尺寸一致；默认布局、重叠提示、越界提示、非法输入、保存导入状态、32 全景和 32 高清资源已核验。房间与家具同源几何做了离线渲染检查，不能视为浏览器截图。

当前环境的静态项目没有可用的受支持浏览器预览，因此未完成浏览器鼠标/触摸和 WebMCP 实际运行测试。WebMCP 采用能力检测，普通浏览器无需此接口。手机性能取决于设备；第一版四件家具合计约 87 万三角面。

本次回归检查使用 DOM、图片与 WebGL 测试替身执行实际构建出的事件处理器，覆盖高清默认、32 组切换、原图缩放、路径跳转、快速点击竞争、环视延迟初始化、无持续帧循环、原有方案卸载与无 WebGL 回退。它们验证加载与状态行为，不代表真实设备帧率或浏览器视觉测试。

</details>
