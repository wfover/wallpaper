import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

// 自定义 flexible 适配方案（PC 端保持设计稿尺寸，移动端等比缩放）
import '@/utils/flexible'

const app = createApp(App)

app.use(router)
app.mount('#app')
