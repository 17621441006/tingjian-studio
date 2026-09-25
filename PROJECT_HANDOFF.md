# 庭间 v17 · 项目续接记录

更新时间：2026-09-26（上海时间）

## 1. 当前结论

- 线上“庭间 · 空间实验室”站点仍处于 active 状态。
- Site project ID：`appgprj_6ab3dabe2fc081919e377bde3d75c050`
- Site slug：`tingjian-space-lab`
- 线上地址：`https://tingjian-space-lab.jackchen911006.chatgpt.site`
- Library 侧当前记录：source version 16，projection revision 31。
- GitHub 私有仓库：`17621441006/tingjian-studio`
- 默认分支：`main`
- v17 源码同步提交：`dc3619d76b045eab7d34679da28aa6e058ef2006`
- 提交说明：`庭间 v17：宽屏设计工作台、全屏看图与十款品牌地面选材`
- 该提交包含可编辑源码、构建/检查脚本与验证记录，但**不包含 dist 大型运行素材**。
- 检查时 GitHub Releases 为空，因此之前计划的完整下载包 `tingjian-studio-v17.zip` 并未真正上传成功。

## 2. GitHub 已有核心资料

当前 main 共 146 个 tree entry，主要包括：

- `src/`：108 项，可编辑业务源码。
- `scripts/`：28 项，构建、验证、资源检查脚本。
- `verification/`：v17 的 UI / floors 检查结果。
- `README.md`、`package.json`、`package-lock.json`、`.openai/`。
- 关键数据文件包括：
  - `src/legacy/floor-catalog.json`：5 款木地板 + 5 款瓷砖/陶瓷大板候选。
  - `src/tour/assets-manifest.json`：四套旧全屋风格 × 八空间的 pano/poster/thumb/hd 路径。
  - `src/legacy/home-image-provenance.json`、`home-variant-provenance.json`：生成图提示词、来源、尺寸、SHA 等追溯记录。

## 3. v17 已完成的最后一轮需求

- 桌面端把风格切换改为左侧竖排，减少左右无效留白。
- 右侧工具区向右收，主效果图获得更大展示面积。
- 主图上增加全屏看图 / 原图 100%。
- 地面选材新增 10 款官方品牌候选：
  - 木地板：Kährs、BOEN、Listone Giordano、Quick-Step、HARO。
  - 瓷砖/陶瓷：Marazzi、Atlas Concorde、Florim、Porcelanosa、Laminam。
- 原有七套方案、历史区、家具实验室继续保留。
- 用户原消息中“5 ~~种”之类横线只是富文本误显示，不代表删除要求。

## 4. 当前唯一明确未完成项

**完整可离线运行的资产包没有成功进入 GitHub。**

缺口主要是 `dist/` 下的大型二进制资源，包括历史/当前效果图、缩略图、全景图、材质图、GLB/glTF 模型等。源码中的构建脚本不会自动从网络重新下载这些缺失资产。

因此：
1. 当前 GitHub 可以用于继续编辑源码、查看产品逻辑和版本记录。
2. 当前 GitHub **不能单独从零还原线上完整站点**。
3. 不要用当前仓库直接覆盖线上 Site，否则会丢失现有大型资源。

## 5. 已确认可用于恢复的资料

- Library 中仍保留早期完整单文件 `daan-vr-tour.html`（约 62 MB），其内嵌 128 个 data:image 资源，对应四套旧全屋风格的 pano/poster/thumb/hd，可作为旧全景资产恢复源。
- Library 仍保留 `daan-three-spaces.html` 以及 2026-09-24~09-25 的大量用户上传/生成图片和模型素材。
- 当前线上 Site 本身仍 active，是优先恢复完整 `dist` 的权威来源；不要用旧单文件版本反向覆盖它。

## 6. 新窗口续接时的操作顺序

1. 先读取本文件与 GitHub main，不要重做已经完成的 v17 UI。
2. 确认线上 Site 仍 active，并优先从 Site/Work 的原项目工作区导出当前完整源码与 `dist`。
3. 生成完整归档，例如 `tingjian-studio-v17-full.zip`，内容至少包括：
   - `src/`
   - `scripts/`
   - `verification/`
   - `dist/`
   - package 文件和 README
4. 对归档做文件数、总大小、关键路径、SHA 校验。
5. 再上传 GitHub。若 Releases 网页上传继续失败，不要反复卡死在同一步；可改用分卷归档或在允许大文件的持久存储中保存，并在 GitHub README 留明确下载入口。
6. 上传完成后，最后核对 GitHub 与线上 Site 的版本标识，确保没有把旧资源覆盖到 v17。

## 7. 禁止误操作

- 不要把 `blockcraft-academy`（Minecraft 项目）与本仓库混用。
- 不要从旧 GitHub 源码覆盖当前线上 Site。
- 不要把仅有源码的仓库描述成“完整离线包已上传”。
- 不要重新压缩/降清主效果图来“凑上传体积”；v17 的主效果图应保留原分辨率。


## 8. 2026-09-26 02:10 后续处理

- GitHub 仓库当前已确认是 **public**。
- 已创建历史归档分支：`archive/history-v17`，并加入 `HISTORY_ARCHIVE.md` 说明。
- main 已配置 `.gitattributes`：`archive/heavy/**` 预留 Git LFS；当前运行站点资源仍计划使用普通 Git，保证 clone 后可直接还原。
- 已建立 GitHub Actions 的 live-dist 恢复流程，并在仓库公开后重新触发；截至本记录更新时，main 仍未出现 `dist/` 提交，因此不能把这一步写成“已完成”。
- 当前 GitHub App 连接能够读写仓库源码、分支与普通 Git 对象，但不提供本地/Library 二进制文件直传接口，也不能把 ChatGPT Site projection 直接 materialize 成文件。这是当前完整 `dist/` 备份的实际阻塞点。
- 后续完成标准：main 中必须真实出现 `dist/`；执行 `npm run check` 与 v17/v16 资产检查通过；单文件 <100 MiB；主分支总资源 <900 MiB；历史大素材仅进入 archive 分支 / LFS，不得用旧素材覆盖当前线上站点。
