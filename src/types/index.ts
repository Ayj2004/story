/** 故事类型（核心业务类型） */
export interface Story {
  id: string | number;
  title: string;
  author: string;
  storyType: string;
  cover: string;
  content: string;
  intro: string;
  createTime: string;
  updateTime: string;
}

/** KV操作返回结果类型（保留原有） */
export interface KVResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}
