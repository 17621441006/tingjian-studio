# 庭间 v17 历史与第二标签页快照

`archive/heavy/history-v17.tar.gz` 是独立归档的完整运行快照，包含历史/第二标签页以及它们引用的共享原始素材；main 不保存此重复压缩包。
为保持 main 完整离线运行，共享资源的唯一运行副本继续位于 main/dist。归档包不替代 main 的正常 build，不用于覆盖当前线上 Site。

```sh
git clone --single-branch --branch archive/history-v17 https://github.com/17621441006/tingjian-studio.git tingjian-history
cd tingjian-history
git lfs install
git lfs pull
git lfs fsck
tar -xzf archive/heavy/history-v17.tar.gz
python3 -m http.server 8000 --directory dist
```

所有超过 100 MB 的归档资产采用 Git LFS。`archive/history-v17-index.json` 记录原始文件大小、图片尺寸和 SHA-256；原图未重编码。
