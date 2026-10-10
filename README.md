# 答辩网页 PPT Skill

面向大学论文、设计和项目答辩的 Codex 技能。它提供一套可复用的静态网页制作台：学生输入题目与材料，选择视觉风格，生成并编辑 16:9 网页幻灯片。

## 能做什么

- 从带标题的材料生成答辩页面，缺少结论时留下明确的待补充项。
- 在浏览器本地导入 TXT、Markdown、DOCX 和文本型 PDF。
- 切换四种风格，编辑、增删、调换页面，全屏演示。
- 导出可离线打开的 HTML、打印为 PDF，并用 JSON 备份或恢复编辑项目。
- 提示可能溢出的页面，避免演示时文字被裁切。

## 使用

在 Codex 中请求安装此仓库 `skills/defense-web-ppt` 路径下的技能。也可直接克隆仓库后运行：

```bash
node skills/defense-web-ppt/scripts/scaffold.mjs /absolute/path/to/empty-project
```

生成的 `dist/index.html` 可由静态服务器托管。技能模板不包含任何 Sites 项目 ID 或访问凭证。

## 边界与隐私

这是规则分段和视觉排版工具，不是 AI 语义生成器。DOCX/PDF 只提取文字；扫描版 PDF 需先 OCR，图片、图表和公式需人工补充。材料在当前浏览器处理；浏览器草稿和下载的 JSON 备份可能包含论文内容，请自行管理。

本仓库自有代码采用 MIT 许可。`assets/starter/dist/vendor/` 内第三方解析器保留各自许可文件：Mammoth 与 PDF.js。
