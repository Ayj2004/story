<template>
  <Layout title="编辑故事 | StoryHub">
    <div class="max-w-3xl mx-auto p-4">
      <!-- 加载状态 -->
      <div v-if="loading" class="text-center py-10">
        <span class="inline-block animate-spin mr-2">🔄</span>
        加载故事中...
      </div>

      <!-- 错误提示 -->
      <div v-if="error" class="text-center py-10 text-red-500">
        {{ error }}
      </div>

      <!-- 故事表单 -->
      <form v-if="story" @submit.prevent="handleSubmit" class="mb-6">
        <h2 class="text-2xl font-bold mb-6">编辑故事</h2>

        <div class="mb-4">
          <label class="block text-gray-700 mb-2">故事标题</label>
          <input
            v-model="storyForm.title"
            type="text"
            class="w-full px-3 py-2 border rounded"
            placeholder="请输入故事标题"
            required
          />
        </div>

        <!-- 作者输入框 -->
        <div class="mb-4">
          <label class="block text-gray-700 mb-2">作者</label>
          <input
            v-model="storyForm.author"
            type="text"
            class="w-full px-3 py-2 border rounded"
            placeholder="请输入作者名称"
            required
          />
        </div>

        <!-- 故事类型输入框 -->
        <div class="mb-4">
          <label class="block text-gray-700 mb-2">故事类型</label>
          <input
            v-model="storyForm.storyType"
            type="text"
            class="w-full px-3 py-2 border rounded"
            placeholder="请输入故事类型（如：玄幻、言情、科幻）"
            required
          />
        </div>

        <!-- 封面预览 -->
        <div class="mb-4">
          <label class="block text-gray-700 mb-2">封面图</label>
          <div class="flex items-center gap-4">
            <img
              :src="storyForm.cover"
              alt="故事封面"
              class="w-32 h-20 object-cover rounded border"
            />
            <button
              type="button"
              class="px-3 py-1 border rounded text-sm hover:bg-gray-100"
              @click="generateRandomCover"
            >
              换一张
            </button>
          </div>
        </div>

        <div class="mb-4">
          <label class="block text-gray-700 mb-2">故事内容</label>
          <textarea
            v-model="storyForm.content"
            class="w-full px-3 py-2 border rounded h-40"
            placeholder="请输入故事内容"
            required
          ></textarea>
        </div>

        <div class="flex gap-4">
          <button
            type="submit"
            class="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
          >
            保存修改
          </button>
          <router-link
            to="/"
            class="px-6 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
          >
            取消
          </router-link>
        </div>
      </form>

      <!-- 故事不存在 -->
      <div v-if="!loading && !error && !story" class="text-center py-10">
        <p class="text-gray-500">该故事不存在或已被删除</p>
        <router-link
          to="/"
          class="text-primary mt-4 inline-block hover:underline"
        >
          返回首页
        </router-link>
      </div>
    </div>
  </Layout>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import type { Story } from "@/types";
import Layout from "@/components/Layout.vue";
import { useStories } from "@/composables/useStories";

const router = useRouter();
const route = useRoute();
const storyId = route.params.id as string;

const { loading, error, fetchStoryById, updateStory } = useStories();
const story = ref<Story | null>(null);
const storyForm = ref<Partial<Story>>({});

// 生成随机封面
const generateRandomCover = () => {
  const randomId = Math.floor(Math.random() * 1000);
  storyForm.value.cover = `https://picsum.photos/800/400?random=${randomId}`;
};

// 加载故事数据
onMounted(async () => {
  if (storyId) {
    const result = await fetchStoryById(storyId);
    if (result.success && result.data) {
      story.value = result.data;
      // 初始化表单数据
      storyForm.value = { ...result.data };
    } else {
      story.value = null;
    }
  }
});

// 提交修改
const handleSubmit = async () => {
  if (
    !storyForm.value.title ||
    !storyForm.value.author ||
    !storyForm.value.storyType ||
    !storyForm.value.content
  ) {
    alert("标题、作者、故事类型、内容为必填项！");
    return;
  }

  // 补充必要字段
  storyForm.value.id = storyId;
  storyForm.value.intro = storyForm.value.content.slice(0, 100);
  storyForm.value.updateTime = new Date().toLocaleString();

  const result = await updateStory(storyForm.value as Story);
  if (result.success) {
    alert("故事修改成功！");
    router.push({ name: "detail", params: { id: storyId } });
  } else {
    alert(`修改失败：${result.error}`);
  }
};
</script>
