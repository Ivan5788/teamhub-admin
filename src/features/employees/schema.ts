import { z } from 'zod'
import type { BaseEntity } from '@/lib/api'
import { DEPARTMENT, EMPLOYEE_STATUS } from './constants'

/**
 * 表單驗證規則 = 資料型別的來源。
 * 新增欄位時：1. 在這裡加規則  2. 在 EmployeeFormModal 加輸入框  3.（選用）在列表加欄位
 */
export const employeeFormSchema = z.object({
  name: z.string().trim().min(1, '請輸入姓名').max(50, '最多 50 字'),
  email: z.email('Email 格式不正確'),
  phone: z.string().regex(/^09\d{8}$/, '請輸入 09 開頭的 10 碼手機號碼'),
  department: z.enum(DEPARTMENT.keys, { error: '請選擇部門' }),
  title: z.string().trim().min(1, '請輸入職稱').max(50, '最多 50 字'),
  status: z.enum(EMPLOYEE_STATUS.keys, { error: '請選擇狀態' }),
  hireDate: z.string().min(1, '請選擇到職日'),
})

export type EmployeeFormValues = z.infer<typeof employeeFormSchema>
export type Employee = BaseEntity & EmployeeFormValues
