/**
 * 真實後端用的 fetch 封裝。統一處理 baseURL、JSON、錯誤訊息。
 * 之後要帶 token 時，在這裡加 Authorization header 即可，其他地方都不用改。
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
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init.headers },
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new HttpError(res.status, body.message ?? `請求失敗（${res.status}）`)
  }
  return res.status === 204 ? (undefined as T) : res.json()
}
