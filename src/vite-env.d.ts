/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** 預設使用 mock，設為 'false' 改打真實 API */
  readonly VITE_USE_MOCK?: string
  readonly VITE_API_BASE_URL?: string
}
