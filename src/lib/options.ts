import type { BadgeTone } from '@/components/ui'

/**
 * 「狀態 / 類別」這類列舉值的單一資料來源（Single Source of Truth）。
 * 一份定義同時產生：zod 驗證用的 enum、下拉選單選項、Badge 顯示文字與顏色。
 *
 *   export const EMPLOYEE_STATUS = defineOptions({
 *     active: { label: '在職', tone: 'green' },
 *   })
 */
export interface OptionMeta {
  label: string
  tone?: BadgeTone
}

export function defineOptions<const T extends Record<string, OptionMeta>>(map: T) {
  const keys = Object.keys(map) as [keyof T & string, ...(keyof T & string)[]]
  return {
    map,
    /** 給 z.enum() 用 */
    keys,
    /** 給 <Select options={...}> 用 */
    options: keys.map((value) => ({ value, label: map[value].label })),
    label: (value: string) => map[value]?.label ?? value,
    tone: (value: string): BadgeTone => map[value]?.tone ?? 'gray',
  }
}
