/** .env 設定 VITE_USE_MOCK=false 即改打真實後端；預設由 MSW 模擬伺服器回應 */
export const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false'

/** API 路徑前綴，例如 /api 或 https://api.example.com */
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api'
