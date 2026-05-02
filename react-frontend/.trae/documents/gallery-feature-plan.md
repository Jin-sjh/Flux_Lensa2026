# 画廊界面（Gallery）实施计划

## 概述

为 Flux Lensa 项目新增一个画廊界面，将用户生成的学习卡片（AI 渲染的带标注图片）以画册形式展示，支持浏览、筛选和详情查看。

## 当前项目分析

* **技术栈**: React 19 + TypeScript + Vite，无路由库（useState + switch），无 UI 库

* **样式方案**: 全局 CSS + CSS 自定义属性（variables.css），BEM 风格类名，热带/自然主题

* **状态管理**: Context + useReducer（AuthContext, SettingsContext, TestContext, useLensa）

* **核心数据流**: 拍照 → AI 标注 → 渲染学习卡片图片（ResultCard） → 练习

* **导航**: Sidebar（桌面端6项）+ BottomNav（移动端5项），通过 `activeNav` 状态切换页面

## 实施步骤

### 步骤 1：定义画廊数据模型

**文件**: `src/types/gallery.ts`（新建）

定义 `GalleryCard` 接口，整合学习卡片的所有关键信息：

```typescript
export interface GalleryCard {
  id: string;
  imageUrl: string;           // 渲染后的学习卡片图片 URL
  originalImageUrl?: string;  // 原始上传图片 URL（可选）
  annotations: Annotation[];  // AI 标注数据
  caption: string;            // 场景描述
  task: string;               // 练习题
  sessionId: string;          // 会话 ID
  createdAt: string;          // 创建时间 ISO 字符串
  isCompleted: boolean;       // 是否已完成练习
}
```

### 步骤 2：扩展 Lensa 状态管理，支持画廊历史记录

**文件**: `src/hooks/useLensa.ts`（修改）

在 `LensaState` 中新增 `galleryCards: GalleryCard[]` 字段，在 `LensaAction` 中新增：

* `ADD_GALLERY_CARD` — 渲染成功后自动将卡片添加到画廊

* `REMOVE_GALLERY_CARD` — 删除画廊中的卡片

* `TOGGLE_GALLERY_CARD_COMPLETE` — 切换卡片完成状态

**文件**: `src/hooks/useLensaApp.ts`（修改）

在 `RENDER_SUCCESS` 后自动 dispatch `ADD_GALLERY_CARD`，将当前生成的卡片信息存入画廊历史。

### 步骤 3：创建画廊页面组件

**文件**: `src/components/gallery/GalleryPage.tsx`（新建）

画廊主页面，包含：

* 页面标题区（eyebrow + section-title，遵循现有 page-panel 模式）

* 筛选/排序工具栏（全部/已完成/未完成 + 按时间排序）

* 画廊网格区域（瀑布流/响应式网格布局）

* 空状态提示（无卡片时展示引导文案）

* 卡片点击进入详情

**文件**: `src/components/gallery/GalleryCard.tsx`（新建）

单张画廊卡片组件，展示：

* 卡片图片（带圆角、阴影、hover 动画）

* 印尼语词汇标签（覆盖在图片底部）

* 完成状态徽章

* 创建时间

**文件**: `src/components/gallery/GalleryDetail.tsx`（新建）

卡片详情模态框/灯箱组件，展示：

* 大图预览

* 标注信息列表（印尼语词汇 + 中文翻译 + 关联新词）

* 练习题展示

* 操作按钮（保存图片、开始练习、删除卡片）

### 步骤 4：添加画廊样式

**文件**: `src/styles/components.css`（修改，追加画廊相关样式）

遵循现有设计体系，新增以下 CSS 类：

* `.gallery-page` — 画廊页面容器

* `.gallery-toolbar` — 筛选/排序工具栏

* `.gallery-filter-btn` — 筛选按钮（复用 upload-tab 风格）

* `.gallery-grid` — 画廊网格（CSS Grid，响应式列数）

* `.gallery-card` — 画廊卡片（图片 + 信息覆盖层）

* `.gallery-card-image` — 卡片图片区域

* `.gallery-card-overlay` — 图片底部信息覆盖层

* `.gallery-card-badge` — 完成状态徽章

* `.gallery-empty` — 空状态容器

* `.gallery-detail-overlay` — 详情模态框背景

* `.gallery-detail` — 详情模态框

* `.gallery-detail-image` — 详情大图

* `.gallery-detail-info` — 详情信息区

* `.gallery-detail-annotations` — 标注列表

* `.gallery-detail-actions` — 操作按钮区

设计要点：

* 使用 `variables.css` 中的设计令牌（颜色、间距、圆角、阴影、过渡）

* 画廊网格：桌面端 3-4 列，平板 2 列，手机 1 列

* 卡片 hover 效果：上浮 + 阴影增强 + 顶部渐变条（与现有 learning-card 一致）

* 详情模态框：毛玻璃背景 + 居中卡片 + 入场动画

* 空状态：与现有占位符风格一致

### 步骤 5：注册画廊路由

**文件**: `src/App.tsx`（修改）

1. 导入 `GalleryPage` 组件
2. 在 `renderPage` 的 switch 中新增 `case 'gallery'` 分支
3. 将 `state.galleryCards` 和相关回调传递给 GalleryPage

### 步骤 6：添加导航入口

**文件**: `src/components/layout/Sidebar.tsx`（修改）

在 `menuItems` 数组中新增画廊项：

```typescript
{ id: 'gallery', icon: '▦', label: '画廊' }
```

位置：在"词汇本"和"Anki 导出"之间。

**文件**: `src/components/layout/BottomNav.tsx`（修改）

在 `tabs` 数组中新增画廊项：

```typescript
{ id: 'gallery', icon: '▦', label: '画廊' }
```

位置：在"词汇"和"Anki"之间。

### 步骤 7：添加国际化翻译

**文件**: `src/contexts/SettingsContext.tsx`（修改）

在三种语言的 `translations` 对象中新增 `gallery` 翻译键：

```typescript
gallery: {
  eyebrow: 'Gallery',
  title: '学习画册',        // zh
  all: '全部',
  completed: '已完成',
  inProgress: '未完成',
  newest: '最新优先',
  oldest: '最早优先',
  emptyTitle: '还没有学习卡片',
  emptyHint: '拍照生成学习内容后，卡片会自动出现在这里',
  goCapture: '去拍照',
  detail: '卡片详情',
  annotations: '词汇标注',
  task: '练习题',
  startPractice: '开始练习',
  saveImage: '保存图片',
  deleteCard: '删除',
  confirmDelete: '确定删除这张卡片？',
  words: '个词汇',
}
```

### 步骤 8：扩展 Mock 数据

**文件**: `src/services/mockData.ts`（修改）

新增 `mockGalleryCards` 数组，包含 6-8 张模拟画廊卡片，使用 Unsplash 图片 URL，覆盖不同场景和完成状态，用于开发和测试。

### 步骤 9：在首页添加画廊入口

**文件**: `src/components/dashboard/QuickActions.tsx`（修改）

在快捷操作卡片中新增"学习画册"入口，点击后导航到画廊页面。

## 文件变更清单

| 操作 | 文件路径                                        | 说明                          |
| -- | ------------------------------------------- | --------------------------- |
| 新建 | `src/types/gallery.ts`                      | 画廊数据类型定义                    |
| 修改 | `src/hooks/useLensa.ts`                     | 新增 galleryCards 状态和 actions |
| 修改 | `src/hooks/useLensaApp.ts`                  | 渲染成功后自动添加画廊卡片               |
| 新建 | `src/components/gallery/GalleryPage.tsx`    | 画廊主页面                       |
| 新建 | `src/components/gallery/GalleryCard.tsx`    | 画廊卡片组件                      |
| 新建 | `src/components/gallery/GalleryDetail.tsx`  | 卡片详情模态框                     |
| 修改 | `src/styles/components.css`                 | 新增画廊相关 CSS 样式               |
| 修改 | `src/App.tsx`                               | 注册画廊路由                      |
| 修改 | `src/components/layout/Sidebar.tsx`         | 添加画廊导航项                     |
| 修改 | `src/components/layout/BottomNav.tsx`       | 添加画廊导航项                     |
| 修改 | `src/contexts/SettingsContext.tsx`          | 添加画廊 i18n 翻译                |
| 修改 | `src/services/mockData.ts`                  | 添加画廊 Mock 数据                |
| 修改 | `src/components/dashboard/QuickActions.tsx` | 添加画廊快捷入口                    |

## 设计规范

* **配色**: 主色深绿 `#294b1b`，强调色金色 `#d8a83f`，背景暖白 `#f4efe3`

* **卡片圆角**: `var(--radius-lg)` (1.25rem)

* **卡片阴影**: `var(--shadow-sm)` → hover 时 `var(--shadow-lg)`

* **过渡动画**: `var(--transition-base)` (250ms)

* **入场动画**: 复用 `fadeInUp`，交错延迟 0.05s

* **毛玻璃效果**: `backdrop-filter: blur(20px)`

* **字体**: 标题 `var(--font-display)` (Cormorant Garamond)，正文 `var(--font-sans)` (DM Sans)

