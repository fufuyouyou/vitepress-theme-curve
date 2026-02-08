/**
 * 为 Mermaid 图表添加下载 PNG 功能
 */

/**
 * 获取当前页面背景色
 */
const getBackgroundColor = () => {
  if (typeof document === "undefined") return "#ffffff";
  return document.documentElement.classList.contains("dark") ? "#21232a" : "#f7f7f9";
};

/**
 * 将 SVG 渲染为高分辨率 PNG 并触发下载
 */
const downloadAsPng = async (svgEl) => {
  try {
    const scale = 3;
    const svgClone = svgEl.cloneNode(true);
    const rect = svgEl.getBoundingClientRect();
    const w = rect.width * scale;
    const h = rect.height * scale;

    svgClone.setAttribute("width", w);
    svgClone.setAttribute("height", h);
    svgClone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    svgClone.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink");
    svgClone.removeAttribute("style");

    // 插入背景矩形
    const bgColor = getBackgroundColor();
    const bgRect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    bgRect.setAttribute("width", "100%");
    bgRect.setAttribute("height", "100%");
    bgRect.setAttribute("fill", bgColor);
    svgClone.insertBefore(bgRect, svgClone.firstChild);

    // 移除可能导致跨域问题的外部引用
    svgClone.querySelectorAll("image").forEach((el) => el.remove());
    svgClone.querySelectorAll("use[href^='http']").forEach((el) => el.remove());

    // 序列化 SVG → base64 data URL（避免 Blob URL 导致 Canvas 跨域污染）
    const svgStr = new XMLSerializer().serializeToString(svgClone);
    const dataUrl = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgStr)));

    const img = new Image();
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, w, h);
        ctx.drawImage(img, 0, 0, w, h);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              downloadAsSvg(svgEl);
              return;
            }
            const pngUrl = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = pngUrl;
            a.download = `mermaid-${Date.now()}.png`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            setTimeout(() => URL.revokeObjectURL(pngUrl), 3000);
          },
          "image/png",
          1.0,
        );
      } catch (canvasErr) {
        console.error("Canvas 导出失败，回退为 SVG:", canvasErr);
        downloadAsSvg(svgEl);
      }
    };
    img.onerror = () => {
      console.error("SVG 图片加载失败，回退为 SVG 下载");
      downloadAsSvg(svgEl);
    };
    img.src = dataUrl;
  } catch (err) {
    console.error("PNG 下载失败，回退为 SVG:", err);
    downloadAsSvg(svgEl);
  }
};

/**
 * 回退：下载 SVG 文件
 */
const downloadAsSvg = (svgEl) => {
  try {
    const svgStr = new XMLSerializer().serializeToString(svgEl);
    const blob = new Blob([svgStr], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `mermaid-${Date.now()}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 3000);
  } catch (e) {
    console.error("SVG 下载也失败:", e);
  }
};

/**
 * 为 .mermaid 容器添加下载按钮
 */
const ensureDownloadBtn = (container) => {
  if (container.querySelector(".mermaid-toolbar")) return;
  if (!container.querySelector("svg")) return;

  const toolbar = document.createElement("div");
  toolbar.className = "mermaid-toolbar";

  const btn = document.createElement("button");
  btn.className = "mermaid-tool-btn";
  btn.title = "下载为 PNG";
  btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>`;
  btn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    const svg = container.querySelector("svg");
    if (svg) downloadAsPng(svg);
  });

  toolbar.appendChild(btn);
  container.appendChild(toolbar);
};

/**
 * 初始化
 */
const initMermaidTools = () => {
  if (typeof document === "undefined") return;

  const contentEl = document.getElementById("page-content") || document.body;

  const addButtons = () => {
    document.querySelectorAll(".mermaid").forEach(ensureDownloadBtn);
  };

  // 多次轮询覆盖异步渲染
  const timers = [
    setTimeout(addButtons, 500),
    setTimeout(addButtons, 1500),
    setTimeout(addButtons, 3000),
    setTimeout(addButtons, 5000),
  ];

  // MutationObserver 监听 DOM 变化（Mermaid 异步渲染 / 主题切换重渲染）
  const observer = new MutationObserver(() => {
    clearTimeout(observer._timer);
    observer._timer = setTimeout(addButtons, 300);
  });
  observer.observe(contentEl, { childList: true, subtree: true });

  return () => {
    observer.disconnect();
    timers.forEach(clearTimeout);
  };
};

export default initMermaidTools;
