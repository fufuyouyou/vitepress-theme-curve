import { listLabel, pageArticle } from "../../.vitepress/theme/api/data.js";

const { data: postData } = await pageArticle({ pageNo: 1, pageSize: -1 }, {});
const { data: tagsData } = await listLabel();

// 标签动态路由
export default {
  paths() {
    const pages = [];
    // 生成每一页的路由参数
    tagsData.forEach((item) => {
      pages.push({ params: { name: item.name } });
    });
    console.info("标签动态路由：", pages);
    return pages;
  },
};
