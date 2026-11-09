import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

export function Card({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      className={cn('rounded-xl bg-white shadow-sm ring-1 ring-slate-200', className)}
      {...props}
    />
  )
}
