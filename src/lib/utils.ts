import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/** 合併 Tailwind class，後面的會覆蓋前面的（例如 cn('px-2', 'px-4') → 'px-4'） */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(iso: string | undefined, withTime = false) {
  if (!iso) return '-'
  return new Date(iso).toLocaleString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    ...(withTime && { hour: '2-digit', minute: '2-digit', hour12: false }),
  })
}

/** ISO 字串 → <input type="datetime-local"> 需要的格式（本地時區） */
export function toDateTimeLocal(iso: string) {
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}
