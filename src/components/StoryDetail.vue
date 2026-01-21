<template>
  <div
    v-if="story"
    class="story-detail max-w-3xl mx-auto p-4"
    :style="colorStyle"
  >
    <!-- 颜色调节面板 -->
    <div
      class="color-adjust-panel mb-6 p-4 bg-white/80 rounded-lg shadow-sm border border-gray-200"
    >
      <h3 class="text-lg font-medium mb-3 text-primary">阅读设置</h3>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <!-- 亮度调节 -->
        <div class="adjust-item">
          <label class="block text-sm text-gray-700 mb-1"
            >亮度 ({{ brightness }}%)</label
          >
          <input
            type="range"
            v-model="brightness"
            min="50"
            max="150"
            step="1"
            class="w-full accent-primary"
          />
        </div>
        <!-- 对比度调节 -->
        <div class="adjust-item">
          <label class="block text-sm text-gray-700 mb-1"
            >对比度 ({{ contrast }}%)</label
          >
          <input
            type="range"
            v-model="contrast"
            min="80"
            max="120"
            step="1"
            class="w-full accent-primary"
          />
        </div>
        <!-- 色温调节 -->
        <div class="adjust-item">
          <label class="block text-sm text-gray-700 mb-1"
            >色温 ({{ temperature }}K)</label
          >
          <input
            type="range"
            v-model="temperature"
            min="3000"
            max="7000"
            step="100"
            class="w-full accent-primary"
          />
        </div>
      </div>
      <!-- 重置按钮 -->
      <button
        @click="resetColorSettings"
        class="mt-3 px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100 transition-colors"
      >
        重置设置
      </button>
    </div>

    <!-- 原有故事内容 -->
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
import { ref, onMounted, computed } from "vue";
import type { Story } from "@/types";
import { useStories } from "@/composables/useStories";

// 修正 props 定义：id 为可选（兼容传入 story 的场景）
const props = defineProps<{
  id?: string | number;
  story?: Story;
}>();

const { getStoryById } = useStories();
const story = ref<Story | null>(props.story || null);

// 颜色调节响应式变量（默认值）
const brightness = ref(100); // 亮度：50%-150%
const contrast = ref(100); // 对比度：80%-120%
const temperature = ref(5000); // 色温：3000K-7000K

// 计算样式：动态生成 CSS 滤镜
const colorStyle = computed(() => {
  // 色温转换为 CSS filter 的 hue-rotate 值
  // 3000K（暖黄）→ -20deg，5000K（中性）→ 0deg，7000K（冷蓝）→ 20deg
  const tempRatio = (temperature.value - 5000) / 20000;
  const hueRotate = tempRatio * 40; // 范围：-20deg 到 +20deg

  return {
    filter: `brightness(${brightness.value}%) contrast(${contrast.value}%) hue-rotate(${hueRotate}deg)`,
    transition: "filter 0.3s ease", // 平滑过渡
  };
});

// 重置颜色设置
const resetColorSettings = () => {
  brightness.value = 100;
  contrast.value = 100;
  temperature.value = 5000;
};

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

/* 颜色调节面板样式 */
.color-adjust-panel {
  position: sticky;
  top: 20px;
  z-index: 10;
}
.adjust-item input[type="range"] {
  cursor: pointer;
}
/* 适配深色模式 */
.dark .color-adjust-panel {
  background-color: #1e293b/80;
  border-color: #334155;
}
.dark .adjust-item label {
  color: #f1f5f9;
}
.dark .prose {
  color: #f1f5f9;
}
</style>
