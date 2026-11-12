import { HttpError } from '@/lib/api/http'
import { hasPermission, ROLE, type Action } from './permissions'
import { getSession } from './session'

/**
 * 模擬後端的權限檢查：未登入回 401、權限不足回 403。
 * 前端隱藏按鈕只是體驗，真正的防線一定在伺服器；mock API 也照這個原則實作，
 * 即使有人繞過畫面直接呼叫 API，也會被擋下。
 */
export function authorize(resource: string, action: Action) {
  const session = getSession()
  if (!session) throw new HttpError(401, '登入已過期，請重新登入')
  const { role } = session.user
  if (!hasPermission(role, `${resource}:${action}`)) {
    throw new HttpError(403, `權限不足：${ROLE.label(role)}無法執行這個操作`)
  }
}
