// ========================================
// 反调试保护（生产环境）
// ========================================

/* eslint-disable no-alert, no-console, no-debugger */

/**
 * 初始化反调试保护
 * 禁止打开控制台，显示友好提示
 */
export function initAntiDebug() {
  // 仅在生产环境启用
  if (import.meta.env.DEV) {
    return
  }

  const warningMessage = '兄弟bro，想打开控制台干啥呢？ 😏'
  let isBlocked = false

  // 检测到开发者工具时的处理：弹出警告（不再刷新页面）
  const onDevToolsDetected = () => {
    if (!isBlocked) {
      isBlocked = true
      alert(warningMessage)
      // 3秒后重置，允许再次检测
      setTimeout(() => {
        isBlocked = false
      }, 3000)
    }
  }

  // ========================================
  // 1. 禁用快捷键（capture 阶段拦截）
  // ========================================
  const blockShortcuts = (e) => {
    // F12
    if (e.key === 'F12' || e.keyCode === 123) {
      e.preventDefault()
      e.stopPropagation()
      alert(warningMessage)
      return false
    }
    // Ctrl+Shift+I / Cmd+Option+I (开发者工具)
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.keyCode === 73)) {
      e.preventDefault()
      e.stopPropagation()
      alert(warningMessage)
      return false
    }
    // Ctrl+Shift+J / Cmd+Option+J (控制台)
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'J' || e.key === 'j' || e.keyCode === 74)) {
      e.preventDefault()
      e.stopPropagation()
      alert(warningMessage)
      return false
    }
    // Ctrl+Shift+C / Cmd+Option+C (检查元素)
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'C' || e.key === 'c' || e.keyCode === 67)) {
      e.preventDefault()
      e.stopPropagation()
      alert(warningMessage)
      return false
    }
    // Ctrl+U / Cmd+U (查看源代码)
    if ((e.ctrlKey || e.metaKey) && (e.key === 'u' || e.key === 'U' || e.keyCode === 85)) {
      e.preventDefault()
      e.stopPropagation()
      alert(warningMessage)
      return false
    }
  }

  document.addEventListener('keydown', blockShortcuts, true)
  window.addEventListener('keydown', blockShortcuts, true)

  // 禁用右键菜单
  document.addEventListener('contextmenu', (e) => {
    e.preventDefault()
    e.stopPropagation()
    alert(warningMessage)
    return false
  }, true)

  // ========================================
  // 2. 窗口尺寸检测（提高阈值，减少误判）
  // ========================================
  const threshold = 200
  const checkWindowSize = () => {
    const widthThreshold = window.outerWidth - window.innerWidth > threshold
    const heightThreshold = window.outerHeight - window.innerHeight > threshold
    if (widthThreshold || heightThreshold) {
      onDevToolsDetected()
    }
  }

  // ========================================
  // 3. debugger 时间差检测（提高阈值，减少误判）
  // ========================================
  const checkDebuggerTiming = () => {
    const start = performance.now()
    // 使用 Function 构造器创建 debugger，更难被静态分析禁用
    ;(function () { }).constructor('debugger')()
    const duration = performance.now() - start
    if (duration > 100) {
      onDevToolsDetected()
    }
  }

  // ========================================
  // 4. console 对象 getter 检测
  // ========================================
  const checkConsoleGetter = () => {
    const el = new Image()
    let triggered = false
    Object.defineProperty(el, 'id', {
      get() {
        triggered = true
        onDevToolsDetected()
        return ''
      },
    })
    console.log('%c', el)
    console.clear()
    return triggered
  }

  // ========================================
  // 5. 持续 debugger 注入（反断点核心）
  // ========================================
  const injectDebugger = () => {
    // 使用多种方式注入 debugger，让断点无法正常使用
    const methods = [
      () => { debugger },
      () => { (function () { }).constructor('debugger')() },
      // eslint-disable-next-line no-eval
      () => { (0, eval)('debugger') },
      // eslint-disable-next-line no-new-func
      () => { new Function('debugger')() },
    ]
    // 随机选择一种方式
    methods[Math.floor(Math.random() * methods.length)]()
  }

  // ========================================
  // 6. 检测 toString 被重写（高级检测）
  // ========================================
  const checkToString = () => {
    const fn = () => {}
    fn.toString = () => {
      onDevToolsDetected()
      return ''
    }
    console.log('%c', fn)
  }

  // ========================================
  // 7. 检测 console 方法被 hook
  // ========================================
  const originalLog = console.log
  const checkConsoleHook = () => {
    if (console.log !== originalLog || console.log.toString().includes('native code') === false) {
      onDevToolsDetected()
    }
  }

  // ========================================
  // 8. Performance API 检测（提高阈值，减少误判）
  // ========================================
  const checkPerformance = () => {
    const t1 = performance.now()
    for (let i = 0; i < 100; i++) {
      console.log(i)
      console.clear()
    }
    const t2 = performance.now()
    // 如果 DevTools 打开，console 操作会变慢
    if (t2 - t1 > 100) {
      onDevToolsDetected()
    }
  }

  // ========================================
  // 启动检测循环
  // ========================================

  // 快速检测循环（50ms 一次 debugger 注入，让断点无法使用）
  setInterval(injectDebugger, 50)

  // 常规检测
  setInterval(checkWindowSize, 300)
  setInterval(checkDebuggerTiming, 200)
  setInterval(checkConsoleGetter, 500)
  setInterval(checkToString, 1000)
  setInterval(checkConsoleHook, 2000)
  setInterval(checkPerformance, 3000)

  // 立即执行一次检测
  setTimeout(() => {
    checkWindowSize()
    checkDebuggerTiming()
    checkConsoleGetter()
  }, 100)

  // 控制台输出警告
  console.log(
    '%c⚠️ 警告',
    'color: red; font-size: 30px; font-weight: bold;',
  )
  console.log(
    `%c${warningMessage}`,
    'color: #333; font-size: 16px;',
  )
}
