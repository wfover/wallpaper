<script setup>
import { computed, onMounted, watch } from 'vue'
import BackToTop from '@/components/common/BackToTop.vue'
import FilterPanel from '@/components/common/FilterPanel.vue'
import TodayPick from '@/components/home/TodayPick.vue'
import WallpaperGrid from '@/components/wallpaper/WallpaperGrid.vue'
import WallpaperModal from '@/components/wallpaper/WallpaperModal.vue'

import { useFilter } from '@/composables/useFilter'
import { useModal } from '@/composables/useModal'
import { useSearch } from '@/composables/useSearch'
import { useWallpapers } from '@/composables/useWallpapers'

// Wallpapers
const { wallpapers, loading, error, total, fetchWallpapers, getPrevWallpaper, getNextWallpaper } = useWallpapers()

// 共享搜索状态
const { searchQuery, setWallpapers } = useSearch()

// 同步壁纸数据到共享状态
watch(wallpapers, (newWallpapers) => {
  setWallpapers(newWallpapers)
}, { immediate: true })

// Filter
const { sortBy, formatFilter, categoryFilter, filteredWallpapers, resultCount } = useFilter(wallpapers, searchQuery)

// Modal
const { isOpen, currentData, open, close, updateData } = useModal()

// Current wallpaper for modal
const currentWallpaper = computed(() => currentData.value)

// Handlers
function handleSelectWallpaper(wallpaper) {
  open(wallpaper)
}

function handlePrevWallpaper() {
  if (!currentWallpaper.value)
    return
  const prev = getPrevWallpaper(currentWallpaper.value.id)
  if (prev) {
    updateData(prev)
  }
}

function handleNextWallpaper() {
  if (!currentWallpaper.value)
    return
  const next = getNextWallpaper(currentWallpaper.value.id)
  if (next) {
    updateData(next)
  }
}

// 重置所有筛选条件
function handleReset() {
  searchQuery.value = ''
}

// Initialize
onMounted(() => {
  fetchWallpapers()
})
</script>

<template>
  <div class="home-page">
    <div class="container">
      <!-- Today's Pick -->
      <TodayPick
        v-if="wallpapers.length > 0 && !loading"
        :wallpapers="wallpapers"
        @select="handleSelectWallpaper"
      />

      <!-- Filter Panel -->
      <FilterPanel
        v-model:sort-by="sortBy"
        v-model:format-filter="formatFilter"
        v-model:category-filter="categoryFilter"
        :result-count="resultCount"
        :total-count="total"
        @reset="handleReset"
      />

      <!-- Error State -->
      <div v-if="error" class="error-state">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 8v4M12 16h.01" />
        </svg>
        <h3>加载失败</h3>
        <p>{{ error }}</p>
        <button class="btn btn--primary" @click="fetchWallpapers">
          重新加载
        </button>
      </div>

      <!-- Wallpaper Grid -->
      <WallpaperGrid
        v-else
        :wallpapers="filteredWallpapers"
        :loading="loading"
        :search-query="searchQuery"
        @select="handleSelectWallpaper"
      />
    </div>

    <!-- Modal -->
    <WallpaperModal
      :wallpaper="currentWallpaper"
      :is-open="isOpen"
      @close="close"
      @prev="handlePrevWallpaper"
      @next="handleNextWallpaper"
    />

    <!-- Back to Top -->
    <BackToTop />
  </div>
</template>

<style lang="scss" scoped>
.home-page {
  padding: $spacing-md 0 $spacing-2xl;
}

.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: $spacing-2xl;
  text-align: center;

  svg {
    width: 64px;
    height: 64px;
    color: var(--color-error);
    margin-bottom: $spacing-lg;
  }

  h3 {
    font-size: $font-size-lg;
    font-weight: $font-weight-semibold;
    color: var(--color-text-primary);
    margin-bottom: $spacing-sm;
  }

  p {
    font-size: $font-size-sm;
    color: var(--color-text-muted);
    margin-bottom: $spacing-lg;
  }
}
</style>
