<!-- 首页 -->
<template>
  <div class="home">
    <Banner v-if="showHeader" :height="store.bannerType" />
    <div class="home-content">
      <div class="posts-content">
        <!-- 分类总览 -->
        <TypeBar :type="showTags ? 'tags' : 'categories'" />
        <!-- 文章列表 -->
        <PostList :listData="postData" />
        <!-- 分页 -->
        <Pagination
          :total="allListTotal"
          :page="Number(page)"
          :limit="postSize"
          :useParams="showCategories || showTags ? true : false"
          :routePath="
            showCategories
              ? `/pages/categories/${showCategories}`
              : showTags
                ? `/pages/tags/${showTags}`
                : ''
          "
        />
      </div>
      <!-- 侧边栏 -->
      <Aside />
    </div>
  </div>
</template>

<script setup>
import { mainStore } from "@/store";
import { pageArticle, listLabel, listType } from "../api/data.js";

const { theme } = useData();
const store = mainStore();
const props = defineProps({
  // 显示首页头部
  showHeader: {
    type: Boolean,
    default: false,
  },
  // 当前页数
  page: {
    type: Number,
    default: 1,
  },
  // 显示分类
  showCategories: {
    type: [null, String],
    default: null,
  },
  // 显示标签
  showTags: {
    type: [null, String],
    default: null,
  },
});

const postSize = theme.value.postSize;

const runtimeTags = ref([]);
const runtimeCategories = ref([]);
const totalCount = ref(0);
const allListTotal = computed(() => {
  if (props.showCategories) {
    const source = runtimeCategories.value && runtimeCategories.value.length ? runtimeCategories.value : theme.value.categoriesData;
    return source.find((item) => item.name === props.showCategories)?.articleTotal || 0;
  }
  if (props.showTags) {
    const source = runtimeTags.value && runtimeTags.value.length ? runtimeTags.value : theme.value.tagsData;
    return source.find((item) => item.name === props.showTags)?.articleTotal || 0;
  }
  return totalCount.value || theme.value.postData.length;
});

// 获得当前页数
const getCurrentPage = () => {
  if (props.showCategories || props.showTags) {
    if (typeof window === "undefined") return 1;
    const params = new URLSearchParams(window.location.search);
    const page = params.get("page");
    if (!page) return 1;
    const currentPage = Number(page);
    return currentPage ? currentPage : 1;
  }
  return props.page ? props.page : 1;
};

const postData = ref([]);

watch(
  () => props.page,
  async () => {
    await listData();
  },
);

// 根据页数计算列表数据
const listData = async () => {
  const page = getCurrentPage();
  const queryParams = {
    type: "",
    tags: "",
  };
  // 分类数据
  if (props.showCategories) {
    queryParams.type = props.showCategories;
  } else if (props.showTags) {
    // 标签数据
    queryParams.tags = props.showTags;
  }
  const { data, page: pageInfo } = await pageArticle({ pageNo: page, pageSize: postSize }, queryParams);
  postData.value = data;
  totalCount.value = pageInfo.totalCount;
};

const initRuntimeData = async () => {
  const [{ data: tags }, { data: cats }] = await Promise.all([
    listLabel(),
    listType()
  ]);
  runtimeTags.value = tags || [];
  runtimeCategories.value = cats || [];
};

onMounted(() => {
  listData();
  initRuntimeData();
});

// 恢复滚动位置
const restoreScrollY = (val) => {
  if (typeof window === "undefined" || val) return false;
  const scrollY = store.lastScrollY;
  nextTick().then(() => {
    // 平滑滚动
    window.scrollTo({
      top: scrollY,
      behavior: "smooth",
    });
    // 清除滚动位置
    store.lastScrollY = 0;
  });
};

// 监听加载结束
watch(
  () => store.loadingStatus,
  (val) => restoreScrollY(val),
);
</script>

<style lang="scss" scoped>
.home {
  .home-content {
    width: 100%;
    display: flex;
    flex-direction: row;

    .posts-content {
      width: calc(100% - 300px);
      transition: width 0.3s;
    }

    .main-aside {
      width: 300px;
      padding-left: 1rem;
    }

    @media (max-width: 1200px) {
      .posts-content {
        width: 100%;
      }
      .main-aside {
        display: none;
      }
    }
  }
}
</style>
