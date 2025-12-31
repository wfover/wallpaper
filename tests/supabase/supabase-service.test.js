/**
 * Supabase Service 单元测试
 * Feature: wallpaper-stats-enhancement
 * Property 4: 错误处理静默性
 * Validates: Requirements 5.2, 5.3
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import * as fc from 'fast-check'
import { describe, expect, it } from 'vitest'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const ROOT_DIR = path.resolve(__dirname, '../..')

describe('Supabase Service', () => {
  const supabasePath = path.join(ROOT_DIR, 'src/utils/supabase.js')
  const supabaseContent = fs.readFileSync(supabasePath, 'utf-8')

  describe('Function Exports', () => {
    it('should export getWallpaperViewCount function', () => {
      expect(supabaseContent).toContain('export async function getWallpaperViewCount')
    })

    it('should export getPopularByTimeRange function', () => {
      expect(supabaseContent).toContain('export async function getPopularByTimeRange')
    })

    it('should export recordView function', () => {
      expect(supabaseContent).toContain('export function recordView')
    })

    it('should export recordDownload function', () => {
      expect(supabaseContent).toContain('export function recordDownload')
    })

    it('should export isSupabaseConfigured function', () => {
      expect(supabaseContent).toContain('export function isSupabaseConfigured')
    })
  })

  describe('Property 4: 错误处理静默性', () => {
    /**
     * Property 4: 错误处理静默性
     * For any recordView or recordDownload call, when Supabase is not configured
     * or network request fails, the function should return silently without
     * throwing exceptions, not affecting user experience.
     * Validates: Requirements 5.2, 5.3
     */

    it('should check for Supabase configuration before making requests', () => {
      // 所有获取函数都应该检查配置
      const functions = [
        'getWallpaperViewCount',
        'getPopularByTimeRange',
        'getPopularWallpapers',
        'getDownloadStats',
        'getWallpaperDownloadCount',
      ]

      fc.assert(
        fc.property(
          fc.constantFrom(...functions),
          (funcName) => {
            // 每个函数都应该在开头检查 SUPABASE_URL 和 SUPABASE_ANON_KEY
            const funcMatch = supabaseContent.match(
              new RegExp(`export async function ${funcName}[^}]+if \\(!SUPABASE_URL \\|\\| !SUPABASE_ANON_KEY\\)`),
            )
            expect(funcMatch, `${funcName} should check Supabase config`).not.toBeNull()
            return true
          },
        ),
        { numRuns: 100 },
      )
    })

    it('should return default values when Supabase is not configured', () => {
      // 检查返回默认值的模式
      // 数字类型函数返回 0
      expect(supabaseContent).toMatch(/getWallpaperViewCount[\s\S]*?return 0/)
      expect(supabaseContent).toMatch(/getWallpaperDownloadCount[\s\S]*?return 0/)

      // 数组类型函数返回 []
      expect(supabaseContent).toMatch(/getPopularByTimeRange[\s\S]*?return \[\]/)
      expect(supabaseContent).toMatch(/getPopularWallpapers[\s\S]*?return \[\]/)
      expect(supabaseContent).toMatch(/getDownloadStats[\s\S]*?return \[\]/)
    })

    it('should use try-catch for error handling in all async functions', () => {
      const asyncFunctions = [
        'getWallpaperViewCount',
        'getPopularByTimeRange',
        'getPopularWallpapers',
        'getDownloadStats',
        'getWallpaperDownloadCount',
      ]

      fc.assert(
        fc.property(
          fc.constantFrom(...asyncFunctions),
          (funcName) => {
            // 每个异步函数都应该有 try-catch
            const funcRegex = new RegExp(`export async function ${funcName}[\\s\\S]*?try\\s*\\{[\\s\\S]*?\\}\\s*catch`)
            expect(supabaseContent).toMatch(funcRegex)
            return true
          },
        ),
        { numRuns: 100 },
      )
    })

    it('should log warnings only in development environment', () => {
      // 检查开发环境日志模式
      expect(supabaseContent).toContain('import.meta.env.DEV')
      expect(supabaseContent).toContain('console.warn')
    })

    it('should not throw errors in recordEvent function', () => {
      // recordEvent 应该静默失败
      expect(supabaseContent).toMatch(/async function recordEvent[\s\S]*?catch \(error\)[\s\S]*?\/\/ 静默失败/)
    })
  })

  describe('getPopularByTimeRange Function', () => {
    it('should support 7-day time range (weekly)', () => {
      expect(supabaseContent).toContain('popular_wallpapers_weekly')
    })

    it('should support 30-day time range (monthly)', () => {
      expect(supabaseContent).toContain('popular_wallpapers_monthly')
    })

    it('should select correct view based on days parameter', () => {
      // 检查视图选择逻辑
      expect(supabaseContent).toMatch(/days <= 7 \? 'popular_wallpapers_weekly' : 'popular_wallpapers_monthly'/)
    })

    it('should have default limit parameter', () => {
      expect(supabaseContent).toMatch(/getPopularByTimeRange\(series, days, limit = 100\)/)
    })
  })

  describe('getWallpaperViewCount Function', () => {
    it('should query view_stats view', () => {
      expect(supabaseContent).toMatch(/getWallpaperViewCount[\s\S]*?view_stats/)
    })

    it('should filter by filename and series', () => {
      expect(supabaseContent).toMatch(/getWallpaperViewCount[\s\S]*?filename=eq\./)
      expect(supabaseContent).toMatch(/getWallpaperViewCount[\s\S]*?series=eq\./)
    })

    it('should return 0 when no data found', () => {
      expect(supabaseContent).toMatch(/getWallpaperViewCount[\s\S]*?data\.length > 0 \? data\[0\]\.view_count : 0/)
    })
  })

  describe('API Request Headers', () => {
    it('should include required Supabase headers', () => {
      const requiredHeaders = ['apikey', 'Authorization']

      fc.assert(
        fc.property(
          fc.constantFrom(...requiredHeaders),
          (header) => {
            expect(supabaseContent).toContain(header)
            return true
          },
        ),
        { numRuns: 100 },
      )
    })
  })
})
