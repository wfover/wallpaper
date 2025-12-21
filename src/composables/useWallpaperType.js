import { ref, watch } from 'vue'
import { STORAGE_KEYS } from '@/utils/constants'

// 全局状态
const wallpaperType = ref('desktop')

// 从 localStorage 读取初始值
const savedType = localStorage.getItem(STORAGE_KEYS.WALLPAPER_TYPE)
if (savedType && ['desktop', 'mobile'].includes(savedType)) {
  wallpaperType.value = savedType
}

// 监听变化并保存到 localStorage
watch(wallpaperType, (newType) => {
  localStorage.setItem(STORAGE_KEYS.WALLPAPER_TYPE, newType)
})

export function useWallpaperType() {
  function setWallpaperType(type) {
    if (['desktop', 'mobile'].includes(type)) {
      wallpaperType.value = type
    }
  }

  return {
    wallpaperType,
    setWallpaperType,
  }
}
