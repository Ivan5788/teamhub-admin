import { defineOptions } from '@/lib/options'

/** 角色定義：label 與 Badge 顏色。新增角色時，記得在 ROLE_PERMISSIONS 補上權限 */
export const ROLE = defineOptions({
  admin: { label: '管理員', tone: 'indigo' },
  editor: { label: '編輯者', tone: 'blue' },
  viewer: { label: '檢視者', tone: 'gray' },
})
export type Role = (typeof ROLE.keys)[number]

export type Action = 'read' | 'create' | 'update' | 'delete'

/** 權限字串格式為「資源:動作」，例如 employees:delete；* 代表任意資源或動作 */
export type Permission = `${string}:${Action | '*'}`

/**
 * 角色 → 權限（RBAC）。前端只用來決定畫面顯示什麼，
 * 真正的把關在 API 層（mock API 會檢查並回傳 403，真實後端也必須檢查）。
 */
const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  admin: ['*:*'],
  editor: ['*:read', '*:create', '*:update'],
  viewer: ['*:read'],
}

export function hasPermission(role: Role | undefined, permission: Permission) {
  if (!role) return false
  const [resource, action] = permission.split(':')
  return ROLE_PERMISSIONS[role].some((granted) => {
    const [r, a] = granted.split(':')
    return (r === '*' || r === resource) && (a === '*' || a === action)
  })
}
