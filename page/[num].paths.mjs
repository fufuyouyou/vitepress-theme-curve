import { getThemeConfig } from "../.vitepress/init.mjs";
import { pageArticle } from "../.vitepress/theme/api/data.js";

export default {
  async paths() {
    const pages = [];
    const themeConfig = await getThemeConfig();
    const postsPerPage = themeConfig.postSize;
    const { data: postData } = await pageArticle({ pageNo: 1, pageSize: -1 }, {});
    const totalPages = Math.ceil(postData.length / postsPerPage);
    for (let pageNum = 2; pageNum <= totalPages; pageNum += 1) {
      pages.push({ params: { num: pageNum.toString() } });
    }
    console.info("文章分页动态路由：", pages);
    return pages;
  },
};
