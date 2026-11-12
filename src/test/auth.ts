import { createDemoSession, demoUserOf, setSession, type Role } from '@/lib/auth'

/** 測試中切換登入角色 */
export function loginAs(role: Role) {
  setSession(createDemoSession(demoUserOf(role)))
}
