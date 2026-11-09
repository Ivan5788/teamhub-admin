import { describe, expect, it } from 'vitest'
import { employeeFormSchema } from './schema'

const valid = {
  name: '王小明',
  email: 'ming@example.com',
  phone: '0912345678',
  department: 'engineering',
  title: '工程師',
  status: 'active',
  hireDate: '2024-01-01',
}

describe('employeeFormSchema', () => {
  it('接受合法資料', () => {
    expect(employeeFormSchema.safeParse(valid).success).toBe(true)
  })

  it.each(['0812345678', '091234567', '09123456789', '09-12345678'])('拒絕手機 %s', (phone) => {
    expect(employeeFormSchema.safeParse({ ...valid, phone }).success).toBe(false)
  })

  it('姓名去除空白後不可為空', () => {
    expect(employeeFormSchema.safeParse({ ...valid, name: '   ' }).success).toBe(false)
  })
})
