<script setup>
/**
 * 带回退功能的图片组件
 *
 * 当主图片（R2 CDN）加载失败时，自动切换到 jsDelivr 回退 URL
 */
import { computed, ref } from 'vue'
import { getFallbackUrl, isR2Enabled } from '@/utils/cdn'

const props = defineProps({
  // 主图片 URL（R2 CDN）
  src: {
    type: String,
    required: true,
  },
  // 自定义回退 URL（可选，默认自动生成 jsDelivr URL）
  fallbackSrc: {
    type: String,
    default: '',
  },
  // 图片 alt 文本
  alt: {
    type: String,
    default: '',
  },
  // 是否启用回退（默认启用）
  enableFallback: {
    type: Boolean,
    default: true,
  },
})

const emit = defineEmits(['load', 'error', 'fallback'])

// 是否已切换到回退 URL
const useFallback = ref(false)

// 图片加载状态
const imageLoaded = ref(false)
const imageError = ref(false)

// 当前显示的图片 URL
const currentSrc = computed(() => {
  if (useFallback.value) {
    // 使用自定义回退 URL 或自动生成
    return props.fallbackSrc || getFallbackUrl(props.src)
  }
  return props.src
})

// 是否可以回退（R2 启用且有回退 URL）
const canFallback = computed(() => {
  if (!props.enableFallback)
    return false
  if (!isR2Enabled())
    return false
  return !useFallback.value
})

function handleLoad() {
  imageLoaded.value = true
  imageError.value = false
  emit('load')
}

function handleError() {
  if (canFallback.value) {
    // 切换到回退 URL
    const fallbackUrl = props.fallbackSrc || getFallbackUrl(props.src)
    console.warn(`[CDN Fallback] ${props.src} -> ${fallbackUrl}`)
    useFallback.value = true
    imageLoaded.value = false
    emit('fallback', { original: props.src, fallback: fallbackUrl })
  }
  else {
    // 回退也失败了，或者不支持回退
    imageError.value = true
    imageLoaded.value = true
    emit('error')
  }
}

// 暴露状态给父组件
defineExpose({
  useFallback,
  imageLoaded,
  imageError,
})
</script>

<template>
  <img
    :src="currentSrc"
    :alt="alt"
    :class="{ 'is-loaded': imageLoaded, 'is-error': imageError }"
    v-bind="$attrs"
    @load="handleLoad"
    @error="handleError"
  >
</template>

<style scoped>
img {
  opacity: 0;
  transition: opacity 0.3s ease;
}

img.is-loaded {
  opacity: 1;
}

img.is-error {
  display: none;
}
</style>
