<!-- 文章页面 -->
<template>
  <div v-if="postMetaData?.id" class="post">
    <div class="post-meta">
      <div class="meta">
        <div class="categories">
          <a :href="`/pages/categories/${postMetaData.type}`" class="cat-item">
            <i class="iconfont icon-folder" />
            <span class="name">{{ postMetaData.type }}</span>
          </a>
        </div>
        <div class="tags">
          <a
            v-for="(item, index) in postMetaData.tags?.split(',') || []"
            :key="index"
            :href="`/pages/tags/${item}`"
            class="tag-item"
          >
            <i class="iconfont icon-hashtag" />
            <span class="name">{{ item }}</span>
          </a>
        </div>
      </div>
      <h1 class="title">
        {{ postMetaData.title || "未命名文章" }}
      </h1>
      <div class="other-meta">
        <span class="meta date">
          <i class="iconfont icon-date" />
          {{ formatTimestamp(postMetaData.createDate) }}
        </span>
        <span class="update meta">
          <i class="iconfont icon-time" />
          {{ formatTimestamp(postMetaData.updateDate) }}
        </span>
      </div>
    </div>
    <div class="post-content">
      <article class="post-article s-card">
        <!-- 过期提醒 -->
        <div class="expired s-card" v-if="postMetaData?.expired >= 180">
          本文发表于 <strong>{{ postMetaData?.expired }}</strong> 天前，其中的信息可能已经事过境迁
        </div>
        <!-- AI 摘要 -->
        <ArticleGPT :postData="postMetaData" />
        <!-- 文章内容 -->
        <div id="page-content" class="markdown-main-style" v-html="html" />
        <!-- 参考资料 -->
        <References :postData="postMetaData" />
        <!-- 版权 -->
        <Copyright :postData="postMetaData" />
        <!-- 其他信息 -->
        <div class="other-meta">
          <div class="all-tags">
            <a
              v-for="(item, index) in postMetaData.tags?.split(',') || []"
              :key="index"
              :href="`/pages/tags/${item}`"
              class="tag-item"
            >
              <i class="iconfont icon-hashtag" />
              <span class="name">{{ item }}</span>
            </a>
          </div>
        </div>
        <!-- 相关文章 -->
        <RelatedPost :postData="postMetaData" />
        <!-- 评论 -->
        <Comments ref="commentRef" />
      </article>
      <Aside showToc />
    </div>
  </div>
</template>

<script setup>
import { formatTimestamp } from "@/utils/helper";
import initFancybox from "@/utils/initFancybox";
import { getArticle } from "@/api/data";

const props = defineProps({
  articleId: {
    type: [null, String],
    default: null,
  },
});

const route = useRoute();
const { theme, site } = useData();

// 评论元素
const commentRef = ref(null);
const html = ref("");

// 获取对应文章数据
const postMetaData = reactive({});

// 标准化语言名称（处理 bash/sh/shell 等）
const normalizeLang = (lang) => {
  if (!lang || lang === "text") return "text";
  const normalized = lang.toLowerCase();
  // bash/sh/shell/zsh 等都映射到 bash
  if (["bash", "sh", "shell", "zsh", "fish"].includes(normalized)) {
    return "bash";
  }
  return normalized;
};

// 获取当前主题对应的 Shiki 主题
const getShikiTheme = () => {
  const isDark =
    document.documentElement.classList.contains("dark") ||
    window.matchMedia("(prefers-color-scheme: dark)").matches;
  return isDark ? "github-dark" : "github-light";
};

const loadContent = () => {
  getArticle(props.articleId).then((res) => {
    Object.assign(postMetaData, res.data);
    loadMarkdown();
  });
};

// 处理代码块语法高亮
const highlightCodeBlocks = async (force = false) => {
  try {
    // 等待一下确保 DOM 已渲染
    await nextTick();

    // 使用更通用的选择器，确保能找到代码块
    const codeBlocks = document.querySelectorAll(
      '#page-content div[class*="language-"], .markdown-main-style div[class*="language-"]',
    );
    if (codeBlocks.length === 0) return;

    // 动态导入 Shiki
    const { codeToHtml } = await import("shiki");
    const currentTheme = getShikiTheme();

    for (const block of codeBlocks) {
      let lang = block.getAttribute("data-lang") || "text";
      const codeElement = block.querySelector("code");

      if (!codeElement) continue;

      // 标准化语言名称
      lang = normalizeLang(lang);

      // 获取原始代码内容（优先从 base64 获取，确保换行等信息完整）
      let rawCode = "";
      const base64Code = block.getAttribute("data-code-base64");
      if (base64Code) {
        try {
          rawCode = decodeURIComponent(escape(atob(base64Code)));
        } catch (e) {
          console.warn("解码 base64 代码失败:", e);
          rawCode = codeElement.textContent || codeElement.innerText;
        }
      } else {
        // 如果没有 base64，从元素获取（兼容旧数据）
        rawCode = codeElement.textContent || codeElement.innerText;
      }

      // 检查是否需要重新高亮（主题变化或强制刷新）
      const currentBlockTheme = block.getAttribute("data-theme");
      const needsRehighlight = force || !currentBlockTheme || currentBlockTheme !== currentTheme;

      if (lang === "text" || !rawCode.trim()) {
        setupCopyButton(block, codeElement);
        continue;
      }

      // 如果已经高亮且主题未变化，仍然需要确保样式正确
      if (!needsRehighlight && codeElement.querySelector(".line")) {
        // 即使已经高亮，也要确保样式正确应用
        await nextTick();

        // 确保行号存在且样式正确
        let lineNumbersWrapper = block.querySelector(".line-numbers-wrapper");
        if (!lineNumbersWrapper) {
          const preElement = block.querySelector("pre");
          if (preElement) {
            lineNumbersWrapper = document.createElement("div");
            lineNumbersWrapper.className = "line-numbers-wrapper";
            lineNumbersWrapper.style.padding = "6px 10px";

            const actualLines = codeElement.querySelectorAll(".line");
            for (let i = 1; i <= actualLines.length; i++) {
              const lineNumber = document.createElement("div");
              lineNumber.className = "line-number";
              lineNumber.textContent = i;
              lineNumber.style.display = "flex";
              lineNumber.style.alignItems = "center";
              lineNumber.style.justifyContent = "center";
              lineNumbersWrapper.appendChild(lineNumber);
            }

            preElement.parentNode.insertBefore(lineNumbersWrapper, preElement);
          }
        } else {
          // 更新现有行号的样式
          const lineNumbers = lineNumbersWrapper.querySelectorAll(".line-number");
          lineNumbers.forEach((lineNumber) => {
            lineNumber.style.display = "flex";
            lineNumber.style.alignItems = "center";
            lineNumber.style.justifyContent = "center";
          });
        }

        setupCopyButton(block, codeElement);
        continue;
      }

      try {
        // 计算行数（用于行号）
        const lineCount = rawCode.split("\n").length;

        // 使用 Shiki 高亮
        const highlighted = await codeToHtml(rawCode, {
          lang: lang,
          theme: currentTheme,
        });

        // 提取高亮后的代码内容
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = highlighted;
        const highlightedPre = tempDiv.querySelector("pre");
        const highlightedCode = highlightedPre?.querySelector("code");

        if (highlightedCode) {
          // 确保 code 元素有正确的样式类和样式
          codeElement.className = `language-${lang}`;

          // 获取 Shiki 返回的 HTML 内容
          codeElement.innerHTML = highlightedCode.innerHTML;

          // 添加或更新行号
          const preElement = block.querySelector("pre");
          let lineNumbersWrapper = block.querySelector(".line-numbers-wrapper");

          if (preElement) {
            // 如果行号已存在，先移除
            if (lineNumbersWrapper) {
              lineNumbersWrapper.remove();
            }

            // 创建行号容器
            lineNumbersWrapper = document.createElement("div");
            lineNumbersWrapper.className = "line-numbers-wrapper";

            // 获取实际的代码行元素
            const allLines = codeElement.querySelectorAll(".line");
            const actualLineCount = allLines.length;

            // 生成行号
            for (let i = 1; i <= actualLineCount; i++) {
              const lineNumber = document.createElement("div");
              lineNumber.className = "line-number";
              lineNumber.textContent = i;

              // 直接设置行号样式，确保高度一致
              // 确保行号内容垂直居中
              lineNumber.style.display = "flex";
              lineNumber.style.alignItems = "center";
              lineNumber.style.justifyContent = "center";

              lineNumbersWrapper.appendChild(lineNumber);
            }

            // 将行号插入到 pre 之前
            preElement.parentNode.insertBefore(lineNumbersWrapper, preElement);

            // 确保行号容器的样式
            lineNumbersWrapper.style.padding = "6px 10px";
          }

          // 标记当前使用的主题
          block.setAttribute("data-theme", currentTheme);
        }

        setupCopyButton(block, codeElement);
      } catch (error) {
        console.warn(`高亮代码块失败 (${lang}):`, error);

        // 等待 DOM 更新
        await nextTick();
        setupCopyButton(block, codeElement);
      }
    }
  } catch (error) {
    console.warn("代码块高亮处理失败:", error);
  }
};

// 设置复制按钮
const setupCopyButton = (block, codeElement) => {
  const copyButton = block.querySelector(".copy");
  if (!copyButton || !codeElement) return;

  // 移除之前的事件监听器（如果有）
  const newCopyButton = copyButton.cloneNode(true);
  copyButton.parentNode.replaceChild(newCopyButton, copyButton);

  newCopyButton.addEventListener("click", async () => {
    try {
      const code = codeElement.textContent || codeElement.innerText;
      await navigator.clipboard.writeText(code);
      newCopyButton.classList.add("copied");
      setTimeout(() => {
        newCopyButton.classList.remove("copied");
      }, 2000);
    } catch (error) {
      console.error("复制失败:", error);
    }
  });
};

const loadMarkdown = async () => {
  try {
    // 获取内容，可能字段名为 content、markdown、body、html 等
    const rawContent =
      postMetaData.content || postMetaData.markdown || postMetaData.body || postMetaData.html || "";

    if (!rawContent) {
      console.warn("未找到文章内容");
      html.value = "";
      return;
    }

    // 如果内容已经是 HTML，直接使用
    if (rawContent.trim().startsWith("<")) {
      html.value = rawContent;
      await nextTick();
      initFancybox(theme.value);
      return;
    }

    // 动态导入 markdown-it 和相关插件
    const [{ default: MarkdownIt }, { default: markdownItAttrs }, { default: container }] =
      await Promise.all([
        import("markdown-it"),
        import("markdown-it-attrs"),
        import("markdown-it-container"),
      ]);

    // 动态导入 tabs 插件
    let tabsMarkdownPlugin;
    try {
      const tabsModule = await import("vitepress-plugin-tabs");
      tabsMarkdownPlugin = tabsModule.tabsMarkdownPlugin || tabsModule.default;
    } catch (e) {
      console.warn("无法加载 tabs 插件:", e);
    }

    // 创建 markdown-it 实例
    const md = new MarkdownIt({
      html: true,
      linkify: true,
      typographer: true,
    });

    // 应用插件
    md.use(markdownItAttrs);
    if (tabsMarkdownPlugin) {
      md.use(tabsMarkdownPlugin);
    }

    // timeline 容器
    md.use(container, "timeline", {
      validate: (params) => params.trim().match(/^timeline\s+(.*)$/),
      render: (tokens, idx) => {
        const m = tokens[idx].info.trim().match(/^timeline\s+(.*)$/);
        if (tokens[idx].nesting === 1) {
          return `<div class="timeline">
                      <span class="timeline-title">${md.utils.escapeHtml(m[1])}</span>
                      <div class="timeline-content">`;
        } else {
          return "</div></div>\n";
        }
      },
    });

    // radio 容器
    md.use(container, "radio", {
      render: (tokens, idx, _options, env) => {
        const token = tokens[idx];
        const check = token.info.trim().slice("radio".length).trim();
        if (token.nesting === 1) {
          const isChecked = md.renderInline(check, {
            references: env.references,
          });
          return `<div class="radio">
            <div class="radio-point ${isChecked}" />`;
        } else {
          return "</div>";
        }
      },
    });

    // button 容器
    md.use(container, "button", {
      render: (tokens, idx, _options) => {
        const token = tokens[idx];
        const check = token.info.trim().slice("button".length).trim();
        if (token.nesting === 1) {
          return `<button class="button ${check}">`;
        } else {
          return "</button>";
        }
      },
    });

    // card 容器
    md.use(container, "card", {
      render: (tokens, idx, _options) => {
        const token = tokens[idx];
        if (token.nesting === 1) {
          return `<div class="card">`;
        } else {
          return "</div>";
        }
      },
    });

    // 表格容器
    md.renderer.rules.table_open = () => {
      return '<div class="table-container"><table>';
    };
    md.renderer.rules.table_close = () => {
      return "</table></div>";
    };

    // 图片处理
    md.renderer.rules.image = (tokens, idx) => {
      const token = tokens[idx];
      const src = token.attrs[token.attrIndex("src")][1];
      const alt = token.content;
      if (!theme.value.fancybox?.enable) {
        return `<img src="${src}" alt="${alt}" loading="lazy">`;
      }
      return `<a class="img-fancybox" href="${src}" data-fancybox="gallery" data-caption="${alt}">
                  <img class="post-img" src="${src}" alt="${alt}" loading="lazy" />
                  <span class="post-img-tip">${alt}</span>
                </a>`;
    };

    // 代码块和 obsidian admonition 处理
    const fence = md.renderer.rules.fence;
    md.renderer.rules.fence = (...args) => {
      const [tokens, idx] = args;
      const token = tokens[idx];
      const lang = token.info.trim();

      // 处理 Obsidian admonition
      if (lang.startsWith("ad-")) {
        const type = lang.substring(3);
        const content = token.content;

        const admonitionTypes = {
          note: "info",
          question: "info",
          warning: "warning",
          tip: "tip",
          summary: "info",
          hint: "tip",
          important: "warning",
          caution: "warning",
          error: "danger",
          danger: "danger",
        };

        const className = admonitionTypes[type] || "info";
        const title = type.toUpperCase();

        return `<div class="${className} custom-block">
              <p class="custom-block-title">${title}</p>
              <div class="custom-block-content">
                ${md.render(content)}
              </div>
        </div>`;
      }

      // 处理普通代码块 - 先渲染基本结构，稍后用 Shiki 高亮
      let content = token.content.trimEnd();

      const language = lang || "text";
      const escapedContent = md.utils.escapeHtml(content);

      // 标准化语言名称用于显示和高亮
      const normalizedLang = normalizeLang(language);
      // 保留原始语言名称用于显示
      const displayLang = language || "text";

      // 使用 Base64 编码保存原始代码内容
      const base64Content = btoa(unescape(encodeURIComponent(content)));

      return `<div class="language-${normalizedLang}" data-lang="${normalizedLang}" data-display-lang="${displayLang}" data-code-base64="${base64Content}">
        <span class="lang">${displayLang}</span>
        <button class="copy"></button>
        <pre><code class="language-${normalizedLang}">${escapedContent}</code></pre>
      </div>`;
    };

    // 渲染 markdown 为 HTML
    html.value = md.render(rawContent);

    // 等待 DOM 更新后处理代码块高亮和初始化 fancybox
    await nextTick();
    // 再等待一次，确保 DOM 完全渲染
    await new Promise((resolve) => setTimeout(resolve, 50));

    // 异步处理代码块语法高亮
    await highlightCodeBlocks();

    // 再次等待并重试一次，确保所有代码块都被处理
    await nextTick();
    await new Promise((resolve) => setTimeout(resolve, 50));
    await highlightCodeBlocks();

    initFancybox(theme.value);
  } catch (error) {
    console.error("渲染 markdown 失败:", error);
    // 如果渲染失败，尝试直接使用内容
    html.value =
      postMetaData.content || postMetaData.markdown || postMetaData.body || postMetaData.html || "";
  }
};

onMounted(async () => {
  loadContent();

  // 监听主题变化，重新高亮代码块
  const handleThemeChange = () => {
    highlightCodeBlocks(true);
  };

  // 监听 DOM 类名变化（主题切换）
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === "attributes" && mutation.attributeName === "class") {
        handleThemeChange();
      }
    });
  });

  // 观察 html 元素的 class 变化
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });

  // 监听系统主题变化
  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
  mediaQuery.addEventListener("change", handleThemeChange);

  // 组件卸载时清理
  onUnmounted(() => {
    observer.disconnect();
    mediaQuery.removeEventListener("change", handleThemeChange);
  });
});
</script>

<style lang="scss" scoped>
@use "../style/post.scss";

.post {
  width: 100%;
  display: flex;
  flex-direction: column;
  animation: fade-up 0.6s 0.1s backwards;

  .post-meta {
    padding: 2rem 0 3rem 18px;
    width: 100%;

    .meta {
      display: flex;
      flex-direction: row;
      align-items: center;

      .categories {
        margin-right: 12px;

        .cat-item {
          display: flex;
          flex-direction: row;
          align-items: center;
          padding: 6px 12px;
          font-size: 14px;
          font-weight: bold;
          border-radius: 8px;
          background-color: var(--main-mask-Inverse-background);
          opacity: 0.8;

          .iconfont {
            margin-right: 6px;
          }

          &:hover {
            color: var(--main-color);
            background-color: var(--main-color-bg);

            .iconfont {
              color: var(--main-color);
            }
          }
        }
      }

      .tags {
        display: flex;
        flex-direction: row;
        align-items: center;

        .tag-item {
          display: flex;
          flex-direction: row;
          align-items: center;
          padding: 6px 12px;
          font-size: 14px;
          font-weight: bold;
          border-radius: 8px;
          opacity: 0.8;

          .iconfont {
            margin-right: 4px;
            opacity: 0.6;
            font-weight: normal;
          }

          &:hover {
            color: var(--main-color);
            background-color: var(--main-color-bg);

            .iconfont {
              color: var(--main-color);
            }
          }
        }
      }
    }

    .title {
      font-size: 2.2rem;
      line-height: 1.2;
      color: var(--main-font-color);
      margin: 1.4rem 0;
    }

    .other-meta {
      display: flex;
      flex-direction: row;
      align-items: center;

      .meta {
        display: flex;
        flex-direction: row;
        align-items: center;
        padding: 6px 12px;
        font-size: 14px;
        border-radius: 8px;
        opacity: 0.8;

        .iconfont {
          margin-right: 6px;
          transition: color 0.3s;
        }

        &.date {
          padding-left: 0;
        }

        &.hot {
          .iconfont {
            font-size: 18px;
          }
        }

        &.hover {
          transition:
            color 0.3s,
            background-color 0.3s;
          cursor: pointer;

          &:hover {
            color: var(--main-color);
            background-color: var(--main-color-bg);

            .iconfont {
              color: var(--main-color);
            }
          }
        }
      }
    }
  }

  .post-content {
    width: 100%;
    display: flex;
    flex-direction: row;
    animation: fade-up 0.6s 0.3s backwards;

    .post-article {
      width: calc(100% - 300px);
      padding: 1rem 2.2rem 2.2rem 2.2rem;
      user-select: text;
      cursor: auto;

      &:hover {
        border-color: var(--main-card-border);
      }

      .expired {
        margin: 1.2rem 0 2rem 0;
        padding: 0.8rem 1.2rem;
        border-left: 6px solid var(--main-warning-color);
        border-radius: 6px 16px 16px 6px;
        user-select: none;

        strong {
          color: var(--main-warning-color);
        }
      }

      .other-meta {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
        margin: 2rem 0;
        opacity: 0.8;

        .all-tags {
          display: flex;
          flex-direction: row;
          align-items: center;

          .tag-item {
            display: flex;
            flex-direction: row;
            align-items: center;
            padding: 6px 12px;
            font-size: 14px;
            font-weight: bold;
            border-radius: 8px;
            background-color: var(--main-card-border);
            margin-right: 12px;

            .iconfont {
              margin-right: 4px;
              opacity: 0.6;
              font-weight: normal;
            }

            &:hover {
              color: var(--main-color);
              background-color: var(--main-color-bg);

              .iconfont {
                color: var(--main-color);
              }
            }
          }
        }

        .report {
          display: flex;
          flex-direction: row;
          align-items: center;
          padding: 6px 12px;
          font-size: 14px;
          font-weight: bold;
          border-radius: 8px;
          background-color: var(--main-card-border);

          .iconfont {
            margin-right: 6px;
          }

          &:hover {
            color: #efefef;
            background-color: var(--main-error-color);

            .iconfont {
              color: #efefef;
            }
          }
        }
      }
    }

    .main-aside {
      width: 300px;
      padding-left: 1rem;
    }

    @media (max-width: 1200px) {
      .post-article {
        width: 100%;
      }
      .main-aside {
        display: none;
      }
    }
  }

  @media (max-width: 768px) {
    .post-meta {
      padding: 4rem 1.5rem;

      .meta {
        justify-content: center;

        .categories {
          margin-right: 0;
        }

        .tags {
          display: none;
        }
      }

      .title {
        font-size: 1.6rem;
        text-align: center;
        line-height: 40px;
      }

      .other-meta {
        justify-content: center;
      }
    }
    .post-content {
      .post-article {
        border: none;
        padding: 20px 30px;

        .other-meta {
          margin: 1rem 0 2rem 0;
          flex-direction: column;

          .all-tags {
            flex-wrap: wrap;

            .tag-item {
              margin-top: 12px;
            }
          }

          .report {
            margin-top: 20px;
          }
        }
      }
    }
  }
}
</style>
