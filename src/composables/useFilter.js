// ========================================
// 搜索和筛选 Composable
// ========================================

import { computed, ref, watch } from 'vue'
import { STORAGE_KEYS } from '@/utils/constants'
import { debounce } from '@/utils/format'

export function useFilter(wallpapers, externalSearchQuery = null) {
  // 搜索关键词（支持外部传入或内部管理）
  const searchQuery = externalSearchQuery || ref('')
  const debouncedQuery = ref('')

  // 排序方式
  const sortBy = ref(localStorage.getItem(STORAGE_KEYS.SORT) || 'newest')

  // 格式筛选
  const formatFilter = ref('all')

  // 分类筛选
  const categoryFilter = ref(localStorage.getItem(STORAGE_KEYS.CATEGORY) || 'all')

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

  // 保存分类筛选偏好
  watch(categoryFilter, (value) => {
    localStorage.setItem(STORAGE_KEYS.CATEGORY, value)
  })

  // 过滤后的壁纸列表
  const filteredWallpapers = computed(() => {
    let result = [...wallpapers.value]

    // 搜索过滤
    if (debouncedQuery.value) {
      const query = debouncedQuery.value.toLowerCase()
      result = result.filter(w =>
        w.filename.toLowerCase().includes(query)
        || (w.tags && w.tags.some(tag => tag.toLowerCase().includes(query))),
      )
    }

    // 格式过滤
    if (formatFilter.value !== 'all') {
      result = result.filter(w =>
        w.format.toLowerCase() === formatFilter.value.toLowerCase(),
      )
    }

    // 分类过滤
    if (categoryFilter.value !== 'all') {
      result = result.filter(w =>
        w.category === categoryFilter.value,
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
    return debouncedQuery.value || formatFilter.value !== 'all' || categoryFilter.value !== 'all'
  })

  // 重置所有筛选条件
  const resetFilters = () => {
    searchQuery.value = ''
    debouncedQuery.value = ''
    formatFilter.value = 'all'
    categoryFilter.value = 'all'
    sortBy.value = 'newest'
  }

  return {
    searchQuery,
    sortBy,
    formatFilter,
    categoryFilter,
    filteredWallpapers,
    resultCount,
    hasActiveFilters,
    resetFilters,
  }
}
