// ========================================
// 全局搜索状态 Composable
// 用于在导航栏和首页之间共享搜索状态
// ========================================

import { ref } from 'vue'

// 全局共享状态（模块级别单例）
const searchQuery = ref('')
const wallpapers = ref([])

export function useSearch() {
  // 设置壁纸数据（供首页初始化）
  const setWallpapers = (data) => {
    wallpapers.value = data
  }

  // 清除搜索
  const clearSearch = () => {
    searchQuery.value = ''
  }

  return {
    searchQuery,
    wallpapers,
    setWallpapers,
    clearSearch,
  }
}
