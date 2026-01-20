src/
├── composables/
│ └── useStories.ts // 原 usePosts.ts 改造
├── components/
│ ├── CategoryFilter.vue // 改为 StoryTypeFilter.vue（语义替换）
│ ├── CreatePostBtn.vue // 改为 CreateStoryBtn.vue
│ ├── Footer.vue // 页脚文案改造
│ ├── Layout.vue // 无核心改动
│ ├── Navbar.vue // 导航文案改造
│ ├── PostCard.vue // 改为 StoryCard.vue
│ └── PostDetail.vue // 改为 StoryDetail.vue
├── router/
│ └── index.ts // 路由语义化改造
├── types/
│ └── index.ts // 类型定义改为 Story
├── views/
│ ├── CreateView.vue // 创建故事页
│ ├── DetailView.vue // 故事详情页
│ ├── EditView.vue // 编辑故事页
│ └── HomeView.vue // 首页（故事列表）
├── App.vue // 无改动
├── index.css // 无核心改动
├── main.ts // 无改动
├── style.css // 无核心改动
└── vite-env.d.ts // 无改动
