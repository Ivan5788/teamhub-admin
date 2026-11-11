import { cn } from '@/lib/utils'
import type { Option } from './form-controls'

interface TabsProps {
  value: string
  onChange: (value: string) => void
  options: readonly Option[]
}

/** 頁籤式篩選，例如：全部 / 草稿 / 已上架 */
export function Tabs({ value, onChange, options }: TabsProps) {
  return (
    <div className="flex gap-1 overflow-x-auto border-b border-slate-200 px-4">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          aria-pressed={value === opt.value}
          className={cn(
            '-mb-px border-b-2 px-3 py-3 text-sm font-medium whitespace-nowrap transition-colors',
            'focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-indigo-600',
            value === opt.value
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-700',
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
