import { useSyncExternalStore } from 'react'
import type { Role } from './permissions'

export interface User {
  id: string
  name: string
  email: string
  role: Role
}

export interface Session {
  token: string
  user: User
  /** ISO 時間，過期後視為未登入 */
  expiresAt: string
}

const STORAGE_KEY = 'teamhub:session'
const listeners = new Set<() => void>()

// 快取解析結果：useSyncExternalStore 要求同一份資料回傳同一個物件參考
let cachedRaw: string | null = null
let cachedSession: Session | null = null

function readStorage(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY)
  } catch {
    return null
  }
}

/** 目前的登入狀態；沒有登入或已過期時回傳 null */
export function getSession(): Session | null {
  const raw = readStorage()
  if (raw !== cachedRaw) {
    cachedRaw = raw
    try {
      cachedSession = raw ? (JSON.parse(raw) as Session) : null
    } catch {
      cachedSession = null
    }
  }
  if (cachedSession && new Date(cachedSession.expiresAt) <= new Date()) return null
  return cachedSession
}

const notify = () => listeners.forEach((listener) => listener())

export function setSession(session: Session) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
  notify()
}

export function clearSession() {
  localStorage.removeItem(STORAGE_KEY)
  notify()
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  // 其他分頁登入或登出時同步（storage 事件只會在「其他」分頁觸發）
  const onStorage = (e: StorageEvent) => e.key === STORAGE_KEY && listener()
  window.addEventListener('storage', onStorage)
  return () => {
    listeners.delete(listener)
    window.removeEventListener('storage', onStorage)
  }
}

/** React 元件訂閱登入狀態：登入、登出、其他分頁變動都會重新渲染 */
export function useSession() {
  return useSyncExternalStore(subscribe, getSession, () => null)
}
