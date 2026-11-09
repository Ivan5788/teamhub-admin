import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, beforeEach } from 'vitest'

// mock API 把資料存在 localStorage，每個測試都從乾淨狀態開始
beforeEach(() => localStorage.clear())
afterEach(cleanup)
