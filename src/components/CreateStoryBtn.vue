<template>
  <button
    class="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
    @click="handleCreateStory"
  >
    创建新故事
  </button>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";

const router = useRouter();

// 跳转至创建页面
const handleCreateStory = () => {
  router.push({ name: "create" });
};
</script>
