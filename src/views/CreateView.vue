<template>
  <Layout title="创建故事 | StoryHub">
    <div class="max-w-3xl mx-auto p-4">
      <h2 class="text-2xl font-bold mb-6">创建新故事</h2>
      <!-- 故事表单 -->
      <form @submit.prevent="handleSubmit">
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
          <label class="block text-gray-700 mb-2">封面图（随机生成）</label>
          <div class="flex items-center gap-4">
            <img
              :src="storyForm.cover"
              alt="随机封面"
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
        <button
          type="submit"
          class="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
        >
          保存故事
        </button>
      </form>
    </div>
  </Layout>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import type { Story } from "@/types";
import Layout from "@/components/Layout.vue";
import { useStories } from "@/composables/useStories";

const router = useRouter();
const { saveStory } = useStories();

// 生成随机封面图
const generateRandomCover = () => {
  const randomId = Math.floor(Math.random() * 1000);
  storyForm.value.cover = `https://picsum.photos/800/400?random=${randomId}`;
};

// 表单数据
const storyForm = ref<Partial<Story>>({
  id: Date.now().toString(),
  title: "",
  author: "",
  storyType: "",
  cover: "",
  content: "",
  intro: "",
  createTime: new Date().toLocaleString(),
  updateTime: new Date().toLocaleString(),
});

// 页面挂载时自动生成随机封面
onMounted(() => {
  generateRandomCover();
});

// 提交表单
const handleSubmit = async () => {
  // 校验必填项
  if (
    !storyForm.value.title ||
    !storyForm.value.author ||
    !storyForm.value.storyType ||
    !storyForm.value.content
  ) {
    alert("标题、作者、故事类型、内容为必填项！");
    return;
  }
  // 补充简介
  storyForm.value.intro = storyForm.value.content.slice(0, 100);
  // 兜底默认值
  storyForm.value.author = storyForm.value.author || "匿名作者";
  storyForm.value.storyType = storyForm.value.storyType || "未分类";

  // 调用保存接口
  const result = await saveStory(storyForm.value as Story);
  if (result.success) {
    alert("故事创建成功！");
    router.push("/");
  } else {
    alert(`创建失败：${result.error}`);
  }
};
</script>
