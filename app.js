/* AI 试衣间 / AI Fitting Room — runs entirely in the browser, no server needed. */
(function () {
  "use strict";

  // ---------- i18n ----------
  const EN = {
    appTitle: "AI Fitting Room",
    appSub: "Upload your photo and a garment to see it on you, get a size pick and a buy / skip verdict",
    settings: "Settings",
    settingsTitle: "Settings (saved only in this browser on your computer)",
    geminiKey: "Gemini API key (free, required for size and buying advice)",
    getKey: "Get one free →",
    geminiModel: "Gemini model",
    geminiModelHint: "Usually leave as is; if you get “model not found”, use a free model name shown in AI Studio",
    hfToken: "Hugging Face token (free, strongly recommended for try-on images)",
    hfHint: "Works without it, but the free quota is tiny",
    spaceId: "Try-on model for tops (Hugging Face Space)",
    spaceHint: "Default yisol/IDM-VTON; if it is down or the queue is long, switch to another IDM-VTON copy",
    spaceId2: "Try-on model for pants, skirts and dresses",
    space2Hint: "Default franciszzj/Leffa; also used as a backup when the tops model is down",
    save: "Save",
    meTitle: "About me",
    personUpload: "Upload a full or half-body photo",
    personTips: "Facing the camera, good light, fitted clothes work best",
    gender: "Gender", female: "Female", male: "Male", other: "Other",
    fit: "Preferred fit", fitSlim: "Slim", fitRegular: "Regular", fitLoose: "Loose",
    height: "Height cm", weight: "Weight kg", shoulder: "Shoulder cm", chest: "Chest / bust cm",
    waist: "Waist cm", hips: "Hips cm", arm: "Arm length cm (optional)", inseam: "Inseam cm (optional)",
    usualTop: "Usual top size", usualBottom: "Usual pants size",
    bodyNotes: "Body notes (optional)", bodyNotesPh: "e.g. sloped shoulders, wide hips, short torso",
    measureHelp: "How to measure: bust at the fullest point, waist at the narrowest, hips at the widest, tape snug but not tight.",
    garmentTitle: "The garment",
    garmentUpload: "Upload the garment image",
    garmentTips: "Taobao / Xiaohongshu / brand site screenshots are fine; a flat-lay or white-background shot of just this item works best",
    category: "Type", catTop: "Top (tee, shirt, sweater)", catOuter: "Outerwear", catDress: "Dress", catBottom: "Pants / skirt",
    price: "Price (optional)",
    garmentDesc: "Description (optional)", garmentDescPh: "e.g. white cropped knit cardigan, stretchy",
    sizeChartText: "Size chart (paste text)",
    sizeChartPh: "e.g.\nS length 60 bust 96 shoulder 40\nM length 62 bust 100 shoulder 41\nL length 64 bust 104 shoulder 42",
    chartUpload: "or upload a size chart screenshot",
    purpose: "Purpose / other thoughts (optional)", purposePh: "e.g. for work, I already own many white tees, worried about pilling",
    runAll: "✨ Try on + AI advice", runTryon: "Try-on only", runAdvice: "Size & buying advice only",
    tryonResult: "Try-on result", adviceResult: "Size & buying advice",
    tryonEmpty: "Your result will appear here", adviceEmpty: "Your result will appear here",
    privacy: "Privacy: photos are sent to the try-on model on Hugging Face and to Google Gemini. The free Gemini tier may use your data to improve Google products, so avoid uploading face or sensitive photos if that bothers you.",
    needPerson: "Please upload your photo first.",
    needGarment: "Please upload the garment image first.",
    needKey: "Add a free Gemini API key in Settings first.",
    tryonLoading: "Generating try-on… usually 30–90 seconds, longer if the queue is busy",
    tryonQueue: "In queue, position",
    adviceLoading: "AI is reading the size chart and your measurements…",
    download: "Download image",
    recommended: "Recommended size", alt: "Backup size", confidence: "Confidence",
    conf_high: "High", conf_medium: "Medium", conf_low: "Low",
    verdict_buy: "👍 Worth buying", verdict_consider: "🤔 Think it over", verdict_skip: "✋ Skip it",
    fitDetails: "Fit by area", area: "Area", yours: "You", garmentCol: "This size", assessment: "Verdict",
    pros: "Why buy", cons: "Concerns", tips: "Styling tips", missing: "Would help to know",
    sizeWhy: "Why this size",
    tryonFailed: "Try-on failed", adviceFailed: "Analysis failed",
    quotaHint: "The free GPU quota is used up. Add a free Hugging Face token in Settings, or wait and try again later.",
    spaceDownHint: "The try-on model seems to be sleeping or under maintenance. Try again in a few minutes, or switch the Space in Settings.",
    saved: "Saved ✓",
    longPress: "On a phone: press and hold the image to save it to your photos",
  };
  const ZH = {}; // Chinese strings come from the HTML itself
  const ZH_EXTRA = {
    needPerson: "请先上传你的照片。",
    needGarment: "请先上传衣服图片。",
    needKey: "请先在“设置”里填好免费的 Gemini API Key。",
    tryonLoading: "正在生成试穿图…一般 30 到 90 秒，排队多时会更久",
    tryonQueue: "排队中，前面还有",
    adviceLoading: "AI 正在看尺码表和你的数据…",
    download: "下载图片",
    recommended: "推荐尺码", alt: "备选尺码", confidence: "把握程度",
    conf_high: "高", conf_medium: "中", conf_low: "低",
    verdict_buy: "👍 推荐购买", verdict_consider: "🤔 谨慎考虑", verdict_skip: "✋ 不推荐",
    fitDetails: "各部位合身情况", area: "部位", yours: "你", garmentCol: "该尺码", assessment: "评价",
    pros: "值得买的理由", cons: "需要注意", tips: "搭配建议", missing: "补充这些信息会更准",
    sizeWhy: "为什么选这个尺码",
    tryonFailed: "试穿图生成失败", adviceFailed: "分析失败",
    quotaHint: "免费 GPU 额度用完了。去“设置”填一个免费的 Hugging Face Token，或者过一会儿再试。",
    spaceDownHint: "试衣模型可能在休眠或维护，过几分钟再试，或者在“设置”里换一个 Space。",
    saved: "已保存 ✓",
    longPress: "手机上：长按图片即可保存到相册",
  };

  let lang = load("lang") || "zh";

  function t(key) {
    if (lang === "en") return EN[key] ?? ZH[key] ?? key;
    return ZH[key] ?? ZH_EXTRA[key] ?? key;
  }

  function captureChinese() {
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      ZH[el.dataset.i18n] = el.textContent;
    });
    document.querySelectorAll("[data-i18n-ph]").forEach((el) => {
      ZH[el.dataset.i18nPh] = el.getAttribute("placeholder");
    });
    ZH.sizeChartPh = document.getElementById("sizeChartText").getAttribute("placeholder");
    Object.assign(ZH, ZH_EXTRA);
  }

  function applyLang() {
    document.documentElement.lang = lang === "en" ? "en" : "zh-CN";
    document.title = lang === "en" ? "AI Fitting Room" : "AI 试衣间";
    document.querySelectorAll("[data-i18n]").forEach((el) => { el.textContent = t(el.dataset.i18n); });
    document.querySelectorAll("[data-i18n-ph]").forEach((el) => { el.setAttribute("placeholder", t(el.dataset.i18nPh)); });
    document.getElementById("sizeChartText").setAttribute("placeholder", t("sizeChartPh"));
    $("langBtn").textContent = lang === "en" ? "中文" : "EN";
    if (lastAdvice) renderAdvice(lastAdvice);
  }

  // ---------- storage ----------
  function load(k) { try { return localStorage.getItem("fit_" + k); } catch { return null; } }
  function store(k, v) { try { localStorage.setItem("fit_" + k, v); } catch { /* quota or private mode */ } }

  const $ = (id) => document.getElementById(id);
  const PROFILE_FIELDS = ["gender", "fitPref", "height", "weight", "shoulder", "chest", "waist", "hips", "arm", "inseam", "usualTop", "usualBottom", "bodyNotes"];
  const SETTINGS_FIELDS = ["geminiKey", "geminiModel", "hfToken", "spaceId", "spaceId2"];

  const images = { person: null, garment: null, chart: null }; // { blob, dataUrl, base64, mime }
  let lastAdvice = null;

  // ---------- images ----------
  function resizeImage(file, maxSide) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(reader.error);
      reader.onload = () => {
        const img = new Image();
        img.onerror = () => reject(new Error("Cannot read image"));
        img.onload = () => {
          const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
          const w = Math.round(img.width * scale), h = Math.round(img.height * scale);
          const c = document.createElement("canvas");
          c.width = w; c.height = h;
          const ctx = c.getContext("2d");
          ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, w, h);
          ctx.drawImage(img, 0, 0, w, h);
          const dataUrl = c.toDataURL("image/jpeg", 0.9);
          c.toBlob((blob) => resolve(fromDataUrl(dataUrl, blob)), "image/jpeg", 0.9);
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    });
  }
  function fromDataUrl(dataUrl, blob) {
    const base64 = dataUrl.split(",")[1];
    if (!blob) {
      const bin = atob(base64); const arr = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
      blob = new Blob([arr], { type: "image/jpeg" });
    }
    return { blob, dataUrl, base64, mime: "image/jpeg" };
  }

  function setupUpload(kind, maxSide) {
    const zone = document.querySelector(`.upload[data-target="${kind}"]`);
    const input = $(kind + "File");
    const preview = $(kind + "Preview");
    const hint = $(kind + "Hint");
    const show = (img) => {
      images[kind] = img;
      preview.src = img.dataUrl; preview.classList.remove("hidden"); hint.classList.add("hidden");
    };
    const handle = async (file) => {
      if (!file || !file.type.startsWith("image/")) return;
      const img = await resizeImage(file, maxSide);
      show(img);
      if (kind === "person") store("personImg", img.dataUrl);
    };
    zone.addEventListener("click", () => input.click());
    input.addEventListener("change", () => handle(input.files[0]));
    zone.addEventListener("dragover", (e) => { e.preventDefault(); zone.classList.add("drag"); });
    zone.addEventListener("dragleave", () => zone.classList.remove("drag"));
    zone.addEventListener("drop", (e) => { e.preventDefault(); zone.classList.remove("drag"); handle(e.dataTransfer.files[0]); });
    if (kind === "person") {
      const saved = load("personImg");
      if (saved) show(fromDataUrl(saved));
    }
    return handle;
  }

  // Paste a screenshot (Ctrl/Cmd+V): goes to garment if empty, else size chart.
  function setupPaste(handlers) {
    document.addEventListener("paste", (e) => {
      if (e.target && /^(INPUT|TEXTAREA)$/.test(e.target.tagName)) return;
      const item = [...(e.clipboardData?.items || [])].find((i) => i.type.startsWith("image/"));
      if (!item) return;
      const file = item.getAsFile();
      if (!images.person) handlers.person(file);
      else if (!images.garment) handlers.garment(file);
      else handlers.chart(file);
    });
  }

  // ---------- profile ----------
  function readProfile() {
    const p = {};
    PROFILE_FIELDS.forEach((f) => { const v = $(f).value.trim(); if (v) p[f] = v; });
    return p;
  }
  function restoreFields(fields) {
    fields.forEach((f) => { const v = load(f); if (v !== null && v !== "") $(f).value = v; });
  }

  // ---------- try-on (Hugging Face Spaces) ----------
  // Tops/outerwear -> IDM-VTON (upper body only). Pants/skirts/dresses -> Leffa (supports lower body and dresses).
  const GARMENT_EN = { top: "a top", outer: "a jacket", dress: "a dress", bottom: "pants" };

  async function streamJob(job) {
    for await (const msg of job) {
      if (msg.type === "status") {
        const s = $("tryonStatus");
        if (s && msg.stage === "pending" && typeof msg.position === "number" && msg.position > 0) {
          s.textContent = `${t("tryonQueue")} ${msg.position} …`;
        }
        if (msg.stage === "error") throw new Error(msg.message || "error");
      } else if (msg.type === "data") {
        return msg.data;
      }
    }
    return null;
  }

  async function tryonIDM(opts) {
    const { Client, handle_file } = window.GradioClient;
    const space = ($("spaceId").value || "yisol/IDM-VTON").trim();
    const client = await Client.connect(space, opts);
    const desc = $("garmentDesc").value.trim() || GARMENT_EN[$("category").value] || "a top";
    return streamJob(client.submit("/tryon", {
      dict: { background: handle_file(images.person.blob), layers: [], composite: null },
      garm_img: handle_file(images.garment.blob),
      garment_des: desc,
      is_checked: true,
      is_checked_crop: true,
      denoise_steps: 30,
      seed: Math.floor(Math.random() * 100000),
    }));
  }

  async function tryonLeffa(opts, garmentType) {
    const { Client, handle_file } = window.GradioClient;
    const space = ($("spaceId2").value || "franciszzj/Leffa").trim();
    const client = await Client.connect(space, opts);
    // The try-on button has no explicit api_name; find its endpoint (defaults to the function name).
    let endpoint = "/leffa_predict_vt";
    try {
      const api = await client.view_api();
      const names = Object.keys(api?.named_endpoints || {});
      endpoint = names.find((n) => /predict_vt/.test(n)) || names.find((n) => /vt|try/i.test(n)) || endpoint;
    } catch { /* keep default */ }
    // upper_body works best with the VITON-HD model; lower body and dresses need the DressCode model.
    const modelType = garmentType === "upper_body" ? "viton_hd" : "dress_code";
    return streamJob(client.submit(endpoint, [
      handle_file(images.person.blob),
      handle_file(images.garment.blob),
      false,                               // accelerate reference UNet
      30,                                  // steps
      2.5,                                 // guidance scale
      Math.floor(Math.random() * 100000),  // seed
      modelType,
      garmentType,
      false,                               // repaint
    ]));
  }

  async function runTryon() {
    const box = $("tryonBox");
    box.innerHTML = `<div class="loading"><div class="spinner"></div><span id="tryonStatus">${esc(t("tryonLoading"))}</span></div>`;
    const token = $("hfToken").value.trim();
    const opts = token ? { token } : {};
    const cat = $("category").value;
    try {
      let data;
      if (cat === "bottom") data = await tryonLeffa(opts, "lower_body");
      else if (cat === "dress") data = await tryonLeffa(opts, "dresses");
      else {
        try {
          data = await tryonIDM(opts);
        } catch (err) {
          if (/quota|exceeded/i.test(String(err?.message || err))) throw err;
          data = await tryonLeffa(opts, "upper_body"); // IDM-VTON down: fall back to Leffa
        }
      }
      const out = data && data[0];
      const url = out && (out.url || (typeof out === "string" ? out : null));
      if (!url) throw new Error("No image returned");
      const img = await fetch(url, token ? { headers: { Authorization: `Bearer ${token}` } } : {})
        .then((r) => r.blob()).then((b) => URL.createObjectURL(b)).catch(() => url);
      box.innerHTML = `<img src="${img}" alt="try-on" /><a class="dl" href="${img}" download="tryon.png">${esc(t("download"))}</a><small class="save-tip">${esc(t("longPress"))}</small>`;
    } catch (err) {
      const msg = String(err?.message || err);
      let hint = "";
      if (/quota|exceeded|ZeroGPU|GPU task/i.test(msg)) hint = t("quotaHint");
      else if (/sleep|paus|build|runtime|not found|404|503|connect|Failed to fetch/i.test(msg)) hint = t("spaceDownHint");
      box.innerHTML = `<div class="error-box"><strong>${esc(t("tryonFailed"))}</strong>\n${esc(hint || msg)}${hint ? `\n\n<small>${esc(msg)}</small>` : ""}</div>`;
    }
  }

  // ---------- advice (Gemini) ----------
  const SYSTEM_PROMPT = `You are an experienced fashion fit consultant who helps people decide what size to buy online and whether an item is worth buying.

How to work:
- Read the size chart (text and/or screenshot) carefully. Garment measurements in charts are usually the garment's flat or full circumference, not body size. Note whether a chart value looks like a half (flat-lay) measurement and double it when comparing to body circumference.
- Compare body measurements with garment measurements using sensible ease (extra room): for tops, bust ease is roughly 4-8 cm for fitted, 8-14 cm for regular, 14+ cm for loose/oversized; shoulders within about ±2 cm of body shoulder width for a set-in sleeve; for pants, waist ease 0-3 cm, hips 4-8 cm. Stretch fabric needs less ease. Adjust for the person's fit preference.
- If the size chart is missing, estimate from height, weight and their usual size, say so, and lower confidence.
- Look at the photos: body shape, proportions, coloring, and the garment's style, cut, fabric look and apparent quality.
- Decide buy / consider / skip with honest, specific reasons: fit, how it suits their body shape and coloring, versatility, quality signals, price, and anything the user mentioned. Do not be a salesperson; say skip when it does not suit them.
- Keep each list item short (one sentence).

Reply with only a JSON object with exactly these keys:
{
  "recommended_size": string,
  "alternative_size": string,            // "" if none
  "confidence": "high" | "medium" | "low",
  "size_reasoning": string,              // 1-3 sentences
  "fit_details": [ { "area": string, "yours": string, "garment": string, "assessment": string } ],
  "verdict": "buy" | "consider" | "skip",
  "verdict_summary": string,             // one sentence
  "reasons_for": [string],
  "reasons_against": [string],
  "style_tips": [string],
  "missing_info": [string]               // what extra info would make this more accurate; [] if none
}`;

  async function runAdvice() {
    const box = $("adviceBox");
    box.innerHTML = `<div class="loading"><div class="spinner"></div><span>${esc(t("adviceLoading"))}</span></div>`;
    const key = $("geminiKey").value.trim();
    let model = ($("geminiModel").value || "gemini-3.8-flash").trim();
    const profile = readProfile();
    const garment = {
      category: $("category").value,
      price: $("price").value.trim() || undefined,
      description: $("garmentDesc").value.trim() || undefined,
      size_chart_text: $("sizeChartText").value.trim() || undefined,
      user_notes: $("purpose").value.trim() || undefined,
    };
    const language = lang === "en" ? "English" : "Simplified Chinese (简体中文)";
    const parts = [
      { text: `Write every string value in ${language}.\n\nMy body profile (cm / kg):\n${JSON.stringify(profile, null, 2)}\n\nThe garment:\n${JSON.stringify(garment, null, 2)}` },
    ];
    if (images.person) parts.push({ text: "Photo of me:" }, { inline_data: { mime_type: images.person.mime, data: images.person.base64 } });
    parts.push({ text: "The garment:" }, { inline_data: { mime_type: images.garment.mime, data: images.garment.base64 } });
    if (images.chart) parts.push({ text: "Size chart screenshot:" }, { inline_data: { mime_type: images.chart.mime, data: images.chart.base64 } });
    if (!garment.size_chart_text && !images.chart) parts.push({ text: "No size chart was provided." });

    const callGemini = (m) => fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(m)}:generateContent`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": key },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents: [{ role: "user", parts }],
          generationConfig: { responseMimeType: "application/json", temperature: 0.4 },
        }),
      });
    try {
      let res = await callGemini(model);
      let json = await res.json().catch(() => ({}));
      // Google retires models over time; if it names a replacement, switch to it and remember.
      const suggested = !res.ok && String(json?.error?.message || "").match(/use models\/([\w.\-]+)/i);
      if (suggested && suggested[1] !== model) {
        model = suggested[1];
        $("geminiModel").value = model; store("geminiModel", model);
        res = await callGemini(model);
        json = await res.json().catch(() => ({}));
      }
      if (!res.ok) throw new Error(json?.error?.message || `HTTP ${res.status}`);
      const text = (json.candidates?.[0]?.content?.parts || []).map((p) => p.text || "").join("");
      if (!text) throw new Error(json.promptFeedback?.blockReason ? `Blocked: ${json.promptFeedback.blockReason}` : "Empty response");
      const advice = parseJson(text);
      lastAdvice = advice;
      renderAdvice(advice);
    } catch (err) {
      box.innerHTML = `<div class="error-box"><strong>${esc(t("adviceFailed"))}</strong>\n${esc(String(err?.message || err))}</div>`;
    }
  }

  function parseJson(text) {
    try { return JSON.parse(text); } catch { /* fall through */ }
    const m = text.match(/\{[\s\S]*\}/);
    if (m) return JSON.parse(m[0]);
    throw new Error("Could not parse AI response");
  }

  function list(items) {
    if (!Array.isArray(items) || !items.length) return "";
    return `<ul>${items.map((i) => `<li>${esc(i)}</li>`).join("")}</ul>`;
  }

  function renderAdvice(a) {
    const verdict = ["buy", "consider", "skip"].includes(a.verdict) ? a.verdict : "consider";
    const conf = ["high", "medium", "low"].includes(a.confidence) ? a.confidence : "medium";
    const rows = (a.fit_details || []).map((d) =>
      `<tr><td>${esc(d.area)}</td><td>${esc(d.yours)}</td><td>${esc(d.garment)}</td><td>${esc(d.assessment)}</td></tr>`).join("");
    $("adviceBox").innerHTML = `
      <div class="size-hero">
        <div class="size-badge">${esc(a.recommended_size || "?")}</div>
        <div>
          <div class="muted">${esc(t("recommended"))}</div>
          ${a.alternative_size ? `<div>${esc(t("alt"))}：<strong>${esc(a.alternative_size)}</strong></div>` : ""}
          <span class="pill">${esc(t("confidence"))}：${esc(t("conf_" + conf))}</span>
        </div>
      </div>
      ${a.size_reasoning ? `<h3>${esc(t("sizeWhy"))}</h3><p>${esc(a.size_reasoning)}</p>` : ""}
      ${rows ? `<h3>${esc(t("fitDetails"))}</h3><div class="table-wrap"><table><thead><tr><th>${esc(t("area"))}</th><th>${esc(t("yours"))}</th><th>${esc(t("garmentCol"))}</th><th>${esc(t("assessment"))}</th></tr></thead><tbody>${rows}</tbody></table></div>` : ""}
      <div class="verdict ${verdict}">${esc(t("verdict_" + verdict))}<small>${esc(a.verdict_summary || "")}</small></div>
      ${a.reasons_for?.length ? `<h3>${esc(t("pros"))}</h3>${list(a.reasons_for)}` : ""}
      ${a.reasons_against?.length ? `<h3>${esc(t("cons"))}</h3>${list(a.reasons_against)}` : ""}
      ${a.style_tips?.length ? `<h3>${esc(t("tips"))}</h3>${list(a.style_tips)}` : ""}
      ${a.missing_info?.length ? `<h3>${esc(t("missing"))}</h3>${list(a.missing_info)}` : ""}
    `;
  }

  function esc(s) {
    return String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }

  // ---------- actions ----------
  function check(needAdvice, needTryon) {
    const err = $("formError");
    let msg = "";
    if ((needTryon || needAdvice) && !images.garment) msg = t("needGarment");
    if (needTryon && !images.person) msg = t("needPerson");
    if (needAdvice && !$("geminiKey").value.trim()) { msg = t("needKey"); $("settingsPanel").classList.remove("hidden"); }
    err.textContent = msg;
    err.classList.toggle("hidden", !msg);
    if (msg) setTimeout(() => err.classList.add("hidden"), 4000);
    return !msg;
  }

  async function run(doTryon, doAdvice) {
    if (!check(doAdvice, doTryon)) return;
    PROFILE_FIELDS.forEach((f) => store(f, $(f).value.trim()));
    const btns = document.querySelectorAll(".actions button");
    btns.forEach((b) => (b.disabled = true));
    setTimeout(() => (doTryon ? $("tryonCard") : $("adviceCard")).scrollIntoView({ behavior: "smooth", block: "start" }), 50);
    try {
      await Promise.all([doTryon ? runTryon() : null, doAdvice ? runAdvice() : null]);
    } finally {
      btns.forEach((b) => (b.disabled = false));
    }
  }

  // ---------- init ----------
  captureChinese();
  restoreFields(PROFILE_FIELDS);
  restoreFields(SETTINGS_FIELDS);
  if ($("geminiModel").value === "gemini-2.5-flash") { $("geminiModel").value = "gemini-3.8-flash"; store("geminiModel", "gemini-3.8-flash"); }
  const handlers = {
    person: setupUpload("person", 1024),
    garment: setupUpload("garment", 1024),
    chart: setupUpload("chart", 1400),
  };
  setupPaste(handlers);
  PROFILE_FIELDS.forEach((f) => $(f).addEventListener("change", () => store(f, $(f).value.trim())));

  $("langBtn").addEventListener("click", () => { lang = lang === "en" ? "zh" : "en"; store("lang", lang); applyLang(); });
  $("settingsBtn").addEventListener("click", () => $("settingsPanel").classList.toggle("hidden"));
  $("saveSettings").addEventListener("click", () => {
    SETTINGS_FIELDS.forEach((f) => store(f, $(f).value.trim()));
    const b = $("saveSettings"); b.textContent = t("saved");
    setTimeout(() => { b.textContent = t("save"); $("settingsPanel").classList.add("hidden"); }, 900);
  });
  // Show / hide buttons for the key fields, so a key can be copied to another device.
  ["geminiKey", "hfToken"].forEach((id) => {
    const input = $(id);
    const btn = document.createElement("button");
    btn.type = "button"; btn.className = "ghost eye"; btn.textContent = "👁";
    btn.setAttribute("aria-label", "show / hide");
    btn.addEventListener("click", () => { input.type = input.type === "password" ? "text" : "password"; });
    const wrap = document.createElement("div"); wrap.className = "key-wrap";
    input.parentNode.insertBefore(wrap, input); wrap.append(input, btn);
  });
  $("runAll").addEventListener("click", () => run(true, true));
  $("runTryon").addEventListener("click", () => run(true, false));
  $("runAdvice").addEventListener("click", () => run(false, true));

  if (!$("geminiKey").value) $("settingsPanel").classList.remove("hidden");
  applyLang();
})();
