// ========================================
// 常量定义
// ========================================

// 从 cdn.js 导入 CDN 相关配置（避免重复定义）
import {
  CDN_VERSION,
  CDN_BASE,
  R2_CDN_BASE,
  JSDELIVR_CDN_BASE,
  getDataUrl,
} from '@/utils/cdn'

// 重新导出
export { CDN_VERSION, R2_CDN_BASE, JSDELIVR_CDN_BASE }

// 前端应用版本号（构建时由 vite 注入）
// eslint-disable-next-line no-undef
export const APP_VERSION = typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : '0.0.0'

// 数据请求版本参数
export const DATA_CACHE_BUSTER = `?v=${CDN_VERSION}`

// 数据源配置
export const DATA_SOURCE = import.meta.env.VITE_DATA_SOURCE || 'local'

// ========================================
// 四大系列配置
// ========================================

function buildCategoryBaseUrl(series) {
  if (DATA_SOURCE === 'r2' && R2_CDN_BASE) {
    return `${R2_CDN_BASE}/data/${series}`
  }
  return `${import.meta.env.BASE_URL}data/${series}`
}

export const SERIES_CONFIG = {
  desktop: {
    id: 'desktop',
    name: '电脑壁纸',
    icon: 'monitor',
    imageBaseUrl: `${CDN_BASE}/wallpaper/desktop`,
    thumbnailBaseUrl: `${CDN_BASE}/thumbnail/desktop`,
    indexUrl: getDataUrl('desktop', 'index.json'),
    dataUrl: `${import.meta.env.BASE_URL}data/desktop.json${DATA_CACHE_BUSTER}`,
    categoryBaseUrl: buildCategoryBaseUrl('desktop'),
    aspectRatio: '16/10',
  },
  mobile: {
    id: 'mobile',
    name: '手机壁纸',
    icon: 'smartphone',
    imageBaseUrl: `${CDN_BASE}/wallpaper/mobile`,
    thumbnailBaseUrl: `${CDN_BASE}/thumbnail/mobile`,
    indexUrl: getDataUrl('mobile', 'index.json'),
    dataUrl: `${import.meta.env.BASE_URL}data/mobile.json${DATA_CACHE_BUSTER}`,
    categoryBaseUrl: buildCategoryBaseUrl('mobile'),
    aspectRatio: '9/16',
  },
  avatar: {
    id: 'avatar',
    name: '头像',
    icon: 'user',
    imageBaseUrl: `${CDN_BASE}/wallpaper/avatar`,
    thumbnailBaseUrl: `${CDN_BASE}/thumbnail/avatar`,
    indexUrl: getDataUrl('avatar', 'index.json'),
    dataUrl: `${import.meta.env.BASE_URL}data/avatar.json${DATA_CACHE_BUSTER}`,
    categoryBaseUrl: buildCategoryBaseUrl('avatar'),
    aspectRatio: '1/1',
  },
  bing: {
    id: 'bing',
    name: '每日Bing',
    icon: 'calendar',
    bingCdnBase: 'https://cn.bing.com',
    imageBaseUrl: `${CDN_BASE}/bing`,
    indexUrl: getDataUrl('bing', 'index.json'),
    latestUrl: getDataUrl('bing', 'latest.json'),
    yearBaseUrl: buildCategoryBaseUrl('bing'),
    aspectRatio: '16/9',
    isDaily: true,
    hasMetadata: true,
    hideFormatFilter: true,
    pcOnly: true,
  },
}

// 设备可见的系列（PC端显示所有系列，平板显示所有系列，移动端不显示 Bing）
export const DEVICE_SERIES = {
  desktop: ['desktop', 'bing', 'mobile', 'avatar'], // PC端可见所有系列
  tablet: ['desktop', 'bing', 'mobile', 'avatar'], // 平板可见所有系列
  mobile: ['mobile', 'avatar'], // 移动端只显示手机壁纸和头像（Bing 仅 PC 端）
}

// 默认系列（根据设备类型）
export const DEFAULT_SERIES = {
  desktop: 'desktop', // PC端默认显示电脑壁纸
  tablet: 'desktop', // 平板默认显示电脑壁纸（适合横屏使用）
  mobile: 'mobile', // 移动端默认显示手机壁纸
}

// 所有系列ID列表
export const ALL_SERIES = ['desktop', 'bing', 'mobile', 'avatar']

// ========================================
// 图片代理服务配置（备用方案，如本地缩略图不可用时使用）
// ========================================
export const IMAGE_PROXY = {
  BASE_URL: 'https://wsrv.nl/',
  THUMB_WIDTH: 400,
  THUMB_QUALITY: 80,
  FORMAT: 'webp',
}

// 排序选项
export const SORT_OPTIONS = [
  { value: 'newest', label: '🕐 最新优先', icon: 'clock' },
  { value: 'popular', label: '🔥 最热门', icon: 'fire' },
  { value: 'downloads', label: '📥 下载量最高', icon: 'download' },
  { value: 'views', label: '👁️ 浏览量最高', icon: 'eye' },
  { value: 'weekly-hot', label: '📅 本周热门', icon: 'calendar' },
  { value: 'monthly-hot', label: '📆 本月热门', icon: 'calendar' },
  { value: 'oldest', label: '🕰️ 最早优先', icon: 'clock-reverse' },
  { value: 'largest', label: '📦 最大优先', icon: 'arrow-down' },
  { value: 'smallest', label: '📄 最小优先', icon: 'arrow-up' },
  { value: 'name-asc', label: '🔤 名称 A-Z', icon: 'sort-alpha' },
  { value: 'name-desc', label: '🔡 名称 Z-A', icon: 'sort-alpha-reverse' },
]

// 格式过滤选项
export const FORMAT_OPTIONS = [
  { value: 'all', label: '全部格式' },
  { value: 'jpg', label: 'JPG' },
  { value: 'png', label: 'PNG' },
  { value: 'jpeg', label: 'JPEG' },
  { value: 'webp', label: 'WEBP' },
  { value: 'gif', label: 'GIF' },
]

// ========================================
// 分辨率标签阈值（按长边判断，用于弹窗中根据真实图片尺寸动态生成标签）
// ========================================
export const RESOLUTION_THRESHOLDS = [
  { minWidth: 15360, label: '16K', type: 'danger' },
  { minWidth: 7680, label: '8K', type: 'danger' },
  { minWidth: 5120, label: '5K+', type: 'danger' },
  { minWidth: 4096, label: '4K+', type: 'warning' },
  { minWidth: 3840, label: '4K', type: 'success' },
  { minWidth: 2048, label: '2K', type: 'info' },
  { minWidth: 1920, label: '超清', type: 'primary' },
  { minWidth: 1280, label: '高清', type: 'secondary' },
  { minWidth: 0, label: '标清', type: 'secondary' },
]

// 分辨率筛选选项（基于 RESOLUTION_THRESHOLDS 生成，用于 FilterPanel）
export const RESOLUTION_OPTIONS = [
  { value: 'all', label: '全部分辨率' },
  ...RESOLUTION_THRESHOLDS.map(t => ({
    value: t.label,
    label: t.label,
    minWidth: t.minWidth,
  })),
]

// 主题
export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
}

// 主题模式（用户选择的模式）
export const THEME_MODES = {
  LIGHT: 'light', // 始终浅色
  DARK: 'dark', // 始终深色
  SYSTEM: 'system', // 跟随系统
  AUTO: 'auto', // 根据时间自动切换（6:00-18:00 浅色，其他深色）
}

// localStorage 键名
export const STORAGE_KEYS = {
  THEME: 'wallpaper-gallery-theme',
  THEME_MODE: 'wallpaper-gallery-theme-mode', // 新增：主题模式
  SORT: 'wallpaper-gallery-sort',
  CATEGORY: 'wallpaper-gallery-category',
  VIEW_MODE: 'wallpaper-gallery-view-mode',
  CURRENT_SERIES: 'wallpaper-gallery-current-series', // 当前选择的系列
}
