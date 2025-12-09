import { pageArticle } from "../../.vitepress/theme/api/data.js";

const { data: postData } = await pageArticle({ pageNo: 1, pageSize: -1 }, {});

export default {
  paths() {
    const pages = [];
    postData.forEach((post) => {
      pages.push({ params: { id: post.id, title: post.title } });
    });
    console.info("详情页动态路由：", pages);
    return pages;
  },
};
