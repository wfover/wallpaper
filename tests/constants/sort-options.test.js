/**
 * 排序选项常量测试
 * Feature: wallpaper-stats-enhancement
 * Property 5: 排序选项完整性
 * Validates: Requirements 3.1, 3.2, 4.1, 4.2
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import * as fc from 'fast-check'
import { describe, expect, it } from 'vitest'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const ROOT_DIR = path.resolve(__dirname, '../..')

describe('sORT_OPTIONS Constants', () => {
  const constantsPath = path.join(ROOT_DIR, 'src/utils/constants.js')
  const constantsContent = fs.readFileSync(constantsPath, 'utf-8')

  describe('property 5: 排序选项完整性', () => {
    /**
     * Property 5: 排序选项完整性
     * For any FilterPanel component render, SORT_OPTIONS should contain
     * 'weekly-hot' and 'monthly-hot' options, and 'downloads' option's
     * label should be "📥 下载量最高".
     * Validates: Requirements 3.1, 3.2, 4.1, 4.2
     */

    it('should contain weekly-hot option', () => {
      expect(constantsContent).toContain('value: \'weekly-hot\'')
      expect(constantsContent).toContain('📅 本周热门')
    })

    it('should contain monthly-hot option', () => {
      expect(constantsContent).toContain('value: \'monthly-hot\'')
      expect(constantsContent).toContain('📆 本月热门')
    })

    it('should have updated downloads label', () => {
      expect(constantsContent).toContain('value: \'downloads\'')
      expect(constantsContent).toContain('📥 下载量最高')
      // 确保旧的文案不存在
      expect(constantsContent).not.toContain('下载最多')
    })

    it('should contain views option', () => {
      expect(constantsContent).toContain('value: \'views\'')
      expect(constantsContent).toContain('👁️ 浏览量最高')
    })

    it('should have all required sort options', () => {
      const requiredOptions = [
        'newest',
        'popular',
        'downloads',
        'views',
        'weekly-hot',
        'monthly-hot',
        'oldest',
        'largest',
        'smallest',
        'name-asc',
        'name-desc',
      ]

      fc.assert(
        fc.property(
          fc.constantFrom(...requiredOptions),
          (optionValue) => {
            expect(constantsContent).toContain(`value: '${optionValue}'`)
            return true
          },
        ),
        { numRuns: 100 },
      )
    })

    it('should have icons for all sort options', () => {
      const optionIcons = {
        'newest': 'clock',
        'popular': 'fire',
        'downloads': 'download',
        'views': 'eye',
        'weekly-hot': 'calendar',
        'monthly-hot': 'calendar',
        'oldest': 'clock-reverse',
        'largest': 'arrow-down',
        'smallest': 'arrow-up',
        'name-asc': 'sort-alpha',
        'name-desc': 'sort-alpha-reverse',
      }

      fc.assert(
        fc.property(
          fc.constantFrom(...Object.entries(optionIcons)),
          ([value, icon]) => {
            // 检查每个选项都有对应的图标
            expect(constantsContent).toContain(`icon: '${icon}'`)
            return true
          },
        ),
        { numRuns: 100 },
      )
    })

    it('should have labels with emoji for visual distinction', () => {
      const optionEmojis = ['🕐', '🔥', '📥', '👁️', '📅', '📆', '🕰️', '📦', '📄', '🔤', '🔡']

      fc.assert(
        fc.property(
          fc.constantFrom(...optionEmojis),
          (emoji) => {
            expect(constantsContent).toContain(emoji)
            return true
          },
        ),
        { numRuns: 100 },
      )
    })
  })

  describe('sORT_OPTIONS Structure', () => {
    it('should export SORT_OPTIONS as array', () => {
      expect(constantsContent).toContain('export const SORT_OPTIONS = [')
    })

    it('should have consistent option structure', () => {
      // 每个选项都应该有 value, label, icon 三个属性
      const optionPattern = /\{\s*value:\s*'[^']+',\s*label:\s*'[^']+',\s*icon:\s*'[^']+'\s*\}/g
      const matches = constantsContent.match(optionPattern)
      expect(matches).not.toBeNull()
      expect(matches.length).toBeGreaterThanOrEqual(11)
    })
  })
})
