import { listType } from "../../.vitepress/theme/api/data.js";

const { data: categoriesData } = await listType();

// 分类动态路由
export default {
  paths() {
    const pages = [];
    // 生成每一页的路由参数
    categoriesData.forEach((item) => {
      pages.push({ params: { name: item.name } });
    });
    console.info("分类动态路由：", pages);
    return pages;
  },
};
