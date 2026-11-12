import { setupServer } from 'msw/node'
import { handlers } from './handlers'

/** 測試用的模擬伺服器（Node）。單元測試與瀏覽器使用同一套 handlers */
export const mockServer = setupServer(...handlers)
