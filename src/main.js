import { createApp } from 'vue'
// 反调试保护（生产环境）
import { initAntiDebug } from '@/utils/anti-debug'
import App from './App.vue'

import router from './router'

// 自定义 flexible 适配方案（PC 端保持设计稿尺寸，移动端等比缩放）
import '@/utils/flexible'

// 动态加载 Umami Analytics
function loadUmamiAnalytics() {
  const websiteId = import.meta.env.VITE_UMAMI_WEBSITE_ID
  if (websiteId) {
    const script = document.createElement('script')
    script.defer = true
    script.src = 'https://cloud.umami.is/script.js'
    script.setAttribute('data-website-id', websiteId)
    document.head.appendChild(script)
  }
}

const app = createApp(App)

app.use(router)
app.mount('#app')

// 初始化反调试
initAntiDebug()

// 加载 Umami Analytics
loadUmamiAnalytics()
