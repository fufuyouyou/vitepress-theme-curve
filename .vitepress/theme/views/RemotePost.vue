<!-- 文章页面 -->
<template>
  <div v-if="postMetaData?.id" class="post">
    <div class="post-meta">
      <div class="meta">
        <div class="categories">
          <a
            :href="`/pages/categories/${postMetaData.type}`"
            class="cat-item"
          >
            <i class="iconfont icon-folder" />
            <span class="name">{{ postMetaData.type }}</span>
          </a>
        </div>
        <div class="tags">
          <a
            v-for="(item, index) in (postMetaData.tags?.split(',') || [])"
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
              v-for="(item, index) in (postMetaData.tags?.split(',') || [])"
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
import MarkdownIt from "markdown-it";
import { formatTimestamp } from "@/utils/helper";
import initFancybox from "@/utils/initFancybox";
import { getArticle } from "@/api/data";
import markdownConfig from "@/utils/markdownConfig.mjs";

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

let md;
let highlighter = null;

const stripFrontMatter = (s) => {
  if (!s) return "";
  const m = s.match(/^---\s*[\r\n]+([\s\S]*?)[\r\n]+---\s*[\r\n]*/);
  return m ? s.slice(m[0].length) : s;
};

const initShiki = async () => {
  try {
    const shiki = await import("shiki");
    highlighter = await shiki.getSingletonHighlighter({
      themes: ["github-light", "github-dark"],
      langs: [
        "javascript",
        "typescript",
        "tsx",
        "jsx",
        "json",
        "yaml",
        "xml",
        "html",
        "shellscript",
        "java",
        "python",
        "vue",
        "css",
        "scss",
        "markdown",
      ],
    });
  } catch (e) {
    console.warn("Shiki 高亮初始化失败，使用纯文本回退", e);
    highlighter = null;
  }
};

const normalizeLang = (l) => {
  const s = (l || "text").toLowerCase();
  const map = {
    sh: "shellscript",
    shell: "shellscript",
    bash: "shellscript",
    yml: "yaml",
    js: "javascript",
    ts: "typescript",
    md: "markdown",
  };
  return map[s] || s;
};

const initCopyButtons = () => {
  const container = document.getElementById("page-content");
  if (!container) return;
  container.querySelectorAll('[class^="language-"] .copy').forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      // 优先使用渲染阶段注入的原始代码，避免复制到行号
      const raw = btn.dataset.code;
      let text = raw ? decodeURIComponent(raw) : "";
      if (!text) {
        const block = btn.closest('[class^="language-"]');
        const pre = block?.querySelector('pre');
        const codeEl = pre?.querySelector('code') || pre;
        if (!codeEl) return;
        const lineNodes = codeEl.querySelectorAll('.line');
        if (lineNodes.length) {
          text = Array.from(lineNodes)
            .map((l) => (l.textContent || '').replace(/\s+$/,''))
            .join("\n");
        } else {
          text = (codeEl.textContent || '').replace(/\s+$/,'');
        }
      }
      navigator.clipboard?.writeText(text).then(() => {
        btn.classList.add("copied");
        setTimeout(() => btn.classList.remove("copied"), 1200);
      });
    });
  });
};

const slugify = (text) => {
  const base = (text || "")
    .replace(/\u200B/g, "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-\u4e00-\u9fa5]/g, "");
  return base || "section";
};

const initHeadingAnchors = () => {
  const container = document.getElementById("page-content");
  if (!container) return;
  const headers = container.querySelectorAll('h2, h3');
  const used = new Map();
  headers.forEach((h) => {
    if (h.id && h.id.trim()) return;
    let id = slugify(h.textContent || "");
    if (used.has(id)) {
      const n = used.get(id) + 1;
      used.set(id, n);
      id = `${id}-${n}`;
    } else {
      used.set(id, 1);
    }
    h.id = id;
  });
};

const loadContent = () => {
  getArticle(props.articleId).then((res) => {
    Object.assign(postMetaData, res.data);
    loadMarkdown();
  })
};

const loadMarkdown = async () => {
  try {
    const mdText = postMetaData.content || "";
  const content = stripFrontMatter(mdText || "");
  html.value = md.render(content || "");
  await nextTick();
  initCopyButtons();
  initHeadingAnchors();
  } catch (error) {
    console.error("加载在线 Markdown 出错：", error);
  }
}

onMounted(async () => {
  await initShiki();
  md = new MarkdownIt({ html: true, linkify: true, breaks: false });
  // 使用 Shiki 统一代码块渲染（与本地文件更一致）
  md.renderer.rules.fence = (tokens, idx) => {
    const token = tokens[idx];
    const info = (token.info || "").trim();
    const lang = info || "text";
    const langNorm = normalizeLang(lang);
    const code = token.content || "";
    let preHtml = `<pre><code>${code.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</code></pre>`;
    if (highlighter) {
      const isDark = document.documentElement.classList.contains("dark");
      const themeName = isDark ? "github-dark" : "github-light";
      try {
        preHtml = highlighter.codeToHtml(code, { lang: langNorm, theme: themeName });
      } catch (e) {
        preHtml = `<pre><code>${code.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</code></pre>`;
      }
    }
    const lineCount = (code.match(/\n/g) || []).length + 1;
    const numbers = new Array(lineCount)
      .fill(0)
      .map((_, i) => `<span class="line-number">${i + 1}</span><br>`)
      .join("");
    const encoded = encodeURIComponent(code);
    return `<div class="language-${lang}" style="--shiki-light: var(--main-font-color); --shiki-dark: var(--main-font-color);"><button class="copy" data-code="${encoded}"></button><span class="lang">${lang}</span><span class="line-numbers-wrapper">${numbers}</span>${preHtml}</div>`;
  };
  markdownConfig(md, theme.value);
  initFancybox(theme.value);
  loadContent();
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
