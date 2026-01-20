<template>
  <div v-if="story" class="story-detail max-w-3xl mx-auto p-4">
    <h1 class="text-3xl font-bold mb-4">{{ story.title }}</h1>
    <div class="flex flex-wrap justify-between gap-2 text-gray-500 mb-6">
      <span>故事类型：{{ story.storyType || "未分类" }}</span>
      <span>作者：{{ story.author || "匿名作者" }}</span>
      <span>发布时间：{{ story.createTime }}</span>
      <span>更新时间：{{ story.updateTime }}</span>
    </div>
    <img
      :src="story.cover"
      :alt="story.title"
      class="w-full h-64 object-cover rounded mb-6"
    />
    <div class="prose max-w-none" v-html="story.content"></div>
  </div>
  <div v-else class="text-center py-10">故事不存在</div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import type { Story } from "@/types";
import { useStories } from "@/composables/useStories";

// 修正 props 定义：id 为可选（兼容传入 story 的场景）
const props = defineProps<{
  id?: string | number;
  story?: Story;
}>();

const { getStoryById } = useStories();
const story = ref<Story | null>(props.story || null);

onMounted(() => {
  // 仅当未传入 story 且传入 id 时，调用 getStoryById
  if (!story.value && props.id) {
    const targetStory = getStoryById(props.id);
    story.value = targetStory || null;
  }
});
</script>

<style scoped>
.story-detail {
  line-height: 1.8;
}
.prose {
  color: #333;
}
.prose p {
  margin-bottom: 1rem;
}
</style>
