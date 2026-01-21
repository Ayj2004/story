import { ref, computed } from "vue";
import type { Story, KVResponse } from "@/types";

// 边缘函数地址（替换为你的实际地址）
const EDGE_FUNCTION_BASE_URL = "https://kvstory.4fa2a2a9.er.aliyun-esa.net";

export const useStories = () => {
  const stories = ref<Story[]>([]);
  const loading = ref(false);
  const error = ref("");

  // 根据ID查找本地故事
  const getStoryById = (id: string | number): Story | undefined => {
    return stories.value.find((story) => story.id === id);
  };

  // 重置错误信息
  const resetError = () => {
    error.value = "";
  };

  // 1. 获取所有故事列表
  const fetchStories = async (): Promise<KVResponse<Story[]>> => {
    loading.value = true;
    resetError();
    try {
      const response = await fetch(`${EDGE_FUNCTION_BASE_URL}/api/stories`);
      if (!response.ok) {
        throw new Error(`请求失败：${response.status} ${response.statusText}`);
      }
      const result: KVResponse<Story[]> = await response.json();
      if (result.success) {
        // 兜底处理：确保列表中每个story的storyType/author有默认值
        stories.value = (result.data || []).map((story) => ({
          ...story,
          author: story.author || "匿名作者",
          storyType: story.storyType || "未分类",
          intro: story.intro || "",
        }));
        return { success: true, data: stories.value };
      } else {
        const errMsg = result.error || "获取故事列表失败";
        error.value = errMsg;
        return { success: false, error: errMsg };
      }
    } catch (e) {
      const errMsg = `网络异常：${(e as Error).message}`;
      error.value = errMsg;
      return { success: false, error: errMsg };
    } finally {
      loading.value = false;
    }
  };

  // 2. 获取单篇故事详情
  const fetchStoryById = async (id: string): Promise<KVResponse<Story>> => {
    if (!id || typeof id !== "string") {
      const errMsg = "故事ID格式错误（必须为非空字符串）";
      error.value = errMsg;
      return { success: false, error: errMsg };
    }

    loading.value = true;
    resetError();
    try {
      const response = await fetch(`${EDGE_FUNCTION_BASE_URL}/api/story/${id}`);
      if (!response.ok) {
        throw new Error(`请求失败：${response.status} ${response.statusText}`);
      }
      const result: KVResponse<Story> = await response.json();
      if (result.success) {
        const story = result.data ?? undefined;
        return { success: true, data: story };
      } else {
        const errMsg = result.error || "获取故事详情失败";
        error.value = errMsg;
        return { success: false, error: errMsg };
      }
    } catch (e) {
      const errMsg = `网络异常：${(e as Error).message}`;
      error.value = errMsg;
      return { success: false, error: errMsg };
    } finally {
      loading.value = false;
    }
  };

  // 3. 新增/更新故事
  const saveStory = async (story: Story): Promise<KVResponse> => {
    const requiredFields = [
      "id",
      "title",
      "content",
      "createTime",
      "updateTime",
    ] as const;
    const emptyFields = requiredFields.filter((field) => !story[field]);
    if (emptyFields.length > 0) {
      const errMsg = `故事必填字段为空：${emptyFields.join(", ")}`;
      error.value = errMsg;
      return { success: false, error: errMsg };
    }

    loading.value = true;
    resetError();
    try {
      const response = await fetch(`${EDGE_FUNCTION_BASE_URL}/api/story`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(story),
      });
      if (!response.ok) {
        throw new Error(`请求失败：${response.status} ${response.statusText}`);
      }
      const result: KVResponse = await response.json();
      if (result.success) {
        await fetchStories(); // 重新拉取列表
        return { success: true };
      } else {
        const errMsg = result.error || "保存故事失败";
        error.value = errMsg;
        return { success: false, error: errMsg };
      }
    } catch (e) {
      const errMsg = `网络异常：${(e as Error).message}`;
      error.value = errMsg;
      return { success: false, error: errMsg };
    } finally {
      loading.value = false;
    }
  };

  // 3.1 单独的更新故事方法
  const updateStory = async (story: Story): Promise<KVResponse> => {
    // 强制更新updateTime
    story.updateTime = new Date().toLocaleString();
    // 复用saveStory
    return await saveStory(story);
  };

  // 4. 删除故事
  const deleteStory = async (id: string): Promise<KVResponse> => {
    if (!id || typeof id !== "string") {
      const errMsg = "故事ID格式错误（必须为非空字符串）";
      error.value = errMsg;
      return { success: false, error: errMsg };
    }

    loading.value = true;
    resetError();
    try {
      const response = await fetch(
        `${EDGE_FUNCTION_BASE_URL}/api/story/${id}`,
        {
          method: "DELETE",
        }
      );
      if (!response.ok) {
        throw new Error(`请求失败：${response.status} ${response.statusText}`);
      }
      const result: KVResponse = await response.json();
      if (result.success) {
        await fetchStories(); // 重新拉取列表
        return { success: true };
      } else {
        const errMsg = result.error || "删除故事失败";
        error.value = errMsg;
        return { success: false, error: errMsg };
      }
    } catch (e) {
      const errMsg = `网络异常：${(e as Error).message}`;
      error.value = errMsg;
      return { success: false, error: errMsg };
    } finally {
      loading.value = false;
    }
  };

  // 故事数量
  const storyCount = computed(() => stories.value.length);

  // 重置状态
  const resetState = () => {
    stories.value = [];
    loading.value = false;
    error.value = "";
  };

  return {
    stories,
    loading,
    error,
    storyCount,
    fetchStories,
    fetchStoryById,
    getStoryById,
    saveStory,
    updateStory,
    deleteStory,
    resetState,
  };
};
