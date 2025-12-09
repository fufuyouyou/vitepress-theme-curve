import { listLabel } from "../../.vitepress/theme/api/data.js";

export default {
  async paths() {
    const pages = [];
    const { data: tagsData } = await listLabel();
    tagsData.forEach((item) => {
      pages.push({ params: { name: item.name } });
    });
    console.info("标签动态路由：", pages);
    return pages;
  },
};
