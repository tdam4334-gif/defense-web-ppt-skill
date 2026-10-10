(() => {
  "use strict";

  const accountId = document.getElementById("authContext")?.dataset.userId;
  const STORAGE_KEY = accountId ? `defense-studio-draft-v2:${accountId}` : "defense-studio-draft-v1";
  const $ = (id) => document.getElementById(id);
  const form = $("projectForm");
  const sampleMaterials = `# 研究背景
校园公共空间在白天和夜间承担不同的活动需求。
现有空间评价往往更关注设施数量，较少讨论夜间的实际使用体验。

# 研究问题
哪些环境因素会影响学生在夜间使用公共空间？
不同活动对照明、可达性和停留设施有什么要求？

# 研究方法
梳理相关文献与校园空间现状。
通过实地观察和访谈收集使用感受。
对典型场所进行对比分析。

# 设计建议
为不同活动设置有层次的照明。
优化主要步行路线和入口识别。
增加适合短暂停留与小组交流的设施。

# 结论与展望
建议以实际使用行为检验空间改造效果。
后续可补充更长时段和更多人群的观察。`;
  const sampleSlides = [
    { type: "cover", kicker: "GRADUATION DEFENSE / DEMO", title: "校园公共空间的夜间使用研究", body: ["从真实使用体验出发，探讨校园夜间公共空间的设计方向。"] },
    { type: "agenda", kicker: "CONTENTS / DEMO", title: "今天，我们讨论什么？", body: ["研究背景", "研究问题", "研究方法", "设计建议", "结论与展望"] },
    { type: "content", kicker: "CONTEXT / 01", title: "研究背景", body: ["校园公共空间在白天和夜间承担不同的活动需求。", "现有空间评价往往更关注设施数量，较少讨论夜间的实际使用体验。"] },
    { type: "content", kicker: "METHOD / 02", title: "研究方法", body: ["梳理相关文献与校园空间现状。", "通过实地观察和访谈收集使用感受。", "对典型场所进行对比分析。"] },
    { type: "content", kicker: "PROPOSAL / 03", title: "设计建议", body: ["为不同活动设置有层次的照明。", "优化主要步行路线和入口识别。", "增加适合短暂停留与小组交流的设施。"] },
    { type: "qa", kicker: "THANK YOU / DEMO", title: "感谢聆听", body: ["欢迎提问与交流"] }
  ];

  const state = { style: "editorial", slides: structuredClone(sampleSlides), current: 0, title: "校园公共空间的夜间使用研究", presenter: "示例演示", institution: "", demo: true };

  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
  }

  function toast(message) {
    const el = $("toast");
    el.textContent = message;
    el.classList.add("show");
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => el.classList.remove("show"), 3200);
  }

  function formData() {
    return {
      projectTitle: $("projectTitle").value,
      direction: $("direction").value,
      presenter: $("presenter").value,
      institution: $("institution").value,
      materials: $("materials").value
    };
  }

  function saveDraft() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...state, fields: formData() }));
      $("saveStatus").textContent = "已保存在本机";
    } catch {
      $("saveStatus").textContent = "本机保存不可用";
    }
  }

  function applySaved(saved) {
      if (!saved || !Array.isArray(saved.slides) || !saved.slides.length || saved.slides.length > 200) throw new Error("无效的项目文件");
      const nextStyle = ["editorial", "ink", "tech", "warm"].includes(saved.style) ? saved.style : "editorial";
      const nextSlides = saved.slides.filter((slide) => slide && typeof slide.title === "string" && Array.isArray(slide.body)).map((slide) => ({ type: ["cover", "agenda", "content", "qa"].includes(slide.type) ? slide.type : "content", kicker: String(slide.kicker || "").slice(0, 120), title: String(slide.title).slice(0, 200), body: slide.body.slice(0, 30).map((item) => String(item).slice(0, 3000)) }));
      if (!nextSlides.length) throw new Error("项目文件没有有效页面");
      state.style = nextStyle;
      state.slides = nextSlides;
      state.current = Math.min(Math.max(Number(saved.current) || 0, 0), state.slides.length - 1);
      state.title = String(saved.title || "");
      state.presenter = String(saved.presenter || "");
      state.institution = String(saved.institution || "");
      state.demo = Boolean(saved.demo);
      if (saved.fields) for (const key of ["projectTitle", "direction", "presenter", "institution", "materials"]) if (typeof saved.fields[key] === "string") $(key).value = saved.fields[key].slice(0, 500000);
      document.querySelector(`input[name="style"][value="${state.style}"]`).checked = true;
      updateStyleSelection();
  }

  function restoreDraft() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
      if (saved) applySaved(saved);
    } catch { /* A damaged draft should not prevent the editor loading. */ }
  }

  function updateStyleSelection() {
    document.querySelectorAll(".style-option").forEach((option) => option.classList.toggle("selected", option.dataset.style === state.style));
  }

  function cleanLine(line) {
    return line.replace(/^\s*(?:[-*•·]|\d+[.、)])\s*/, "").trim();
  }

  function splitLongText(text) {
    const chunks = text.match(/[^。！？；;]+[。！？；;]?/g) || [text];
    const out = [];
    for (const item of chunks) {
      const sentence = item.trim();
      if (!sentence) continue;
      if (sentence.length <= 72) out.push(sentence);
      else for (let i = 0; i < sentence.length; i += 72) out.push(sentence.slice(i, i + 72));
    }
    return out;
  }

  function parseMaterials(raw) {
    const lines = raw.replace(/\r\n?/g, "\n").split("\n");
    const sections = [];
    let current = { title: "核心材料", body: [] };
    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line) continue;
      const heading = line.match(/^#{1,4}\s+(.+)$/) || line.match(/^第[一二三四五六七八九十\d]+[章节部分][：:\s]*(.+)$/) || line.match(/^[一二三四五六七八九十]+[、.．]\s*(.+)$/) || (line.length <= 22 && /^(?:摘要|引言|绪论|研究背景|研究目的|研究问题|研究方法|研究内容|实验设计|数据分析|结果分析|主要发现|设计方案|创新点|结论|总结|展望|参考文献|致谢)$/.test(line) ? [line, line] : null);
      if (heading) {
        if (current.body.length) sections.push(current);
        current = { title: heading[1].trim(), body: [] };
      } else {
        current.body.push(...splitLongText(cleanLine(line)));
      }
    }
    if (current.body.length) sections.push(current);
    if (!sections.length) return [];
    return sections;
  }

  function buildDeck(input) {
    const title = input.projectTitle.trim();
    const direction = input.direction.trim();
    const sections = parseMaterials(input.materials);
    if (!sections.length) return null;
    const sectionTitles = sections.map((section) => section.title).slice(0, 6);
    const slides = [
      { type: "cover", kicker: "GRADUATION DEFENSE", title, body: [direction || "围绕研究问题，呈现过程与结论。"] },
      { type: "agenda", kicker: "CONTENTS", title: "答辩路径", body: sectionTitles }
    ];
    for (const [sectionIndex, section] of sections.entries()) {
      let page = 1;
      let group = [];
      const flush = () => {
        if (!group.length) return;
        slides.push({ type: "content", kicker: `PART ${String(sectionIndex + 1).padStart(2, "0")}`, title: section.title + (page > 1 ? ` · ${page}` : ""), body: group });
        group = [];
        page += 1;
      };
      for (const item of section.body) {
        if (group.length >= 3 || (group.length && group.join("").length + item.length > 150)) flush();
        group.push(item);
      }
      flush();
    }
    if (!sections.some((section) => /结论|总结|展望|启示/.test(section.title))) slides.push({ type: "content", kicker: "CONCLUSION", title: "结论与展望", body: ["待补充：请根据你的研究结果写出核心结论。", "待补充：说明研究局限与下一步方向。"] });
    slides.push({ type: "qa", kicker: "THANK YOU", title: "感谢聆听", body: ["欢迎提问与交流"] });
    return slides;
  }

  function slideHtml(slide, index, total) {
    const type = ["cover", "agenda", "content", "qa"].includes(slide.type) ? slide.type : "content";
    const body = slide.body.filter(Boolean);
    const subtitle = body[0] ? `<p class="slide-subtitle">${escapeHtml(body[0])}</p>` : "";
    const bullets = body.length ? `<ol class="slide-bullets">${body.map((item, i) => `<li><span>${String(i + 1).padStart(2, "0")}</span><div>${escapeHtml(item)}</div></li>`).join("")}</ol>` : "";
    const content = type === "cover" || type === "qa" ? subtitle : bullets;
    const footer = [state.presenter, state.institution].filter(Boolean).join(" · ") || "答辩工坊";
    return `<article class="slide slide-${type} theme-${state.style}" aria-label="第 ${index + 1} 页：${escapeHtml(slide.title)}"><div class="slide-big-shape"></div><div class="slide-inner"><div class="slide-top"><span class="mark">${escapeHtml(slide.kicker || "DEFENSE")}</span><span>${escapeHtml(state.demo ? "演示内容" : "答辩演示")}</span></div><div class="slide-content"><p class="slide-kicker">${escapeHtml(slide.kicker || "DEFENSE")}</p><h2 class="slide-title">${escapeHtml(slide.title)}</h2>${content}</div><div class="slide-footer"><span>${escapeHtml(footer)}</span><span class="slide-num">${String(index + 1).padStart(2, "0")} / ${String(total).padStart(2, "0")}</span></div></div></article>`;
  }

  function updateFitWarning() {
    const slide = $("currentSlide").querySelector(".slide");
    const content = slide?.querySelector(".slide-content");
    const footer = slide?.querySelector(".slide-footer");
    const last = content?.lastElementChild;
    const overflowing = Boolean(last && footer && last.getBoundingClientRect().bottom > footer.getBoundingClientRect().top - 8);
    $("fitWarning").hidden = !overflowing;
    $("slideFrame").classList.toggle("overflowing", overflowing);
  }

  function renderCurrent() {
    const slide = state.slides[state.current];
    $("currentSlide").innerHTML = slideHtml(slide, state.current, state.slides.length);
    $("pageCount").textContent = `${String(state.current + 1).padStart(2, "0")} / ${String(state.slides.length).padStart(2, "0")}`;
    $("previewStatus").textContent = state.demo ? "示例内容 · 可切换风格与试用编辑" : `${state.title || "未命名答辩"} · ${state.slides.length} 页`;
    $("prevSlide").disabled = state.current === 0;
    $("nextSlide").disabled = state.current === state.slides.length - 1;
    $("moveUp").disabled = state.current === 0;
    $("moveDown").disabled = state.current === state.slides.length - 1;
    requestAnimationFrame(updateFitWarning);
  }

  function renderThumbnails() {
    $("thumbStrip").innerHTML = state.slides.map((slide, index) => `<button type="button" class="thumb ${index === state.current ? "active" : ""}" data-index="${index}" aria-label="跳转到第 ${index + 1} 页：${escapeHtml(slide.title)}"><span class="thumb-preview ${state.style}"><span>${escapeHtml(slide.title)}</span></span><span class="thumb-caption">${String(index + 1).padStart(2, "0")} ${escapeHtml(slide.title)}</span></button>`).join("");
  }

  function renderEditor() {
    const slide = state.slides[state.current];
    $("slideKicker").value = slide.kicker;
    $("slideTitle").value = slide.title;
    $("slideBody").value = slide.body.join("\n");
    $("deleteSlide").disabled = state.slides.length <= 1;
  }

  function renderPrintDeck() {
    $("printDeck").innerHTML = state.slides.map((slide, index) => slideHtml(slide, index, state.slides.length)).join("");
  }

  function renderAll() {
    renderCurrent(); renderThumbnails(); renderEditor(); renderPrintDeck(); refreshAiPrompt(); saveDraft();
  }

  function buildAiPrompt() {
    const slide = state.slides[state.current];
    const fields = formData();
    const styleName = { editorial: "简约学术", ink: "东方水墨", tech: "未来科技", warm: "暖调叙事" }[state.style];
    const parts = [
      "请帮我润色一页大学答辩网页 PPT。只根据提供的内容修改表达，不要编造数据、引用、研究结果或事实。保持适合 16:9 幻灯片的简洁篇幅。",
      `项目题目：${fields.projectTitle.trim() || state.title || "未命名答辩"}`,
      `研究方向：${fields.direction.trim() || "未填写"}`,
      `视觉风格：${styleName}`,
      `当前第 ${state.current + 1} 页：${JSON.stringify({ title: slide.title, kicker: slide.kicker, body: slide.body }, null, 2)}`,
    ];
    if ($("includeAiMaterials").checked) {
      const materials = fields.materials.trim();
      parts.push(materials ? `供核对的原始材料（最多 12000 字）:\n${materials.slice(0, 12000)}${materials.length > 12000 ? "\n[材料已截断]" : ""}` : "原始材料：未填写");
    }
    parts.push('请只返回一个 JSON 对象，不要 Markdown 代码围栏或额外说明。格式：{"title":"页面标题","kicker":"短页眉","body":["要点一","要点二"]}。title 不超过 60 字，kicker 不超过 40 字，body 为 1 至 5 个要点，每项不超过 120 字。无依据的内容请写“待核实”。');
    return parts.join("\n\n");
  }

  function refreshAiPrompt() {
    $("aiPromptPreview").value = buildAiPrompt();
  }

  async function copyAiPrompt() {
    refreshAiPrompt();
    const prompt = $("aiPromptPreview").value;
    try {
      await navigator.clipboard.writeText(prompt);
      toast("提示词已复制，请在自己的 ChatGPT 中粘贴。");
    } catch {
      $("aiPromptPreview").focus();
      $("aiPromptPreview").select();
      toast("自动复制不可用。提示词已选中，请手动复制。");
    }
  }

  function applyAiResult() {
    let raw = $("aiResult").value.trim();
    if (!raw) return toast("请先粘贴 ChatGPT 返回的 JSON。");
    raw = raw.replace(/^\x60\x60\x60(?:json)?\s*/i, "").replace(/\s*\x60\x60\x60$/, "");
    try {
      const result = JSON.parse(raw);
      if (!result || typeof result !== "object" || Array.isArray(result)) throw new Error("返回内容必须是 JSON 对象。");
      if (typeof result.title !== "string" || !result.title.trim() || result.title.length > 100) throw new Error("标题需为 1–100 字。");
      if (typeof result.kicker !== "string" || result.kicker.length > 60) throw new Error("页眉需为 0–60 字。");
      if (!Array.isArray(result.body) || result.body.length < 1 || result.body.length > 8 || result.body.some((line) => typeof line !== "string" || !line.trim() || line.length > 300)) throw new Error("正文需为 1–8 条，每条 1–300 字。");
      state.slides[state.current] = { ...state.slides[state.current], title: result.title.trim(), kicker: result.kicker.trim(), body: result.body.map((line) => line.trim()) };
      renderAll();
      toast("已应用到当前页，请核对内容与版面。");
    } catch (error) {
      toast(error instanceof SyntaxError ? "JSON 格式有误，请让 ChatGPT 只返回一个 JSON 对象。" : error.message);
    }
  }

  function setCurrent(index) {
    state.current = Math.min(Math.max(index, 0), state.slides.length - 1);
    renderAll();
  }

  function loadDemo() {
    $("projectTitle").value = "校园公共空间的夜间使用研究";
    $("direction").value = "从真实使用体验出发，探讨校园夜间公共空间的设计方向。";
    $("presenter").value = "示例演示";
    $("institution").value = "";
    $("materials").value = sampleMaterials;
    state.title = $("projectTitle").value;
    state.presenter = "示例演示";
    state.institution = "";
    state.demo = true;
    state.slides = structuredClone(sampleSlides);
    state.current = 0;
    renderAll();
    toast("示例已载入。它仅展示排版，不代表真实研究结果。");
  }

  function exportHtml() {
    const css = $("slideStyles").textContent;
    const slides = state.slides.map((slide, index) => `<section class="deck-page" data-index="${index}">${slideHtml(slide, index, state.slides.length)}</section>`).join("");
    const doc = `<!doctype html><html lang="zh-CN"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(state.title || "网页答辩 PPT")}</title><style>${css}\n*{box-sizing:border-box}body{margin:0;background:#0c1920;font-family:"Microsoft YaHei","PingFang SC",sans-serif;color:#fff}.deck-page{display:none;position:absolute;inset:0;align-items:center;justify-content:center;padding:3vh 3vw}.deck-page.active{display:flex}.deck-page .slide{width:min(94vw,167.11vh);max-height:94vh}.deck-nav{position:fixed;bottom:13px;left:50%;transform:translateX(-50%);display:flex;align-items:center;gap:15px;padding:7px 10px;background:#0b2632d9;border:1px solid #ffffff30;border-radius:7px;z-index:2;font-size:12px}.deck-nav button{color:#fff;background:#ffffff1c;border:0;border-radius:4px;padding:7px 10px;cursor:pointer}.deck-nav button:hover{background:#ffffff38}@media print{@page{size:16in 9in;margin:0}body{background:#fff}.deck-page,.deck-page.active{display:block;position:relative;width:16in;height:9in;padding:0;break-after:page}.deck-page:last-of-type{break-after:auto}.deck-page .slide{width:16in;height:9in;max-height:none}.deck-nav{display:none}}</style></head><body>${slides}<nav class="deck-nav" aria-label="演示控制"><button id="prev" aria-label="上一页">←</button><span id="counter"></span><button id="next" aria-label="下一页">→</button><button id="pdf">打印 / PDF</button></nav><script>(()=>{const pages=[...document.querySelectorAll('.deck-page')];let current=0;function show(i){current=Math.max(0,Math.min(pages.length-1,i));pages.forEach((p,n)=>p.classList.toggle('active',n===current));document.querySelector('#counter').textContent=(current+1)+' / '+pages.length}document.querySelector('#prev').onclick=()=>show(current-1);document.querySelector('#next').onclick=()=>show(current+1);document.querySelector('#pdf').onclick=()=>window.print();document.addEventListener('keydown',e=>{if(['ArrowRight','ArrowDown','PageDown',' '].includes(e.key)){e.preventDefault();show(current+1)}if(['ArrowLeft','ArrowUp','PageUp'].includes(e.key)){e.preventDefault();show(current-1)}});show(0)})();<\/script></body></html>`;
    const url = URL.createObjectURL(new Blob([doc], { type: "text/html;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `${(state.title || "网页答辩PPT").replace(/[\\/:*?"<>|]/g, "-").slice(0, 60)}.html`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
    toast("HTML 已导出，可离线打开演示。");
  }

  function downloadFile(contents, type, filename) {
    const url = URL.createObjectURL(new Blob([contents], { type }));
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  }

  let mammothPromise;
  function loadMammoth() {
    if (window.mammoth) return Promise.resolve(window.mammoth);
    if (!mammothPromise) mammothPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "vendor/mammoth.browser.min.js";
      script.onload = () => window.mammoth ? resolve(window.mammoth) : reject(new Error("DOCX 解析器未加载"));
      script.onerror = () => reject(new Error("DOCX 解析器未加载"));
      document.head.append(script);
    });
    return mammothPromise;
  }

  async function extractPdfText(file) {
    const pdfjs = await import("./vendor/pdf.min.mjs");
    pdfjs.GlobalWorkerOptions.workerSrc = new URL("./vendor/pdf.worker.min.mjs", document.baseURI).href;
    const task = pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) });
    const pdf = await task.promise;
    try {
      if (pdf.numPages > 80) throw new Error("PDF 超过 80 页，请先提取摘要或相关章节再导入。");
      const pages = [];
      for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
        const page = await pdf.getPage(pageNumber);
        const content = await page.getTextContent();
        pages.push(content.items.map((item) => `${item.str || ""}${item.hasEOL ? "\n" : " "}`).join("").trim());
        page.cleanup();
      }
      return pages.filter(Boolean).join("\n\n");
    } finally {
      await task.destroy();
    }
  }

  async function extractFileText(file) {
    if (/\.(txt|md)$/i.test(file.name)) return file.text();
    if (/\.docx$/i.test(file.name)) {
      const mammoth = await loadMammoth();
      return (await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() })).value;
    }
    if (/\.pdf$/i.test(file.name)) return extractPdfText(file);
    throw new Error("请选择 TXT、Markdown、DOCX 或 PDF 文件。");
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const input = formData();
    const deck = buildDeck(input);
    if (!deck) return toast("请添加至少一段有效的答辩材料。");
    state.slides = deck;
    state.current = 0;
    state.title = input.projectTitle.trim();
    state.presenter = input.presenter.trim();
    state.institution = input.institution.trim();
    state.demo = false;
    renderAll();
    $("previewPanel").scrollIntoView({ behavior: "smooth", block: "start" });
    toast(`已生成 ${deck.length} 页。请逐页核对论据和结论。`);
  });

  form.addEventListener("input", () => { saveDraft(); refreshAiPrompt(); });
  $("materialFile").addEventListener("change", async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 20 * 1024 * 1024) return toast("文件大于 20 MB，请先提取相关章节。");
    try {
      $("saveStatus").textContent = "正在本机读取文件…";
      const extracted = (await extractFileText(file)).trim();
      if (!extracted) throw new Error("没有读取到文字。扫描版 PDF 请先进行 OCR。");
      const existing = $("materials").value.trim();
      $("materials").value = existing ? `${existing}\n\n${extracted}` : extracted;
      saveDraft();
      toast(`已从 ${file.name} 读取文字；请检查表格、公式和段落。`);
    } catch (error) { toast(error.message || "读取文件失败，请粘贴文本重试。"); }
    event.target.value = "";
  });
  document.querySelectorAll('input[name="style"]').forEach((input) => input.addEventListener("change", () => { state.style = input.value; updateStyleSelection(); renderAll(); }));
  $("loadDemo").addEventListener("click", loadDemo);
  $("prevSlide").addEventListener("click", () => setCurrent(state.current - 1));
  $("nextSlide").addEventListener("click", () => setCurrent(state.current + 1));
  $("thumbStrip").addEventListener("click", (event) => { const button = event.target.closest(".thumb"); if (button) setCurrent(Number(button.dataset.index)); });
  for (const [id, key, transform] of [["slideKicker", "kicker", (v) => v], ["slideTitle", "title", (v) => v], ["slideBody", "body", (v) => v.split("\n").map((line) => line.trim()).filter(Boolean)]]) {
    $(id).addEventListener("input", (event) => { state.slides[state.current][key] = transform(event.target.value); renderCurrent(); renderThumbnails(); renderPrintDeck(); refreshAiPrompt(); saveDraft(); });
  }
  $("addSlide").addEventListener("click", () => { state.slides.splice(state.current + 1, 0, { type: "content", kicker: "NEW SLIDE", title: "新的一页", body: ["在这里写下你的核心要点。"] }); setCurrent(state.current + 1); });
  $("moveUp").addEventListener("click", () => { if (state.current < 1) return; [state.slides[state.current - 1], state.slides[state.current]] = [state.slides[state.current], state.slides[state.current - 1]]; setCurrent(state.current - 1); });
  $("moveDown").addEventListener("click", () => { if (state.current >= state.slides.length - 1) return; [state.slides[state.current + 1], state.slides[state.current]] = [state.slides[state.current], state.slides[state.current + 1]]; setCurrent(state.current + 1); });
  $("deleteSlide").addEventListener("click", () => { if (state.slides.length <= 1) return; state.slides.splice(state.current, 1); setCurrent(Math.min(state.current, state.slides.length - 1)); });
  $("backupBtn").addEventListener("click", () => {
    const data = { schema: 1, ...state, fields: formData() };
    downloadFile(JSON.stringify(data, null, 2), "application/json;charset=utf-8", `${(state.title || "网页答辩PPT").replace(/[\\/:*?"<>|]/g, "-").slice(0, 60)}.project.json`);
    toast("项目备份已下载。请妥善保管其中的答辩材料。");
  });
  $("restoreFile").addEventListener("change", async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      if (file.size > 2 * 1024 * 1024) throw new Error("项目文件超过 2 MB。");
      const saved = JSON.parse(await file.text());
      if (saved.schema !== 1) throw new Error("不支持的项目文件格式。");
      applySaved(saved);
      renderAll();
      toast("项目已恢复，请检查页面和材料。");
    } catch (error) { toast(error.message || "项目文件读取失败。"); }
    event.target.value = "";
  });
  $("presentBtn").addEventListener("click", () => { const active = document.body.classList.toggle("presenting"); $("presentBtn").innerHTML = active ? "退出演示 <span>×</span>" : "全屏演示 <span>↗</span>"; });
  $("printBtn").addEventListener("click", () => { renderPrintDeck(); window.print(); });
  $("exportBtn").addEventListener("click", exportHtml);
  $("includeAiMaterials").addEventListener("change", refreshAiPrompt);
  $("copyAiPrompt").addEventListener("click", copyAiPrompt);
  $("applyAiResult").addEventListener("click", applyAiResult);
  document.addEventListener("keydown", (event) => {
    if (!document.body.classList.contains("presenting")) return;
    if (event.key === "Escape") { document.body.classList.remove("presenting"); $("presentBtn").innerHTML = "全屏演示 <span>↗</span>"; }
    else if (["ArrowRight", "ArrowDown", "PageDown", " "].includes(event.key)) { event.preventDefault(); setCurrent(state.current + 1); }
    else if (["ArrowLeft", "ArrowUp", "PageUp"].includes(event.key)) { event.preventDefault(); setCurrent(state.current - 1); }
  });
  window.addEventListener("resize", () => requestAnimationFrame(updateFitWarning));

  restoreDraft();
  renderAll();
})();
