import { useQueryClient } from '@tanstack/react-query'
import { login } from './auth-api'
import { hasPermission, type Permission } from './permissions'
import { clearSession, setSession, useSession } from './session'

/**
 * 元件取得登入資訊與權限判斷：
 *   const { user, can } = useAuth()
 *   {can('employees:delete') && <DeleteButton />}
 */
export function useAuth() {
  const session = useSession()
  const queryClient = useQueryClient()
  const role = session?.user.role

  return {
    user: session?.user ?? null,
    can: (permission: Permission) => hasPermission(role, permission),
    signIn: async (email: string, password: string) => setSession(await login(email, password)),
    signOut: () => {
      clearSession()
      // 清掉上一位使用者的資料快取，避免換帳號後短暫看到不該看的內容
      queryClient.clear()
    },
  }
}
