// .vitepress/config.mjs
import { defineConfig } from "file:///F:/suzhibin/blog/node_modules/vitepress/dist/node/index.js";

// .vitepress/theme/utils/generateRSS.mjs
import { createContentLoader } from "file:///F:/suzhibin/blog/node_modules/vitepress/dist/node/index.js";
import { writeFileSync } from "fs";
import { Feed } from "file:///F:/suzhibin/blog/node_modules/feed/lib/feed.js";
import path from "path";
var createRssFile = async (config, themeConfig3) => {
  const siteMeta = themeConfig3.siteMeta;
  const hostLink = siteMeta.site;
  const feed = new Feed({
    title: siteMeta.title,
    description: siteMeta.description,
    id: hostLink,
    link: hostLink,
    language: "zh",
    generator: siteMeta.author.name,
    favicon: siteMeta.author.cover,
    copyright: `Copyright \xA9 2020-present ${siteMeta.author.name}`,
    updated: /* @__PURE__ */ new Date()
  });
  let posts = await createContentLoader("posts/**/*.md", {
    render: true
  }).load();
  posts = posts.sort((a, b) => {
    const dateA = new Date(a.frontmatter.date);
    const dateB = new Date(b.frontmatter.date);
    return dateB - dateA;
  });
  for (const { url, frontmatter } of posts) {
    if (feed.items.length >= 10) break;
    let { title, description, date } = frontmatter;
    if (typeof date === "string") date = new Date(date);
    feed.addItem({
      title,
      id: `${hostLink}${url}`,
      link: `${hostLink}${url}`,
      description,
      date,
      // updated,
      author: [
        {
          name: siteMeta.author.name,
          email: siteMeta.author.email,
          link: siteMeta.author.link
        }
      ]
    });
  }
  writeFileSync(path.join(config.outDir, "rss.xml"), feed.rss2(), "utf-8");
};

// .vitepress/config.mjs
import { withPwa } from "file:///F:/suzhibin/blog/node_modules/@vite-pwa/vitepress/dist/index.mjs";

// .vitepress/theme/utils/commonTools.mjs
import { load } from "file:///F:/suzhibin/blog/node_modules/cheerio/lib/esm/index.js";
var jumpRedirect = (html, themeConfig3, isDom = false) => {
  try {
    const isDev = process.env.NODE_ENV === "development";
    if (isDev) return false;
    if (!themeConfig3.jumpRedirect.enable) return html;
    const redirectPage = "/redirect";
    const excludeClass = themeConfig3.jumpRedirect.exclude;
    if (isDom) {
      if (typeof window === "undefined" || typeof document === "undefined") return false;
      const allLinks = [...document.getElementsByTagName("a")];
      if (allLinks?.length === 0) return false;
      allLinks.forEach((link) => {
        if (link.getAttribute("target") === "_blank") {
          if (excludeClass.some((className) => link.classList.contains(className))) {
            return false;
          }
          const linkHref = link.getAttribute("href");
          if (linkHref && !linkHref.includes(redirectPage)) {
            const encodedHref = btoa(linkHref);
            const redirectLink = `${redirectPage}?url=${encodedHref}`;
            link.setAttribute("original-href", linkHref);
            link.setAttribute("href", redirectLink);
          }
        }
      });
    } else {
      const $ = load(html);
      $("a[target='_blank']").each((_, el) => {
        const $a = $(el);
        const href = $a.attr("href");
        const classesStr = $a.attr("class");
        const innerText = $a.text();
        const classes = classesStr ? classesStr.trim().split(" ") : [];
        if (excludeClass.some((className) => classes.includes(className))) {
          return;
        }
        if (href && !href.includes(redirectPage)) {
          const encodedHref = Buffer.from(href, "utf-8").toString("base64");
          const attributes = el.attribs;
          let attributesStr = "";
          for (let attr in attributes) {
            if (Object.prototype.hasOwnProperty.call(attributes, attr)) {
              attributesStr += ` ${attr}="${attributes[attr]}"`;
            }
          }
          const newLink = `<a href="${redirectPage}?url=${encodedHref}" original-href="${href}" ${attributesStr}>${innerText}</a>`;
          $a.replaceWith(newLink);
        }
      });
      return $.html();
    }
  } catch (error) {
    console.error("\u5904\u7406\u94FE\u63A5\u65F6\u51FA\u9519\uFF1A", error);
  }
};

// .vitepress/theme/assets/themeConfig.mjs
var themeConfig = {
  // 站点信息
  siteMeta: {
    // 站点标题
    title: "\u7D20\u8FD8\u771F",
    // 站点描述
    description: "\u8BB0\u5F55\u4E00\u4E9B\u6709\u8DA3\u7684\u4E1C\u897F",
    // 站点logo
    logo: "/images/logo/favicon.png",
    // 站点地址
    site: "https://blog.suzhibin.cn",
    // 语言
    lang: "zh-CN",
    // 作者
    author: {
      name: "\u7D20\u8FD8\u771F",
      cover: "/images/logo/logo.png",
      email: "18735880447@139.com",
      link: "https://suzhibin.cn"
    }
  },
  // 备案信息
  icp: "\u664BICP\u59072025070551\u53F7-1",
  // 建站日期
  since: "2025-12-01",
  // 每页文章数据
  postSize: 10,
  // inject
  inject: {
    // 头部
    // https://vitepress.dev/zh/reference/site-config#head
    header: [
      // favicon
      ["link", { rel: "icon", href: "/favicon.ico" }],
      // RSS
      [
        "link",
        {
          rel: "alternate",
          type: "application/rss+xml",
          title: "RSS",
          href: "https://blog.imsyy.top/rss.xml"
        }
      ],
      // 预载 CDN
      [
        "link",
        {
          crossorigin: "",
          rel: "preconnect",
          href: "https://s1.hdslb.com"
        }
      ],
      [
        "link",
        {
          crossorigin: "",
          rel: "preconnect",
          href: "https://mirrors.sustech.edu.cn"
        }
      ],
      // HarmonyOS font
      [
        "link",
        {
          crossorigin: "anonymous",
          rel: "stylesheet",
          href: "https://s1.hdslb.com/bfs/static/jinkela/long/font/regular.css"
        }
      ],
      [
        "link",
        {
          crossorigin: "anonymous",
          rel: "stylesheet",
          href: "https://mirrors.sustech.edu.cn/cdnjs/ajax/libs/lxgw-wenkai-screen-webfont/1.7.0/style.css"
        }
      ],
      // iconfont
      [
        "link",
        {
          crossorigin: "anonymous",
          rel: "stylesheet",
          href: "https://cdn2.codesign.qq.com/icons/g5ZpEgx3z4VO6j2/latest/iconfont.css"
        }
      ],
      // Embed code
      ["link", { rel: "preconnect", href: "https://use.sevencdn.com" }],
      ["link", { rel: "preconnect", href: "https://fonts.gstatic.com", crossorigin: "" }],
      [
        "link",
        {
          crossorigin: "anonymous",
          href: "https://use.sevencdn.com/css2?family=Fira+Code:wght@300..700&display=swap",
          rel: "stylesheet"
        }
      ],
      // 预载 DocSearch
      [
        "link",
        {
          href: "https://X5EBEZB53I-dsn.algolia.net",
          rel: "preconnect",
          crossorigin: ""
        }
      ]
    ]
  },
  // 导航栏菜单
  nav: [
    {
      text: "\u6587\u5E93",
      items: [
        { text: "\u6587\u7AE0\u5217\u8868", link: "/pages/archives", icon: "article" },
        { text: "\u5168\u90E8\u5206\u7C7B", link: "/pages/categories", icon: "folder" },
        { text: "\u5168\u90E8\u6807\u7B7E", link: "/pages/tags", icon: "hashtag" }
      ]
    },
    {
      text: "\u4E13\u680F",
      items: [
        { text: "\u6280\u672F\u5206\u4EAB", link: "/pages/categories/\u6280\u672F\u5206\u4EAB", icon: "code" },
        { text: "\u8FD0\u7EF4\u7B14\u8BB0", link: "/pages/categories/\u8FD0\u7EF4\u7B14\u8BB0", icon: "technical" },
        { text: "\u65E5\u5E38\u968F\u7B14", link: "/pages/categories/\u65E5\u5E38\u968F\u7B14", icon: "date" }
      ]
    }
  ],
  // 导航栏菜单 - 左侧
  navMore: [
    {
      name: "\u7F51\u7AD9\u5217\u8868",
      list: [
        {
          icon: "/images/home.png",
          name: "\u4E3B\u9875",
          url: "https://suzhibin.cn"
        },
        {
          icon: "/images/nav.png",
          name: "\u5BFC\u822A",
          url: "https://nav.suzhibin.cn"
        },
        {
          icon: "/images/tools.png",
          name: "\u5DE5\u5177",
          url: "https://tools.suzhibin.cn"
        },
        {
          icon: "/images/tv.png",
          name: "\u5F71\u89C6",
          url: "https://tv.suzhibin.cn"
        },
        {
          icon: "/images/book.png",
          name: "\u4E66\u7C4D",
          url: "https://book.suzhibin.cn"
        }
      ]
    }
  ],
  // 封面配置
  cover: {
    // 是否开启双栏布局
    twoColumns: false,
    // 是否开启封面显示
    showCover: {
      // 是否开启封面显示 文章不设置cover封面会显示异常，可以设置下方默认封面
      enable: false,
      // 封面布局方式: left | right | both
      coverLayout: "both",
      // 默认封面(随机展示)
      defaultCover: []
    }
  },
  // 页脚信息
  footer: {
    // 社交链接（请确保为偶数个）
    social: [
      {
        icon: "github",
        link: "https://github.com/fufuyouyou"
      },
      {
        icon: "bilibili",
        link: "https://space.bilibili.com/242547598"
      },
      {
        icon: "qq",
        link: "https://res.abeim.cn/api/qq/?qq=1242066854"
      },
      {
        icon: "email",
        link: "mailto:18735880447@139.com"
      }
    ],
    // sitemap
    sitemap: []
  },
  // 评论
  comment: {
    enable: true,
    // 评论系统选择
    // artalk / twikoo
    type: "artalk",
    // artalk
    // https://artalk.js.org/
    artalk: {
      site: "\u7D20\u8FD8\u771F",
      server: "https://comment.suzhibin.cn",
      siteUrl: "https://blog.suzhibin.cn"
    },
    // twikoo
    // https://twikoo.js.org/
    twikoo: {
      // 必填，若不想使用 CDN，可以使用 pnpm add twikoo 安装并引入
      js: "https://mirrors.sustech.edu.cn/cdnjs/ajax/libs/twikoo/1.6.39/twikoo.all.min.js",
      envId: "",
      // 环境地域，默认为 ap-shanghai，腾讯云环境填 ap-shanghai 或 ap-guangzhou；Vercel 环境不填
      region: "ap-shanghai",
      lang: "zh-CN"
    }
  },
  // 侧边栏
  aside: {
    // 站点简介
    hello: {
      enable: true,
      text: "\u975E\u543E\u5C0F\u5929\u4E0B\uFF0C\u624D\u9AD8\u800C\u5DF2\uFF1B\u975E\u543E\u7EB5\u53E4\u4ECA\uFF0C\u65F6\u8D4B\u800C\u5DF2\uFF1B\u975E\u543E\u7768\u4E5D\u5DDE\uFF0C\u5B8F\u89C2\u800C\u5DF2\uFF1B\u4E09\u975E\u7109\u7F6A\uFF1F\u65E0\u68A6\u81F3\u80DC\u3002"
    },
    // 目录
    toc: {
      enable: true
    },
    // 标签
    tags: {
      enable: true
    },
    // 倒计时
    countDown: {
      enable: true,
      // 倒计时日期
      data: {
        name: "\u6625\u8282",
        date: "2026-02-16"
      }
    },
    // 站点数据
    siteData: {
      enable: true
    }
  },
  // 友链
  friends: {
    // 友链朋友圈
    circleOfFriends: "",
    // 动态友链
    dynamicLink: {
      server: "",
      app_token: "",
      table_id: ""
    }
  },
  // 音乐播放器
  // https://github.com/imsyy/Meting-API
  music: {
    enable: false,
    // url
    url: "https://api-meting.example.com",
    // id
    id: 9379831714,
    // netease / tencent / kugou
    server: "netease",
    // playlist / album / song
    type: "playlist"
  },
  // 搜索
  // https://www.algolia.com/
  search: {
    enable: false,
    appId: "",
    apiKey: ""
  },
  // 打赏
  rewardData: {
    enable: false,
    // 微信二维码
    wechat: "https://pic.efefee.cn/uploads/2024/04/07/66121049d1e80.webp",
    // 支付宝二维码
    alipay: "https://pic.efefee.cn/uploads/2024/04/07/661206631d3b5.webp"
  },
  // 图片灯箱
  fancybox: {
    enable: true,
    js: "https://mirrors.sustech.edu.cn/cdnjs/ajax/libs/fancyapps-ui/5.0.36/fancybox/fancybox.umd.min.js",
    css: "https://mirrors.sustech.edu.cn/cdnjs/ajax/libs/fancyapps-ui/5.0.36/fancybox/fancybox.min.css"
  },
  // 外链中转
  jumpRedirect: {
    enable: false,
    // 排除类名
    exclude: [
      "cf-friends-link",
      "upyun",
      "icp",
      "author",
      "rss",
      "cc",
      "power",
      "social-link",
      "link-text",
      "travellings",
      "post-link",
      "report",
      "more-link",
      "skills-item",
      "right-menu-link",
      "link-card"
    ]
  },
  // 站点统计
  tongji: {
    "51la": ""
  }
};

// .vitepress/init.mjs
import { existsSync } from "fs";
import path2 from "path";
var __vite_injected_original_dirname = "F:\\suzhibin\\blog\\.vitepress";
var getThemeConfig = async () => {
  try {
    const configPath = path2.resolve(__vite_injected_original_dirname, "../themeConfig.mjs");
    if (existsSync(configPath)) {
      const userConfig = await import("../themeConfig.mjs");
      return Object.assign(themeConfig, userConfig?.themeConfig || {});
    } else {
      console.warn("User configuration file not found, using default themeConfig.");
      return themeConfig;
    }
  } catch (error) {
    console.error("An error occurred while loading the configuration:", error);
    return themeConfig;
  }
};

// .vitepress/theme/utils/markdownConfig.mjs
import { tabsMarkdownPlugin } from "file:///F:/suzhibin/blog/node_modules/vitepress-plugin-tabs/dist/index.js";
import markdownItAttrs from "file:///F:/suzhibin/blog/node_modules/markdown-it-attrs/index.js";
import container from "file:///F:/suzhibin/blog/node_modules/markdown-it-container/index.mjs";
var markdownConfig = (md, themeConfig3) => {
  md.use(markdownItAttrs);
  md.use(tabsMarkdownPlugin);
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
    }
  });
  md.use(container, "radio", {
    render: (tokens, idx, _options, env) => {
      const token = tokens[idx];
      const check = token.info.trim().slice("radio".length).trim();
      if (token.nesting === 1) {
        const isChecked = md.renderInline(check, {
          references: env.references
        });
        return `<div class="radio">
          <div class="radio-point ${isChecked}" />`;
      } else {
        return "</div>";
      }
    }
  });
  md.use(container, "button", {
    render: (tokens, idx, _options) => {
      const token = tokens[idx];
      const check = token.info.trim().slice("button".length).trim();
      if (token.nesting === 1) {
        return `<button class="button ${check}">`;
      } else {
        return "</button>";
      }
    }
  });
  md.use(container, "card", {
    render: (tokens, idx, _options) => {
      const token = tokens[idx];
      if (token.nesting === 1) {
        return `<div class="card">`;
      } else {
        return "</div>";
      }
    }
  });
  md.renderer.rules.table_open = () => {
    return '<div class="table-container"><table>';
  };
  md.renderer.rules.table_close = () => {
    return "</table></div>";
  };
  md.renderer.rules.image = (tokens, idx) => {
    const token = tokens[idx];
    const src = token.attrs[token.attrIndex("src")][1];
    const alt = token.content;
    if (!themeConfig3.fancybox.enable) {
      return `<img src="${src}" alt="${alt}" loading="lazy">`;
    }
    return `<a class="img-fancybox" href="${src}" data-fancybox="gallery" data-caption="${alt}">
                <img class="post-img" src="${src}" alt="${alt}" loading="lazy" />
                <span class="post-img-tip">${alt}</span>
              </a>`;
  };
  const fence = md.renderer.rules.fence;
  md.renderer.rules.fence = (...args) => {
    const [tokens, idx] = args;
    const token = tokens[idx];
    const lang = token.info.trim();
    if (lang.startsWith("ad-")) {
      const type = lang.substring(3);
      const content = token.content;
      const admonitionTypes = {
        "note": "info",
        "question": "info",
        "warning": "warning",
        "tip": "tip",
        "summary": "info",
        "hint": "tip",
        "important": "warning",
        "caution": "warning",
        "error": "danger",
        "danger": "danger"
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
    return fence(...args);
  };
};
var markdownConfig_default = markdownConfig;

// .vitepress/config.mjs
import AutoImport from "file:///F:/suzhibin/blog/node_modules/unplugin-auto-import/dist/vite.js";
import Components from "file:///F:/suzhibin/blog/node_modules/unplugin-vue-components/dist/vite.js";
import path3 from "path";

// .vitepress/theme/utils/request.ts
import axios from "file:///F:/suzhibin/blog/node_modules/axios/index.js";
var errorHandler = (error) => {
  console.log("error", error);
  let errorCode = error.code;
  if (errorCode == "ERR_NETWORK") {
    console.error("\u7F51\u7EDC\u94FE\u63A5\u9519\u8BEF");
    return Promise.reject(error);
  }
  let status = error.response.status;
  if (error.response) {
    const { message } = error.response.data;
    if (status === 403) {
      console.error(message || "\u672A\u6388\u6743");
    } else if (status === 404) {
      console.error("\u8BF7\u6C42\u7684\u9875\u9762\uFF08\u8D44\u6E90\uFF09\u4E0D\u5B58\u5728" + error.request.responseURL);
    } else if (status === 401) {
      console.error(message || "\u672A\u6388\u6743");
    } else if (status === 500) {
      console.error(message || "\u670D\u52A1\u9519\u8BEF");
    }
    return Promise.reject(error);
  }
};
var request = axios.create({
  baseURL: "https://manage.suzhibin.cn/manage-api",
  // baseURL: 'http://127.0.0.1:8080/manage-api',
  timeout: 1e4,
  // 超时时间，10s
  withCredentials: true,
  validateStatus(status) {
    return status >= 200 && status < 300;
  }
});
request.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return errorHandler(error);
  }
);
request.interceptors.response.use(
  (response) => {
    if (response.config.responseType === "blob") {
      return response;
    } else {
      return Object.assign({ success: false }, response.data);
    }
  },
  (error) => {
    return errorHandler(error);
  }
);
var request_default = request;

// .vitepress/theme/utils/apikey.ts
import CryptoJS from "file:///F:/suzhibin/blog/node_modules/crypto-js/index.js";
var apiKey = "sk_eb37a07a44b844f8851c9dae7671af09";
var secretKey = "ufh7ndwPAUmmlNOSzKQmzA2mVzznZlmAP6LhgS5s5no=";
function buildCanonicalQuery(params) {
  if (!params) return "";
  const keys = Object.keys(params).filter((k) => params[k] !== void 0 && params[k] !== null);
  keys.sort();
  return keys.map((k) => `${k}=${params[k]}`).join("&");
}
function hmacHex(text, secretKey2) {
  return CryptoJS.HmacSHA256(text, secretKey2).toString(CryptoJS.enc.Hex);
}
async function apiKeyRequest(options) {
  const { url, method = "get", params, data } = options;
  const ts = Math.floor(Date.now()).toString();
  const nonce = Math.random().toString(36).slice(2) + Date.now();
  const canonical = buildCanonicalQuery(params);
  const payload = `${method.toUpperCase()}
${url}
${canonical}
${ts}
${nonce}`;
  const signature = hmacHex(payload, secretKey);
  return request_default({
    url,
    method,
    params,
    data,
    headers: {
      isToken: false,
      "API-Key": apiKey,
      "Timestamp": ts,
      "Nonce": nonce,
      "Signature": signature
    }
  });
}

// .vitepress/theme/api/data.js
var listType = () => {
  return apiKeyRequest({
    url: "/blog/api/listType",
    method: "get"
  });
};
var listLabel = () => {
  return apiKeyRequest({
    url: "/blog/api/listLabel",
    method: "get"
  });
};
var pageArticle = (page, data) => {
  return apiKeyRequest({
    url: "/blog/api/pageArticle",
    method: "post",
    params: page,
    data
  });
};
var countByYear = () => {
  return apiKeyRequest({
    url: "/blog/api/countByYear",
    method: "get"
  });
};

// .vitepress/config.mjs
var __vite_injected_original_dirname2 = "F:\\suzhibin\\blog\\.vitepress";
var createDynamicPathsRefresher = () => {
  const files = {
    article: path3.resolve(process.cwd(), "pages", "article", "[id].paths.mjs"),
    tags: path3.resolve(process.cwd(), "pages", "tags", "[name].paths.mjs"),
    categories: path3.resolve(process.cwd(), "pages", "categories", "[name].paths.mjs"),
    pageNum: path3.resolve(process.cwd(), "page", "[num].paths.mjs")
  };
  const prev = { article: "", tags: "", categories: "", pageNum: "" };
  return {
    name: "vitepress-dynamic-paths-refresher",
    apply: "serve",
    configureServer(server) {
      const invalidate = (file) => {
        const mods = server.moduleGraph.getModulesByFile(file);
        if (mods) {
          for (const m of mods) server.moduleGraph.invalidateModule(m);
        }
      };
      const check = async () => {
        let changed = false;
        try {
          const { data: articleData } = await pageArticle({ pageNo: 1, pageSize: -1 }, {});
          const articleDigest = JSON.stringify(articleData);
          if (prev.article && prev.article !== articleDigest) {
            invalidate(files.article);
            changed = true;
          }
          prev.article = articleDigest;
          try {
            const theme = await getThemeConfig();
            const postsPerPage = theme.postSize;
            const pageDigest = `${articleData?.length || 0}:${postsPerPage}`;
            if (prev.pageNum && prev.pageNum !== pageDigest) {
              invalidate(files.pageNum);
              changed = true;
            }
            prev.pageNum = pageDigest;
          } catch (e) {
          }
        } catch (e) {
        }
        try {
          const { data: tagsData2 } = await listLabel();
          const tagsDigest = JSON.stringify(tagsData2);
          if (prev.tags && prev.tags !== tagsDigest) {
            invalidate(files.tags);
            changed = true;
          }
          prev.tags = tagsDigest;
        } catch (e) {
        }
        try {
          const { data: categoriesData2 } = await listType();
          const categoriesDigest = JSON.stringify(categoriesData2);
          if (prev.categories && prev.categories !== categoriesDigest) {
            invalidate(files.categories);
            changed = true;
          }
          prev.categories = categoriesDigest;
        } catch (e) {
        }
        if (changed) server.ws.send({ type: "full-reload" });
      };
      check();
      const timer = setInterval(check, 60 * 60 * 1e3);
      server.httpServer?.on("close", () => clearInterval(timer));
    }
  };
};
var { data: postData } = await pageArticle({ pageNo: 1, pageSize: -1 }, {});
var { data: categoriesData } = await listType();
var { data: tagsData } = await listLabel();
var { data: archivesData } = await countByYear();
var themeConfig2 = await getThemeConfig();
var config_default = withPwa(
  defineConfig({
    title: themeConfig2.siteMeta.title,
    description: themeConfig2.siteMeta.description,
    lang: themeConfig2.siteMeta.lang,
    // 简洁的 URL
    cleanUrls: true,
    // 最后更新时间戳
    lastUpdated: true,
    // 主题
    appearance: "dark",
    // Head
    head: themeConfig2.inject.header,
    // sitemap
    sitemap: {
      hostname: themeConfig2.siteMeta.site
    },
    // 主题配置
    themeConfig: {
      ...themeConfig2,
      // 必要数据
      postData,
      tagsData,
      categoriesData,
      archivesData
    },
    // markdown
    markdown: {
      math: true,
      lineNumbers: true,
      toc: { level: [1, 2, 3] },
      image: {
        lazyLoading: true
      },
      config: (md) => markdownConfig_default(md, themeConfig2)
    },
    // 构建排除
    srcExclude: ["**/README.md", "**/TODO.md"],
    // transformHead
    transformPageData: async (pageData) => {
      const canonicalUrl = `${themeConfig2.siteMeta.site}/${pageData.relativePath}`.replace(/index\.md$/, "").replace(/\.md$/, "");
      pageData.frontmatter.head ??= [];
      pageData.frontmatter.head.push(["link", { rel: "canonical", href: canonicalUrl }]);
    },
    // transformHtml
    transformHtml: (html) => {
      return jumpRedirect(html, themeConfig2);
    },
    // buildEnd
    buildEnd: async (config) => {
      await createRssFile(config, themeConfig2);
    },
    // vite
    vite: {
      plugins: [
        AutoImport({
          imports: ["vue", "vitepress"],
          dts: ".vitepress/auto-imports.d.ts"
        }),
        Components({
          dirs: [".vitepress/theme/components", ".vitepress/theme/views"],
          extensions: ["vue", "md"],
          include: [/\.vue$/, /\.vue\?vue/, /\.md$/],
          dts: ".vitepress/components.d.ts"
        }),
        createDynamicPathsRefresher()
      ],
      resolve: {
        // 配置路径别名
        alias: {
          // eslint-disable-next-line no-undef
          "@": path3.resolve(__vite_injected_original_dirname2, "./theme")
        }
      },
      css: {
        preprocessorOptions: {
          scss: {
            silenceDeprecations: ["legacy-js-api"]
          }
        }
      },
      // 服务器
      server: {
        port: 9877
      },
      // 构建
      build: {
        minify: "terser",
        terserOptions: {
          compress: {
            pure_funcs: ["console.log"]
          }
        }
      }
    },
    // PWA
    pwa: {
      registerType: "autoUpdate",
      selfDestroying: true,
      workbox: {
        clientsClaim: true,
        skipWaiting: true,
        cleanupOutdatedCaches: true,
        // 资源缓存
        runtimeCaching: [
          {
            urlPattern: /(.*?)\.(woff2|woff|ttf|css)/,
            handler: "CacheFirst",
            options: {
              cacheName: "file-cache"
            }
          },
          {
            urlPattern: /(.*?)\.(ico|webp|png|jpe?g|svg|gif|bmp|psd|tiff|tga|eps)/,
            handler: "CacheFirst",
            options: {
              cacheName: "image-cache"
            }
          },
          {
            urlPattern: /^https:\/\/cdn2\.codesign\.qq\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "iconfont-cache",
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 2
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ],
        // 缓存文件
        globPatterns: ["**/*.{js,css,html,ico,png,jpg,jpeg,gif,svg,woff2,ttf}"],
        // 排除路径
        navigateFallbackDenylist: [/^\/sitemap.xml$/, /^\/rss.xml$/, /^\/robots.txt$/]
      },
      manifest: {
        name: themeConfig2.siteMeta.title,
        short_name: themeConfig2.siteMeta.title,
        description: themeConfig2.siteMeta.description,
        display: "standalone",
        start_url: "/",
        theme_color: "#fff",
        background_color: "#efefef"
      }
    }
  })
);
export {
  config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLnZpdGVwcmVzcy9jb25maWcubWpzIiwgIi52aXRlcHJlc3MvdGhlbWUvdXRpbHMvZ2VuZXJhdGVSU1MubWpzIiwgIi52aXRlcHJlc3MvdGhlbWUvdXRpbHMvY29tbW9uVG9vbHMubWpzIiwgIi52aXRlcHJlc3MvdGhlbWUvYXNzZXRzL3RoZW1lQ29uZmlnLm1qcyIsICIudml0ZXByZXNzL2luaXQubWpzIiwgIi52aXRlcHJlc3MvdGhlbWUvdXRpbHMvbWFya2Rvd25Db25maWcubWpzIiwgIi52aXRlcHJlc3MvdGhlbWUvdXRpbHMvcmVxdWVzdC50cyIsICIudml0ZXByZXNzL3RoZW1lL3V0aWxzL2FwaWtleS50cyIsICIudml0ZXByZXNzL3RoZW1lL2FwaS9kYXRhLmpzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiRjpcXFxcc3V6aGliaW5cXFxcYmxvZ1xcXFwudml0ZXByZXNzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJGOlxcXFxzdXpoaWJpblxcXFxibG9nXFxcXC52aXRlcHJlc3NcXFxcY29uZmlnLm1qc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vRjovc3V6aGliaW4vYmxvZy8udml0ZXByZXNzL2NvbmZpZy5tanNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tIFwidml0ZXByZXNzXCI7XG5pbXBvcnQgeyBjcmVhdGVSc3NGaWxlIH0gZnJvbSBcIi4vdGhlbWUvdXRpbHMvZ2VuZXJhdGVSU1MubWpzXCI7XG5pbXBvcnQgeyB3aXRoUHdhIH0gZnJvbSBcIkB2aXRlLXB3YS92aXRlcHJlc3NcIjtcbmltcG9ydCB7IGp1bXBSZWRpcmVjdCB9IGZyb20gXCIuL3RoZW1lL3V0aWxzL2NvbW1vblRvb2xzLm1qc1wiO1xuaW1wb3J0IHsgZ2V0VGhlbWVDb25maWcgfSBmcm9tIFwiLi9pbml0Lm1qc1wiO1xuaW1wb3J0IG1hcmtkb3duQ29uZmlnIGZyb20gXCIuL3RoZW1lL3V0aWxzL21hcmtkb3duQ29uZmlnLm1qc1wiO1xuaW1wb3J0IEF1dG9JbXBvcnQgZnJvbSBcInVucGx1Z2luLWF1dG8taW1wb3J0L3ZpdGVcIjtcbmltcG9ydCBDb21wb25lbnRzIGZyb20gXCJ1bnBsdWdpbi12dWUtY29tcG9uZW50cy92aXRlXCI7XG5pbXBvcnQgcGF0aCBmcm9tIFwicGF0aFwiO1xuaW1wb3J0IHsgY291bnRCeVllYXIsIGxpc3RMYWJlbCwgbGlzdFR5cGUsIHBhZ2VBcnRpY2xlIH0gZnJvbSBcIi4vdGhlbWUvYXBpL2RhdGEuanNcIjtcblxuY29uc3QgY3JlYXRlRHluYW1pY1BhdGhzUmVmcmVzaGVyID0gKCkgPT4ge1xuICBjb25zdCBmaWxlcyA9IHtcbiAgICBhcnRpY2xlOiBwYXRoLnJlc29sdmUocHJvY2Vzcy5jd2QoKSwgXCJwYWdlc1wiLCBcImFydGljbGVcIiwgXCJbaWRdLnBhdGhzLm1qc1wiKSxcbiAgICB0YWdzOiBwYXRoLnJlc29sdmUocHJvY2Vzcy5jd2QoKSwgXCJwYWdlc1wiLCBcInRhZ3NcIiwgXCJbbmFtZV0ucGF0aHMubWpzXCIpLFxuICAgIGNhdGVnb3JpZXM6IHBhdGgucmVzb2x2ZShwcm9jZXNzLmN3ZCgpLCBcInBhZ2VzXCIsIFwiY2F0ZWdvcmllc1wiLCBcIltuYW1lXS5wYXRocy5tanNcIiksXG4gICAgcGFnZU51bTogcGF0aC5yZXNvbHZlKHByb2Nlc3MuY3dkKCksIFwicGFnZVwiLCBcIltudW1dLnBhdGhzLm1qc1wiKSxcbiAgfTtcbiAgY29uc3QgcHJldiA9IHsgYXJ0aWNsZTogXCJcIiwgdGFnczogXCJcIiwgY2F0ZWdvcmllczogXCJcIiwgcGFnZU51bTogXCJcIiB9O1xuICByZXR1cm4ge1xuICAgIG5hbWU6IFwidml0ZXByZXNzLWR5bmFtaWMtcGF0aHMtcmVmcmVzaGVyXCIsXG4gICAgYXBwbHk6IFwic2VydmVcIixcbiAgICBjb25maWd1cmVTZXJ2ZXIoc2VydmVyKSB7XG4gICAgICBjb25zdCBpbnZhbGlkYXRlID0gKGZpbGUpID0+IHtcbiAgICAgICAgY29uc3QgbW9kcyA9IHNlcnZlci5tb2R1bGVHcmFwaC5nZXRNb2R1bGVzQnlGaWxlKGZpbGUpO1xuICAgICAgICBpZiAobW9kcykge1xuICAgICAgICAgIGZvciAoY29uc3QgbSBvZiBtb2RzKSBzZXJ2ZXIubW9kdWxlR3JhcGguaW52YWxpZGF0ZU1vZHVsZShtKTtcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICAgIGNvbnN0IGNoZWNrID0gYXN5bmMgKCkgPT4ge1xuICAgICAgICBsZXQgY2hhbmdlZCA9IGZhbHNlO1xuICAgICAgICB0cnkge1xuICAgICAgICAgIGNvbnN0IHsgZGF0YTogYXJ0aWNsZURhdGEgfSA9IGF3YWl0IHBhZ2VBcnRpY2xlKHsgcGFnZU5vOiAxLCBwYWdlU2l6ZTogLTEgfSwge30pO1xuICAgICAgICAgIGNvbnN0IGFydGljbGVEaWdlc3QgPSBKU09OLnN0cmluZ2lmeShhcnRpY2xlRGF0YSk7XG4gICAgICAgICAgaWYgKHByZXYuYXJ0aWNsZSAmJiBwcmV2LmFydGljbGUgIT09IGFydGljbGVEaWdlc3QpIHtcbiAgICAgICAgICAgIGludmFsaWRhdGUoZmlsZXMuYXJ0aWNsZSk7XG4gICAgICAgICAgICBjaGFuZ2VkID0gdHJ1ZTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcHJldi5hcnRpY2xlID0gYXJ0aWNsZURpZ2VzdDtcbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgdGhlbWUgPSBhd2FpdCBnZXRUaGVtZUNvbmZpZygpO1xuICAgICAgICAgICAgY29uc3QgcG9zdHNQZXJQYWdlID0gdGhlbWUucG9zdFNpemU7XG4gICAgICAgICAgICBjb25zdCBwYWdlRGlnZXN0ID0gYCR7YXJ0aWNsZURhdGE/Lmxlbmd0aCB8fCAwfToke3Bvc3RzUGVyUGFnZX1gO1xuICAgICAgICAgICAgaWYgKHByZXYucGFnZU51bSAmJiBwcmV2LnBhZ2VOdW0gIT09IHBhZ2VEaWdlc3QpIHtcbiAgICAgICAgICAgICAgaW52YWxpZGF0ZShmaWxlcy5wYWdlTnVtKTtcbiAgICAgICAgICAgICAgY2hhbmdlZCA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBwcmV2LnBhZ2VOdW0gPSBwYWdlRGlnZXN0O1xuICAgICAgICAgIH0gY2F0Y2ggKGUpIHt9XG4gICAgICAgIH0gY2F0Y2ggKGUpIHt9XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgY29uc3QgeyBkYXRhOiB0YWdzRGF0YSB9ID0gYXdhaXQgbGlzdExhYmVsKCk7XG4gICAgICAgICAgY29uc3QgdGFnc0RpZ2VzdCA9IEpTT04uc3RyaW5naWZ5KHRhZ3NEYXRhKTtcbiAgICAgICAgICBpZiAocHJldi50YWdzICYmIHByZXYudGFncyAhPT0gdGFnc0RpZ2VzdCkge1xuICAgICAgICAgICAgaW52YWxpZGF0ZShmaWxlcy50YWdzKTtcbiAgICAgICAgICAgIGNoYW5nZWQgPSB0cnVlO1xuICAgICAgICAgIH1cbiAgICAgICAgICBwcmV2LnRhZ3MgPSB0YWdzRGlnZXN0O1xuICAgICAgICB9IGNhdGNoIChlKSB7fVxuICAgICAgICB0cnkge1xuICAgICAgICAgIGNvbnN0IHsgZGF0YTogY2F0ZWdvcmllc0RhdGEgfSA9IGF3YWl0IGxpc3RUeXBlKCk7XG4gICAgICAgICAgY29uc3QgY2F0ZWdvcmllc0RpZ2VzdCA9IEpTT04uc3RyaW5naWZ5KGNhdGVnb3JpZXNEYXRhKTtcbiAgICAgICAgICBpZiAocHJldi5jYXRlZ29yaWVzICYmIHByZXYuY2F0ZWdvcmllcyAhPT0gY2F0ZWdvcmllc0RpZ2VzdCkge1xuICAgICAgICAgICAgaW52YWxpZGF0ZShmaWxlcy5jYXRlZ29yaWVzKTtcbiAgICAgICAgICAgIGNoYW5nZWQgPSB0cnVlO1xuICAgICAgICAgIH1cbiAgICAgICAgICBwcmV2LmNhdGVnb3JpZXMgPSBjYXRlZ29yaWVzRGlnZXN0O1xuICAgICAgICB9IGNhdGNoIChlKSB7fVxuICAgICAgICBpZiAoY2hhbmdlZCkgc2VydmVyLndzLnNlbmQoeyB0eXBlOiBcImZ1bGwtcmVsb2FkXCIgfSk7XG4gICAgICB9O1xuICAgICAgY2hlY2soKTtcbiAgICAgIC8vIFx1NkJDRiAxIFx1NUMwRlx1NjVGNlx1NjhDMFx1NjdFNVx1NEUwMFx1NkIyMVxuICAgICAgY29uc3QgdGltZXIgPSBzZXRJbnRlcnZhbChjaGVjaywgNjAgKiA2MCAqIDEwMDApO1xuICAgICAgc2VydmVyLmh0dHBTZXJ2ZXI/Lm9uKFwiY2xvc2VcIiwgKCkgPT4gY2xlYXJJbnRlcnZhbCh0aW1lcikpO1xuICAgIH0sXG4gIH07XG59O1xuXG4vLyBcdTgzQjdcdTUzRDZcdTUxNjhcdTVDNDBcdTY1NzBcdTYzNkVcbmNvbnN0IHsgZGF0YTogcG9zdERhdGEgfSA9IGF3YWl0IHBhZ2VBcnRpY2xlKHsgcGFnZU5vOiAxLCBwYWdlU2l6ZTogLTEgfSwge30pO1xuY29uc3QgeyBkYXRhOiBjYXRlZ29yaWVzRGF0YSB9ID0gYXdhaXQgbGlzdFR5cGUoKTtcbmNvbnN0IHsgZGF0YTogdGFnc0RhdGEgfSA9IGF3YWl0IGxpc3RMYWJlbCgpO1xuY29uc3QgeyBkYXRhOiBhcmNoaXZlc0RhdGEgfSA9IGF3YWl0IGNvdW50QnlZZWFyKCk7XG5cbi8vIFx1ODNCN1x1NTNENlx1NEUzQlx1OTg5OFx1OTE0RFx1N0Y2RVxuY29uc3QgdGhlbWVDb25maWcgPSBhd2FpdCBnZXRUaGVtZUNvbmZpZygpO1xuXG4vLyBodHRwczovL3ZpdGVwcmVzcy5kZXYvcmVmZXJlbmNlL3NpdGUtY29uZmlnXG5leHBvcnQgZGVmYXVsdCB3aXRoUHdhKFxuICBkZWZpbmVDb25maWcoe1xuICAgIHRpdGxlOiB0aGVtZUNvbmZpZy5zaXRlTWV0YS50aXRsZSxcbiAgICBkZXNjcmlwdGlvbjogdGhlbWVDb25maWcuc2l0ZU1ldGEuZGVzY3JpcHRpb24sXG4gICAgbGFuZzogdGhlbWVDb25maWcuc2l0ZU1ldGEubGFuZyxcbiAgICAvLyBcdTdCODBcdTZEMDFcdTc2ODQgVVJMXG4gICAgY2xlYW5VcmxzOiB0cnVlLFxuICAgIC8vIFx1NjcwMFx1NTQwRVx1NjZGNFx1NjVCMFx1NjVGNlx1OTVGNFx1NjIzM1xuICAgIGxhc3RVcGRhdGVkOiB0cnVlLFxuICAgIC8vIFx1NEUzQlx1OTg5OFxuICAgIGFwcGVhcmFuY2U6IFwiZGFya1wiLFxuICAgIC8vIEhlYWRcbiAgICBoZWFkOiB0aGVtZUNvbmZpZy5pbmplY3QuaGVhZGVyLFxuICAgIC8vIHNpdGVtYXBcbiAgICBzaXRlbWFwOiB7XG4gICAgICBob3N0bmFtZTogdGhlbWVDb25maWcuc2l0ZU1ldGEuc2l0ZSxcbiAgICB9LFxuICAgIC8vIFx1NEUzQlx1OTg5OFx1OTE0RFx1N0Y2RVxuICAgIHRoZW1lQ29uZmlnOiB7XG4gICAgICAuLi50aGVtZUNvbmZpZyxcbiAgICAgIC8vIFx1NUZDNVx1ODk4MVx1NjU3MFx1NjM2RVxuICAgICAgcG9zdERhdGE6IHBvc3REYXRhLFxuICAgICAgdGFnc0RhdGE6IHRhZ3NEYXRhLFxuICAgICAgY2F0ZWdvcmllc0RhdGE6IGNhdGVnb3JpZXNEYXRhLFxuICAgICAgYXJjaGl2ZXNEYXRhOiBhcmNoaXZlc0RhdGEsXG4gICAgfSxcbiAgICAvLyBtYXJrZG93blxuICAgIG1hcmtkb3duOiB7XG4gICAgICBtYXRoOiB0cnVlLFxuICAgICAgbGluZU51bWJlcnM6IHRydWUsXG4gICAgICB0b2M6IHsgbGV2ZWw6IFsxLCAyLCAzXSB9LFxuICAgICAgaW1hZ2U6IHtcbiAgICAgICAgbGF6eUxvYWRpbmc6IHRydWUsXG4gICAgICB9LFxuICAgICAgY29uZmlnOiAobWQpID0+IG1hcmtkb3duQ29uZmlnKG1kLCB0aGVtZUNvbmZpZyksXG4gICAgfSxcbiAgICAvLyBcdTY3ODRcdTVFRkFcdTYzOTJcdTk2NjRcbiAgICBzcmNFeGNsdWRlOiBbXCIqKi9SRUFETUUubWRcIiwgXCIqKi9UT0RPLm1kXCJdLFxuICAgIC8vIHRyYW5zZm9ybUhlYWRcbiAgICB0cmFuc2Zvcm1QYWdlRGF0YTogYXN5bmMgKHBhZ2VEYXRhKSA9PiB7XG4gICAgICAvLyBjYW5vbmljYWwgVVJMXG4gICAgICBjb25zdCBjYW5vbmljYWxVcmwgPSBgJHt0aGVtZUNvbmZpZy5zaXRlTWV0YS5zaXRlfS8ke3BhZ2VEYXRhLnJlbGF0aXZlUGF0aH1gXG4gICAgICAgIC5yZXBsYWNlKC9pbmRleFxcLm1kJC8sIFwiXCIpXG4gICAgICAgIC5yZXBsYWNlKC9cXC5tZCQvLCBcIlwiKTtcbiAgICAgIHBhZ2VEYXRhLmZyb250bWF0dGVyLmhlYWQgPz89IFtdO1xuICAgICAgcGFnZURhdGEuZnJvbnRtYXR0ZXIuaGVhZC5wdXNoKFtcImxpbmtcIiwgeyByZWw6IFwiY2Fub25pY2FsXCIsIGhyZWY6IGNhbm9uaWNhbFVybCB9XSk7XG4gICAgfSxcbiAgICAvLyB0cmFuc2Zvcm1IdG1sXG4gICAgdHJhbnNmb3JtSHRtbDogKGh0bWwpID0+IHtcbiAgICAgIHJldHVybiBqdW1wUmVkaXJlY3QoaHRtbCwgdGhlbWVDb25maWcpO1xuICAgIH0sXG4gICAgLy8gYnVpbGRFbmRcbiAgICBidWlsZEVuZDogYXN5bmMgKGNvbmZpZykgPT4ge1xuICAgICAgYXdhaXQgY3JlYXRlUnNzRmlsZShjb25maWcsIHRoZW1lQ29uZmlnKTtcbiAgICB9LFxuICAgIC8vIHZpdGVcbiAgICB2aXRlOiB7XG4gICAgICBwbHVnaW5zOiBbXG4gICAgICAgIEF1dG9JbXBvcnQoe1xuICAgICAgICAgIGltcG9ydHM6IFtcInZ1ZVwiLCBcInZpdGVwcmVzc1wiXSxcbiAgICAgICAgICBkdHM6IFwiLnZpdGVwcmVzcy9hdXRvLWltcG9ydHMuZC50c1wiLFxuICAgICAgICB9KSxcbiAgICAgICAgQ29tcG9uZW50cyh7XG4gICAgICAgICAgZGlyczogW1wiLnZpdGVwcmVzcy90aGVtZS9jb21wb25lbnRzXCIsIFwiLnZpdGVwcmVzcy90aGVtZS92aWV3c1wiXSxcbiAgICAgICAgICBleHRlbnNpb25zOiBbXCJ2dWVcIiwgXCJtZFwiXSxcbiAgICAgICAgICBpbmNsdWRlOiBbL1xcLnZ1ZSQvLCAvXFwudnVlXFw/dnVlLywgL1xcLm1kJC9dLFxuICAgICAgICAgIGR0czogXCIudml0ZXByZXNzL2NvbXBvbmVudHMuZC50c1wiLFxuICAgICAgICB9KSxcbiAgICAgICAgY3JlYXRlRHluYW1pY1BhdGhzUmVmcmVzaGVyKCksXG4gICAgICBdLFxuICAgICAgcmVzb2x2ZToge1xuICAgICAgICAvLyBcdTkxNERcdTdGNkVcdThERUZcdTVGODRcdTUyMkJcdTU0MERcbiAgICAgICAgYWxpYXM6IHtcbiAgICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tdW5kZWZcbiAgICAgICAgICBcIkBcIjogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgXCIuL3RoZW1lXCIpLFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICAgIGNzczoge1xuICAgICAgICBwcmVwcm9jZXNzb3JPcHRpb25zOiB7XG4gICAgICAgICAgc2Nzczoge1xuICAgICAgICAgICAgc2lsZW5jZURlcHJlY2F0aW9uczogW1wibGVnYWN5LWpzLWFwaVwiXSxcbiAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICAgIC8vIFx1NjcwRFx1NTJBMVx1NTY2OFxuICAgICAgc2VydmVyOiB7XG4gICAgICAgIHBvcnQ6IDk4NzcsXG4gICAgICB9LFxuICAgICAgLy8gXHU2Nzg0XHU1RUZBXG4gICAgICBidWlsZDoge1xuICAgICAgICBtaW5pZnk6IFwidGVyc2VyXCIsXG4gICAgICAgIHRlcnNlck9wdGlvbnM6IHtcbiAgICAgICAgICBjb21wcmVzczoge1xuICAgICAgICAgICAgcHVyZV9mdW5jczogW1wiY29uc29sZS5sb2dcIl0sXG4gICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgfSxcbiAgICAvLyBQV0FcbiAgICBwd2E6IHtcbiAgICAgIHJlZ2lzdGVyVHlwZTogXCJhdXRvVXBkYXRlXCIsXG4gICAgICBzZWxmRGVzdHJveWluZzogdHJ1ZSxcbiAgICAgIHdvcmtib3g6IHtcbiAgICAgICAgY2xpZW50c0NsYWltOiB0cnVlLFxuICAgICAgICBza2lwV2FpdGluZzogdHJ1ZSxcbiAgICAgICAgY2xlYW51cE91dGRhdGVkQ2FjaGVzOiB0cnVlLFxuICAgICAgICAvLyBcdThENDRcdTZFOTBcdTdGMTNcdTVCNThcbiAgICAgICAgcnVudGltZUNhY2hpbmc6IFtcbiAgICAgICAgICB7XG4gICAgICAgICAgICB1cmxQYXR0ZXJuOiAvKC4qPylcXC4od29mZjJ8d29mZnx0dGZ8Y3NzKS8sXG4gICAgICAgICAgICBoYW5kbGVyOiBcIkNhY2hlRmlyc3RcIixcbiAgICAgICAgICAgIG9wdGlvbnM6IHtcbiAgICAgICAgICAgICAgY2FjaGVOYW1lOiBcImZpbGUtY2FjaGVcIixcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgfSxcbiAgICAgICAgICB7XG4gICAgICAgICAgICB1cmxQYXR0ZXJuOiAvKC4qPylcXC4oaWNvfHdlYnB8cG5nfGpwZT9nfHN2Z3xnaWZ8Ym1wfHBzZHx0aWZmfHRnYXxlcHMpLyxcbiAgICAgICAgICAgIGhhbmRsZXI6IFwiQ2FjaGVGaXJzdFwiLFxuICAgICAgICAgICAgb3B0aW9uczoge1xuICAgICAgICAgICAgICBjYWNoZU5hbWU6IFwiaW1hZ2UtY2FjaGVcIixcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgfSxcbiAgICAgICAgICB7XG4gICAgICAgICAgICB1cmxQYXR0ZXJuOiAvXmh0dHBzOlxcL1xcL2NkbjJcXC5jb2Rlc2lnblxcLnFxXFwuY29tXFwvLiovaSxcbiAgICAgICAgICAgIGhhbmRsZXI6IFwiQ2FjaGVGaXJzdFwiLFxuICAgICAgICAgICAgb3B0aW9uczoge1xuICAgICAgICAgICAgICBjYWNoZU5hbWU6IFwiaWNvbmZvbnQtY2FjaGVcIixcbiAgICAgICAgICAgICAgZXhwaXJhdGlvbjoge1xuICAgICAgICAgICAgICAgIG1heEVudHJpZXM6IDEwLFxuICAgICAgICAgICAgICAgIG1heEFnZVNlY29uZHM6IDYwICogNjAgKiAyNCAqIDIsXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIGNhY2hlYWJsZVJlc3BvbnNlOiB7XG4gICAgICAgICAgICAgICAgc3RhdHVzZXM6IFswLCAyMDBdLFxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICB9LFxuICAgICAgICBdLFxuICAgICAgICAvLyBcdTdGMTNcdTVCNThcdTY1ODdcdTRFRjZcbiAgICAgICAgZ2xvYlBhdHRlcm5zOiBbXCIqKi8qLntqcyxjc3MsaHRtbCxpY28scG5nLGpwZyxqcGVnLGdpZixzdmcsd29mZjIsdHRmfVwiXSxcbiAgICAgICAgLy8gXHU2MzkyXHU5NjY0XHU4REVGXHU1Rjg0XG4gICAgICAgIG5hdmlnYXRlRmFsbGJhY2tEZW55bGlzdDogWy9eXFwvc2l0ZW1hcC54bWwkLywgL15cXC9yc3MueG1sJC8sIC9eXFwvcm9ib3RzLnR4dCQvXSxcbiAgICAgIH0sXG4gICAgICBtYW5pZmVzdDoge1xuICAgICAgICBuYW1lOiB0aGVtZUNvbmZpZy5zaXRlTWV0YS50aXRsZSxcbiAgICAgICAgc2hvcnRfbmFtZTogdGhlbWVDb25maWcuc2l0ZU1ldGEudGl0bGUsXG4gICAgICAgIGRlc2NyaXB0aW9uOiB0aGVtZUNvbmZpZy5zaXRlTWV0YS5kZXNjcmlwdGlvbixcbiAgICAgICAgZGlzcGxheTogXCJzdGFuZGFsb25lXCIsXG4gICAgICAgIHN0YXJ0X3VybDogXCIvXCIsXG4gICAgICAgIHRoZW1lX2NvbG9yOiBcIiNmZmZcIixcbiAgICAgICAgYmFja2dyb3VuZF9jb2xvcjogXCIjZWZlZmVmXCJcbiAgICAgIH0sXG4gICAgfSxcbiAgfSksXG4pO1xuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJGOlxcXFxzdXpoaWJpblxcXFxibG9nXFxcXC52aXRlcHJlc3NcXFxcdGhlbWVcXFxcdXRpbHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkY6XFxcXHN1emhpYmluXFxcXGJsb2dcXFxcLnZpdGVwcmVzc1xcXFx0aGVtZVxcXFx1dGlsc1xcXFxnZW5lcmF0ZVJTUy5tanNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0Y6L3N1emhpYmluL2Jsb2cvLnZpdGVwcmVzcy90aGVtZS91dGlscy9nZW5lcmF0ZVJTUy5tanNcIjtpbXBvcnQgeyBjcmVhdGVDb250ZW50TG9hZGVyIH0gZnJvbSBcInZpdGVwcmVzc1wiO1xyXG5pbXBvcnQgeyB3cml0ZUZpbGVTeW5jIH0gZnJvbSBcImZzXCI7XHJcbmltcG9ydCB7IEZlZWQgfSBmcm9tIFwiZmVlZFwiO1xyXG5pbXBvcnQgcGF0aCBmcm9tIFwicGF0aFwiO1xyXG5cclxuLyoqXHJcbiAqIFx1NzUxRlx1NjIxMCBSU1NcclxuICogQHBhcmFtIHsqfSBjb25maWcgVml0ZVByZXNzIGJ1aWxkRW5kXHJcbiAqIEBwYXJhbSB7Kn0gdGhlbWVDb25maWcgXHU0RTNCXHU5ODk4XHU5MTREXHU3RjZFXHJcbiAqL1xyXG5leHBvcnQgY29uc3QgY3JlYXRlUnNzRmlsZSA9IGFzeW5jIChjb25maWcsIHRoZW1lQ29uZmlnKSA9PiB7XHJcbiAgLy8gXHU5MTREXHU3RjZFXHU0RkUxXHU2MDZGXHJcbiAgY29uc3Qgc2l0ZU1ldGEgPSB0aGVtZUNvbmZpZy5zaXRlTWV0YTtcclxuICBjb25zdCBob3N0TGluayA9IHNpdGVNZXRhLnNpdGU7XHJcbiAgLy8gRmVlZCBcdTVCOUVcdTRGOEJcclxuICBjb25zdCBmZWVkID0gbmV3IEZlZWQoe1xyXG4gICAgdGl0bGU6IHNpdGVNZXRhLnRpdGxlLFxyXG4gICAgZGVzY3JpcHRpb246IHNpdGVNZXRhLmRlc2NyaXB0aW9uLFxyXG4gICAgaWQ6IGhvc3RMaW5rLFxyXG4gICAgbGluazogaG9zdExpbmssXHJcbiAgICBsYW5ndWFnZTogXCJ6aFwiLFxyXG4gICAgZ2VuZXJhdG9yOiBzaXRlTWV0YS5hdXRob3IubmFtZSxcclxuICAgIGZhdmljb246IHNpdGVNZXRhLmF1dGhvci5jb3ZlcixcclxuICAgIGNvcHlyaWdodDogYENvcHlyaWdodCBcdTAwQTkgMjAyMC1wcmVzZW50ICR7c2l0ZU1ldGEuYXV0aG9yLm5hbWV9YCxcclxuICAgIHVwZGF0ZWQ6IG5ldyBEYXRlKCksXHJcbiAgfSk7XHJcbiAgLy8gXHU1MkEwXHU4RjdEXHU2NTg3XHU3QUUwXHJcbiAgbGV0IHBvc3RzID0gYXdhaXQgY3JlYXRlQ29udGVudExvYWRlcihcInBvc3RzLyoqLyoubWRcIiwge1xyXG4gICAgcmVuZGVyOiB0cnVlLFxyXG4gIH0pLmxvYWQoKTtcclxuICAvLyBcdTY1RTVcdTY3MUZcdTk2NERcdTVFOEZcdTYzOTJcdTVFOEZcclxuICBwb3N0cyA9IHBvc3RzLnNvcnQoKGEsIGIpID0+IHtcclxuICAgIGNvbnN0IGRhdGVBID0gbmV3IERhdGUoYS5mcm9udG1hdHRlci5kYXRlKTtcclxuICAgIGNvbnN0IGRhdGVCID0gbmV3IERhdGUoYi5mcm9udG1hdHRlci5kYXRlKTtcclxuICAgIHJldHVybiBkYXRlQiAtIGRhdGVBO1xyXG4gIH0pO1xyXG4gIGZvciAoY29uc3QgeyB1cmwsIGZyb250bWF0dGVyIH0gb2YgcG9zdHMpIHtcclxuICAgIC8vIFx1NEVDNVx1NEZERFx1NzU1OVx1NjcwMFx1OEZEMSAxMCBcdTdCQzdcdTY1ODdcdTdBRTBcclxuICAgIGlmIChmZWVkLml0ZW1zLmxlbmd0aCA+PSAxMCkgYnJlYWs7XHJcbiAgICAvLyBcdTY1ODdcdTdBRTBcdTRGRTFcdTYwNkZcclxuICAgIGxldCB7IHRpdGxlLCBkZXNjcmlwdGlvbiwgZGF0ZSB9ID0gZnJvbnRtYXR0ZXI7XHJcbiAgICAvLyBcdTU5MDRcdTc0MDZcdTY1RTVcdTY3MUZcclxuICAgIGlmICh0eXBlb2YgZGF0ZSA9PT0gXCJzdHJpbmdcIikgZGF0ZSA9IG5ldyBEYXRlKGRhdGUpO1xyXG4gICAgLy8gXHU2REZCXHU1MkEwXHU2NTg3XHU3QUUwXHJcbiAgICBmZWVkLmFkZEl0ZW0oe1xyXG4gICAgICB0aXRsZSxcclxuICAgICAgaWQ6IGAke2hvc3RMaW5rfSR7dXJsfWAsXHJcbiAgICAgIGxpbms6IGAke2hvc3RMaW5rfSR7dXJsfWAsXHJcbiAgICAgIGRlc2NyaXB0aW9uLFxyXG4gICAgICBkYXRlLFxyXG4gICAgICAvLyB1cGRhdGVkLFxyXG4gICAgICBhdXRob3I6IFtcclxuICAgICAgICB7XHJcbiAgICAgICAgICBuYW1lOiBzaXRlTWV0YS5hdXRob3IubmFtZSxcclxuICAgICAgICAgIGVtYWlsOiBzaXRlTWV0YS5hdXRob3IuZW1haWwsXHJcbiAgICAgICAgICBsaW5rOiBzaXRlTWV0YS5hdXRob3IubGluayxcclxuICAgICAgICB9LFxyXG4gICAgICBdLFxyXG4gICAgfSk7XHJcbiAgfVxyXG4gIC8vIFx1NTE5OVx1NTE2NVx1NjU4N1x1NEVGNlxyXG4gIHdyaXRlRmlsZVN5bmMocGF0aC5qb2luKGNvbmZpZy5vdXREaXIsIFwicnNzLnhtbFwiKSwgZmVlZC5yc3MyKCksIFwidXRmLThcIik7XHJcbn07XHJcbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiRjpcXFxcc3V6aGliaW5cXFxcYmxvZ1xcXFwudml0ZXByZXNzXFxcXHRoZW1lXFxcXHV0aWxzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJGOlxcXFxzdXpoaWJpblxcXFxibG9nXFxcXC52aXRlcHJlc3NcXFxcdGhlbWVcXFxcdXRpbHNcXFxcY29tbW9uVG9vbHMubWpzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9GOi9zdXpoaWJpbi9ibG9nLy52aXRlcHJlc3MvdGhlbWUvdXRpbHMvY29tbW9uVG9vbHMubWpzXCI7aW1wb3J0IHsgbG9hZCB9IGZyb20gXCJjaGVlcmlvXCI7XHJcblxyXG4vKipcclxuICogXHU0RUNFXHU2NTg3XHU0RUY2XHU1NDBEXHU3NTFGXHU2MjEwXHU2NTcwXHU1QjU3IElEXHJcbiAqIEBwYXJhbSB7c3RyaW5nfSBmaWxlTmFtZSAtIFx1NjU4N1x1NEVGNlx1NTQwRFxyXG4gKiBAcmV0dXJucyB7bnVtYmVyfSAtIFx1NzUxRlx1NjIxMFx1NzY4NFx1NjU3MFx1NUI1N0lEXHJcbiAqL1xyXG5leHBvcnQgY29uc3QgZ2VuZXJhdGVJZCA9IChmaWxlTmFtZSkgPT4ge1xyXG4gIC8vIFx1NUMwNlx1NjU4N1x1NEVGNlx1NTQwRFx1OEY2Q1x1NjM2Mlx1NEUzQVx1NTRDOFx1NUUwQ1x1NTAzQ1xyXG4gIGxldCBoYXNoID0gMDtcclxuICBmb3IgKGxldCBpID0gMDsgaSA8IGZpbGVOYW1lLmxlbmd0aDsgaSsrKSB7XHJcbiAgICBoYXNoID0gKGhhc2ggPDwgNSkgLSBoYXNoICsgZmlsZU5hbWUuY2hhckNvZGVBdChpKTtcclxuICB9XHJcbiAgLy8gXHU1QzA2XHU1NEM4XHU1RTBDXHU1MDNDXHU4RjZDXHU2MzYyXHU0RTNBXHU2QjYzXHU2NTc0XHU2NTcwXHJcbiAgY29uc3QgbnVtZXJpY0lkID0gTWF0aC5hYnMoaGFzaCAlIDEwMDAwMDAwMDAwKTtcclxuICByZXR1cm4gbnVtZXJpY0lkO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIFx1NTJBOFx1NjAwMVx1NTJBMFx1OEY3RFx1ODExQVx1NjcyQ1xyXG4gKiBAcGFyYW0ge3N0cmluZ30gc3JjIC0gXHU4MTFBXHU2NzJDIFVSTFxyXG4gKiAqIEBwYXJhbSB7b2JqZWN0fSBvcHRpb24gLSBcdTkxNERcdTdGNkVcclxuICovXHJcbmV4cG9ydCBjb25zdCBsb2FkU2NyaXB0ID0gKHNyYywgb3B0aW9uID0ge30pID0+IHtcclxuICBpZiAodHlwZW9mIGRvY3VtZW50ID09PSBcInVuZGVmaW5lZFwiIHx8ICFzcmMpIHJldHVybiBmYWxzZTtcclxuICAvLyBcdTgzQjdcdTUzRDZcdTkxNERcdTdGNkVcclxuICBjb25zdCB7IGFzeW5jID0gZmFsc2UsIHJlbG9hZCA9IGZhbHNlLCBjYWxsYmFjayB9ID0gb3B0aW9uO1xyXG4gIC8vIFx1NjhDMFx1NjdFNVx1NjYyRlx1NTQyNlx1NURGMlx1N0VDRlx1NTJBMFx1OEY3RFx1OEZDN1x1NkI2NFx1ODExQVx1NjcyQ1xyXG4gIGNvbnN0IGV4aXN0aW5nU2NyaXB0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3Rvcihgc2NyaXB0W3NyYz1cIiR7c3JjfVwiXWApO1xyXG4gIGlmIChleGlzdGluZ1NjcmlwdCkge1xyXG4gICAgaWYgKCFyZWxvYWQpIHtcclxuICAgICAgY2FsbGJhY2sgJiYgY2FsbGJhY2sobnVsbCwgZXhpc3RpbmdTY3JpcHQpO1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbiAgICBleGlzdGluZ1NjcmlwdC5yZW1vdmUoKTtcclxuICB9XHJcbiAgLy8gXHU1MjFCXHU1RUZBXHU0RTAwXHU0RTJBXHU2NUIwXHU3Njg0c2NyaXB0XHU2ODA3XHU3QjdFXHU1RTc2XHU1MkEwXHU4RjdEXHJcbiAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcclxuICAgIGNvbnN0IHNjcmlwdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJzY3JpcHRcIik7XHJcbiAgICBzY3JpcHQuc3JjID0gc3JjO1xyXG4gICAgaWYgKGFzeW5jKSBzY3JpcHQuYXN5bmMgPSB0cnVlO1xyXG4gICAgc2NyaXB0Lm9ubG9hZCA9ICgpID0+IHtcclxuICAgICAgcmVzb2x2ZShzY3JpcHQpO1xyXG4gICAgICBjYWxsYmFjayAmJiBjYWxsYmFjayhudWxsLCBzY3JpcHQpO1xyXG4gICAgfTtcclxuICAgIHNjcmlwdC5vbmVycm9yID0gKGVycm9yKSA9PiB7XHJcbiAgICAgIHJlamVjdChlcnJvcik7XHJcbiAgICAgIGNhbGxiYWNrICYmIGNhbGxiYWNrKGVycm9yKTtcclxuICAgIH07XHJcbiAgICBkb2N1bWVudC5oZWFkLmFwcGVuZENoaWxkKHNjcmlwdCk7XHJcbiAgfSk7XHJcbn07XHJcblxyXG4vKipcclxuICogXHU1MkE4XHU2MDAxXHU1MkEwXHU4RjdEXHU2ODM3XHU1RjBGXHU4ODY4XHJcbiAqIEBwYXJhbSB7c3RyaW5nfSBocmVmIC0gXHU2ODM3XHU1RjBGXHU4ODY4IFVSTFxyXG4gKiBAcGFyYW0ge29iamVjdH0gb3B0aW9uIC0gXHU5MTREXHU3RjZFXHJcbiAqL1xyXG5leHBvcnQgY29uc3QgbG9hZENTUyA9IChocmVmLCBvcHRpb24gPSB7fSkgPT4ge1xyXG4gIGlmICh0eXBlb2YgZG9jdW1lbnQgPT09IFwidW5kZWZpbmVkXCIgfHwgIWhyZWYpIHJldHVybiBmYWxzZTtcclxuICAvLyBcdTgzQjdcdTUzRDZcdTkxNERcdTdGNkVcclxuICBjb25zdCB7IHJlbG9hZCA9IGZhbHNlLCBjYWxsYmFjayB9ID0gb3B0aW9uO1xyXG4gIC8vIFx1NjhDMFx1NjdFNVx1NjYyRlx1NTQyNlx1NURGMlx1N0VDRlx1NTJBMFx1OEY3RFx1OEZDN1x1NkI2NFx1NjgzN1x1NUYwRlx1ODg2OFxyXG4gIGNvbnN0IGV4aXN0aW5nTGluayA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYGxpbmtbaHJlZj1cIiR7aHJlZn1cIl1gKTtcclxuICBpZiAoZXhpc3RpbmdMaW5rKSB7XHJcbiAgICBpZiAoIXJlbG9hZCkge1xyXG4gICAgICBjYWxsYmFjayAmJiBjYWxsYmFjayhudWxsLCBleGlzdGluZ0xpbmspO1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbiAgICBleGlzdGluZ0xpbmsucmVtb3ZlKCk7XHJcbiAgfVxyXG4gIC8vIFx1NTIxQlx1NUVGQVx1NjVCMFx1NzY4NGxpbmtcdTY4MDdcdTdCN0VcdTVFNzZcdThCQkVcdTdGNkVcdTVDNUVcdTYwMjdcclxuICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xyXG4gICAgY29uc3QgbGluayA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJsaW5rXCIpO1xyXG4gICAgbGluay5ocmVmID0gaHJlZjtcclxuICAgIGxpbmsucmVsID0gXCJzdHlsZXNoZWV0XCI7XHJcbiAgICBsaW5rLnR5cGUgPSBcInRleHQvY3NzXCI7XHJcbiAgICBsaW5rLm9ubG9hZCA9ICgpID0+IHtcclxuICAgICAgcmVzb2x2ZShsaW5rKTtcclxuICAgICAgY2FsbGJhY2sgJiYgY2FsbGJhY2sobnVsbCwgbGluayk7XHJcbiAgICB9O1xyXG4gICAgbGluay5vbmVycm9yID0gKGVycm9yKSA9PiB7XHJcbiAgICAgIHJlamVjdChlcnJvcik7XHJcbiAgICAgIGNhbGxiYWNrICYmIGNhbGxiYWNrKGVycm9yKTtcclxuICAgIH07XHJcbiAgICBkb2N1bWVudC5oZWFkLmFwcGVuZENoaWxkKGxpbmspO1xyXG4gIH0pO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIFx1OERGM1x1OEY2Q1x1NEUyRFx1OEY2Q1x1OTg3NVxyXG4gKiBAcGFyYW0ge3N0cmluZ30gaHRtbCAtIFx1OTg3NVx1OTc2Mlx1NTE4NVx1NUJCOVxyXG4gKiBAcGFyYW0ge2Jvb2xlYW59IGlzRG9tIC0gXHU2NjJGXHU1NDI2XHU0RTNBIERPTSBcdTVCRjlcdThDNjFcclxuICovXHJcbmV4cG9ydCBjb25zdCBqdW1wUmVkaXJlY3QgPSAoaHRtbCwgdGhlbWVDb25maWcsIGlzRG9tID0gZmFsc2UpID0+IHtcclxuICB0cnkge1xyXG4gICAgLy8gXHU2NjJGXHU1NDI2XHU0RTNBXHU1RjAwXHU1M0QxXHU3M0FGXHU1ODgzXHJcbiAgICBjb25zdCBpc0RldiA9IHByb2Nlc3MuZW52Lk5PREVfRU5WID09PSBcImRldmVsb3BtZW50XCI7XHJcbiAgICBpZiAoaXNEZXYpIHJldHVybiBmYWxzZTtcclxuICAgIC8vIFx1NjYyRlx1NTQyNlx1NTQyRlx1NzUyOFxyXG4gICAgaWYgKCF0aGVtZUNvbmZpZy5qdW1wUmVkaXJlY3QuZW5hYmxlKSByZXR1cm4gaHRtbDtcclxuICAgIC8vIFx1NEUyRFx1OEY2Q1x1OTg3NVx1NTczMFx1NTc0MFxyXG4gICAgY29uc3QgcmVkaXJlY3RQYWdlID0gXCIvcmVkaXJlY3RcIjtcclxuICAgIC8vIFx1NjM5Mlx1OTY2NFx1NzY4NCBjbGFzc05hbWVcclxuICAgIGNvbnN0IGV4Y2x1ZGVDbGFzcyA9IHRoZW1lQ29uZmlnLmp1bXBSZWRpcmVjdC5leGNsdWRlO1xyXG4gICAgaWYgKGlzRG9tKSB7XHJcbiAgICAgIGlmICh0eXBlb2Ygd2luZG93ID09PSBcInVuZGVmaW5lZFwiIHx8IHR5cGVvZiBkb2N1bWVudCA9PT0gXCJ1bmRlZmluZWRcIikgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAvLyBcdTYyNDBcdTY3MDlcdTk0RkVcdTYzQTVcclxuICAgICAgY29uc3QgYWxsTGlua3MgPSBbLi4uZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoXCJhXCIpXTtcclxuICAgICAgaWYgKGFsbExpbmtzPy5sZW5ndGggPT09IDApIHJldHVybiBmYWxzZTtcclxuICAgICAgYWxsTGlua3MuZm9yRWFjaCgobGluaykgPT4ge1xyXG4gICAgICAgIC8vIFx1NjhDMFx1NjdFNVx1OTRGRVx1NjNBNVx1NjYyRlx1NTQyNlx1NTMwNVx1NTQyQiB0YXJnZXQ9XCJfYmxhbmtcIiBcdTVDNUVcdTYwMjdcclxuICAgICAgICBpZiAobGluay5nZXRBdHRyaWJ1dGUoXCJ0YXJnZXRcIikgPT09IFwiX2JsYW5rXCIpIHtcclxuICAgICAgICAgIC8vIFx1NjhDMFx1NjdFNVx1OTRGRVx1NjNBNVx1NjYyRlx1NTQyNlx1NTMwNVx1NTQyQlx1NjM5Mlx1OTY2NFx1NzY4NFx1N0M3QlxyXG4gICAgICAgICAgaWYgKGV4Y2x1ZGVDbGFzcy5zb21lKChjbGFzc05hbWUpID0+IGxpbmsuY2xhc3NMaXN0LmNvbnRhaW5zKGNsYXNzTmFtZSkpKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGNvbnN0IGxpbmtIcmVmID0gbGluay5nZXRBdHRyaWJ1dGUoXCJocmVmXCIpO1xyXG4gICAgICAgICAgLy8gXHU1QjU4XHU1NzI4XHU5NEZFXHU2M0E1XHU0RTE0XHU5NzVFXHU0RTJEXHU4RjZDXHU5ODc1XHJcbiAgICAgICAgICBpZiAobGlua0hyZWYgJiYgIWxpbmtIcmVmLmluY2x1ZGVzKHJlZGlyZWN0UGFnZSkpIHtcclxuICAgICAgICAgICAgLy8gQmFzZTY0XHJcbiAgICAgICAgICAgIGNvbnN0IGVuY29kZWRIcmVmID0gYnRvYShsaW5rSHJlZik7XHJcbiAgICAgICAgICAgIGNvbnN0IHJlZGlyZWN0TGluayA9IGAke3JlZGlyZWN0UGFnZX0/dXJsPSR7ZW5jb2RlZEhyZWZ9YDtcclxuICAgICAgICAgICAgLy8gXHU0RkREXHU1QjU4XHU1MzlGXHU1OUNCXHU5NEZFXHU2M0E1XHJcbiAgICAgICAgICAgIGxpbmsuc2V0QXR0cmlidXRlKFwib3JpZ2luYWwtaHJlZlwiLCBsaW5rSHJlZik7XHJcbiAgICAgICAgICAgIC8vIFx1ODk4Nlx1NzZENiBocmVmXHJcbiAgICAgICAgICAgIGxpbmsuc2V0QXR0cmlidXRlKFwiaHJlZlwiLCByZWRpcmVjdExpbmspO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfSk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBjb25zdCAkID0gbG9hZChodG1sKTtcclxuICAgICAgLy8gXHU2NkZGXHU2MzYyXHU3QjI2XHU1NDA4XHU2NzYxXHU0RUY2XHU3Njg0XHU2ODA3XHU3QjdFXHJcbiAgICAgICQoXCJhW3RhcmdldD0nX2JsYW5rJ11cIikuZWFjaCgoXywgZWwpID0+IHtcclxuICAgICAgICBjb25zdCAkYSA9ICQoZWwpO1xyXG4gICAgICAgIGNvbnN0IGhyZWYgPSAkYS5hdHRyKFwiaHJlZlwiKTtcclxuICAgICAgICBjb25zdCBjbGFzc2VzU3RyID0gJGEuYXR0cihcImNsYXNzXCIpO1xyXG4gICAgICAgIGNvbnN0IGlubmVyVGV4dCA9ICRhLnRleHQoKTtcclxuICAgICAgICAvLyBcdTY4QzBcdTY3RTVcdTY2MkZcdTU0MjZcdTUzMDVcdTU0MkJcdTYzOTJcdTk2NjRcdTc2ODRcdTdDN0JcclxuICAgICAgICBjb25zdCBjbGFzc2VzID0gY2xhc3Nlc1N0ciA/IGNsYXNzZXNTdHIudHJpbSgpLnNwbGl0KFwiIFwiKSA6IFtdO1xyXG4gICAgICAgIGlmIChleGNsdWRlQ2xhc3Muc29tZSgoY2xhc3NOYW1lKSA9PiBjbGFzc2VzLmluY2x1ZGVzKGNsYXNzTmFtZSkpKSB7XHJcbiAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIFx1NUI1OFx1NTcyOFx1OTRGRVx1NjNBNVx1NEUxNFx1OTc1RVx1NEUyRFx1OEY2Q1x1OTg3NVxyXG4gICAgICAgIGlmIChocmVmICYmICFocmVmLmluY2x1ZGVzKHJlZGlyZWN0UGFnZSkpIHtcclxuICAgICAgICAgIC8vIEJhc2U2NCBcdTdGMTZcdTc4MDEgaHJlZlxyXG4gICAgICAgICAgY29uc3QgZW5jb2RlZEhyZWYgPSBCdWZmZXIuZnJvbShocmVmLCBcInV0Zi04XCIpLnRvU3RyaW5nKFwiYmFzZTY0XCIpO1xyXG4gICAgICAgICAgLy8gXHU4M0I3XHU1M0Q2XHU2MjQwXHU2NzA5XHU1QzVFXHU2MDI3XHJcbiAgICAgICAgICBjb25zdCBhdHRyaWJ1dGVzID0gZWwuYXR0cmlicztcclxuICAgICAgICAgIC8vIFx1OTFDRFx1Njc4NFx1NUM1RVx1NjAyN1x1NUI1N1x1N0IyNlx1NEUzMlx1RkYwQ1x1NEZERFx1NzU1OVx1NTM5Rlx1NjcwOVx1NUM1RVx1NjAyN1xyXG4gICAgICAgICAgbGV0IGF0dHJpYnV0ZXNTdHIgPSBcIlwiO1xyXG4gICAgICAgICAgZm9yIChsZXQgYXR0ciBpbiBhdHRyaWJ1dGVzKSB7XHJcbiAgICAgICAgICAgIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoYXR0cmlidXRlcywgYXR0cikpIHtcclxuICAgICAgICAgICAgICBhdHRyaWJ1dGVzU3RyICs9IGAgJHthdHRyfT1cIiR7YXR0cmlidXRlc1thdHRyXX1cImA7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuICAgICAgICAgIC8vIFx1Njc4NFx1OTAyMFx1NjVCMFx1NjgwN1x1N0I3RVxyXG4gICAgICAgICAgY29uc3QgbmV3TGluayA9IGA8YSBocmVmPVwiJHtyZWRpcmVjdFBhZ2V9P3VybD0ke2VuY29kZWRIcmVmfVwiIG9yaWdpbmFsLWhyZWY9XCIke2hyZWZ9XCIgJHthdHRyaWJ1dGVzU3RyfT4ke2lubmVyVGV4dH08L2E+YDtcclxuICAgICAgICAgIC8vIFx1NjZGRlx1NjM2Mlx1NTM5Rlx1NjcwOVx1NjgwN1x1N0I3RVxyXG4gICAgICAgICAgJGEucmVwbGFjZVdpdGgobmV3TGluayk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9KTtcclxuICAgICAgcmV0dXJuICQuaHRtbCgpO1xyXG4gICAgfVxyXG4gIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICBjb25zb2xlLmVycm9yKFwiXHU1OTA0XHU3NDA2XHU5NEZFXHU2M0E1XHU2NUY2XHU1MUZBXHU5NTE5XHVGRjFBXCIsIGVycm9yKTtcclxuICB9XHJcbn07XHJcbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiRjpcXFxcc3V6aGliaW5cXFxcYmxvZ1xcXFwudml0ZXByZXNzXFxcXHRoZW1lXFxcXGFzc2V0c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiRjpcXFxcc3V6aGliaW5cXFxcYmxvZ1xcXFwudml0ZXByZXNzXFxcXHRoZW1lXFxcXGFzc2V0c1xcXFx0aGVtZUNvbmZpZy5tanNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0Y6L3N1emhpYmluL2Jsb2cvLnZpdGVwcmVzcy90aGVtZS9hc3NldHMvdGhlbWVDb25maWcubWpzXCI7Ly8gXHU0RTNCXHU5ODk4XHU5MTREXHU3RjZFXG5leHBvcnQgY29uc3QgdGhlbWVDb25maWcgPSB7XG4gIC8vIFx1N0FEOVx1NzBCOVx1NEZFMVx1NjA2RlxuICBzaXRlTWV0YToge1xuICAgIC8vIFx1N0FEOVx1NzBCOVx1NjgwN1x1OTg5OFxuICAgIHRpdGxlOiBcIlx1N0QyMFx1OEZEOFx1NzcxRlwiLFxuICAgIC8vIFx1N0FEOVx1NzBCOVx1NjNDRlx1OEZGMFxuICAgIGRlc2NyaXB0aW9uOiBcIlx1OEJCMFx1NUY1NVx1NEUwMFx1NEU5Qlx1NjcwOVx1OERBM1x1NzY4NFx1NEUxQ1x1ODk3RlwiLFxuICAgIC8vIFx1N0FEOVx1NzBCOWxvZ29cbiAgICBsb2dvOiBcIi9pbWFnZXMvbG9nby9mYXZpY29uLnBuZ1wiLFxuICAgIC8vIFx1N0FEOVx1NzBCOVx1NTczMFx1NTc0MFxuICAgIHNpdGU6IFwiaHR0cHM6Ly9ibG9nLnN1emhpYmluLmNuXCIsXG4gICAgLy8gXHU4QkVEXHU4QTAwXG4gICAgbGFuZzogXCJ6aC1DTlwiLFxuICAgIC8vIFx1NEY1Q1x1ODAwNVxuICAgIGF1dGhvcjoge1xuICAgICAgbmFtZTogXCJcdTdEMjBcdThGRDhcdTc3MUZcIixcbiAgICAgIGNvdmVyOiBcIi9pbWFnZXMvbG9nby9sb2dvLnBuZ1wiLFxuICAgICAgZW1haWw6IFwiMTg3MzU4ODA0NDdAMTM5LmNvbVwiLFxuICAgICAgbGluazogXCJodHRwczovL3N1emhpYmluLmNuXCIsXG4gICAgfSxcbiAgfSxcbiAgLy8gXHU1OTA3XHU2ODQ4XHU0RkUxXHU2MDZGXG4gIGljcDogXCJcdTY2NEJJQ1BcdTU5MDcyMDI1MDcwNTUxXHU1M0Y3LTFcIixcbiAgLy8gXHU1RUZBXHU3QUQ5XHU2NUU1XHU2NzFGXG4gIHNpbmNlOiBcIjIwMjUtMTItMDFcIixcbiAgLy8gXHU2QkNGXHU5ODc1XHU2NTg3XHU3QUUwXHU2NTcwXHU2MzZFXG4gIHBvc3RTaXplOiAxMCxcbiAgLy8gaW5qZWN0XG4gIGluamVjdDoge1xuICAgIC8vIFx1NTkzNFx1OTBFOFxuICAgIC8vIGh0dHBzOi8vdml0ZXByZXNzLmRldi96aC9yZWZlcmVuY2Uvc2l0ZS1jb25maWcjaGVhZFxuICAgIGhlYWRlcjogW1xuICAgICAgLy8gZmF2aWNvblxuICAgICAgW1wibGlua1wiLCB7IHJlbDogXCJpY29uXCIsIGhyZWY6IFwiL2Zhdmljb24uaWNvXCIgfV0sXG4gICAgICAvLyBSU1NcbiAgICAgIFtcbiAgICAgICAgXCJsaW5rXCIsXG4gICAgICAgIHtcbiAgICAgICAgICByZWw6IFwiYWx0ZXJuYXRlXCIsXG4gICAgICAgICAgdHlwZTogXCJhcHBsaWNhdGlvbi9yc3MreG1sXCIsXG4gICAgICAgICAgdGl0bGU6IFwiUlNTXCIsXG4gICAgICAgICAgaHJlZjogXCJodHRwczovL2Jsb2cuaW1zeXkudG9wL3Jzcy54bWxcIixcbiAgICAgICAgfSxcbiAgICAgIF0sXG4gICAgICAvLyBcdTk4ODRcdThGN0QgQ0ROXG4gICAgICBbXG4gICAgICAgIFwibGlua1wiLFxuICAgICAgICB7XG4gICAgICAgICAgY3Jvc3NvcmlnaW46IFwiXCIsXG4gICAgICAgICAgcmVsOiBcInByZWNvbm5lY3RcIixcbiAgICAgICAgICBocmVmOiBcImh0dHBzOi8vczEuaGRzbGIuY29tXCIsXG4gICAgICAgIH0sXG4gICAgICBdLFxuICAgICAgW1xuICAgICAgICBcImxpbmtcIixcbiAgICAgICAge1xuICAgICAgICAgIGNyb3Nzb3JpZ2luOiBcIlwiLFxuICAgICAgICAgIHJlbDogXCJwcmVjb25uZWN0XCIsXG4gICAgICAgICAgaHJlZjogXCJodHRwczovL21pcnJvcnMuc3VzdGVjaC5lZHUuY25cIixcbiAgICAgICAgfSxcbiAgICAgIF0sXG4gICAgICAvLyBIYXJtb255T1MgZm9udFxuICAgICAgW1xuICAgICAgICBcImxpbmtcIixcbiAgICAgICAge1xuICAgICAgICAgIGNyb3Nzb3JpZ2luOiBcImFub255bW91c1wiLFxuICAgICAgICAgIHJlbDogXCJzdHlsZXNoZWV0XCIsXG4gICAgICAgICAgaHJlZjogXCJodHRwczovL3MxLmhkc2xiLmNvbS9iZnMvc3RhdGljL2ppbmtlbGEvbG9uZy9mb250L3JlZ3VsYXIuY3NzXCIsXG4gICAgICAgIH0sXG4gICAgICBdLFxuICAgICAgW1xuICAgICAgICBcImxpbmtcIixcbiAgICAgICAge1xuICAgICAgICAgIGNyb3Nzb3JpZ2luOiBcImFub255bW91c1wiLFxuICAgICAgICAgIHJlbDogXCJzdHlsZXNoZWV0XCIsXG4gICAgICAgICAgaHJlZjogXCJodHRwczovL21pcnJvcnMuc3VzdGVjaC5lZHUuY24vY2RuanMvYWpheC9saWJzL2x4Z3ctd2Vua2FpLXNjcmVlbi13ZWJmb250LzEuNy4wL3N0eWxlLmNzc1wiLFxuICAgICAgICB9LFxuICAgICAgXSxcbiAgICAgIC8vIGljb25mb250XG4gICAgICBbXG4gICAgICAgIFwibGlua1wiLFxuICAgICAgICB7XG4gICAgICAgICAgY3Jvc3NvcmlnaW46IFwiYW5vbnltb3VzXCIsXG4gICAgICAgICAgcmVsOiBcInN0eWxlc2hlZXRcIixcbiAgICAgICAgICBocmVmOiBcImh0dHBzOi8vY2RuMi5jb2Rlc2lnbi5xcS5jb20vaWNvbnMvZzVacEVneDN6NFZPNmoyL2xhdGVzdC9pY29uZm9udC5jc3NcIixcbiAgICAgICAgfSxcbiAgICAgIF0sXG4gICAgICAvLyBFbWJlZCBjb2RlXG4gICAgICBbXCJsaW5rXCIsIHsgcmVsOiBcInByZWNvbm5lY3RcIiwgaHJlZjogXCJodHRwczovL3VzZS5zZXZlbmNkbi5jb21cIiB9XSxcbiAgICAgIFtcImxpbmtcIiwgeyByZWw6IFwicHJlY29ubmVjdFwiLCBocmVmOiBcImh0dHBzOi8vZm9udHMuZ3N0YXRpYy5jb21cIiwgY3Jvc3NvcmlnaW46IFwiXCIgfV0sXG4gICAgICBbXG4gICAgICAgIFwibGlua1wiLFxuICAgICAgICB7XG4gICAgICAgICAgY3Jvc3NvcmlnaW46IFwiYW5vbnltb3VzXCIsXG4gICAgICAgICAgaHJlZjogXCJodHRwczovL3VzZS5zZXZlbmNkbi5jb20vY3NzMj9mYW1pbHk9RmlyYStDb2RlOndnaHRAMzAwLi43MDAmZGlzcGxheT1zd2FwXCIsXG4gICAgICAgICAgcmVsOiBcInN0eWxlc2hlZXRcIixcbiAgICAgICAgfSxcbiAgICAgIF0sXG4gICAgICAvLyBcdTk4ODRcdThGN0QgRG9jU2VhcmNoXG4gICAgICBbXG4gICAgICAgIFwibGlua1wiLFxuICAgICAgICB7XG4gICAgICAgICAgaHJlZjogXCJodHRwczovL1g1RUJFWkI1M0ktZHNuLmFsZ29saWEubmV0XCIsXG4gICAgICAgICAgcmVsOiBcInByZWNvbm5lY3RcIixcbiAgICAgICAgICBjcm9zc29yaWdpbjogXCJcIixcbiAgICAgICAgfSxcbiAgICAgIF0sXG4gICAgXSxcbiAgfSxcbiAgLy8gXHU1QkZDXHU4MjJBXHU2ODBGXHU4M0RDXHU1MzU1XG4gIG5hdjogW1xuICAgIHtcbiAgICAgIHRleHQ6IFwiXHU2NTg3XHU1RTkzXCIsXG4gICAgICBpdGVtczogW1xuICAgICAgICB7IHRleHQ6IFwiXHU2NTg3XHU3QUUwXHU1MjE3XHU4ODY4XCIsIGxpbms6IFwiL3BhZ2VzL2FyY2hpdmVzXCIsIGljb246IFwiYXJ0aWNsZVwiIH0sXG4gICAgICAgIHsgdGV4dDogXCJcdTUxNjhcdTkwRThcdTUyMDZcdTdDN0JcIiwgbGluazogXCIvcGFnZXMvY2F0ZWdvcmllc1wiLCBpY29uOiBcImZvbGRlclwiIH0sXG4gICAgICAgIHsgdGV4dDogXCJcdTUxNjhcdTkwRThcdTY4MDdcdTdCN0VcIiwgbGluazogXCIvcGFnZXMvdGFnc1wiLCBpY29uOiBcImhhc2h0YWdcIiB9LFxuICAgICAgXSxcbiAgICB9LFxuICAgIHtcbiAgICAgIHRleHQ6IFwiXHU0RTEzXHU2ODBGXCIsXG4gICAgICBpdGVtczogW1xuICAgICAgICB7IHRleHQ6IFwiXHU2MjgwXHU2NzJGXHU1MjA2XHU0RUFCXCIsIGxpbms6IFwiL3BhZ2VzL2NhdGVnb3JpZXMvXHU2MjgwXHU2NzJGXHU1MjA2XHU0RUFCXCIsIGljb246IFwiY29kZVwiIH0sXG4gICAgICAgIHsgdGV4dDogXCJcdThGRDBcdTdFRjRcdTdCMTRcdThCQjBcIiwgbGluazogXCIvcGFnZXMvY2F0ZWdvcmllcy9cdThGRDBcdTdFRjRcdTdCMTRcdThCQjBcIiwgaWNvbjogXCJ0ZWNobmljYWxcIiB9LFxuICAgICAgICB7IHRleHQ6IFwiXHU2NUU1XHU1RTM4XHU5NjhGXHU3QjE0XCIsIGxpbms6IFwiL3BhZ2VzL2NhdGVnb3JpZXMvXHU2NUU1XHU1RTM4XHU5NjhGXHU3QjE0XCIsIGljb246IFwiZGF0ZVwiIH0sXG4gICAgICBdLFxuICAgIH0sXG4gIF0sXG4gIC8vIFx1NUJGQ1x1ODIyQVx1NjgwRlx1ODNEQ1x1NTM1NSAtIFx1NURFNlx1NEZBN1xuICBuYXZNb3JlOiBbXG4gICAge1xuICAgICAgbmFtZTogXCJcdTdGNTFcdTdBRDlcdTUyMTdcdTg4NjhcIixcbiAgICAgIGxpc3Q6IFtcbiAgICAgICAge1xuICAgICAgICAgIGljb246IFwiL2ltYWdlcy9ob21lLnBuZ1wiLFxuICAgICAgICAgIG5hbWU6IFwiXHU0RTNCXHU5ODc1XCIsXG4gICAgICAgICAgdXJsOiBcImh0dHBzOi8vc3V6aGliaW4uY25cIixcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIGljb246IFwiL2ltYWdlcy9uYXYucG5nXCIsXG4gICAgICAgICAgbmFtZTogXCJcdTVCRkNcdTgyMkFcIixcbiAgICAgICAgICB1cmw6IFwiaHR0cHM6Ly9uYXYuc3V6aGliaW4uY25cIixcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIGljb246IFwiL2ltYWdlcy90b29scy5wbmdcIixcbiAgICAgICAgICBuYW1lOiBcIlx1NURFNVx1NTE3N1wiLFxuICAgICAgICAgIHVybDogXCJodHRwczovL3Rvb2xzLnN1emhpYmluLmNuXCIsXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBpY29uOiBcIi9pbWFnZXMvdHYucG5nXCIsXG4gICAgICAgICAgbmFtZTogXCJcdTVGNzFcdTg5QzZcIixcbiAgICAgICAgICB1cmw6IFwiaHR0cHM6Ly90di5zdXpoaWJpbi5jblwiLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgaWNvbjogXCIvaW1hZ2VzL2Jvb2sucG5nXCIsXG4gICAgICAgICAgbmFtZTogXCJcdTRFNjZcdTdDNERcIixcbiAgICAgICAgICB1cmw6IFwiaHR0cHM6Ly9ib29rLnN1emhpYmluLmNuXCIsXG4gICAgICAgIH0sXG4gICAgICBdLFxuICAgIH0sXG4gIF0sXG4gIC8vIFx1NUMwMVx1OTc2Mlx1OTE0RFx1N0Y2RVxuICBjb3Zlcjoge1xuICAgIC8vIFx1NjYyRlx1NTQyNlx1NUYwMFx1NTQyRlx1NTNDQ1x1NjgwRlx1NUUwM1x1NUM0MFxuICAgIHR3b0NvbHVtbnM6IGZhbHNlLFxuICAgIC8vIFx1NjYyRlx1NTQyNlx1NUYwMFx1NTQyRlx1NUMwMVx1OTc2Mlx1NjYzRVx1NzkzQVxuICAgIHNob3dDb3Zlcjoge1xuICAgICAgLy8gXHU2NjJGXHU1NDI2XHU1RjAwXHU1NDJGXHU1QzAxXHU5NzYyXHU2NjNFXHU3OTNBIFx1NjU4N1x1N0FFMFx1NEUwRFx1OEJCRVx1N0Y2RWNvdmVyXHU1QzAxXHU5NzYyXHU0RjFBXHU2NjNFXHU3OTNBXHU1RjAyXHU1RTM4XHVGRjBDXHU1M0VGXHU0RUU1XHU4QkJFXHU3RjZFXHU0RTBCXHU2NUI5XHU5RUQ4XHU4QkE0XHU1QzAxXHU5NzYyXG4gICAgICBlbmFibGU6IGZhbHNlLFxuICAgICAgLy8gXHU1QzAxXHU5NzYyXHU1RTAzXHU1QzQwXHU2NUI5XHU1RjBGOiBsZWZ0IHwgcmlnaHQgfCBib3RoXG4gICAgICBjb3ZlckxheW91dDogXCJib3RoXCIsXG4gICAgICAvLyBcdTlFRDhcdThCQTRcdTVDMDFcdTk3NjIoXHU5NjhGXHU2NzNBXHU1QzU1XHU3OTNBKVxuICAgICAgZGVmYXVsdENvdmVyOiBbXSxcbiAgICB9LFxuICB9LFxuICAvLyBcdTk4NzVcdTgxMUFcdTRGRTFcdTYwNkZcbiAgZm9vdGVyOiB7XG4gICAgLy8gXHU3OTNFXHU0RUE0XHU5NEZFXHU2M0E1XHVGRjA4XHU4QkY3XHU3ODZFXHU0RkREXHU0RTNBXHU1MDc2XHU2NTcwXHU0RTJBXHVGRjA5XG4gICAgc29jaWFsOiBbXG4gICAgICB7XG4gICAgICAgIGljb246IFwiZ2l0aHViXCIsXG4gICAgICAgIGxpbms6IFwiaHR0cHM6Ly9naXRodWIuY29tL2Z1ZnV5b3V5b3VcIixcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIGljb246IFwiYmlsaWJpbGlcIixcbiAgICAgICAgbGluazogXCJodHRwczovL3NwYWNlLmJpbGliaWxpLmNvbS8yNDI1NDc1OThcIixcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIGljb246IFwicXFcIixcbiAgICAgICAgbGluazogXCJodHRwczovL3Jlcy5hYmVpbS5jbi9hcGkvcXEvP3FxPTEyNDIwNjY4NTRcIixcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIGljb246IFwiZW1haWxcIixcbiAgICAgICAgbGluazogXCJtYWlsdG86MTg3MzU4ODA0NDdAMTM5LmNvbVwiLFxuICAgICAgfSxcbiAgICBdLFxuICAgIC8vIHNpdGVtYXBcbiAgICBzaXRlbWFwOiBbXSxcbiAgfSxcbiAgLy8gXHU4QkM0XHU4QkJBXG4gIGNvbW1lbnQ6IHtcbiAgICBlbmFibGU6IHRydWUsXG4gICAgLy8gXHU4QkM0XHU4QkJBXHU3Q0ZCXHU3RURGXHU5MDA5XHU2MkU5XG4gICAgLy8gYXJ0YWxrIC8gdHdpa29vXG4gICAgdHlwZTogXCJhcnRhbGtcIixcbiAgICAvLyBhcnRhbGtcbiAgICAvLyBodHRwczovL2FydGFsay5qcy5vcmcvXG4gICAgYXJ0YWxrOiB7XG4gICAgICBzaXRlOiBcIlx1N0QyMFx1OEZEOFx1NzcxRlwiLFxuICAgICAgc2VydmVyOiBcImh0dHBzOi8vY29tbWVudC5zdXpoaWJpbi5jblwiLFxuICAgICAgc2l0ZVVybDogXCJodHRwczovL2Jsb2cuc3V6aGliaW4uY25cIixcbiAgICB9LFxuICAgIC8vIHR3aWtvb1xuICAgIC8vIGh0dHBzOi8vdHdpa29vLmpzLm9yZy9cbiAgICB0d2lrb286IHtcbiAgICAgIC8vIFx1NUZDNVx1NTg2Qlx1RkYwQ1x1ODJFNVx1NEUwRFx1NjBGM1x1NEY3Rlx1NzUyOCBDRE5cdUZGMENcdTUzRUZcdTRFRTVcdTRGN0ZcdTc1MjggcG5wbSBhZGQgdHdpa29vIFx1NUI4OVx1ODhDNVx1NUU3Nlx1NUYxNVx1NTE2NVxuICAgICAganM6IFwiaHR0cHM6Ly9taXJyb3JzLnN1c3RlY2guZWR1LmNuL2NkbmpzL2FqYXgvbGlicy90d2lrb28vMS42LjM5L3R3aWtvby5hbGwubWluLmpzXCIsXG4gICAgICBlbnZJZDogXCJcIixcbiAgICAgIC8vIFx1NzNBRlx1NTg4M1x1NTczMFx1NTdERlx1RkYwQ1x1OUVEOFx1OEJBNFx1NEUzQSBhcC1zaGFuZ2hhaVx1RkYwQ1x1ODE3RVx1OEJBRlx1NEU5MVx1NzNBRlx1NTg4M1x1NTg2QiBhcC1zaGFuZ2hhaSBcdTYyMTYgYXAtZ3Vhbmd6aG91XHVGRjFCVmVyY2VsIFx1NzNBRlx1NTg4M1x1NEUwRFx1NTg2QlxuICAgICAgcmVnaW9uOiBcImFwLXNoYW5naGFpXCIsXG4gICAgICBsYW5nOiBcInpoLUNOXCIsXG4gICAgfSxcbiAgfSxcbiAgLy8gXHU0RkE3XHU4RkI5XHU2ODBGXG4gIGFzaWRlOiB7XG4gICAgLy8gXHU3QUQ5XHU3MEI5XHU3QjgwXHU0RUNCXG4gICAgaGVsbG86IHtcbiAgICAgIGVuYWJsZTogdHJ1ZSxcbiAgICAgIHRleHQ6IFwiXHU5NzVFXHU1NDNFXHU1QzBGXHU1OTI5XHU0RTBCXHVGRjBDXHU2MjREXHU5QUQ4XHU4MDBDXHU1REYyXHVGRjFCXHU5NzVFXHU1NDNFXHU3RUI1XHU1M0U0XHU0RUNBXHVGRjBDXHU2NUY2XHU4RDRCXHU4MDBDXHU1REYyXHVGRjFCXHU5NzVFXHU1NDNFXHU3NzY4XHU0RTVEXHU1RERFXHVGRjBDXHU1QjhGXHU4OUMyXHU4MDBDXHU1REYyXHVGRjFCXHU0RTA5XHU5NzVFXHU3MTA5XHU3RjZBXHVGRjFGXHU2NUUwXHU2OEE2XHU4MUYzXHU4MERDXHUzMDAyXCIsXG4gICAgfSxcbiAgICAvLyBcdTc2RUVcdTVGNTVcbiAgICB0b2M6IHtcbiAgICAgIGVuYWJsZTogdHJ1ZSxcbiAgICB9LFxuICAgIC8vIFx1NjgwN1x1N0I3RVxuICAgIHRhZ3M6IHtcbiAgICAgIGVuYWJsZTogdHJ1ZSxcbiAgICB9LFxuICAgIC8vIFx1NTAxMlx1OEJBMVx1NjVGNlxuICAgIGNvdW50RG93bjoge1xuICAgICAgZW5hYmxlOiB0cnVlLFxuICAgICAgLy8gXHU1MDEyXHU4QkExXHU2NUY2XHU2NUU1XHU2NzFGXG4gICAgICBkYXRhOiB7XG4gICAgICAgIG5hbWU6IFwiXHU2NjI1XHU4MjgyXCIsXG4gICAgICAgIGRhdGU6IFwiMjAyNi0wMi0xNlwiLFxuICAgICAgfSxcbiAgICB9LFxuICAgIC8vIFx1N0FEOVx1NzBCOVx1NjU3MFx1NjM2RVxuICAgIHNpdGVEYXRhOiB7XG4gICAgICBlbmFibGU6IHRydWUsXG4gICAgfSxcbiAgfSxcbiAgLy8gXHU1M0NCXHU5NEZFXG4gIGZyaWVuZHM6IHtcbiAgICAvLyBcdTUzQ0JcdTk0RkVcdTY3MEJcdTUzQ0JcdTU3MDhcbiAgICBjaXJjbGVPZkZyaWVuZHM6IFwiXCIsXG4gICAgLy8gXHU1MkE4XHU2MDAxXHU1M0NCXHU5NEZFXG4gICAgZHluYW1pY0xpbms6IHtcbiAgICAgIHNlcnZlcjogXCJcIixcbiAgICAgIGFwcF90b2tlbjogXCJcIixcbiAgICAgIHRhYmxlX2lkOiBcIlwiLFxuICAgIH0sXG4gIH0sXG4gIC8vIFx1OTdGM1x1NEU1MFx1NjRBRFx1NjUzRVx1NTY2OFxuICAvLyBodHRwczovL2dpdGh1Yi5jb20vaW1zeXkvTWV0aW5nLUFQSVxuICBtdXNpYzoge1xuICAgIGVuYWJsZTogZmFsc2UsXG4gICAgLy8gdXJsXG4gICAgdXJsOiBcImh0dHBzOi8vYXBpLW1ldGluZy5leGFtcGxlLmNvbVwiLFxuICAgIC8vIGlkXG4gICAgaWQ6IDkzNzk4MzE3MTQsXG4gICAgLy8gbmV0ZWFzZSAvIHRlbmNlbnQgLyBrdWdvdVxuICAgIHNlcnZlcjogXCJuZXRlYXNlXCIsXG4gICAgLy8gcGxheWxpc3QgLyBhbGJ1bSAvIHNvbmdcbiAgICB0eXBlOiBcInBsYXlsaXN0XCIsXG4gIH0sXG4gIC8vIFx1NjQxQ1x1N0QyMlxuICAvLyBodHRwczovL3d3dy5hbGdvbGlhLmNvbS9cbiAgc2VhcmNoOiB7XG4gICAgZW5hYmxlOiBmYWxzZSxcbiAgICBhcHBJZDogXCJcIixcbiAgICBhcGlLZXk6IFwiXCIsXG4gIH0sXG4gIC8vIFx1NjI1M1x1OEQ0RlxuICByZXdhcmREYXRhOiB7XG4gICAgZW5hYmxlOiBmYWxzZSxcbiAgICAvLyBcdTVGQUVcdTRGRTFcdTRFOENcdTdFRjRcdTc4MDFcbiAgICB3ZWNoYXQ6IFwiaHR0cHM6Ly9waWMuZWZlZmVlLmNuL3VwbG9hZHMvMjAyNC8wNC8wNy82NjEyMTA0OWQxZTgwLndlYnBcIixcbiAgICAvLyBcdTY1MkZcdTRFRDhcdTVCOURcdTRFOENcdTdFRjRcdTc4MDFcbiAgICBhbGlwYXk6IFwiaHR0cHM6Ly9waWMuZWZlZmVlLmNuL3VwbG9hZHMvMjAyNC8wNC8wNy82NjEyMDY2MzFkM2I1LndlYnBcIixcbiAgfSxcbiAgLy8gXHU1NkZFXHU3MjQ3XHU3MDZGXHU3QkIxXG4gIGZhbmN5Ym94OiB7XG4gICAgZW5hYmxlOiB0cnVlLFxuICAgIGpzOiBcImh0dHBzOi8vbWlycm9ycy5zdXN0ZWNoLmVkdS5jbi9jZG5qcy9hamF4L2xpYnMvZmFuY3lhcHBzLXVpLzUuMC4zNi9mYW5jeWJveC9mYW5jeWJveC51bWQubWluLmpzXCIsXG4gICAgY3NzOiBcImh0dHBzOi8vbWlycm9ycy5zdXN0ZWNoLmVkdS5jbi9jZG5qcy9hamF4L2xpYnMvZmFuY3lhcHBzLXVpLzUuMC4zNi9mYW5jeWJveC9mYW5jeWJveC5taW4uY3NzXCIsXG4gIH0sXG4gIC8vIFx1NTkxNlx1OTRGRVx1NEUyRFx1OEY2Q1xuICBqdW1wUmVkaXJlY3Q6IHtcbiAgICBlbmFibGU6IGZhbHNlLFxuICAgIC8vIFx1NjM5Mlx1OTY2NFx1N0M3Qlx1NTQwRFxuICAgIGV4Y2x1ZGU6IFtcbiAgICAgIFwiY2YtZnJpZW5kcy1saW5rXCIsXG4gICAgICBcInVweXVuXCIsXG4gICAgICBcImljcFwiLFxuICAgICAgXCJhdXRob3JcIixcbiAgICAgIFwicnNzXCIsXG4gICAgICBcImNjXCIsXG4gICAgICBcInBvd2VyXCIsXG4gICAgICBcInNvY2lhbC1saW5rXCIsXG4gICAgICBcImxpbmstdGV4dFwiLFxuICAgICAgXCJ0cmF2ZWxsaW5nc1wiLFxuICAgICAgXCJwb3N0LWxpbmtcIixcbiAgICAgIFwicmVwb3J0XCIsXG4gICAgICBcIm1vcmUtbGlua1wiLFxuICAgICAgXCJza2lsbHMtaXRlbVwiLFxuICAgICAgXCJyaWdodC1tZW51LWxpbmtcIixcbiAgICAgIFwibGluay1jYXJkXCIsXG4gICAgXSxcbiAgfSxcbiAgLy8gXHU3QUQ5XHU3MEI5XHU3RURGXHU4QkExXG4gIHRvbmdqaToge1xuICAgIFwiNTFsYVwiOiBcIlwiLFxuICB9LFxufTtcbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiRjpcXFxcc3V6aGliaW5cXFxcYmxvZ1xcXFwudml0ZXByZXNzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJGOlxcXFxzdXpoaWJpblxcXFxibG9nXFxcXC52aXRlcHJlc3NcXFxcaW5pdC5tanNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0Y6L3N1emhpYmluL2Jsb2cvLnZpdGVwcmVzcy9pbml0Lm1qc1wiO2ltcG9ydCB7IHRoZW1lQ29uZmlnIH0gZnJvbSBcIi4vdGhlbWUvYXNzZXRzL3RoZW1lQ29uZmlnLm1qc1wiO1xyXG5pbXBvcnQgeyBleGlzdHNTeW5jIH0gZnJvbSBcImZzXCI7XHJcbmltcG9ydCBwYXRoIGZyb20gXCJwYXRoXCI7XHJcblxyXG4vKipcclxuICogXHU4M0I3XHU1M0Q2XHU1RTc2XHU1NDA4XHU1RTc2XHU5MTREXHU3RjZFXHU2NTg3XHU0RUY2XHJcbiAqL1xyXG5leHBvcnQgY29uc3QgZ2V0VGhlbWVDb25maWcgPSBhc3luYyAoKSA9PiB7XHJcbiAgdHJ5IHtcclxuICAgIC8vIFx1OTE0RFx1N0Y2RVx1NjU4N1x1NEVGNlx1N0VERFx1NUJGOVx1OERFRlx1NUY4NFxyXG4gICAgY29uc3QgY29uZmlnUGF0aCA9IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsIFwiLi4vdGhlbWVDb25maWcubWpzXCIpO1xyXG4gICAgaWYgKGV4aXN0c1N5bmMoY29uZmlnUGF0aCkpIHtcclxuICAgICAgLy8gXHU2NTg3XHU0RUY2XHU1QjU4XHU1NzI4XHU2NUY2XHU4RkRCXHU4ODRDXHU1MkE4XHU2MDAxXHU1QkZDXHU1MTY1XHJcbiAgICAgIGNvbnN0IHVzZXJDb25maWcgPSBhd2FpdCBpbXBvcnQoXCIuLi90aGVtZUNvbmZpZy5tanNcIik7XHJcbiAgICAgIHJldHVybiBPYmplY3QuYXNzaWduKHRoZW1lQ29uZmlnLCB1c2VyQ29uZmlnPy50aGVtZUNvbmZpZyB8fCB7fSk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAvLyBcdTY1ODdcdTRFRjZcdTRFMERcdTVCNThcdTU3MjhcdTY1RjZcdThGRDRcdTU2REVcdTlFRDhcdThCQTRcdTkxNERcdTdGNkVcclxuICAgICAgY29uc29sZS53YXJuKFwiVXNlciBjb25maWd1cmF0aW9uIGZpbGUgbm90IGZvdW5kLCB1c2luZyBkZWZhdWx0IHRoZW1lQ29uZmlnLlwiKTtcclxuICAgICAgcmV0dXJuIHRoZW1lQ29uZmlnO1xyXG4gICAgfVxyXG4gIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICBjb25zb2xlLmVycm9yKFwiQW4gZXJyb3Igb2NjdXJyZWQgd2hpbGUgbG9hZGluZyB0aGUgY29uZmlndXJhdGlvbjpcIiwgZXJyb3IpO1xyXG4gICAgcmV0dXJuIHRoZW1lQ29uZmlnO1xyXG4gIH1cclxufTtcclxuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJGOlxcXFxzdXpoaWJpblxcXFxibG9nXFxcXC52aXRlcHJlc3NcXFxcdGhlbWVcXFxcdXRpbHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkY6XFxcXHN1emhpYmluXFxcXGJsb2dcXFxcLnZpdGVwcmVzc1xcXFx0aGVtZVxcXFx1dGlsc1xcXFxtYXJrZG93bkNvbmZpZy5tanNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0Y6L3N1emhpYmluL2Jsb2cvLnZpdGVwcmVzcy90aGVtZS91dGlscy9tYXJrZG93bkNvbmZpZy5tanNcIjtpbXBvcnQgeyB0YWJzTWFya2Rvd25QbHVnaW4gfSBmcm9tIFwidml0ZXByZXNzLXBsdWdpbi10YWJzXCI7XHJcbmltcG9ydCBtYXJrZG93bkl0QXR0cnMgZnJvbSBcIm1hcmtkb3duLWl0LWF0dHJzXCI7XHJcbmltcG9ydCBjb250YWluZXIgZnJvbSBcIm1hcmtkb3duLWl0LWNvbnRhaW5lclwiO1xyXG5cclxuLy8gbWFya2Rvd24taXRcclxuY29uc3QgbWFya2Rvd25Db25maWcgPSAobWQsIHRoZW1lQ29uZmlnKSA9PiB7XHJcbiAgLy8gXHU2M0QyXHU0RUY2XHJcbiAgbWQudXNlKG1hcmtkb3duSXRBdHRycyk7XHJcbiAgbWQudXNlKHRhYnNNYXJrZG93blBsdWdpbik7XHJcbiAgLy8gdGltZWxpbmVcclxuICBtZC51c2UoY29udGFpbmVyLCBcInRpbWVsaW5lXCIsIHtcclxuICAgIHZhbGlkYXRlOiAocGFyYW1zKSA9PiBwYXJhbXMudHJpbSgpLm1hdGNoKC9edGltZWxpbmVcXHMrKC4qKSQvKSxcclxuICAgIHJlbmRlcjogKHRva2VucywgaWR4KSA9PiB7XHJcbiAgICAgIGNvbnN0IG0gPSB0b2tlbnNbaWR4XS5pbmZvLnRyaW0oKS5tYXRjaCgvXnRpbWVsaW5lXFxzKyguKikkLyk7XHJcbiAgICAgIGlmICh0b2tlbnNbaWR4XS5uZXN0aW5nID09PSAxKSB7XHJcbiAgICAgICAgcmV0dXJuIGA8ZGl2IGNsYXNzPVwidGltZWxpbmVcIj5cclxuICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cInRpbWVsaW5lLXRpdGxlXCI+JHttZC51dGlscy5lc2NhcGVIdG1sKG1bMV0pfTwvc3Bhbj5cclxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwidGltZWxpbmUtY29udGVudFwiPmA7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgcmV0dXJuIFwiPC9kaXY+PC9kaXY+XFxuXCI7XHJcbiAgICAgIH1cclxuICAgIH0sXHJcbiAgfSk7XHJcbiAgLy8gcmFkaW9cclxuICBtZC51c2UoY29udGFpbmVyLCBcInJhZGlvXCIsIHtcclxuICAgIHJlbmRlcjogKHRva2VucywgaWR4LCBfb3B0aW9ucywgZW52KSA9PiB7XHJcbiAgICAgIGNvbnN0IHRva2VuID0gdG9rZW5zW2lkeF07XHJcbiAgICAgIGNvbnN0IGNoZWNrID0gdG9rZW4uaW5mby50cmltKCkuc2xpY2UoXCJyYWRpb1wiLmxlbmd0aCkudHJpbSgpO1xyXG4gICAgICBpZiAodG9rZW4ubmVzdGluZyA9PT0gMSkge1xyXG4gICAgICAgIGNvbnN0IGlzQ2hlY2tlZCA9IG1kLnJlbmRlcklubGluZShjaGVjaywge1xyXG4gICAgICAgICAgcmVmZXJlbmNlczogZW52LnJlZmVyZW5jZXMsXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgcmV0dXJuIGA8ZGl2IGNsYXNzPVwicmFkaW9cIj5cclxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJyYWRpby1wb2ludCAke2lzQ2hlY2tlZH1cIiAvPmA7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgcmV0dXJuIFwiPC9kaXY+XCI7XHJcbiAgICAgIH1cclxuICAgIH0sXHJcbiAgfSk7XHJcbiAgLy8gYnV0dG9uXHJcbiAgbWQudXNlKGNvbnRhaW5lciwgXCJidXR0b25cIiwge1xyXG4gICAgcmVuZGVyOiAodG9rZW5zLCBpZHgsIF9vcHRpb25zKSA9PiB7XHJcbiAgICAgIGNvbnN0IHRva2VuID0gdG9rZW5zW2lkeF07XHJcbiAgICAgIGNvbnN0IGNoZWNrID0gdG9rZW4uaW5mby50cmltKCkuc2xpY2UoXCJidXR0b25cIi5sZW5ndGgpLnRyaW0oKTtcclxuICAgICAgaWYgKHRva2VuLm5lc3RpbmcgPT09IDEpIHtcclxuICAgICAgICByZXR1cm4gYDxidXR0b24gY2xhc3M9XCJidXR0b24gJHtjaGVja31cIj5gO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHJldHVybiBcIjwvYnV0dG9uPlwiO1xyXG4gICAgICB9XHJcbiAgICB9LFxyXG4gIH0pO1xyXG4gIC8vIGNhcmRcclxuICBtZC51c2UoY29udGFpbmVyLCBcImNhcmRcIiwge1xyXG4gICAgcmVuZGVyOiAodG9rZW5zLCBpZHgsIF9vcHRpb25zKSA9PiB7XHJcbiAgICAgIGNvbnN0IHRva2VuID0gdG9rZW5zW2lkeF07XHJcbiAgICAgIGlmICh0b2tlbi5uZXN0aW5nID09PSAxKSB7XHJcbiAgICAgICAgcmV0dXJuIGA8ZGl2IGNsYXNzPVwiY2FyZFwiPmA7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgcmV0dXJuIFwiPC9kaXY+XCI7XHJcbiAgICAgIH1cclxuICAgIH0sXHJcbiAgfSk7XHJcbiAgLy8gXHU4ODY4XHU2ODNDXHJcbiAgbWQucmVuZGVyZXIucnVsZXMudGFibGVfb3BlbiA9ICgpID0+IHtcclxuICAgIHJldHVybiAnPGRpdiBjbGFzcz1cInRhYmxlLWNvbnRhaW5lclwiPjx0YWJsZT4nO1xyXG4gIH07XHJcbiAgbWQucmVuZGVyZXIucnVsZXMudGFibGVfY2xvc2UgPSAoKSA9PiB7XHJcbiAgICByZXR1cm4gXCI8L3RhYmxlPjwvZGl2PlwiO1xyXG4gIH07XHJcbiAgLy8gXHU1NkZFXHU3MjQ3XHJcbiAgbWQucmVuZGVyZXIucnVsZXMuaW1hZ2UgPSAodG9rZW5zLCBpZHgpID0+IHtcclxuICAgIGNvbnN0IHRva2VuID0gdG9rZW5zW2lkeF07XHJcbiAgICBjb25zdCBzcmMgPSB0b2tlbi5hdHRyc1t0b2tlbi5hdHRySW5kZXgoXCJzcmNcIildWzFdO1xyXG4gICAgY29uc3QgYWx0ID0gdG9rZW4uY29udGVudDtcclxuICAgIGlmICghdGhlbWVDb25maWcuZmFuY3lib3guZW5hYmxlKSB7XHJcbiAgICAgIHJldHVybiBgPGltZyBzcmM9XCIke3NyY31cIiBhbHQ9XCIke2FsdH1cIiBsb2FkaW5nPVwibGF6eVwiPmA7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gYDxhIGNsYXNzPVwiaW1nLWZhbmN5Ym94XCIgaHJlZj1cIiR7c3JjfVwiIGRhdGEtZmFuY3lib3g9XCJnYWxsZXJ5XCIgZGF0YS1jYXB0aW9uPVwiJHthbHR9XCI+XHJcbiAgICAgICAgICAgICAgICA8aW1nIGNsYXNzPVwicG9zdC1pbWdcIiBzcmM9XCIke3NyY31cIiBhbHQ9XCIke2FsdH1cIiBsb2FkaW5nPVwibGF6eVwiIC8+XHJcbiAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cInBvc3QtaW1nLXRpcFwiPiR7YWx0fTwvc3Bhbj5cclxuICAgICAgICAgICAgICA8L2E+YDtcclxuICB9O1xyXG4gIFxyXG4gIC8vIG9ic2lkaWFuIGFkbW9uaXRpb25cclxuICBjb25zdCBmZW5jZSA9IG1kLnJlbmRlcmVyLnJ1bGVzLmZlbmNlO1xyXG4gIG1kLnJlbmRlcmVyLnJ1bGVzLmZlbmNlID0gKC4uLmFyZ3MpID0+IHtcclxuICAgIGNvbnN0IFt0b2tlbnMsIGlkeF0gPSBhcmdzO1xyXG4gICAgY29uc3QgdG9rZW4gPSB0b2tlbnNbaWR4XTtcclxuICAgIGNvbnN0IGxhbmcgPSB0b2tlbi5pbmZvLnRyaW0oKTtcclxuXHJcbiAgICAvLyBcdTU5MDRcdTc0MDYgT2JzaWRpYW4gYWRtb25pdGlvblxyXG4gICAgaWYgKGxhbmcuc3RhcnRzV2l0aCgnYWQtJykpIHtcclxuICAgICAgY29uc3QgdHlwZSA9IGxhbmcuc3Vic3RyaW5nKDMpOyAvLyBcdTUzRDZhZC1cdTRFNEJcdTU0MEVcdTc2ODRcdTUxODVcdTVCQjlcdUZGMENcdTgzQjdcdTUzRDZcdTdDN0JcdTU3OEJcclxuICAgICAgY29uc3QgY29udGVudCA9IHRva2VuLmNvbnRlbnQ7XHJcblxyXG4gICAgICBjb25zdCBhZG1vbml0aW9uVHlwZXMgPSB7XHJcbiAgICAgICAgJ25vdGUnOiAnaW5mbycsXHJcbiAgICAgICAgJ3F1ZXN0aW9uJzogJ2luZm8nLFxyXG4gICAgICAgICd3YXJuaW5nJzogJ3dhcm5pbmcnLFxyXG4gICAgICAgICd0aXAnOiAndGlwJyxcclxuICAgICAgICAnc3VtbWFyeSc6ICdpbmZvJyxcclxuICAgICAgICAnaGludCc6ICd0aXAnLFxyXG4gICAgICAgICdpbXBvcnRhbnQnOiAnd2FybmluZycsXHJcbiAgICAgICAgJ2NhdXRpb24nOiAnd2FybmluZycsXHJcbiAgICAgICAgJ2Vycm9yJzogJ2RhbmdlcicsXHJcbiAgICAgICAgJ2Rhbmdlcic6ICdkYW5nZXInXHJcbiAgICAgIH07XHJcblxyXG4gICAgICBjb25zdCBjbGFzc05hbWUgPSBhZG1vbml0aW9uVHlwZXNbdHlwZV0gfHwgJ2luZm8nO1xyXG4gICAgICBjb25zdCB0aXRsZSA9IHR5cGUudG9VcHBlckNhc2UoKTtcclxuXHJcbiAgICAgIHJldHVybiBgPGRpdiBjbGFzcz1cIiR7Y2xhc3NOYW1lfSBjdXN0b20tYmxvY2tcIj5cclxuICAgICAgICAgICAgPHAgY2xhc3M9XCJjdXN0b20tYmxvY2stdGl0bGVcIj4ke3RpdGxlfTwvcD5cclxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cImN1c3RvbS1ibG9jay1jb250ZW50XCI+XHJcbiAgICAgICAgICAgICAgJHttZC5yZW5kZXIoY29udGVudCl9XHJcbiAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgPC9kaXY+YDtcclxuICAgIH1cclxuICAgIHJldHVybiBmZW5jZSguLi5hcmdzKTtcclxuICB9OyAgXHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCBtYXJrZG93bkNvbmZpZztcclxuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJGOlxcXFxzdXpoaWJpblxcXFxibG9nXFxcXC52aXRlcHJlc3NcXFxcdGhlbWVcXFxcdXRpbHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkY6XFxcXHN1emhpYmluXFxcXGJsb2dcXFxcLnZpdGVwcmVzc1xcXFx0aGVtZVxcXFx1dGlsc1xcXFxyZXF1ZXN0LnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9GOi9zdXpoaWJpbi9ibG9nLy52aXRlcHJlc3MvdGhlbWUvdXRpbHMvcmVxdWVzdC50c1wiO2ltcG9ydCBheGlvcyBmcm9tIFwiYXhpb3NcIjtcclxuXHJcbmNvbnN0IGVycm9ySGFuZGxlciA9IChlcnJvcjogYW55KSA9PiB7XHJcbiAgY29uc29sZS5sb2coXCJlcnJvclwiLCBlcnJvcik7XHJcbiAgbGV0IGVycm9yQ29kZSA9IGVycm9yLmNvZGU7XHJcbiAgaWYgKGVycm9yQ29kZSA9PSBcIkVSUl9ORVRXT1JLXCIpIHtcclxuICAgIGNvbnNvbGUuZXJyb3IoJ1x1N0Y1MVx1N0VEQ1x1OTRGRVx1NjNBNVx1OTUxOVx1OEJFRicpO1xyXG4gICAgcmV0dXJuIFByb21pc2UucmVqZWN0KGVycm9yKTtcclxuICB9XHJcbiAgbGV0IHN0YXR1cyA9IGVycm9yLnJlc3BvbnNlLnN0YXR1cztcclxuICBpZiAoZXJyb3IucmVzcG9uc2UpIHtcclxuICAgIGNvbnN0IHsgbWVzc2FnZSB9ID0gZXJyb3IucmVzcG9uc2UuZGF0YTtcclxuICAgIGlmIChzdGF0dXMgPT09IDQwMykge1xyXG4gICAgICBjb25zb2xlLmVycm9yKG1lc3NhZ2UgfHwgXCJcdTY3MkFcdTYzODhcdTY3NDNcIik7XHJcbiAgICB9IGVsc2UgaWYgKHN0YXR1cyA9PT0gNDA0KSB7XHJcbiAgICAgIGNvbnNvbGUuZXJyb3IoXCJcdThCRjdcdTZDNDJcdTc2ODRcdTk4NzVcdTk3NjJcdUZGMDhcdThENDRcdTZFOTBcdUZGMDlcdTRFMERcdTVCNThcdTU3MjhcIiArIGVycm9yLnJlcXVlc3QucmVzcG9uc2VVUkwpO1xyXG4gICAgfSBlbHNlIGlmIChzdGF0dXMgPT09IDQwMSkge1xyXG4gICAgICBjb25zb2xlLmVycm9yKG1lc3NhZ2UgfHwgXCJcdTY3MkFcdTYzODhcdTY3NDNcIik7XHJcbiAgICB9IGVsc2UgaWYgKHN0YXR1cyA9PT0gNTAwKSB7XHJcbiAgICAgIGNvbnNvbGUuZXJyb3IobWVzc2FnZSB8fCBcIlx1NjcwRFx1NTJBMVx1OTUxOVx1OEJFRlwiKTtcclxuICAgIH1cclxuICAgIHJldHVybiBQcm9taXNlLnJlamVjdChlcnJvcik7XHJcbiAgfVxyXG59O1xyXG5cclxuY29uc3QgcmVxdWVzdCA9IGF4aW9zLmNyZWF0ZSh7XHJcbiAgYmFzZVVSTDogJ2h0dHBzOi8vbWFuYWdlLnN1emhpYmluLmNuL21hbmFnZS1hcGknLFxyXG4gIC8vIGJhc2VVUkw6ICdodHRwOi8vMTI3LjAuMC4xOjgwODAvbWFuYWdlLWFwaScsXHJcbiAgdGltZW91dDogMTAwMDAsIC8vIFx1OEQ4NVx1NjVGNlx1NjVGNlx1OTVGNFx1RkYwQzEwc1xyXG4gIHdpdGhDcmVkZW50aWFsczogdHJ1ZSxcclxuICB2YWxpZGF0ZVN0YXR1cyhzdGF0dXMpIHtcclxuICAgIHJldHVybiBzdGF0dXMgPj0gMjAwICYmIHN0YXR1cyA8IDMwMDtcclxuICB9LFxyXG59KTtcclxucmVxdWVzdC5pbnRlcmNlcHRvcnMucmVxdWVzdC51c2UoY29uZmlnID0+IHtcclxuICAgICAgcmV0dXJuIGNvbmZpZztcclxuICAgIH0sXHJcbiAgICAoZXJyb3IpID0+IHtcclxuICAgICAgcmV0dXJuIGVycm9ySGFuZGxlcihlcnJvcik7XHJcbiAgICB9LFxyXG4pO1xyXG4vLyBhZGQgcmVzcG9uc2UgaW50ZXJjZXB0b3JzXHJcbnJlcXVlc3QuaW50ZXJjZXB0b3JzLnJlc3BvbnNlLnVzZSgocmVzcG9uc2UpID0+IHtcclxuICAgICAgaWYgKHJlc3BvbnNlLmNvbmZpZy5yZXNwb25zZVR5cGUgPT09IFwiYmxvYlwiKSB7XHJcbiAgICAgICAgcmV0dXJuIHJlc3BvbnNlO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHJldHVybiBPYmplY3QuYXNzaWduKHsgc3VjY2VzczogZmFsc2UgfSwgcmVzcG9uc2UuZGF0YSk7XHJcbiAgICAgIH1cclxuICAgIH0sXHJcbiAgICAoZXJyb3IpID0+IHtcclxuICAgICAgcmV0dXJuIGVycm9ySGFuZGxlcihlcnJvcik7XHJcbiAgICB9LFxyXG4pO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgcmVxdWVzdDtcclxuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJGOlxcXFxzdXpoaWJpblxcXFxibG9nXFxcXC52aXRlcHJlc3NcXFxcdGhlbWVcXFxcdXRpbHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkY6XFxcXHN1emhpYmluXFxcXGJsb2dcXFxcLnZpdGVwcmVzc1xcXFx0aGVtZVxcXFx1dGlsc1xcXFxhcGlrZXkudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0Y6L3N1emhpYmluL2Jsb2cvLnZpdGVwcmVzcy90aGVtZS91dGlscy9hcGlrZXkudHNcIjtpbXBvcnQgcmVxdWVzdCBmcm9tIFwiLi9yZXF1ZXN0XCI7XG5pbXBvcnQgQ3J5cHRvSlMgZnJvbSBcImNyeXB0by1qc1wiO1xuXG5jb25zdCBhcGlLZXkgPSAnc2tfZWIzN2EwN2E0NGI4NDRmODg1MWM5ZGFlNzY3MWFmMDknO1xuY29uc3Qgc2VjcmV0S2V5ID0gJ3VmaDduZHdQQVVtbWxOT1N6S1FtekEybVZ6em5abG1BUDZMaGdTNXM1bm89JztcblxuZnVuY3Rpb24gYnVpbGRDYW5vbmljYWxRdWVyeShwYXJhbXM6IFJlY29yZDxzdHJpbmcsIGFueT4gfCB1bmRlZmluZWQpIHtcbiAgaWYgKCFwYXJhbXMpIHJldHVybiBcIlwiO1xuICBjb25zdCBrZXlzID0gT2JqZWN0LmtleXMocGFyYW1zKS5maWx0ZXIoayA9PiBwYXJhbXNba10gIT09IHVuZGVmaW5lZCAmJiBwYXJhbXNba10gIT09IG51bGwpO1xuICBrZXlzLnNvcnQoKTtcbiAgcmV0dXJuIGtleXMubWFwKGsgPT4gYCR7a309JHtwYXJhbXNba119YCkuam9pbihcIiZcIik7XG59XG5cbmZ1bmN0aW9uIHNoYTI1NkhleChib2R5OiBhbnkpOiBzdHJpbmcge1xuICBpZiAoYm9keSA9PT0gdW5kZWZpbmVkIHx8IGJvZHkgPT09IG51bGwpIHJldHVybiBcIlwiO1xuICBpZiAodHlwZW9mIGJvZHkgPT09IFwic3RyaW5nXCIpIHtcbiAgICByZXR1cm4gQ3J5cHRvSlMuU0hBMjU2KGJvZHkpLnRvU3RyaW5nKENyeXB0b0pTLmVuYy5IZXgpO1xuICB9XG4gIGlmIChib2R5IGluc3RhbmNlb2YgRm9ybURhdGEpIHtcbiAgICByZXR1cm4gXCJcIjtcbiAgfVxuICByZXR1cm4gQ3J5cHRvSlMuU0hBMjU2KEpTT04uc3RyaW5naWZ5KGJvZHkpKS50b1N0cmluZyhDcnlwdG9KUy5lbmMuSGV4KTtcbn1cblxuZnVuY3Rpb24gaG1hY0hleCh0ZXh0OiBzdHJpbmcsIHNlY3JldEtleTogc3RyaW5nKTogc3RyaW5nIHtcbiAgcmV0dXJuIENyeXB0b0pTLkhtYWNTSEEyNTYodGV4dCwgc2VjcmV0S2V5KS50b1N0cmluZyhDcnlwdG9KUy5lbmMuSGV4KTtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGFwaUtleVJlcXVlc3Qob3B0aW9uczoge1xuICB1cmw6IHN0cmluZztcbiAgbWV0aG9kPzogXCJnZXRcIiB8IFwicG9zdFwiIHwgXCJwdXRcIiB8IFwiZGVsZXRlXCIgfCBcInBhdGNoXCI7XG4gIHBhcmFtcz86IFJlY29yZDxzdHJpbmcsIGFueT47XG4gIGRhdGE/OiBhbnk7XG59KSB7XG4gIGNvbnN0IHsgdXJsLCBtZXRob2QgPSBcImdldFwiLCBwYXJhbXMsIGRhdGEgfSA9IG9wdGlvbnM7XG4gIGNvbnN0IHRzID0gTWF0aC5mbG9vcihEYXRlLm5vdygpKS50b1N0cmluZygpO1xuICBjb25zdCBub25jZSA9IE1hdGgucmFuZG9tKCkudG9TdHJpbmcoMzYpLnNsaWNlKDIpICsgRGF0ZS5ub3coKTtcbiAgY29uc3QgY2Fub25pY2FsID0gYnVpbGRDYW5vbmljYWxRdWVyeShwYXJhbXMpO1xuICBjb25zdCBwYXlsb2FkID0gYCR7bWV0aG9kLnRvVXBwZXJDYXNlKCl9XFxuJHt1cmx9XFxuJHtjYW5vbmljYWx9XFxuJHt0c31cXG4ke25vbmNlfWA7XG4gIGNvbnN0IHNpZ25hdHVyZSA9IGhtYWNIZXgocGF5bG9hZCwgc2VjcmV0S2V5KTtcbiAgcmV0dXJuIHJlcXVlc3Qoe1xuICAgIHVybCxcbiAgICBtZXRob2QsXG4gICAgcGFyYW1zLFxuICAgIGRhdGEsXG4gICAgaGVhZGVyczoge1xuICAgICAgaXNUb2tlbjogZmFsc2UsXG4gICAgICBcIkFQSS1LZXlcIjogYXBpS2V5LFxuICAgICAgXCJUaW1lc3RhbXBcIjogdHMsXG4gICAgICBcIk5vbmNlXCI6IG5vbmNlLFxuICAgICAgXCJTaWduYXR1cmVcIjogc2lnbmF0dXJlLFxuICAgIH0sXG4gIH0pO1xufVxuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJGOlxcXFxzdXpoaWJpblxcXFxibG9nXFxcXC52aXRlcHJlc3NcXFxcdGhlbWVcXFxcYXBpXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJGOlxcXFxzdXpoaWJpblxcXFxibG9nXFxcXC52aXRlcHJlc3NcXFxcdGhlbWVcXFxcYXBpXFxcXGRhdGEuanNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0Y6L3N1emhpYmluL2Jsb2cvLnZpdGVwcmVzcy90aGVtZS9hcGkvZGF0YS5qc1wiO2ltcG9ydCB7IGFwaUtleVJlcXVlc3QgfSBmcm9tIFwiLi4vdXRpbHMvYXBpa2V5LnRzXCI7XG5cbmV4cG9ydCBjb25zdCBsaXN0TmF2ID0gKCkgPT4ge1xuICByZXR1cm4gYXBpS2V5UmVxdWVzdCh7XG4gICAgdXJsOiBcIi9ibG9nL2FwaS9saXN0TmF2XCIsXG4gICAgbWV0aG9kOiBcImdldFwiLFxuICB9KTtcbn07XG5cbmV4cG9ydCBjb25zdCBsaXN0VHlwZSA9ICgpID0+IHtcbiAgcmV0dXJuIGFwaUtleVJlcXVlc3Qoe1xuICAgIHVybDogXCIvYmxvZy9hcGkvbGlzdFR5cGVcIixcbiAgICBtZXRob2Q6IFwiZ2V0XCIsXG4gIH0pO1xufTtcblxuZXhwb3J0IGNvbnN0IGxpc3RMYWJlbCA9ICgpID0+IHtcbiAgcmV0dXJuIGFwaUtleVJlcXVlc3Qoe1xuICAgIHVybDogXCIvYmxvZy9hcGkvbGlzdExhYmVsXCIsXG4gICAgbWV0aG9kOiBcImdldFwiLFxuICB9KTtcbn07XG5cbmV4cG9ydCBjb25zdCBwYWdlQXJ0aWNsZSA9IChwYWdlLCBkYXRhKSA9PiB7XG4gIHJldHVybiBhcGlLZXlSZXF1ZXN0KHtcbiAgICB1cmw6IFwiL2Jsb2cvYXBpL3BhZ2VBcnRpY2xlXCIsXG4gICAgbWV0aG9kOiBcInBvc3RcIixcbiAgICBwYXJhbXM6IHBhZ2UsXG4gICAgZGF0YVxuICB9KTtcbn07XG5cbmV4cG9ydCBjb25zdCBnZXRBcnRpY2xlID0gKGlkKSA9PiB7XG4gIHJldHVybiBhcGlLZXlSZXF1ZXN0KHtcbiAgICB1cmw6IFwiL2Jsb2cvYXBpL2dldEFydGljbGVcIixcbiAgICBtZXRob2Q6IFwiZ2V0XCIsXG4gICAgcGFyYW1zOiB7XG4gICAgICBpZCxcbiAgICB9LFxuICB9KTtcbn07XG5cbmV4cG9ydCBjb25zdCBjb3VudEJ5WWVhciA9ICgpID0+IHtcbiAgcmV0dXJuIGFwaUtleVJlcXVlc3Qoe1xuICAgIHVybDogXCIvYmxvZy9hcGkvY291bnRCeVllYXJcIixcbiAgICBtZXRob2Q6IFwiZ2V0XCIsXG4gIH0pO1xufTtcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBbVEsU0FBUyxvQkFB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QTtBQUFBLElBRVAsYUFBYTtBQUFBO0FBQUEsSUFFYixNQUFNO0FBQUE7QUFBQSxJQUVOLE1BQU07QUFBQTtBQUFBLElBRU4sTUFBTTtBQUFBO0FBQUEsSUFFTixRQUFRO0FBQUEsTUFDTixNQUFNO0FBQUEsTUFDTixPQUFPO0FBQUEsTUFDUCxPQUFPO0FBQUEsTUFDUCxNQUFNO0FBQUEsSUFDUjtBQUFBLEVBQ0Y7QUFBQTtBQUFBLEVBRUEsS0FBSztBQUFBO0FBQUEsRUFFTCxPQUFPO0FBQUE7QUFBQSxFQUVQLFVBQVU7QUFBQTtBQUFBLEVBRVYsUUFBUTtBQUFBO0FBQUE7QUFBQSxJQUdOLFFBQVE7QUFBQTtBQUFBLE1BRU4sQ0FBQyxRQUFRLEVBQUUsS0FBSyxRQUFRLE1BQU0sZUFBZSxDQUFDO0FBQUE7QUFBQSxNQUU5QztBQUFBLFFBQ0U7QUFBQSxRQUNBO0FBQUEsVUFDRSxLQUFLO0FBQUEsVUFDTCxNQUFNO0FBQUEsVUFDTixPQUFPO0FBQUEsVUFDUCxNQUFNO0FBQUEsUUFDUjtBQUFBLE1BQ0Y7QUFBQTtBQUFBLE1BRUE7QUFBQSxRQUNFO0FBQUEsUUFDQTtBQUFBLFVBQ0UsYUFBYTtBQUFBLFVBQ2IsS0FBSztBQUFBLFVBQ0wsTUFBTTtBQUFBLFFBQ1I7QUFBQSxNQUNGO0FBQUEsTUFDQTtBQUFBLFFBQ0U7QUFBQSxRQUNBO0FBQUEsVUFDRSxhQUFhO0FBQUEsVUFDYixLQUFLO0FBQUEsVUFDTCxNQUFNO0FBQUEsUUFDUjtBQUFBLE1BQ0Y7QUFBQTtBQUFBLE1BRUE7QUFBQSxRQUNFO0FBQUEsUUFDQTtBQUFBLFVBQ0UsYUFBYTtBQUFBLFVBQ2IsS0FBSztBQUFBLFVBQ0wsTUFBTTtBQUFBLFFBQ1I7QUFBQSxNQUNGO0FBQUEsTUFDQTtBQUFBLFFBQ0U7QUFBQSxRQUNBO0FBQUEsVUFDRSxhQUFhO0FBQUEsVUFDYixLQUFLO0FBQUEsVUFDTCxNQUFNO0FBQUEsUUFDUjtBQUFBLE1BQ0Y7QUFBQTtBQUFBLE1BRUE7QUFBQSxRQUNFO0FBQUEsUUFDQTtBQUFBLFVBQ0UsYUFBYTtBQUFBLFVB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QXVCO0FBQUE7QUFBQSxRQUV2QixnQkFBZ0I7QUFBQSxVQUNkO0FBQUEsWUFDRSxZQUFZO0FBQUEsWUFDWixTQUFTO0FBQUEsWUFDVCxTQUFTO0FBQUEsY0FDUCxXQUFXO0FBQUEsWUFDYjtBQUFBLFVBQ0Y7QUFBQSxVQUNBO0FBQUEsWUFDRSxZQUFZO0FBQUEsWUFDWixTQUFTO0FBQUEsWUFDVCxTQUFTO0FBQUEsY0FDUCxXQUFXO0FBQUEsWUFDYjtBQUFBLFVBQ0Y7QUFBQSxVQUNBO0FBQUEsWUFDRSxZQUFZO0FBQUEsWUFDWixTQUFTO0FBQUEsWUFDVCxTQUFTO0FBQUEsY0FDUCxXQUFXO0FBQUEsY0FDWCxZQUFZO0FBQUEsZ0JBQ1YsWUFBWTtBQUFBLGdCQUNaLGVBQWUsS0FBSyxLQUFLLEtBQUs7QUFBQSxjQUNoQztBQUFBLGNBQ0EsbUJBQW1CO0FBQUEsZ0JBQ2pCLFVBQVUsQ0FBQyxHQUFHLEdBQUc7QUFBQSxjQUNuQjtBQUFBLFlBQ0Y7QUFBQSxVQUNGO0FBQUEsUUFDRjtBQUFBO0FBQUEsUUFFQSxjQUFjLENBQUMsdURBQXVEO0FBQUE7QUFBQSxRQUV0RSwwQkFBMEIsQ0FBQyxtQkFBbUIsZUFBZSxnQkFBZ0I7QUFBQSxNQUMvRTtBQUFBLE1BQ0EsVUFBVTtBQUFBLFFBQ1IsTUFBTUQsYUFBWSxTQUFTO0FBQUEsUUFDM0IsWUFBWUEsYUFBWSxTQUFTO0FBQUEsUUFDakMsYUFBYUEsYUFBWSxTQUFTO0FBQUEsUUFDbEMsU0FBUztBQUFBLFFBQ1QsV0FBVztBQUFBLFFBQ1gsYUFBYTtBQUFBLFFBQ2Isa0JBQWtCO0FBQUEsTUFDcEI7QUFBQSxJQUNGO0FBQUEsRUFDRixDQUFDO0FBQ0g7IiwKICAibmFtZXMiOiBbInRoZW1lQ29uZmlnIiwgInRoZW1lQ29uZmlnIiwgInBhdGgiLCAicGF0aCIsICJ0aGVtZUNvbmZpZyIsICJwYXRoIiwgInNlY3JldEtleSIsICJfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSIsICJwYXRoIiwgInRhZ3NEYXRhIiwgImNhdGVnb3JpZXNEYXRhIiwgInRoZW1lQ29uZmlnIiwgIl9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lIl0KfQo=
