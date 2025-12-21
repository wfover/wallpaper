import { computed, onMounted, onUnmounted, ref } from 'vue'

/**
 * 设备检测 Composable
 * 用于响应式检测当前设备类型
 */
export function useDevice() {
  const windowWidth = ref(typeof window !== 'undefined' ? window.innerWidth : 1024)

  // 与 SCSS 断点保持一致
  const isMobile = computed(() => windowWidth.value < 768)
  const isTablet = computed(() => windowWidth.value >= 768 && windowWidth.value < 992)
  const isDesktop = computed(() => windowWidth.value >= 992)

  // 更细粒度的判断
  const isSmallMobile = computed(() => windowWidth.value < 576)
  const isLargeDesktop = computed(() => windowWidth.value >= 1200)

  function updateWidth() {
    windowWidth.value = window.innerWidth
  }

  onMounted(() => {
    window.addEventListener('resize', updateWidth)
  })

  onUnmounted(() => {
    window.removeEventListener('resize', updateWidth)
  })

  return {
    windowWidth,
    isMobile,
    isTablet,
    isDesktop,
    isSmallMobile,
    isLargeDesktop,
  }
}
