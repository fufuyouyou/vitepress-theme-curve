import { defineConfig } from "vitepress";
import { createRssFile } from "./theme/utils/generateRSS.mjs";
import { withPwa } from "@vite-pwa/vitepress";
import { jumpRedirect } from "./theme/utils/commonTools.mjs";
import { getThemeConfig } from "./init.mjs";
import markdownConfig from "./theme/utils/markdownConfig.mjs";
import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
import path from "path";
import { countByYear, listLabel, listType, pageArticle } from "./theme/api/data.js";

const createDynamicPathsRefresher = () => {
  const files = {
    article: path.resolve(process.cwd(), "pages", "article", "[id].paths.mjs"),
    tags: path.resolve(process.cwd(), "pages", "tags", "[name].paths.mjs"),
    categories: path.resolve(process.cwd(), "pages", "categories", "[name].paths.mjs"),
    pageNum: path.resolve(process.cwd(), "page", "[num].paths.mjs"),
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
          } catch (e) {}
        } catch (e) {}
        try {
          const { data: tagsData } = await listLabel();
          const tagsDigest = JSON.stringify(tagsData);
          if (prev.tags && prev.tags !== tagsDigest) {
            invalidate(files.tags);
            changed = true;
          }
          prev.tags = tagsDigest;
        } catch (e) {}
        try {
          const { data: categoriesData } = await listType();
          const categoriesDigest = JSON.stringify(categoriesData);
          if (prev.categories && prev.categories !== categoriesDigest) {
            invalidate(files.categories);
            changed = true;
          }
          prev.categories = categoriesDigest;
        } catch (e) {}
        if (changed) server.ws.send({ type: "full-reload" });
      };
      check();
      // 每 1 小时检查一次
      const timer = setInterval(check, 60 * 60 * 1000);
      server.httpServer?.on("close", () => clearInterval(timer));
    },
  };
};

// 获取全局数据
const { data: postData } = await pageArticle({ pageNo: 1, pageSize: -1 }, {});
const { data: categoriesData } = await listType();
const { data: tagsData } = await listLabel();
const { data: archivesData } = await countByYear();

// 获取主题配置
const themeConfig = await getThemeConfig();

// https://vitepress.dev/reference/site-config
export default withPwa(
  defineConfig({
    title: themeConfig.siteMeta.title,
    description: themeConfig.siteMeta.description,
    lang: themeConfig.siteMeta.lang,
    // 简洁的 URL
    cleanUrls: true,
    // 最后更新时间戳
    lastUpdated: true,
    // 主题
    appearance: "dark",
    // Head
    head: themeConfig.inject.header,
    // sitemap
    sitemap: {
      hostname: themeConfig.siteMeta.site,
    },
    // 主题配置
    themeConfig: {
      ...themeConfig,
      // 必要数据
      postData: postData,
      tagsData: tagsData,
      categoriesData: categoriesData,
      archivesData: archivesData,
    },
    // markdown
    markdown: {
      math: true,
      lineNumbers: true,
      toc: { level: [1, 2, 3] },
      image: {
        lazyLoading: true,
      },
      config: (md) => markdownConfig(md, themeConfig),
    },
    // 构建排除
    srcExclude: ["**/README.md", "**/TODO.md"],
    // transformHead
    transformPageData: async (pageData) => {
      // canonical URL
      const canonicalUrl = `${themeConfig.siteMeta.site}/${pageData.relativePath}`
        .replace(/index\.md$/, "")
        .replace(/\.md$/, "");
      pageData.frontmatter.head ??= [];
      pageData.frontmatter.head.push(["link", { rel: "canonical", href: canonicalUrl }]);
    },
    // transformHtml
    transformHtml: (html) => {
      return jumpRedirect(html, themeConfig);
    },
    // buildEnd
    buildEnd: async (config) => {
      await createRssFile(config, themeConfig);
    },
    // vite
    vite: {
      plugins: [
        AutoImport({
          imports: ["vue", "vitepress"],
          dts: ".vitepress/auto-imports.d.ts",
        }),
        Components({
          dirs: [".vitepress/theme/components", ".vitepress/theme/views"],
          extensions: ["vue", "md"],
          include: [/\.vue$/, /\.vue\?vue/, /\.md$/],
          dts: ".vitepress/components.d.ts",
        }),
        createDynamicPathsRefresher(),
      ],
      resolve: {
        // 配置路径别名
        alias: {
          // eslint-disable-next-line no-undef
          "@": path.resolve(__dirname, "./theme"),
        },
      },
      css: {
        preprocessorOptions: {
          scss: {
            silenceDeprecations: ["legacy-js-api"],
          },
        },
      },
      // 服务器
      server: {
        port: 9877,
      },
      // 构建
      build: {
        minify: "terser",
        terserOptions: {
          compress: {
            pure_funcs: ["console.log"],
          },
        },
      },
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
              cacheName: "file-cache",
            },
          },
          {
            urlPattern: /(.*?)\.(ico|webp|png|jpe?g|svg|gif|bmp|psd|tiff|tga|eps)/,
            handler: "CacheFirst",
            options: {
              cacheName: "image-cache",
            },
          },
          {
            urlPattern: /^https:\/\/cdn2\.codesign\.qq\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "iconfont-cache",
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 2,
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
        // 缓存文件
        globPatterns: ["**/*.{js,css,html,ico,png,jpg,jpeg,gif,svg,woff2,ttf}"],
        // 排除路径
        navigateFallbackDenylist: [/^\/sitemap.xml$/, /^\/rss.xml$/, /^\/robots.txt$/],
      },
      manifest: {
        name: themeConfig.siteMeta.title,
        short_name: themeConfig.siteMeta.title,
        description: themeConfig.siteMeta.description,
        display: "standalone",
        start_url: "/",
        theme_color: "#fff",
        background_color: "#efefef"
      },
    },
  }),
);
