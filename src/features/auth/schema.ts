import { z } from 'zod'

export const loginSchema = z.object({
  email: z.email('請輸入有效的 Email'),
  password: z.string().min(1, '請輸入密碼'),
})
export type LoginValues = z.infer<typeof loginSchema>

/**
 * 只接受站內路徑，避免 ?redirect=https://evil.example 這類開放式重新導向（Open Redirect）。
 * 「//evil.example」在瀏覽器會被當成外部網址，也要擋掉。
 */
export function safeRedirect(target: string | null) {
  if (!target || !target.startsWith('/') || target.startsWith('//') || target.startsWith('/\\')) {
    return '/'
  }
  return target
}
