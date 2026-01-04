<script setup>
import { onMounted, onUnmounted, ref } from 'vue'

defineProps({
  isDark: {
    type: Boolean,
    default: false,
  },
})

const currentTime = ref('00:14')

function updateTime() {
  const now = new Date()
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  currentTime.value = `${hours}:${minutes}`
}

let timeInterval = null

onMounted(() => {
  updateTime()
  timeInterval = setInterval(updateTime, 1000)
})

onUnmounted(() => {
  if (timeInterval) {
    clearInterval(timeInterval)
  }
})
</script>

<template>
  <div class="phone-frame" :class="{ 'phone-frame--dark': isDark }">
    <!-- 手机外框 -->
    <div class="phone-frame__device">
      <!-- 顶部刘海/听筒 -->
      <div class="phone-frame__notch">
        <div class="phone-frame__speaker" />
      </div>

      <!-- 屏幕区域 -->
      <div class="phone-frame__screen">
        <!-- Dynamic Island (iPhone 16/14 样式) - 单独显示，不包含时间 -->
        <div class="phone-frame__dynamic-island" />

        <!-- 壁纸内容区域 -->
        <div class="phone-frame__content">
          <slot />
          <!-- 时间显示在壁纸中间，大字体加粗 -->
          <div class="phone-frame__wallpaper-time">
            {{ currentTime }}
          </div>
        </div>
      </div>

      <!-- 底部指示器（Home Indicator） -->
      <div class="phone-frame__home-indicator" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.phone-frame {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: $spacing-xl;
  background: #ffffff; // 纯白色背景
  border-radius: $radius-2xl;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);

  &--dark {
    background: #ffffff;
  }
}

.phone-frame__device {
  position: relative;
  width: 375px;
  height: 812px; // iPhone 标准高度（375 × 812 = iPhone X/11/12/13/14 标准尺寸）
  background: #000;
  border-radius: 50px; // 苹果大R角设计
  padding: 8px;
  box-shadow:
    0 0 0 2px rgba(255, 255, 255, 0.1),
    inset 0 0 0 2px rgba(0, 0, 0, 0.2),
    0 10px 40px rgba(0, 0, 0, 0.5);
}

// Dynamic Island (iPhone 16/14 样式) - 单独显示，不包含内容
.phone-frame__dynamic-island {
  position: absolute;
  top: 0; // 和状态栏平齐
  left: 50%;
  transform: translateX(-50%);
  width: 140px; // 增加宽度：110px -> 140px
  height: 28px; // 降低高度：35px -> 28px
  background: #000;
  border-radius: 30px;
  z-index: 10;
  margin-top: 8px; // 稍微下移一点，和状态栏对齐
}

// 壁纸靠上显示的时间（大字体加粗）
.phone-frame__wallpaper-time {
  position: absolute;
  top: 12%; // 靠上显示
  left: 50%;
  transform: translateX(-50%); // 只水平居中
  font-size: 130px; // 增大字体：100px -> 130px
  font-weight: 600; // 加粗
  color: #fff;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', sans-serif;
  letter-spacing: 8px; // 增加数字间隔：-2px -> 8px
  white-space: nowrap;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3); // 添加阴影增强可读性
  z-index: 5;
  pointer-events: none; // 不阻挡点击
}

.phone-frame__screen {
  width: 100%;
  height: 100%;
  background: #000;
  border-radius: 42px; // 与外壳R角匹配
  overflow: hidden;
  position: relative;
}

.phone-frame__content {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.phone-frame__home-indicator {
  position: absolute;
  bottom: 18px; // 距离底部更高
  left: 50%;
  transform: translateX(-50%);
  width: 134px;
  height: 6px; // 更粗一点
  background: #ffffff; // 白色
  border-radius: 3px;
  z-index: 10;
}

// 响应式调整
@media (max-width: 768px) {
  .phone-frame {
    padding: $spacing-md;
    background: rgba(255, 255, 255, 0.98); // 移动端也使用亮色背景
  }

  .phone-frame__device {
    width: 320px;
    height: 693px; // 移动端按比例缩放（320 × 693 ≈ 375 × 812 的比例）
    border-radius: 42px; // 移动端也使用大R角
  }

  .phone-frame__screen {
    border-radius: 36px; // 与外壳R角匹配
  }

  .phone-frame__dynamic-island {
    top: 0;
    width: 120px; // 增加宽度：110px -> 120px
    height: 26px; // 降低高度：32px -> 26px
    border-radius: 16px;
    margin-top: 6px;
  }

  .phone-frame__wallpaper-time {
    font-size: 80px; // 增大字体：60px -> 80px
    letter-spacing: 6px; // 增加数字间隔：-1.5px -> 6px
  }

  .phone-frame__home-indicator {
    bottom: 16px; // 移动端也调整
  }
}
</style>
