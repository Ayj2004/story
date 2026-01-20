<template>
  <Layout :title="story?.title || '故事详情 | StoryHub'">
    <div class="max-w-3xl mx-auto py-8 px-4">
      <!-- 加载状态 -->
      <div v-if="loading" class="text-center py-10">
        <span class="inline-block animate-spin mr-2">🔄</span>
        加载中...
      </div>

      <!-- 错误提示 -->
      <div v-if="error" class="text-center py-10 text-red-500">
        {{ error }}
      </div>

      <!-- 故事操作区（绿色系按钮） -->
      <div v-if="story" class="mb-6 flex gap-4">
        <router-link
          :to="{ name: 'edit', params: { id: story.id } }"
          class="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors"
        >
          编辑故事
        </router-link>
        <button
          class="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
          @click="handleDelete"
        >
          删除故事
        </button>
      </div>

      <!-- 故事详情 -->
      <StoryDetail v-if="story" :id="story.id" :story="story" />

      <!-- 故事不存在 -->
      <div v-if="!loading && !error && !story" class="text-center py-10">
        <p class="text-gray-500">该故事不存在或已被删除</p>
        <router-link
          to="/"
          class="text-emerald-600 mt-4 inline-block hover:underline"
        >
          返回首页
        </router-link>
      </div>
    </div>
  </Layout>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import type { Story } from "@/types";
import Layout from "@/components/Layout.vue";
import StoryDetail from "@/components/StoryDetail.vue";
import { useStories } from "@/composables/useStories";

// 获取路由参数
const route = useRoute();
const router = useRouter();
const storyId = ref<string | number>(route.params.id as string);

const { loading, error, fetchStoryById, deleteStory } = useStories();
const story = ref<Story | null>(null);

// 加载故事详情
onMounted(async () => {
  if (storyId.value) {
    const result = await fetchStoryById(storyId.value as string);
    if (result.success && result.data) {
      story.value = result.data;
    } else {
      story.value = null;
    }
  }
});

// 处理删除逻辑
const handleDelete = async () => {
  if (!confirm("确定要删除这个故事吗？删除后无法恢复！")) {
    return;
  }

  const result = await deleteStory(storyId.value as string);
  if (result.success) {
    alert("故事删除成功！");
    router.push("/");
  } else {
    alert(`删除失败：${result.error}`);
  }
};
</script>
