import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Navigate, useSearchParams } from 'react-router'
import { Building2, CircleAlert, Eye, PencilLine, ShieldCheck, type LucideIcon } from 'lucide-react'
import { Button, Field, Input } from '@/components/ui'
import { DEMO_PASSWORD, demoUserOf, ROLE, useAuth, type Role } from '@/lib/auth'
import { cn } from '@/lib/utils'
import { loginSchema, safeRedirect, type LoginValues } from '../schema'

const DEMO_ROLES: { role: Role; icon: LucideIcon; description: string }[] = [
  { role: 'admin', icon: ShieldCheck, description: '可新增、編輯、刪除所有資料' },
  { role: 'editor', icon: PencilLine, description: '可新增與編輯，不能刪除' },
  { role: 'viewer', icon: Eye, description: '只能瀏覽，無法修改任何資料' },
]

export function LoginPage() {
  const { user, signIn } = useAuth()
  const [searchParams] = useSearchParams()
  const redirect = safeRedirect(searchParams.get('redirect'))
  const [error, setError] = useState<string | null>(null)
  const [pendingRole, setPendingRole] = useState<Role | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema) })

  useEffect(() => {
    document.title = '登入｜TeamHub'
  }, [])

  // 登入成功後 session 更新，這裡會直接導回原本要去的頁面
  if (user) return <Navigate to={redirect} replace />

  const attempt = async (email: string, password: string) => {
    setError(null)
    try {
      await signIn(email, password)
    } catch (err) {
      setError(err instanceof Error ? err.message : '登入失敗，請稍後再試')
    }
  }

  const loginAsDemo = async (role: Role) => {
    setPendingRole(role)
    await attempt(demoUserOf(role).email, DEMO_PASSWORD)
    setPendingRole(null)
  }

  const busy = isSubmitting || pendingRole !== null

  return (
    <main className="flex min-h-dvh items-center justify-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 flex items-center justify-center gap-2 text-slate-900">
          <Building2 className="size-7 text-indigo-600" />
          <span className="text-xl font-semibold">TeamHub</span>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:p-8">
          <h1 className="text-lg font-semibold text-slate-900">登入管理後台</h1>
          <p className="mt-1 text-sm text-slate-500">
            選擇示範角色即可直接體驗，不同角色看到的功能不同。
          </p>

          <div className="mt-5 grid gap-2">
            {DEMO_ROLES.map(({ role, icon: Icon, description }) => (
              <button
                key={role}
                type="button"
                onClick={() => loginAsDemo(role)}
                disabled={busy}
                aria-label={`以${ROLE.label(role)}身分登入`}
                className={cn(
                  'flex items-center gap-3 rounded-xl p-3 text-left ring-1 ring-slate-200 transition-colors',
                  'hover:bg-indigo-50/60 hover:ring-indigo-300 disabled:cursor-not-allowed disabled:opacity-60',
                  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600',
                )}
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-indigo-50">
                  <Icon className="size-5 text-indigo-600" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium text-slate-900">
                    以{ROLE.label(role)}身分登入
                  </span>
                  <span className="block text-xs text-slate-500">{description}</span>
                </span>
                {pendingRole === role && <span className="text-xs text-indigo-600">登入中…</span>}
              </button>
            ))}
          </div>

          <div className="my-6 flex items-center gap-3 text-xs text-slate-400">
            <span className="h-px flex-1 bg-slate-200" />
            或使用帳號密碼
            <span className="h-px flex-1 bg-slate-200" />
          </div>

          <form
            noValidate
            onSubmit={handleSubmit((v) => attempt(v.email, v.password))}
            className="grid gap-4"
          >
            {error && (
              <p
                role="alert"
                className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700"
              >
                <CircleAlert className="size-4 shrink-0" />
                {error}
              </p>
            )}
            <Field label="Email" error={errors.email?.message}>
              <Input
                type="email"
                autoComplete="username"
                autoCapitalize="none"
                aria-invalid={!!errors.email}
                {...register('email')}
              />
            </Field>
            <Field label="密碼" error={errors.password?.message}>
              <Input
                type="password"
                autoComplete="current-password"
                aria-invalid={!!errors.password}
                {...register('password')}
              />
            </Field>
            <Button type="submit" loading={isSubmitting} disabled={busy} className="w-full">
              登入
            </Button>
          </form>

          <p className="mt-4 text-xs text-slate-500">
            示範帳號：admin@teamhub.dev、editor@teamhub.dev、viewer@teamhub.dev，密碼皆為{' '}
            <code className="rounded bg-slate-100 px-1">{DEMO_PASSWORD}</code>
          </p>
        </div>
      </div>
    </main>
  )
}
