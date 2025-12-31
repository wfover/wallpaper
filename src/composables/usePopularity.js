import { ref } from 'vue'
import { getPopularWallpapers, isSupabaseConfigured } from '@/utils/supabase'

// 热门数据缓存（5分钟过期）
const CACHE_DURATION = 5 * 60 * 1000
const popularityCache = ref(new Map())
const cacheTimestamp = ref(new Map())
const loading = ref(false)

/**
 * 热门壁纸数据管理
 */
export function usePopularity() {
  /**
   * 获取指定系列的热门数据
   * @param {string} series - 系列
   * @param {number} limit - 数量限制
   */
  async function fetchPopularData(series, limit = 100) {
    if (!isSupabaseConfigured()) {
      return []
    }

    // 检查缓存
    const cacheKey = `${series}_${limit}`
    const cached = popularityCache.value.get(cacheKey)
    const timestamp = cacheTimestamp.value.get(cacheKey)

    if (cached && timestamp && Date.now() - timestamp < CACHE_DURATION) {
      return cached
    }

    loading.value = true
    try {
      const data = await getPopularWallpapers(series, limit)
      popularityCache.value.set(cacheKey, data)
      cacheTimestamp.value.set(cacheKey, Date.now())
      return data
    }
    catch (error) {
      console.error('获取热门数据失败:', error)
      return cached || []
    }
    finally {
      loading.value = false
    }
  }

  /**
   * 检查壁纸是否为热门
   * @param {string} filename - 文件名
   * @param {string} series - 系列
   * @param {number} threshold - 热门阈值（默认前10名或分数>50）
   */
  function isPopular(filename, series, threshold = 10) {
    const cacheKey = `${series}_100`
    const data = popularityCache.value.get(cacheKey)

    if (!data || data.length === 0) {
      return false
    }

    // 查找壁纸在热门列表中的位置
    const index = data.findIndex(item => item.filename === filename)

    // 前 threshold 名为热门
    return index !== -1 && index < threshold
  }

  /**
   * 获取壁纸的热门排名
   * @param {string} filename - 文件名
   * @param {string} series - 系列
   * @returns {number} 排名（从1开始），0表示不在热门列表
   */
  function getPopularRank(filename, series) {
    const cacheKey = `${series}_100`
    const data = popularityCache.value.get(cacheKey)

    if (!data || data.length === 0) {
      return 0
    }

    const index = data.findIndex(item => item.filename === filename)
    return index !== -1 ? index + 1 : 0
  }

  /**
   * 获取壁纸的热度分数
   * @param {string} filename - 文件名
   * @param {string} series - 系列
   */
  function getPopularityScore(filename, series) {
    const cacheKey = `${series}_100`
    const data = popularityCache.value.get(cacheKey)

    if (!data || data.length === 0) {
      return 0
    }

    const item = data.find(item => item.filename === filename)
    return item?.popularity_score || 0
  }

  /**
   * 获取壁纸的下载次数
   * @param {string} filename - 文件名
   * @param {string} series - 系列
   * @returns {number} 下载次数
   */
  function getDownloadCount(filename, series) {
    const cacheKey = `${series}_100`
    const data = popularityCache.value.get(cacheKey)

    if (!data || data.length === 0) {
      return 0
    }

    const item = data.find(item => item.filename === filename)
    return item?.download_count || 0
  }

  /**
   * 清除缓存
   */
  function clearCache() {
    popularityCache.value.clear()
    cacheTimestamp.value.clear()
  }

  return {
    loading,
    fetchPopularData,
    isPopular,
    getPopularRank,
    getPopularityScore,
    getDownloadCount,
    clearCache,
  }
}
