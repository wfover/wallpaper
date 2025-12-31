<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import DiyAvatarBanner from '@/components/avatar/DiyAvatarBanner.vue'
import AnnouncementBanner from '@/components/common/AnnouncementBanner.vue'
import BackToTop from '@/components/common/BackToTop.vue'
import FilterPanel from '@/components/common/FilterPanel.vue'
import PopularWallpapers from '@/components/home/PopularWallpapers.vue'
// import TodayPick from '@/components/home/TodayPick.vue' // 暂时隐藏，后续可能改为3D轮播
import PortraitWallpaperModal from '@/components/wallpaper/PortraitWallpaperModal.vue'
import WallpaperGrid from '@/components/wallpaper/WallpaperGrid.vue'
import WallpaperModal from '@/components/wallpaper/WallpaperModal.vue'

import { useFilter } from '@/composables/useFilter'
import { useModal } from '@/composables/useModal'
import { useSearch } from '@/composables/useSearch'
import { useWallpapers } from '@/composables/useWallpapers'
import { useWallpaperType } from '@/composables/useWallpaperType'
import { getPopularByTimeRange, getPopularWallpapers, isSupabaseConfigured } from '@/utils/supabase'

const route = useRoute()

// 系列管理
const { currentSeries, initFromRoute } = useWallpaperType()

// 是否使用竖屏弹窗（手机壁纸、头像使用竖屏弹窗）
const usePortraitModal = computed(() => ['mobile', 'avatar'].includes(currentSeries.value))

// Wallpapers
const { wallpapers, loading: wallpapersLoading, error, total, fetchWallpapers, getPrevWallpaper, getNextWallpaper } = useWallpapers()

// 热门数据（用于排序）
const popularityData = ref([])
const weeklyPopularityData = ref([])
const monthlyPopularityData = ref([])
const popularityLoading = ref(false)

// 整体加载状态：壁纸和热门数据都加载完成才算完成
const loading = computed(() => wallpapersLoading.value || popularityLoading.value)

// 获取热门数据
async function fetchPopularityData(series) {
  if (!isSupabaseConfigured()) {
    popularityData.value = []
    weeklyPopularityData.value = []
    monthlyPopularityData.value = []
    return
  }
  popularityLoading.value = true
  try {
    // 并行获取全量、本周、本月热门数据
    const [allData, weeklyData, monthlyData] = await Promise.all([
      getPopularWallpapers(series, 100),
      getPopularByTimeRange(series, 7, 100),
      getPopularByTimeRange(series, 30, 100),
    ])
    popularityData.value = allData
    weeklyPopularityData.value = weeklyData
    monthlyPopularityData.value = monthlyData
  }
  catch (err) {
    console.error('获取热门数据失败:', err)
    popularityData.value = []
    weeklyPopularityData.value = []
    monthlyPopularityData.value = []
  }
  finally {
    popularityLoading.value = false
  }
}

// 共享搜索状态
const { searchQuery, setWallpapers } = useSearch()

// 同步壁纸数据到共享状态
watch(wallpapers, (newWallpapers) => {
  setWallpapers(newWallpapers)
}, { immediate: true })

// 监听路由变化，切换系列
watch(() => route.meta?.series, (newSeries) => {
  if (newSeries) {
    initFromRoute(newSeries)
  }
}, { immediate: false })

// 监听系列变化，重新加载数据
watch(currentSeries, async (newSeries) => {
  await Promise.all([
    fetchWallpapers(newSeries),
    fetchPopularityData(newSeries),
  ])
}, { immediate: false })

// Filter（传入热门数据和当前系列）
const { sortBy, formatFilter, categoryFilter, subcategoryFilter, categoryOptions, subcategoryOptions, filteredWallpapers, resultCount, hasActiveFilters, resetFilters } = useFilter(wallpapers, searchQuery, popularityData, currentSeries, weeklyPopularityData, monthlyPopularityData)

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
  resetFilters()
}

// 重新加载当前系列
function handleReload() {
  fetchWallpapers(currentSeries.value, true)
}

// Initialize
onMounted(async () => {
  // 如果路由带有系列参数，初始化系列
  if (route.meta?.series) {
    initFromRoute(route.meta.series)
  }
  // 并行加载壁纸数据和热门数据
  await Promise.all([
    fetchWallpapers(currentSeries.value),
    fetchPopularityData(currentSeries.value),
  ])
})
</script>

<template>
  <div class="home-page">
    <div class="container">
      <!-- Announcement Banner -->
      <AnnouncementBanner />

      <!-- Today's Pick - 暂时隐藏，后续可能改为3D轮播 -->
      <!-- <TodayPick
        v-if="wallpapers.length > 0 && !loading && currentSeries === 'desktop'"
        :wallpapers="wallpapers"
        @select="handleSelectWallpaper"
      /> -->

      <!-- 热门壁纸 - 仅电脑壁纸系列显示 -->
      <PopularWallpapers
        v-if="currentSeries === 'desktop'"
        :series="currentSeries"
        :wallpapers="wallpapers"
        :popularity-data="popularityData"
        :loading="loading"
        @select="handleSelectWallpaper"
      />

      <!-- DIY 头像工具入口 - 仅头像系列显示 -->
      <DiyAvatarBanner v-if="currentSeries === 'avatar'" />

      <!-- Filter Panel -->
      <FilterPanel
        v-model:sort-by="sortBy"
        v-model:format-filter="formatFilter"
        v-model:category-filter="categoryFilter"
        v-model:subcategory-filter="subcategoryFilter"
        :category-options="categoryOptions"
        :subcategory-options="subcategoryOptions"
        :result-count="resultCount"
        :total-count="total"
        :loading="loading"
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
        <button class="btn btn--primary" @click="handleReload">
          重新加载
        </button>
      </div>

      <!-- Wallpaper Grid -->
      <WallpaperGrid
        v-else
        :wallpapers="filteredWallpapers"
        :loading="loading"
        :search-query="searchQuery"
        :total-count="total"
        :has-filters="hasActiveFilters"
        :popularity-data="popularityData"
        @select="handleSelectWallpaper"
        @reset-filters="resetFilters"
      />
    </div>

    <!-- Modal - 根据系列类型选择弹窗 -->
    <!-- 横屏弹窗：电脑壁纸 -->
    <WallpaperModal
      v-if="!usePortraitModal"
      :wallpaper="currentWallpaper"
      :is-open="isOpen"
      @close="close"
      @prev="handlePrevWallpaper"
      @next="handleNextWallpaper"
    />

    <!-- 竖屏弹窗：手机壁纸、头像 -->
    <PortraitWallpaperModal
      v-else
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

  // 移动端：为 fixed 的筛选栏预留空间
  @include mobile-only {
    padding-top: calc($spacing-md + 52px); // 52px 为筛选栏高度
  }
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
