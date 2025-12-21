# 移动端适配与路由改造计划

## 项目背景

- **项目**: Wallpaper Gallery - Vue 3 壁纸展示应用
- **技术栈**: Vue 3.5.24 + Vite 7.2.4 + Element Plus + SCSS
- **目标**: 移动端适配 + 添加路由 + UI 组件双库方案

## 方案概述

采用 **rem + 媒体查询混合方案**：

- PC 端：**保持现状不动**，Element Plus + px 单位
- 移动端：Vant 核心组件 + rem 单位（postcss-pxtorem 转换）
- 设备检测：媒体查询 + useDevice composable

**核心策略**：

- PC 端样式完全不转换（通过 selectorBlackList 排除）
- 只有移动端专用样式（`.mobile-*` 类）会被转换为 rem
- amfe-flexible 只在移动端生效（>540px 自动停止）

---

## 阶段 1：基础配置

### 1.1 安装依赖

```bash
# 路由
pnpm add vue-router

# Vant 组件库（按需引入）
pnpm add vant @vant/auto-import-resolver

# rem 适配方案
pnpm add amfe-flexible
pnpm add -D postcss-pxtorem
```

### 1.2 配置 postcss-pxtorem

**文件**: `postcss.config.js`（新建）

关键配置：PC 端样式不转换

```javascript
export default {
  plugins: {
    'postcss-pxtorem': {
      rootValue: 37.5, // 设计稿宽度 375 / 10
      unitPrecision: 5,
      propList: ['*'],
      selectorBlackList: [
        // PC 端样式全部排除
        '.pc-only',
        '.no-rem',
        // Element Plus 组件不转换
        '.el-',
        // 现有组件类名（保持 PC 端现状）
        '.app-header',
        '.filter-panel',
        '.wallpaper-',
        '.hero-',
        '.container',
        '.header-',
        '.brand-',
        '.view-mode-',
        '.action-',
        '.theme-',
        '.fullscreen-',
        '.github-',
        // 根元素
        'html',
        'body',
      ],
      replace: true,
      mediaQuery: false,
      minPixelValue: 2,
      exclude: /node_modules/i,
    },
  },
}
```

### 1.3 配置 amfe-flexible

**修改文件**: `src/main.js`

```javascript
import 'amfe-flexible'
// amfe-flexible 特性：
// - 移动端（<=540px）：动态设置 html font-size
// - PC 端（>540px）：font-size 固定为 54px，不会无限放大
```

### 1.4 配置 Vant 按需引入

**修改文件**: `vite.config.js`

```javascript
import { VantResolver } from '@vant/auto-import-resolver'

// 在 plugins 中添加
AutoImport({
  resolvers: [ElementPlusResolver(), VantResolver()],
}),
Components({
  resolvers: [ElementPlusResolver(), VantResolver()],
}),
```

### 1.5 配置 Vue Router

**新建文件**: `src/router/index.js`

```javascript
import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/Home.vue'),
    meta: { title: 'Wallpaper Gallery' },
  },
  {
    path: '/about',
    name: 'About',
    component: () => import('@/views/About.vue'),
    meta: { title: '关于我们' },
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    return savedPosition || { top: 0 }
  },
})

export default router
```

---

## 阶段 2：移动端检测工具

**新建文件**: `src/composables/useDevice.js`

```javascript
import { computed, onMounted, onUnmounted, ref } from 'vue'

export function useDevice() {
  const windowWidth = ref(typeof window !== 'undefined' ? window.innerWidth : 1024)

  const isMobile = computed(() => windowWidth.value < 768)
  const isTablet = computed(() => windowWidth.value >= 768 && windowWidth.value < 992)
  const isDesktop = computed(() => windowWidth.value >= 992)

  function updateWidth() {
    windowWidth.value = window.innerWidth
  }

  onMounted(() => {
    window.addEventListener('resize', updateWidth)
  })

  onUnmounted(() => {
    window.removeEventListener('resize', updateWidth)
  })

  return { isMobile, isTablet, isDesktop, windowWidth }
}
```

---

## 阶段 3：组件重构

### 3.1 AppHeader.vue 改造

**目标**：

- PC 端：**保持现有布局不变**
- 移动端：显示汉堡菜单按钮，点击打开左侧抽屉

**改造点**：

1. 添加 `useDevice` 检测设备
2. PC 端代码完全不动
3. 移动端使用 `v-if="isMobile"` 条件渲染
4. 使用 Vant Popup 实现左侧抽屉
5. 抽屉内包含：导航菜单、视图切换、主题切换

### 3.2 FilterPanel.vue 改造

**目标**：

- PC 端：**保持横向筛选布局不变**
- 移动端：显示"筛选"按钮，点击底部弹出抽屉

**改造点**：

1. 添加 `useDevice` 检测设备
2. PC 端代码完全不动
3. 移动端使用 `v-if="isMobile"` 条件渲染
4. 使用 Vant Popup 实现底部弹出

---

## 阶段 4：视图页面

### 4.1 Home.vue

将 App.vue 中的主要内容迁移至独立视图：

- Hero Section
- TodayPick
- FilterPanel
- WallpaperGrid

### 4.2 About.vue

简单的关于页面：

- 项目介绍
- 技术栈说明
- 联系方式/GitHub 链接

---

## 阶段 5：修复移动端问题

### 5.1 禁用双指缩放

**修改文件**: `index.html`

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
```

### 5.2 修复横向滚动

**检查点**：

1. 全局 `overflow-x: hidden`
2. 容器最大宽度 `max-width: 100vw`
3. 固定定位元素宽度检查

---

## 文件清单

### 新建文件

| 文件路径 | 说明 |
| --- | --- |
| `postcss.config.js` | PostCSS 配置 |
| `src/router/index.js` | 路由配置 |
| `src/composables/useDevice.js` | 设备检测 |
| `src/views/Home.vue` | 首页视图 |
| `src/views/About.vue` | 关于页视图 |

### 修改文件

| 文件路径 | 改动说明 |
| --- | --- |
| `vite.config.js` | 添加 Vant 解析器 |
| `src/main.js` | 注册路由、引入 flexible |
| `src/App.vue` | 简化为路由容器 |
| `src/components/layout/AppHeader.vue` | 添加移动端抽屉（PC 端不动） |
| `src/components/common/FilterPanel.vue` | 添加底部弹出（PC 端不动） |
| `index.html` | 视口 meta 修复 |
| `src/assets/styles/main.scss` | 全局滚动修复 |

---

## 预期结果

- [x] **PC 端完全保持现状**
- [x] 移动端无横向滚动条
- [x] 双指缩放被禁用
- [x] 移动端筛选面板底部弹出
- [x] 移动端顶部菜单变为抽屉式
- [x] 添加首页和关于页路由
- [x] Element Plus (PC) + Vant (Mobile) 共存
