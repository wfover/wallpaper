// ========================================
// 搜索和筛选 Composable
// ========================================

import { computed, ref, watch } from 'vue'
import { STORAGE_KEYS } from '@/utils/constants'
import { debounce } from '@/utils/format'

/**
 * 获取系列的默认排序方式
 * @param {string} series - 系列类型
 * @returns {string} 默认排序方式
 */
function getDefaultSort(series) {
  // 手机壁纸和头像默认按热门排序，电脑壁纸默认按最新排序
  return ['mobile', 'avatar'].includes(series) ? 'popular' : 'newest'
}

export function useFilter(wallpapers, externalSearchQuery = null, popularityData = null, currentSeries = null, weeklyPopularityData = null, monthlyPopularityData = null) {
  // 搜索关键词（支持外部传入或内部管理）
  const searchQuery = externalSearchQuery || ref('')
  const debouncedQuery = ref('')

  // 获取初始排序方式（根据系列）
  const initialSort = currentSeries?.value
    ? getDefaultSort(currentSeries.value)
    : (localStorage.getItem(STORAGE_KEYS.SORT) || 'newest')

  // 排序方式
  const sortBy = ref(initialSort)

  // 监听系列变化，切换默认排序
  if (currentSeries) {
    watch(currentSeries, (newSeries) => {
      sortBy.value = getDefaultSort(newSeries)
    })
  }

  // 格式筛选
  const formatFilter = ref('all')

  // 分类筛选（一级分类）
  const categoryFilter = ref(localStorage.getItem(STORAGE_KEYS.CATEGORY) || 'all')

  // 二级分类筛选
  const subcategoryFilter = ref('all')

  // 防抖处理搜索
  const updateDebouncedQuery = debounce((value) => {
    debouncedQuery.value = value
  }, 300)

  watch(searchQuery, (value) => {
    updateDebouncedQuery(value)
  })

  // 保存排序偏好
  watch(sortBy, (value) => {
    localStorage.setItem(STORAGE_KEYS.SORT, value)
  })

  // 保存分类筛选偏好（不自动重置子分类，由组件控制）
  watch(categoryFilter, (value) => {
    localStorage.setItem(STORAGE_KEYS.CATEGORY, value)
  })

  // 动态生成分类选项（从壁纸数据中提取，包含二级分类信息）
  const categoryOptions = computed(() => {
    // 统计一级分类
    const categoryCount = {}
    // 统计二级分类 { '游戏': { '原神': 5, '崩坏': 3 }, ... }
    const subcategoryCount = {}

    wallpapers.value.forEach((w) => {
      if (w.category) {
        categoryCount[w.category] = (categoryCount[w.category] || 0) + 1

        // 统计二级分类（仅当存在时）
        if (w.subcategory) {
          if (!subcategoryCount[w.category]) {
            subcategoryCount[w.category] = {}
          }
          subcategoryCount[w.category][w.subcategory] = (subcategoryCount[w.category][w.subcategory] || 0) + 1
        }
      }
    })

    // 排序分类（按数量降序）
    const sortedCategories = Object.keys(categoryCount).sort((a, b) => {
      return (categoryCount[b] || 0) - (categoryCount[a] || 0)
    })

    // 返回选项格式（包含二级分类信息）
    return [
      { value: 'all', label: '全部分类', count: wallpapers.value.length },
      ...sortedCategories.map((cat) => {
        const subcats = subcategoryCount[cat]
        let subcategories = []

        if (subcats) {
          // 将二级分类转换为数组并排序
          subcategories = Object.entries(subcats)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count)
        }

        return {
          value: cat,
          label: cat,
          count: categoryCount[cat],
          // 仅当有二级分类时才添加
          ...(subcategories.length > 0 && { subcategories }),
        }
      }),
    ]
  })

  // 当前一级分类的二级分类选项
  const subcategoryOptions = computed(() => {
    if (categoryFilter.value === 'all') {
      return [{ value: 'all', label: '全部' }]
    }

    const currentCategory = categoryOptions.value.find(opt => opt.value === categoryFilter.value)
    if (currentCategory && currentCategory.subcategories && currentCategory.subcategories.length > 0) {
      return [
        { value: 'all', label: '全部' },
        ...currentCategory.subcategories.map(sub => ({
          value: sub.name,
          label: `${sub.name} (${sub.count})`,
        })),
      ]
    }

    return [{ value: 'all', label: '全部' }]
  })

  // 当分类选项变化时，检查当前选中的分类是否仍然有效
  watch(categoryOptions, (newOptions, oldOptions) => {
    // 如果是首次加载（oldOptions 为空）或者分类列表完全变化（切换系列），重置筛选
    if (!oldOptions || oldOptions.length === 0) {
      return
    }

    // 检查分类列表是否发生了根本性变化（切换系列时会完全不同）
    const oldCategories = new Set(oldOptions.map(opt => opt.value))
    const newCategories = new Set(newOptions.map(opt => opt.value))
    const hasSignificantChange = newOptions.length !== oldOptions.length
      || [...newCategories].some(cat => !oldCategories.has(cat))

    if (hasSignificantChange) {
      // 系列切换导致分类完全变化，重置所有分类筛选
      categoryFilter.value = 'all'
      subcategoryFilter.value = 'all'
    }
    else {
      // 仅检查当前选中的分类是否仍然有效
      const validValues = newOptions.map(opt => opt.value)
      if (!validValues.includes(categoryFilter.value)) {
        categoryFilter.value = 'all'
      }
    }
  })

  // 过滤后的壁纸列表
  const filteredWallpapers = computed(() => {
    let result = [...wallpapers.value]

    // 搜索过滤（匹配文件名、分类、二级分类、标签）
    if (debouncedQuery.value) {
      const query = debouncedQuery.value.toLowerCase()
      result = result.filter(w =>
        w.filename.toLowerCase().includes(query)
        || w.category?.toLowerCase().includes(query)
        || w.subcategory?.toLowerCase().includes(query)
        || (w.tags && w.tags.some(tag => tag.toLowerCase().includes(query))),
      )
    }

    // 格式过滤
    if (formatFilter.value !== 'all') {
      result = result.filter(w =>
        w.format.toLowerCase() === formatFilter.value.toLowerCase(),
      )
    }

    // 一级分类过滤
    if (categoryFilter.value !== 'all') {
      result = result.filter(w =>
        w.category === categoryFilter.value,
      )
    }

    // 二级分类过滤
    if (subcategoryFilter.value !== 'all') {
      result = result.filter(w =>
        w.subcategory === subcategoryFilter.value,
      )
    }

    // 排序
    switch (sortBy.value) {
      case 'newest':
        result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        break
      case 'oldest':
        result.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
        break
      case 'popular':
        // 按热度分数排序（需要热门数据）
        if (popularityData && popularityData.value) {
          const popularMap = new Map(
            popularityData.value.map(item => [item.filename, item.popularity_score || 0]),
          )
          result.sort((a, b) => {
            const scoreA = popularMap.get(a.filename) || 0
            const scoreB = popularMap.get(b.filename) || 0
            // 热度相同时按最新排序
            if (scoreB === scoreA) {
              return new Date(b.createdAt) - new Date(a.createdAt)
            }
            return scoreB - scoreA
          })
        }
        break
      case 'downloads':
        // 按下载量排序（需要热门数据）
        if (popularityData && popularityData.value) {
          const downloadMap = new Map(
            popularityData.value.map(item => [item.filename, item.download_count || 0]),
          )
          result.sort((a, b) => {
            const countA = downloadMap.get(a.filename) || 0
            const countB = downloadMap.get(b.filename) || 0
            // 下载量相同时按最新排序
            if (countB === countA) {
              return new Date(b.createdAt) - new Date(a.createdAt)
            }
            return countB - countA
          })
        }
        break
      case 'views':
        // 按浏览量排序（需要热门数据）
        if (popularityData && popularityData.value) {
          const viewMap = new Map(
            popularityData.value.map(item => [item.filename, item.view_count || 0]),
          )
          result.sort((a, b) => {
            const countA = viewMap.get(a.filename) || 0
            const countB = viewMap.get(b.filename) || 0
            // 浏览量相同时按最新排序
            if (countB === countA) {
              return new Date(b.createdAt) - new Date(a.createdAt)
            }
            return countB - countA
          })
        }
        break
      case 'weekly-hot':
        // 按本周热度排序（需要本周热门数据）
        if (weeklyPopularityData && weeklyPopularityData.value && weeklyPopularityData.value.length > 0) {
          const weeklyMap = new Map(
            weeklyPopularityData.value.map(item => [item.filename, item.popularity_score || 0]),
          )
          result.sort((a, b) => {
            const scoreA = weeklyMap.get(a.filename) || 0
            const scoreB = weeklyMap.get(b.filename) || 0
            // 热度相同时按最新排序
            if (scoreB === scoreA) {
              return new Date(b.createdAt) - new Date(a.createdAt)
            }
            return scoreB - scoreA
          })
        }
        else if (popularityData && popularityData.value) {
          // 降级：使用全量热门数据
          const popularMap = new Map(
            popularityData.value.map(item => [item.filename, item.popularity_score || 0]),
          )
          result.sort((a, b) => {
            const scoreA = popularMap.get(a.filename) || 0
            const scoreB = popularMap.get(b.filename) || 0
            if (scoreB === scoreA) {
              return new Date(b.createdAt) - new Date(a.createdAt)
            }
            return scoreB - scoreA
          })
        }
        break
      case 'monthly-hot':
        // 按本月热度排序（需要本月热门数据）
        if (monthlyPopularityData && monthlyPopularityData.value && monthlyPopularityData.value.length > 0) {
          const monthlyMap = new Map(
            monthlyPopularityData.value.map(item => [item.filename, item.popularity_score || 0]),
          )
          result.sort((a, b) => {
            const scoreA = monthlyMap.get(a.filename) || 0
            const scoreB = monthlyMap.get(b.filename) || 0
            // 热度相同时按最新排序
            if (scoreB === scoreA) {
              return new Date(b.createdAt) - new Date(a.createdAt)
            }
            return scoreB - scoreA
          })
        }
        else if (popularityData && popularityData.value) {
          // 降级：使用全量热门数据
          const popularMap = new Map(
            popularityData.value.map(item => [item.filename, item.popularity_score || 0]),
          )
          result.sort((a, b) => {
            const scoreA = popularMap.get(a.filename) || 0
            const scoreB = popularMap.get(b.filename) || 0
            if (scoreB === scoreA) {
              return new Date(b.createdAt) - new Date(a.createdAt)
            }
            return scoreB - scoreA
          })
        }
        break
      case 'largest':
        result.sort((a, b) => b.size - a.size)
        break
      case 'smallest':
        result.sort((a, b) => a.size - b.size)
        break
      case 'name-asc':
        result.sort((a, b) => a.filename.localeCompare(b.filename))
        break
      case 'name-desc':
        result.sort((a, b) => b.filename.localeCompare(a.filename))
        break
    }

    return result
  })

  // 搜索结果数量
  const resultCount = computed(() => filteredWallpapers.value.length)

  // 是否有激活的筛选条件
  const hasActiveFilters = computed(() => {
    return debouncedQuery.value || formatFilter.value !== 'all' || categoryFilter.value !== 'all' || subcategoryFilter.value !== 'all'
  })

  // 重置所有筛选条件
  const resetFilters = () => {
    searchQuery.value = ''
    debouncedQuery.value = ''
    formatFilter.value = 'all'
    categoryFilter.value = 'all'
    subcategoryFilter.value = 'all'
    // 根据系列重置为对应的默认排序
    sortBy.value = currentSeries?.value ? getDefaultSort(currentSeries.value) : 'newest'
  }

  return {
    searchQuery,
    sortBy,
    formatFilter,
    categoryFilter,
    subcategoryFilter,
    categoryOptions,
    subcategoryOptions,
    filteredWallpapers,
    resultCount,
    hasActiveFilters,
    resetFilters,
  }
}
