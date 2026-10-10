---
name: defense-web-ppt
description: Build or improve a Chinese university thesis or project defense website that turns a student's topic and source material into editable 16:9 browser slides. Use for web PPT creation, presentation flow, and offline HTML delivery; use a PPTX skill for native PowerPoint files.
---

# 答辩网页 PPT

把学生提供的方向、材料和风格偏好整理成可核对、可编辑、可演示的网页幻灯片。`assets/starter/dist/` 是可离线运行的静态制作台，不依赖模型服务。新建项目时可运行 `node scripts/scaffold.mjs <绝对输出目录>`；已有项目应在原有源码上修改，保留其站点身份和数据。

## 内容判断

- 先确认答辩类型、听众、预计时长、已有证据和交付格式。缺失信息可用明确的待补充项推进，不能编造数据、实验结果、引文或人物。
- 以研究问题和证据组织讲述顺序。常见页面包括封面、问题、方法、发现、贡献、局限、结论和问答；按实际材料增减，不强迫每份答辩套用固定页数。
- 区分“用户材料中明确写出”和“为演示结构补的占位”。生成后逐页让用户核对原始资料，尤其是数据、结论、图表和参考文献。
- 对文字过密的页面拆页或改写为简短要点；不要为了塞进一页而缩到难读。

## 使用模板

1. 复制 starter，替换示例题目、品牌文案、配色和页面内容。`dist/vendor/` 含本地 DOCX/PDF 文字解析器及其原许可文件；保留这些许可文件。
2. 模板可导入 TXT、Markdown、DOCX 和文本型 PDF。Word/PDF 导入只提取文字；扫描版 PDF 需另做 OCR，图片、图表和公式需人工处理。输入在浏览器本地解析并保存在 localStorage；JSON 备份会包含材料，提醒用户妥善保管。
3. 模板按标题和句子分段，不具备 AI 语义归纳能力。如果用户要求 AI 提纲、自动引用或事实核查，需要另行设计服务、凭证、成本和数据处理方式，不要把规则分段称为 AI 生成。
4. 需要托管时遵循可用的 Sites 工作流。不要把现有 `.openai/hosting.json`、站点 ID、仓库凭证、用户论文或测试下载文件放进通用技能模板。改变现有站点的公开范围前，确认用户的分享意图。

## 交付自检

- 用一份有标题、有结论的样例和一份缺少结论的样例检查页面结构与待补充提示。
- 在桌面和手机宽度检查文字溢出、按钮可用性、键盘翻页与演示模式。
- 验证 TXT/Markdown、DOCX、文本型 PDF 的导入；扫描 PDF 应给出明确提示。
- 实际导出并离线打开 HTML，检查备份 JSON 可重新导入；打印 PDF 前检查分页和字体。
- 检查页面没有外部脚本、示例材料没有被误当作真实研究、部署地址和访问权限与用户要求一致。
