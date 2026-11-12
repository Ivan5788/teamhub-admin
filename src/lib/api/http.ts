import { clearSession, getSession } from '@/lib/auth/session'

/**
 * 真實後端用的 fetch 封裝。統一處理 baseURL、JSON、錯誤訊息與登入 token。
 * 收到 401 時清除登入狀態，路由守衛會自動導回登入頁。
 */
const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api'

export class HttpError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

export async function http<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getSession()?.token
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...init.headers,
    },
  })
  if (res.status === 401) clearSession()
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new HttpError(res.status, body.message ?? `請求失敗（${res.status}）`)
  }
  return res.status === 204 ? (undefined as T) : res.json()
}
