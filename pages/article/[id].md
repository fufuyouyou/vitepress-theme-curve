---
title: 文章详情
aside: false
padding: false
comment: true
---

<script setup>
import { onMounted } from "vue";
import { useData } from "vitepress";
import RemotePost from "@/views/RemotePost.vue";

const { params, site } = useData();

onMounted(() => {
  document.title = `${params.value.title} | ${site.value.title}`;
});
</script>

<RemotePost :articleId="params.id" />

