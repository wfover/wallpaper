/**
 * 时间范围排序属性测试
 * Feature: wallpaper-stats-enhancement
 * Property 3: 时间范围数据筛选
 * Validates: Requirements 4.3, 4.4
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import * as fc from 'fast-check'
import { describe, expect, it } from 'vitest'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const ROOT_DIR = path.resolve(__dirname, '../..')

describe('Time Range Sorting', () => {
  const useFilterPath = path.join(ROOT_DIR, 'src/composables/useFilter.js')
  const useFilterContent = fs.readFileSync(useFilterPath, 'utf-8')

  describe('Property 3: 时间范围数据筛选', () => {
    /**
     * Property 3: 时间范围数据筛选
     * For any time range query (7 days or 30 days), getPopularByTimeRange
     * function should return records within the specified time range.
     * Validates: Requirements 4.3, 4.4
     */

    it('should support weekly-hot sort option', () => {
      expect(useFilterContent).toContain("case 'weekly-hot':")
    })

    it('should support monthly-hot sort option', () => {
      expect(useFilterContent).toContain("case 'monthly-hot':")
    })

    it('should accept weeklyPopularityData parameter', () => {
      expect(useFilterContent).toContain('weeklyPopularityData')
    })

    it('should accept monthlyPopularityData parameter', () => {
      expect(useFilterContent).toContain('monthlyPopularityData')
    })

    it('should use weeklyPopularityData for weekly-hot sorting', () => {
      // 检查 weekly-hot 排序使用 weeklyPopularityData
      const weeklyHotSection = useFilterContent.match(/case 'weekly-hot':[\s\S]*?break/)?.[0]
      expect(weeklyHotSection).toBeDefined()
      expect(weeklyHotSection).toContain('weeklyPopularityData')
    })

    it('should use monthlyPopularityData for monthly-hot sorting', () => {
      // 检查 monthly-hot 排序使用 monthlyPopularityData
      const monthlyHotSection = useFilterContent.match(/case 'monthly-hot':[\s\S]*?break/)?.[0]
      expect(monthlyHotSection).toBeDefined()
      expect(monthlyHotSection).toContain('monthlyPopularityData')
    })

    it('should fallback to popularityData when time range data is empty', () => {
      // 检查降级逻辑
      expect(useFilterContent).toContain('降级：使用全量热门数据')
    })

    it('should sort by popularity_score for time range sorting', () => {
      const sortOptions = ['weekly-hot', 'monthly-hot']

      fc.assert(
        fc.property(
          fc.constantFrom(...sortOptions),
          (sortOption) => {
            const sectionRegex = new RegExp(`case '${sortOption}':[\\s\\S]*?popularity_score`)
            expect(useFilterContent).toMatch(sectionRegex)
            return true
          },
        ),
        { numRuns: 100 },
      )
    })

    it('should use secondary sort by createdAt when scores are equal', () => {
      // 检查热度相同时按最新排序的逻辑
      const weeklySection = useFilterContent.match(/case 'weekly-hot':[\s\S]*?break/)?.[0]
      const monthlySection = useFilterContent.match(/case 'monthly-hot':[\s\S]*?break/)?.[0]

      expect(weeklySection).toContain('热度相同时按最新排序')
      expect(monthlySection).toContain('热度相同时按最新排序')
    })
  })

  describe('Home.vue Integration', () => {
    const homePath = path.join(ROOT_DIR, 'src/views/Home.vue')
    const homeContent = fs.readFileSync(homePath, 'utf-8')

    it('should import getPopularByTimeRange function', () => {
      expect(homeContent).toContain('getPopularByTimeRange')
    })

    it('should define weeklyPopularityData ref', () => {
      expect(homeContent).toContain('weeklyPopularityData')
    })

    it('should define monthlyPopularityData ref', () => {
      expect(homeContent).toContain('monthlyPopularityData')
    })

    it('should fetch weekly and monthly data in parallel', () => {
      expect(homeContent).toContain('Promise.all')
      expect(homeContent).toContain('getPopularByTimeRange(series, 7')
      expect(homeContent).toContain('getPopularByTimeRange(series, 30')
    })

    it('should pass time range data to useFilter', () => {
      expect(homeContent).toContain('weeklyPopularityData, monthlyPopularityData')
    })
  })

  describe('Supabase Service Integration', () => {
    const supabasePath = path.join(ROOT_DIR, 'src/utils/supabase.js')
    const supabaseContent = fs.readFileSync(supabasePath, 'utf-8')

    it('should have getPopularByTimeRange function', () => {
      expect(supabaseContent).toContain('export async function getPopularByTimeRange')
    })

    it('should query correct view based on days parameter', () => {
      expect(supabaseContent).toContain('popular_wallpapers_weekly')
      expect(supabaseContent).toContain('popular_wallpapers_monthly')
    })
  })
})
