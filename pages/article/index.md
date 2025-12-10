---
title: 文章详情
aside: false
padding: false
comment: true
---

<script setup>
import { onMounted } from "vue";
import { useRoute, useData } from "vitepress";
import RemotePost from "@/views/RemotePost.vue";

const route = useRoute();
const { site } = useData();

onMounted(() => {
  const title = route?.data?.title || "文章详情";
  document.title = `${title} | ${site.value.title}`;
});
</script>

<RemotePost :articleId="route?.query?.id" />

