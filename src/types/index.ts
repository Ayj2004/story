/** 博客文章类型 */
export interface Post {
  id: string | number;
  title: string;
  cover: string;
  content: string;
  summary: string;
  createTime: string;
  updateTime: string;
  category?: string;
  excerpt?: string;
  author?: string;
}

/** KV操作返回结果类型 */
export interface KVResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}
