import { useEffect, type ReactNode } from 'react'

interface PageHeaderProps {
  title: string
  description?: string
  /** 右上角的操作按鈕，例如「新增」 */
  actions?: ReactNode
}

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  useEffect(() => {
    document.title = `${title}｜TeamHub`
  }, [title])

  return (
    <div className="mb-4 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
      <div>
        <h1 className="text-xl font-semibold text-slate-900 sm:text-2xl">{title}</h1>
        {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
      </div>
      {actions && <div className="flex gap-3 [&>*]:flex-1 sm:[&>*]:flex-none">{actions}</div>}
    </div>
  )
}
