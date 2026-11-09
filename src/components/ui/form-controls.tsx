import type { ComponentProps, ReactNode } from 'react'
import { cn } from '@/lib/utils'

/**
 * 表單基礎元件。React 19 的 ref 是一般 prop，所以可以直接搭配 react-hook-form：
 *   <Input {...register('name')} />
 */

const controlClass =
  'block w-full rounded-lg border-0 bg-white px-3 py-2 text-sm text-slate-900 ring-1 ring-slate-300 ' +
  'placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-600 focus:outline-none ' +
  'disabled:bg-slate-50 disabled:text-slate-500 aria-invalid:ring-red-500'

export function Input({ className, ...props }: ComponentProps<'input'>) {
  return <input className={cn(controlClass, 'h-10', className)} {...props} />
}

export function Textarea({ className, ...props }: ComponentProps<'textarea'>) {
  return <textarea rows={4} className={cn(controlClass, className)} {...props} />
}

export interface Option {
  value: string
  label: string
}

interface SelectProps extends ComponentProps<'select'> {
  options: readonly Option[]
  /** 有傳就會多一個空值選項，例如「全部狀態」或「請選擇」 */
  placeholder?: string
}

export function Select({ options, placeholder, className, ...props }: SelectProps) {
  return (
    <select className={cn(controlClass, 'h-10 pr-8', className)} {...props}>
      {placeholder !== undefined && <option value="">{placeholder}</option>}
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  )
}

interface FieldProps {
  label: string
  error?: string
  required?: boolean
  hint?: string
  className?: string
  children: ReactNode
}

/** 標籤 + 欄位 + 錯誤訊息的統一排版 */
export function Field({ label, error, required, hint, className, children }: FieldProps) {
  return (
    <label className={cn('block space-y-1.5', className)}>
      <span className="text-sm font-medium text-slate-700">
        {label}
        {required && <span className="ml-0.5 text-red-500">*</span>}
      </span>
      {children}
      {error ? (
        <p className="text-xs text-red-600">{error}</p>
      ) : (
        hint && <p className="text-xs text-slate-500">{hint}</p>
      )}
    </label>
  )
}
