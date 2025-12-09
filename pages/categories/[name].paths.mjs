import { listType } from "../../.vitepress/theme/api/data.js";

export default {
  async paths() {
    const pages = [];
    const { data: categoriesData } = await listType();
    categoriesData.forEach((item) => {
      pages.push({ params: { name: item.name } });
    });
    console.info("分类动态路由：", pages);
    return pages;
  },
};
