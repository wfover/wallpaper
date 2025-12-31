<script setup>
/**
 * 热门壁纸轮播组件
 * 左侧大图轮播 + 右侧热门排行榜
 * 后续可升级为 3D 效果
 */
import { Autoplay, Pagination } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/vue'
import { computed, onMounted, ref, watch } from 'vue'

// Swiper 样式
import 'swiper/css'
import 'swiper/css/pagination'

const props = defineProps({
  series: {
    type: String,
    default: 'desktop',
  },
  wallpapers: {
    type: Array,
    default: () => [],
  },
  popularityData: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['select'])

// Swiper 实例引用
const swiperRef = ref(null)

// 排行榜动画状态
const rankingAnimated = ref(false)

// Swiper 配置
const swiperModules = [Autoplay, Pagination]

// 轮播图列表（取前5张）
const carouselList = computed(() => {
  if (!props.popularityData?.length || !props.wallpapers?.length) {
    return []
  }

  return props.popularityData
    .slice(0, 5)
    .map((stat) => {
      const wallpaper = props.wallpapers.find(w => w.filename === stat.filename)
      if (wallpaper) {
        return {
          ...wallpaper,
          downloadCount: stat.download_count || 0,
          viewCount: stat.view_count || 0,
          popularityScore: stat.popularity_score || 0,
        }
      }
      return null
    })
    .filter(Boolean)
})

// 右侧排行榜列表（取前5名）
const rankingList = computed(() => {
  if (!props.popularityData?.length || !props.wallpapers?.length) {
    return []
  }

  return props.popularityData
    .slice(0, 5)
    .map((stat, index) => {
      const wallpaper = props.wallpapers.find(w => w.filename === stat.filename)
      if (wallpaper) {
        return {
          ...wallpaper,
          rank: index + 1,
          downloadCount: stat.download_count || 0,
          viewCount: stat.view_count || 0,
        }
      }
      return null
    })
    .filter(Boolean)
})

// 监听数据变化，触发动画
watch(rankingList, (newList) => {
  if (newList.length > 0) {
    rankingAnimated.value = false
    setTimeout(() => {
      rankingAnimated.value = true
    }, 100)
  }
}, { immediate: true })

onMounted(() => {
  if (rankingList.value.length > 0) {
    setTimeout(() => {
      rankingAnimated.value = true
    }, 300)
  }
})

// Swiper 初始化回调
function onSwiper(swiper) {
  swiperRef.value = swiper
}

// 鼠标进入暂停自动播放
function handleMouseEnter() {
  if (swiperRef.value?.autoplay) {
    swiperRef.value.autoplay.stop()
  }
}

// 鼠标离开恢复自动播放
function handleMouseLeave() {
  if (swiperRef.value?.autoplay) {
    swiperRef.value.autoplay.start()
  }
}

function handleClick(wallpaper) {
  emit('select', wallpaper)
}

// 格式化数字
function formatNumber(num) {
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}k`
  }
  return num.toString()
}
</script>

<template>
  <!-- Loading skeleton -->
  <div v-if="loading" class="popular-section popular-section--loading">
    <div class="popular-section__header">
      <div class="skeleton-badge" />
    </div>
    <div class="popular-section__content">
      <div class="skeleton-carousel">
        <div class="skeleton-image" />
      </div>
      <div class="skeleton-ranking">
        <div v-for="i in 5" :key="i" class="skeleton-item" />
      </div>
    </div>
  </div>

  <!-- 有数据时显示 -->
  <div
    v-else-if="carouselList.length > 0"
    class="popular-section"
  >
    <div class="popular-section__header">
      <div class="popular-section__badge">
        <span>🔥 热门壁纸</span>
      </div>
    </div>

    <div class="popular-section__content">
      <!-- 左侧轮播图 -->
      <div
        class="popular-carousel"
        @mouseenter="handleMouseEnter"
        @mouseleave="handleMouseLeave"
      >
        <Swiper
          :modules="swiperModules"
          :slides-per-view="1"
          :space-between="0"
          :loop="true"
          :speed="600"
          :autoplay="{
            delay: 4000,
            disableOnInteraction: false,
          }"
          :pagination="{
            clickable: true,
            el: '.swiper-pagination',
          }"
          class="popular-swiper"
          @swiper="onSwiper"
        >
          <SwiperSlide
            v-for="wallpaper in carouselList"
            :key="wallpaper.id"
          >
            <div
              class="popular-slide"
              @click="handleClick(wallpaper)"
            >
              <img
                :src="wallpaper.previewUrl || wallpaper.thumbnailUrl"
                :alt="wallpaper.filename"
                class="popular-slide__image"
                loading="lazy"
              >
            </div>
          </SwiperSlide>
        </Swiper>
        <div class="swiper-pagination" />
      </div>

      <!-- 右侧排行榜 -->
      <div class="popular-ranking">
        <div class="popular-ranking__header">
          <span>🏆 排行榜</span>
        </div>
        <div class="popular-ranking__list">
          <div
            v-for="(item, index) in rankingList"
            :key="item.id"
            class="ranking-item"
            :class="{ 'ranking-item--animated': rankingAnimated }"
            :style="{ '--delay': `${index * 0.15}s` }"
            @click="handleClick(item)"
          >
            <div class="ranking-item__thumb-wrapper">
              <img
                :src="item.thumbnailUrl"
                :alt="item.filename"
                class="ranking-item__thumb"
                loading="lazy"
              >
              <div class="ranking-item__rank" :class="`ranking-item__rank--${item.rank}`">
                {{ item.rank }}
              </div>
            </div>
            <div class="ranking-item__info">
              <div class="ranking-item__title">
                {{ item.title || item.filename }}
              </div>
              <div class="ranking-item__stats">
                <span class="ranking-item__stat">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                  {{ formatNumber(item.viewCount) }}
                </span>
                <span class="ranking-item__stat">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
                  </svg>
                  {{ formatNumber(item.downloadCount) }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.popular-section {
  margin-bottom: $spacing-xl;
}

.popular-section__header {
  display: flex;
  align-items: center;
  margin-bottom: $spacing-md;
}

.popular-section__badge {
  display: flex;
  align-items: center;
  gap: $spacing-xs;
  padding: $spacing-xs $spacing-md;
  background: linear-gradient(135deg, #f97316, #ef4444);
  color: white;
  border-radius: $radius-full;
  font-size: $font-size-sm;
  font-weight: $font-weight-semibold;
}

.popular-section__content {
  display: flex;
  gap: $spacing-lg;

  @include mobile-only {
    flex-direction: column;
  }
}

// 左侧轮播图
.popular-carousel {
  flex: 1;
  min-width: 0;
  position: relative;
  border-radius: $radius-lg;
  overflow: hidden;
}

.popular-swiper {
  width: 100%;
  border-radius: $radius-lg;
  overflow: hidden;
}

.popular-slide {
  position: relative;
  cursor: pointer;
  aspect-ratio: 16 / 9;
  overflow: hidden;
}

.popular-slide__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;

  .popular-slide:hover & {
    transform: scale(1.05);
  }
}

.swiper-pagination {
  position: absolute;
  bottom: $spacing-md;
  left: 0;
  right: 0;
  z-index: 10;
  display: flex;
  justify-content: center;
  gap: $spacing-xs;

  :deep(.swiper-pagination-bullet) {
    width: 24px;
    height: 4px;
    border-radius: 2px;
    background: rgba(255, 255, 255, 0.4);
    opacity: 1;
    transition: all 0.3s ease;
  }

  :deep(.swiper-pagination-bullet-active) {
    width: 40px;
    background: white;
  }
}

// 右侧排行榜
.popular-ranking {
  width: 280px;
  flex-shrink: 0;
  background: var(--color-bg-secondary);
  border-radius: $radius-lg;
  padding: $spacing-md;
  display: flex;
  flex-direction: column;

  @include mobile-only {
    width: 100%;
  }
}

.popular-ranking__header {
  font-size: $font-size-md;
  font-weight: $font-weight-semibold;
  color: var(--color-text-primary);
  margin-bottom: $spacing-sm;
}

.popular-ranking__list {
  display: flex;
  flex-direction: column;
  flex: 1;
  gap: $spacing-sm;
}

.ranking-item {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  padding: $spacing-xs;
  border-radius: $radius-md;
  cursor: pointer;
  transition: all 0.3s ease;
  background: var(--color-bg-primary);
  flex: 1;
  opacity: 0;
  transform: translateX(20px);

  &--animated {
    animation: slideInRight 0.5s ease forwards;
    animation-delay: var(--delay);
  }

  &:hover {
    background: var(--color-bg-hover);

    .ranking-item__thumb {
      transform: scale(1.05);
    }
  }
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.ranking-item__thumb-wrapper {
  position: relative;
  width: 90px;
  aspect-ratio: 16 / 9;
  border-radius: $radius-sm;
  overflow: hidden;
  flex-shrink: 0;
}

.ranking-item__thumb {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.ranking-item__rank {
  position: absolute;
  top: 0;
  left: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: $font-weight-bold;
  border-radius: 0 0 $radius-sm 0;
  color: white;
  background: rgba(0, 0, 0, 0.5);

  &--1 {
    background: linear-gradient(135deg, #ffd700, #ffb800);
  }

  &--2 {
    background: linear-gradient(135deg, #c0c0c0, #a8a8a8);
  }

  &--3 {
    background: linear-gradient(135deg, #cd7f32, #b87333);
  }
}

.ranking-item__info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.ranking-item__title {
  font-size: $font-size-sm;
  color: var(--color-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 4px;
  font-weight: $font-weight-medium;
}

.ranking-item__stats {
  display: flex;
  gap: $spacing-sm;
}

.ranking-item__stat {
  display: flex;
  align-items: center;
  gap: 3px;
  font-size: 11px;
  color: var(--color-text-muted);

  svg {
    width: 11px;
    height: 11px;
  }
}

// Skeleton styles
.popular-section--loading {
  .skeleton-carousel {
    flex: 1;
    border-radius: $radius-lg;
    overflow: hidden;
  }

  .skeleton-image {
    aspect-ratio: 16 / 9;
    background: linear-gradient(135deg, var(--color-bg-secondary) 0%, var(--color-bg-hover) 100%);
    animation: pulse 2s ease-in-out infinite;
  }

  .skeleton-ranking {
    width: 280px;
    background: var(--color-bg-secondary);
    border-radius: $radius-lg;
    padding: $spacing-md;
  }

  .skeleton-item {
    height: 40px;
    background: var(--color-bg-tertiary);
    border-radius: $radius-md;
    margin-bottom: $spacing-sm;
    animation: pulse 2s ease-in-out infinite;

    &:last-child {
      margin-bottom: 0;
    }
  }
}

.popular-section__content {
  .skeleton-carousel,
  .skeleton-ranking {
    @include mobile-only {
      width: 100%;
    }
  }
}

.skeleton-badge {
  width: 120px;
  height: 28px;
  background: var(--color-bg-secondary);
  border-radius: $radius-full;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}
</style>
