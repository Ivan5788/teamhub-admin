import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/** 合併 Tailwind class，後面的會覆蓋前面的（例如 cn('px-2', 'px-4') → 'px-4'） */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const pad = (n: number) => String(n).padStart(2, '0')

/**
 * 日期格式化為 2026/11/19（withTime：2026/11/19 14:00），使用本地時區。
 * 刻意自己組字串而不用 toLocaleString：不同平台的語系資料，
 * 日期與時間之間可能是特殊空白字元，會讓比對與字串處理在 CI（Linux）和本機結果不同。
 */
export function formatDate(iso: string | undefined, withTime = false) {
  if (!iso) return '-'
  const d = new Date(iso)
  const date = `${d.getFullYear()}/${pad(d.getMonth() + 1)}/${pad(d.getDate())}`
  return withTime ? `${date} ${formatTime(iso)}` : date
}

/** 時間格式化為 14:00（24 小時制，本地時區） */
export function formatTime(iso: string) {
  const d = new Date(iso)
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`
}

/** ISO 字串 → <input type="datetime-local"> 需要的格式（本地時區） */
export function toDateTimeLocal(iso: string) {
  const d = new Date(iso)
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}
