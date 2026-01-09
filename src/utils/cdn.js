// ========================================
// CDN 工具函数 (R2 迁移支持)
// ========================================

import { CDN_VERSION } from '@/utils/constants'

// ========================================
// 配置
// ========================================

// R2 CDN 基础 URL（从环境变量读取）
export const R2_CDN_BASE = import.meta.env.VITE_CDN_BASE || ''

// 数据源配置：'r2' | 'local'
export const DATA_SOURCE = import.meta.env.VITE_DATA_SOURCE || 'local'

// jsDelivr CDN（回退方案）
const _jsdelivrParts = {
  p: 'https://',
  h: 'cdn.jsdelivr.net',
  g: '/gh/IT-NuanxinPro',
  r: `/nuanXinProPic@${CDN_VERSION}`,
}
export const JSDELIVR_CDN_BASE = `${_jsdelivrParts.p}${_jsdelivrParts.h}${_jsdelivrParts.g}${_jsdelivrParts.r}`

// ========================================
// 图片 URL 构建
// ========================================

/**
 * 构建图片 URL（支持 R2 CDN）
 *
 * @param {string} path - 相对路径，如 /wallpaper/desktop/xxx.png
 * @returns {string} 完整 URL
 *
 * 优先级：
 * 1. 如果配置了 R2 CDN，使用 R2
 * 2. 否则使用 jsDelivr
 */
export function buildImageUrl(path) {
  if (!path)
    return ''

  // 如果路径已经是完整 URL，直接返回
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path
  }

  // 确保路径以 / 开头
  const normalizedPath = path.startsWith('/') ? path : `/${path}`

  // 优先使用 R2 CDN
  if (R2_CDN_BASE) {
    return `${R2_CDN_BASE}${normalizedPath}`
  }

  // 回退到 jsDelivr
  return `${JSDELIVR_CDN_BASE}${normalizedPath}`
}

/**
 * 获取 jsDelivr 回退 URL
 *
 * @param {string} path - 相对路径
 * @returns {string} jsDelivr URL
 */
export function getFallbackUrl(path) {
  if (!path)
    return ''

  // 如果路径已经是完整 URL，提取路径部分
  if (path.startsWith('http://') || path.startsWith('https://')) {
    // 尝试从 R2 URL 提取路径
    if (R2_CDN_BASE && path.startsWith(R2_CDN_BASE)) {
      path = path.slice(R2_CDN_BASE.length)
    }
    // 尝试从 jsDelivr URL 提取路径
    else if (path.includes('jsdelivr.net')) {
      const match = path.match(/@[^/]+(\/.*)/)
      if (match) {
        path = match[1]
      }
    }
    else {
      // 无法提取路径，返回原 URL
      return path
    }
  }

  // 确保路径以 / 开头
  const normalizedPath = path.startsWith('/') ? path : `/${path}`

  return `${JSDELIVR_CDN_BASE}${normalizedPath}`
}

// ========================================
// 数据 URL 构建
// ========================================

/**
 * 获取数据 JSON URL
 *
 * @param {string} series - 系列 ID，如 'desktop', 'mobile', 'avatar', 'bing'
 * @param {string} file - 文件名，如 'index.json', '动漫.json'
 * @returns {string} 数据 URL
 */
export function getDataUrl(series, file = 'index.json') {
  const cacheBuster = `?v=${CDN_VERSION}`

  // 使用 R2 数据源
  if (DATA_SOURCE === 'r2' && R2_CDN_BASE) {
    return `${R2_CDN_BASE}/data/${series}/${file}${cacheBuster}`
  }

  // 使用本地数据源
  return `${import.meta.env.BASE_URL}data/${series}/${file}${cacheBuster}`
}

/**
 * 获取 Bing 数据 URL
 *
 * @param {string} file - 文件名，如 'index.json', 'latest.json', '2025.json'
 * @returns {string} 数据 URL
 */
export function getBingDataUrl(file = 'index.json') {
  return getDataUrl('bing', file)
}

// ========================================
// Bing 图片 URL（特殊处理）
// ========================================

// Bing CDN 基础 URL
const BING_CDN_BASE = 'https://cn.bing.com'

/**
 * 构建 Bing 缩略图 URL
 * Bing 图片始终使用 Bing 官方 CDN，不走 R2
 *
 * @param {string} urlbase - Bing urlbase，如 /th?id=OHR.xxx_EN-US123
 * @returns {string} 缩略图 URL（400x240）
 */
export function buildBingThumbnailUrl(urlbase) {
  if (!urlbase)
    return ''
  return `${BING_CDN_BASE}${urlbase}_400x240.jpg`
}

/**
 * 构建 Bing 预览图 URL
 *
 * @param {string} urlbase - Bing urlbase
 * @returns {string} 预览图 URL（1920x1080）
 */
export function buildBingPreviewUrl(urlbase) {
  if (!urlbase)
    return ''
  return `${BING_CDN_BASE}${urlbase}_1920x1080.jpg`
}

/**
 * 构建 Bing UHD 原图 URL
 *
 * @param {string} urlbase - Bing urlbase
 * @returns {string} UHD 原图 URL
 */
export function buildBingUHDUrl(urlbase) {
  if (!urlbase)
    return ''
  return `${BING_CDN_BASE}${urlbase}_UHD.jpg`
}

// ========================================
// 工具函数
// ========================================

/**
 * 检查是否启用了 R2 CDN
 * @returns {boolean}
 */
export function isR2Enabled() {
  return !!R2_CDN_BASE
}

/**
 * 检查是否使用 R2 数据源
 * @returns {boolean}
 */
export function isR2DataSource() {
  return DATA_SOURCE === 'r2' && !!R2_CDN_BASE
}

/**
 * 从完整 URL 提取相对路径
 *
 * @param {string} url - 完整 URL
 * @returns {string} 相对路径
 */
export function extractPathFromUrl(url) {
  if (!url)
    return ''

  // 从 R2 URL 提取
  if (R2_CDN_BASE && url.startsWith(R2_CDN_BASE)) {
    return url.slice(R2_CDN_BASE.length)
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
