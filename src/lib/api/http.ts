import { clearSession, getSession } from '@/lib/auth/session'
import { API_BASE_URL } from './config'

/**
 * 所有 API 請求的 fetch 封裝。統一處理 baseURL、JSON、錯誤訊息與登入 token。
 * 收到 401 時清除登入狀態，路由守衛會自動導回登入頁。
 */

export class HttpError extends Error {
  /** HTTP 狀態碼；0 代表網路連線失敗，請求沒有送達伺服器 */
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

export async function http<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getSession()?.token
  // 以目前網址為基準組出完整網址；測試環境（Node 的 fetch）不接受相對路徑
  const url = new URL(`${API_BASE_URL}${path}`, globalThis.location?.origin)

  let res: Response
  try {
    res = await fetch(url, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...init.headers,
      },
    })
  } catch {
    throw new HttpError(0, '網路連線失敗，請檢查網路後再試')
  }

  if (res.status === 401) clearSession()
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new HttpError(res.status, body.message ?? `請求失敗（${res.status}）`)
  }
  return res.status === 204 ? (undefined as T) : res.json()
}
