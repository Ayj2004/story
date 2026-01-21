async function handleRequest(request) {
  try {
    // 统一提取响应头常量
    const DEFAULT_HEADERS = {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    };

    // URL 解析容错
    let url, pathname, method;
    try {
      url = new URL(request.url);
      pathname = url.pathname;
      method = request.method.toUpperCase();
    } catch (urlErr) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "请求 URL 格式非法，无法解析",
        }),
        {
          status: 400,
          headers: DEFAULT_HEADERS,
        }
      );
    }

    // 处理 OPTIONS 预检请求
    if (method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Accept",
          "Access-Control-Max-Age": "86400",
        },
      });
    }

    // 初始化 EdgeKV（验证模块是否可用）
    if (typeof EdgeKV === "undefined") {
      return new Response(
        JSON.stringify({
          success: false,
          error: "EdgeKV 模块未加载，无法操作真实 KV 存储",
        }),
        {
          status: 500,
          headers: DEFAULT_HEADERS,
        }
      );
    }
    const edgeKV = new EdgeKV({ namespace: "kvstory" });
    const getType = { type: "json" };

    // 1. 获取所有故事列表（真实 KV 读取）
    if (method === "GET" && pathname === "/api/stories") {
      // 读取 story_list（替换原post_list）
      const storyList = (await edgeKV.get("story_list", getType)) || [];

      // 验证 storyList 为数组
      if (!Array.isArray(storyList)) {
        return new Response(
          JSON.stringify({
            success: false,
            error: "story_list 格式错误，预期为数组",
          }),
          {
            status: 500,
            headers: DEFAULT_HEADERS,
          }
        );
      }

      // 批量读取单篇故事数据
      const stories = await Promise.all(
        storyList.map(async (id) => {
          if (!id) return null;
          const idStr = String(id);
          const storyKey = `story_${idStr}`;
          const story = await edgeKV.get(storyKey, getType);

          // 补充字段返回
          return story
            ? {
                id: idStr,
                title: story.title || "无标题",
                intro: story.intro || "无简介", // 原summary→intro
                cover: story.cover || "https://picsum.photos/1440/1080",
                createTime: story.createTime || "",
                author: story.author || "匿名作者",
                storyType: story.storyType || "未分类", // 原category→storyType
                updateTime: story.updateTime || story.createTime || "",
                content: story.content || "",
              }
            : null;
        })
      );

      const validStories = stories.filter(Boolean);
      return new Response(
        JSON.stringify({
          success: true,
          data: validStories,
        }),
        {
          headers: DEFAULT_HEADERS,
        }
      );
    }

    // 2. 获取单篇故事详情（真实 KV 读取）
    if (method === "GET" && pathname.startsWith("/api/story/")) {
      const storyId = pathname.split("/").pop();
      if (!storyId) {
        return new Response(
          JSON.stringify({
            success: false,
            error: "故事ID不能为空",
          }),
          {
            status: 400,
            headers: DEFAULT_HEADERS,
          }
        );
      }

      const storyIdStr = String(storyId);
      const storyKey = `story_${storyIdStr}`;
      const story = await edgeKV.get(storyKey, getType);

      if (!story) {
        return new Response(
          JSON.stringify({
            success: false,
            error: "故事不存在",
          }),
          {
            status: 404,
            headers: DEFAULT_HEADERS,
          }
        );
      }

      // 补充字段兜底
      const storyWithDefault = {
        ...story,
        author: story.author || "匿名作者",
        storyType: story.storyType || "未分类",
        intro: story.intro || story.content.slice(0, 100),
      };

      return new Response(
        JSON.stringify({
          success: true,
          data: storyWithDefault,
        }),
        {
          headers: DEFAULT_HEADERS,
        }
      );
    }

    // 3. 新增/更新故事（真实 KV 写入）
    if (method === "POST" && pathname === "/api/story") {
      const storyData = await request.json();
      if (!storyData.id || !storyData.title || !storyData.content) {
        return new Response(
          JSON.stringify({
            success: false,
            error: "故事ID、标题、内容不能为空",
          }),
          {
            status: 400,
            headers: DEFAULT_HEADERS,
          }
        );
      }

      // 补全时间字段 + 作者/类型兜底
      const now = new Date().toISOString();
      const story = {
        ...storyData,
        id: String(storyData.id),
        updateTime: now,
        createTime: storyData.createTime || now,
        author: storyData.author || "匿名作者",
        storyType: storyData.storyType || "未分类",
        intro: storyData.intro || storyData.content.slice(0, 100),
      };

      // 写入单篇故事数据
      const storyKey = `story_${story.id}`;
      await edgeKV.put(storyKey, JSON.stringify(story));

      // 更新故事列表
      const storyList = (await edgeKV.get("story_list", getType)) || [];
      if (!Array.isArray(storyList)) {
        return new Response(
          JSON.stringify({
            success: false,
            error: "story_list 格式错误，预期为数组",
          }),
          {
            status: 500,
            headers: DEFAULT_HEADERS,
          }
        );
      }

      if (!storyList.includes(story.id)) {
        storyList.push(story.id);
        await edgeKV.put("story_list", JSON.stringify(storyList));
      }

      return new Response(
        JSON.stringify({
          success: true,
          data: "故事保存成功（真实 KV 存储）",
        }),
        {
          headers: DEFAULT_HEADERS,
        }
      );
    }

    // 4. 删除故事（真实 KV 删除）
    if (method === "DELETE" && pathname.startsWith("/api/story/")) {
      const storyId = pathname.split("/").pop();
      if (!storyId) {
        return new Response(
          JSON.stringify({
            success: false,
            error: "故事ID不能为空",
          }),
          {
            status: 400,
            headers: DEFAULT_HEADERS,
          }
        );
      }

      const storyIdStr = String(storyId);
      const storyKey = `story_${storyIdStr}`;

      // 删除单篇故事数据
      const deleteResult = await edgeKV.delete(storyKey);
      if (!deleteResult) {
        return new Response(
          JSON.stringify({
            success: false,
            error: "故事删除失败",
          }),
          {
            status: 500,
            headers: DEFAULT_HEADERS,
          }
        );
      }

      // 更新故事列表
      const storyList = (await edgeKV.get("story_list", getType)) || [];
      if (!Array.isArray(storyList)) {
        return new Response(
          JSON.stringify({
            success: false,
            error: "story_list 格式错误，预期为数组",
          }),
          {
            status: 500,
            headers: DEFAULT_HEADERS,
          }
        );
      }

      const newStoryList = storyList.filter((id) => String(id) !== storyIdStr);
      await edgeKV.put("story_list", JSON.stringify(newStoryList));

      return new Response(
        JSON.stringify({
          success: true,
          data: "故事删除成功（真实 KV 存储）",
        }),
        {
          headers: DEFAULT_HEADERS,
        }
      );
    }

    // 路由未匹配
    return new Response(
      JSON.stringify({
        success: false,
        error: "接口不存在",
      }),
      {
        status: 404,
        headers: DEFAULT_HEADERS,
      }
    );
  } catch (e) {
    // 异常处理
    const errorMsg = e.message || "未知操作异常";
    return new Response(
      JSON.stringify({
        success: false,
        error: `操作异常：${errorMsg}`,
      }),
      {
        status: 500,
        headers: DEFAULT_HEADERS,
      }
    );
  }
}

// 导出fetch处理函数
export default {
  async fetch(request) {
    return handleRequest(request);
  },
};
