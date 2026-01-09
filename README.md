# Wallpaper Gallery

一个高雅大气的壁纸展示网站，基于 Vue 3 + Vite 7 构建，完美适配桌面端和移动端。

## ✨ 特性

### 🎨 核心功能

- **高清壁纸展示** - 支持 16K/8K/5K/4K 及更高分辨率壁纸
- **四大系列** - 电脑壁纸、手机壁纸、头像、Bing 每日壁纸
- **Bing 每日壁纸** - 从 2019年6月至今约 2400+ 张必应精选壁纸
- **智能裁剪** - PC 端电脑壁纸智能裁剪功能
- **真机显示模式** - 手机壁纸和头像系列专属 iPhone 外观模拟
- **智能搜索** - 实时搜索建议、关键词高亮
- **多种排序** - 按时间、大小、名称排序
- **动态分类** - 自动从壁纸数据中提取分类
- **一键下载** - 直接下载原图

### 🖼️ 视图与浏览

- **多视图模式** - 网格/列表/瀑布流，支持 GSAP Flip 动画丝滑切换
- **全屏浏览** - 沉浸式全屏浏览模式
- **移动端无限滚动** - 滚动到底部自动加载更多
- **3D 热门轮播** - 首页 3D 卡片轮播展示热门壁纸

### 💫 用户体验

- **主题切换** - 深色/浅色/跟随系统/定时自动切换
- **响应式设计** - 完美适配桌面端和移动端
- **用户偏好记忆** - 记住用户的系列选择、排序方式、视图模式

## 🛠️ 技术栈

| 类别 | 技术 |
| --- | --- |
| 框架 | Vue 3.5 (Composition API) |
| 构建工具 | Vite 7 |
| UI 组件 | Element Plus + Vant |
| 动画 | GSAP + Flip 插件 |
| 样式 | Sass + postcss-pxtorem |
| 路由 | Vue Router 4 |
| 状态管理 | Pinia |

## 🚀 快速开始

### Fork 用户（推荐）

```bash
# 1. Fork 本项目到你的 GitHub

# 2. 克隆你 Fork 的项目
git clone https://github.com/你的用户名/wallpaper-gallery.git
cd wallpaper-gallery

# 3. 安装依赖
pnpm install

# 4. 生成壁纸数据（自动从线上拉取）
pnpm generate

# 5. 启动开发服务器
pnpm dev

# 6. 构建生产版本
pnpm build
```

**无需任何额外配置！** 运行 `pnpm generate` 会自动从官方数据源拉取壁纸数据。

### 数据来源说明

| 资源 | 来源 | 说明 |
|------|------|------|
| 图片 | jsDelivr CDN | 自动从官方图床获取 |
| JSON 数据 | 线上数据源 | `pnpm generate` 自动拉取 |
| Bing 壁纸 | Bing 官方 CDN | 直连 cn.bing.com |

### 部署方式

**GitHub Pages（推荐）：**
1. 在仓库 Settings → Pages 中启用 GitHub Pages
2. 选择 GitHub Actions 作为构建源
3. 推送代码后自动部署

**Vercel：**
1. 导入你的 GitHub 仓库到 Vercel
2. 构建命令：`pnpm build:vercel`
3. 输出目录：`dist`

### 自定义图床（可选）

如果你想使用自己的图床：

1. **准备图床仓库**
   - Fork [nuanXinProPic](https://github.com/IT-NuanxinPro/nuanXinProPic) 图床项目
   - 或创建兼容的目录结构

2. **修改配置**
   ```bash
   # .env.production
   VITE_CDN_BASE=https://你的CDN域名
   VITE_DATA_SOURCE=r2  # 如果使用 CDN 托管 JSON
   ```

3. **修改数据源**
   - 编辑 `scripts/generate-data.js` 中的 `ONLINE_DATA_BASE_URL`
   - 或将图床仓库 clone 到项目同级目录

## 📁 项目结构

```text
wallpaper-gallery/
├── public/data/          # 壁纸数据 JSON（构建时生成）
├── scripts/
│   └── generate-data.js  # 数据生成脚本
├── src/
│   ├── components/       # Vue 组件
│   ├── composables/      # 组合式函数
│   ├── router/           # 路由配置
│   ├── views/            # 页面视图
│   └── utils/            # 工具函数
└── index.html
```

## 📱 四大系列

| 系列 | 路由 | 宽高比 | 数据来源 |
| --- | --- | --- | --- |
| 电脑壁纸 | `/desktop` | 16:10 | 图床 CDN |
| 手机壁纸 | `/mobile` | 9:16 | 图床 CDN |
| 头像 | `/avatar` | 1:1 | 图床 CDN |
| Bing 每日 | `/bing` | 16:9 | Bing 官方 CDN |

## 🎯 性能优化

- **CDN 外部化** - Vue / Vue Router 通过 CDN 加载
- **代码分割** - 路由级别代码分割，按需加载
- **Brotli 压缩** - 静态资源预压缩
- **图片优化** - WebP 缩略图、懒加载

## ☕ 赞赏支持

如果这个项目对你有帮助，欢迎请作者喝杯咖啡 ☕

<p align="center">
  <img src="docs/sponsor-alipay.png" width="300" alt="支付宝" />
  <img src="docs/sponsor-wechat.png" width="300" alt="微信支付" />
</p>

## 📄 License

MIT
