<template>
  <div class="mb-8 flex flex-wrap gap-2">
    <!-- 全部故事按钮（绿色主题） -->
    <button
      class="px-4 py-2 rounded-md transition-colors duration-200"
      :style="{
        backgroundColor:
          activeStoryType === 'all'
            ? '#10b981' // 绿色主色（emerald-500）
            : '#f5f5f5',
        color: activeStoryType === 'all' ? '#ffffff' : '#333333',
        border: activeStoryType === 'all' ? 'none' : '1px solid #e5e7eb',
      }"
      @click="handleSelectStoryType('all')"
    >
      全部故事
    </button>

    <!-- 动态故事类型按钮 -->
    <button
      v-for="storyType in storyTypes"
      :key="storyType"
      class="px-4 py-2 rounded-md transition-colors duration-200"
      :style="{
        backgroundColor:
          activeStoryType === storyType
            ? getStoryTypeColor(storyType, 'active')
            : getStoryTypeColor(storyType, 'default'),
        color: activeStoryType === storyType ? '#ffffff' : '#333333',
        '--hover-bg': getStoryTypeColor(storyType, 'hover'),
        border: activeStoryType === storyType ? 'none' : '1px solid #e5e7eb',
      }"
      @mouseenter="(e) => handleHover(e, 'enter')"
      @mouseleave="(e) => handleHover(e, 'leave', storyType)"
      @click="handleSelectStoryType(storyType)"
    >
      {{ storyType }}
    </button>
  </div>
</template>

<script setup lang="ts">
import type { PropType } from "vue";

// 定义Props
const props = defineProps({
  storyTypes: {
    type: Array as PropType<string[]>,
    required: true,
  },
  activeStoryType: {
    type: String,
    required: true,
    default: "all",
  },
});

const { storyTypes, activeStoryType } = props;

// 定义事件
const emit = defineEmits<{
  (e: "change", storyType: string): void;
}>();

// 处理类型选择
const handleSelectStoryType = (storyType: string) => {
  emit("change", storyType);
};

/**
 * 基于故事类型名生成固定的唯一颜色
 * @param storyType 故事类型名称
 * @param type 颜色类型（default/active/hover）
 * @returns 十六进制颜色值
 */
const getStoryTypeColor = (
  storyType: string,
  type: "default" | "active" | "hover"
): string => {
  const hash = storyType.split("").reduce((acc, char) => {
    acc = (acc << 5) - acc + char.charCodeAt(0);
    return acc & acc;
  }, 0);

  const hue = Math.abs(hash) % 360;
  // 调整色系为绿色系（hue偏移至120左右，保持绿色基调）
  const greenHue = (hue % 120) + 80;
  const colorConfig = {
    default: `hsl(${greenHue}, 30%, 95%)`,
    active: `hsl(${greenHue}, 70%, 50%)`,
    hover: `hsl(${greenHue}, 40%, 90%)`,
  };

  return colorConfig[type];
};

/**
 * 处理鼠标hover事件
 */
const handleHover = (
  e: MouseEvent,
  action: "enter" | "leave",
  storyType?: string
) => {
  const target = e.target as HTMLButtonElement;
  if (!target) return;

  if (action === "enter") {
    const hoverBg = window
      .getComputedStyle(target)
      .getPropertyValue("--hover-bg");
    target.style.backgroundColor = hoverBg;
  } else if (action === "leave" && storyType) {
    target.style.backgroundColor =
      activeStoryType === storyType
        ? getStoryTypeColor(storyType, "active")
        : getStoryTypeColor(storyType, "default");
  }
};

// 显式暴露函数
defineExpose({
  handleSelectStoryType,
  handleHover,
  getStoryTypeColor,
});
</script>
