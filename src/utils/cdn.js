// ========================================
// CDN 工具函数
// ========================================
// 支持三种模式：
// 1. 自定义 CDN：配置了 VITE_CDN_BASE，使用自定义 R2/CDN
// 2. 默认模式：未配置 CDN，使用 jsDelivr 从官方图床获取
// 3. Bing 图片：始终使用 Bing 官方 CDN

// ========================================
// 版本号（独立定义，避免循环依赖）
// ========================================

// CDN 版本号 - GitHub Actions 构建时会自动替换
export const CDN_VERSION = 'v1.1.17'

// ========================================
// CDN 配置
// ========================================

// 自定义 CDN（从环境变量读取，可选）
const CUSTOM_CDN_BASE = import.meta.env.VITE_CDN_BASE || ''

// 数据源：'r2' | 'local'
const DATA_SOURCE = import.meta.env.VITE_DATA_SOURCE || 'local'

// jsDelivr CDN（默认图床，指向官方仓库）
const JSDELIVR_BASE = `https://cdn.jsdelivr.net/gh/IT-NuanxinPro/nuanXinProPic@${CDN_VERSION}`

// 主 CDN（优先自定义，回退 jsDelivr）
const CDN_BASE = CUSTOM_CDN_BASE || JSDELIVR_BASE

// Bing 官方 CDN
const BING_CDN_BASE = 'https://cn.bing.com'

// ========================================
// 导出配置
// ========================================

export { CDN_BASE, JSDELIVR_BASE as JSDELIVR_CDN_BASE, CUSTOM_CDN_BASE as R2_CDN_BASE }

// ========================================
// 图片 URL 构建
// ========================================

/**
 * 构建图片 URL
 * @param {string} path - 相对路径，如 /wallpaper/desktop/xxx.png
 * @returns {string} 完整 URL
 */
export function buildImageUrl(path) {
  if (!path) {
    return ''
  }

  // 已是完整 URL，直接返回
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path
  }

  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${CDN_BASE}${normalizedPath}`
}

/**
 * 获取 jsDelivr 回退 URL（用于图片加载失败时）
 * @param {string} path - 相对路径或完整 URL
 * @returns {string} jsDelivr URL
 */
export function getFallbackUrl(path) {
  if (!path) {
    return ''
  }

  // 提取相对路径
  const relativePath = extractPathFromUrl(path)
  const normalizedPath = relativePath.startsWith('/') ? relativePath : `/${relativePath}`

  return `${JSDELIVR_BASE}${normalizedPath}`
}

// ========================================
// 数据 URL 构建
// ========================================

/**
 * 获取数据 JSON URL
 * @param {string} series - 系列 ID
 * @param {string} file - 文件名
 * @returns {string} 数据 URL
 *
 * 数据源优先级：
 * 1. R2 模式 (VITE_CDN_BASE + VITE_DATA_SOURCE=r2) → 从 R2 CDN 获取
 * 2. 本地模式 (VITE_DATA_SOURCE=local) → 从本地 /data/ 获取
 *
 * 注意：Fork 用户需要配置自己的 R2 或生成本地 JSON 数据
 */
export function getDataUrl(series, file = 'index.json') {
  const cacheBuster = `?v=${CDN_VERSION}`

  // R2 数据源（需要同时配置 CDN_BASE 和 DATA_SOURCE=r2）
  if (DATA_SOURCE === 'r2' && CUSTOM_CDN_BASE) {
    return `${CUSTOM_CDN_BASE}/data/${series}/${file}${cacheBuster}`
  }

  // 本地数据源（开发环境或 Fork 用户自己生成的数据）
  return `${import.meta.env.BASE_URL}data/${series}/${file}${cacheBuster}`
}

/**
 * 获取 Bing 数据 URL
 */
export function getBingDataUrl(file = 'index.json') {
  return getDataUrl('bing', file)
}

// ========================================
// Bing 图片 URL（始终使用 Bing 官方 CDN）
// ========================================

export function buildBingThumbnailUrl(urlbase) {
  if (!urlbase) {
    return ''
  }
  return `${BING_CDN_BASE}${urlbase}_400x240.jpg`
}

export function buildBingPreviewUrl(urlbase) {
  if (!urlbase) {
    return ''
  }
  return `${BING_CDN_BASE}${urlbase}_1920x1080.jpg`
}

export function buildBingUHDUrl(urlbase) {
  if (!urlbase) {
    return ''
  }
  return `${BING_CDN_BASE}${urlbase}_UHD.jpg`
}

// ========================================
// 工具函数
// ========================================

/**
 * 检查是否使用自定义 CDN
 */
export function isCustomCdnEnabled() {
  return !!CUSTOM_CDN_BASE
}

/**
 * 检查是否使用远程数据源
 */
export function isRemoteDataSource() {
  return DATA_SOURCE === 'r2' && !!CUSTOM_CDN_BASE
}

// 兼容旧 API
export const isR2Enabled = isCustomCdnEnabled
export const isR2DataSource = isRemoteDataSource
export const DATA_SOURCE_VALUE = DATA_SOURCE

/**
 * 从完整 URL 提取相对路径
 */
export function extractPathFromUrl(url) {
  if (!url) {
    return ''
  }

  // 从自定义 CDN URL 提取
  if (CUSTOM_CDN_BASE && url.startsWith(CUSTOM_CDN_BASE)) {
    return url.slice(CUSTOM_CDN_BASE.length)
  }

  // 从 jsDelivr URL 提取
  const jsdelivrMatch = url.match(/@[^/]+(\/.*)/)
  if (jsdelivrMatch) {
    return jsdelivrMatch[1]
  }

  // 从 GitHub Raw URL 提取
  const rawMatch = url.match(/\/nuanXinProPic\/[^/]+(\/.*)/)
  if (rawMatch) {
    return rawMatch[1]
  }

  return url
}
