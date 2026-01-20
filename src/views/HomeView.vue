<template>
  <Layout title="首页 | 云栈故事馆 - 简约轻量的 Vue 故事阅读系统">
    <div class="max-w-7xl mx-auto py-8 px-4">
      <!-- 加载状态 -->
      <div v-if="loading" class="text-center py-10">
        <span class="inline-block animate-spin mr-2">🔄</span>
        加载中...
      </div>

      <!-- 错误提示 -->
      <div v-if="error" class="text-center py-10 text-red-500">
        {{ error }}
      </div>

      <!-- 故事类型筛选 + 故事列表 -->
      <div v-if="!loading && !error">
        <!-- 故事类型筛选组件 -->
        <StoryTypeFilter
          :storyTypes="allStoryTypes"
          :active-story-type="activeStoryType"
          @change="handleStoryTypeChange"
        />

        <!-- 故事列表 -->
        <div
          v-if="filteredStories.length"
          class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <router-link
            v-for="story in filteredStories"
            :key="story.id"
            :to="{ name: 'detail', params: { id: story.id } }"
            class="block"
          >
            <StoryCard :story="story" />
          </router-link>
        </div>

        <!-- 筛选后空状态 -->
        <div v-if="!filteredStories.length" class="text-center py-10">
          <p class="text-gray-500 mb-4">
            {{
              activeStoryType === "all"
                ? "暂无故事，快去创建吧～"
                : `暂无${activeStoryType}类型的故事`
            }}
          </p>
          <CreateStoryBtn />
        </div>
      </div>
    </div>
  </Layout>
</template>

<script setup lang="ts">
import { onMounted, computed, ref } from "vue";
import Layout from "@/components/Layout.vue";
import StoryCard from "@/components/StoryCard.vue";
import CreateStoryBtn from "@/components/CreateStoryBtn.vue";
import StoryTypeFilter from "@/components/StoryTypeFilter.vue";
import { useStories } from "@/composables/useStories";

const { stories, loading, error, fetchStories } = useStories();

// 页面挂载时加载故事列表
onMounted(() => {
  fetchStories();
});

// 故事类型筛选相关状态
const activeStoryType = ref<string>("all");

// 提取所有不重复的故事类型
const allStoryTypes = computed(() => {
  const typeSet = new Set(
    stories.value.map((story) => story.storyType || "未分类").filter(Boolean)
  );
  return Array.from(typeSet);
});

// 根据选中的类型筛选故事
const filteredStories = computed(() => {
  if (activeStoryType.value === "all") {
    return stories.value;
  }
  return stories.value.filter((story) => {
    const storyType = story.storyType || "未分类";
    return storyType === activeStoryType.value;
  });
});

// 处理类型切换
const handleStoryTypeChange = (storyType: string) => {
  activeStoryType.value = storyType;
};
</script>
