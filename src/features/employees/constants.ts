import { defineOptions } from '@/lib/options'

export const EMPLOYEE_STATUS = defineOptions({
  active: { label: '在職', tone: 'green' },
  onLeave: { label: '留職停薪', tone: 'yellow' },
  resigned: { label: '離職', tone: 'gray' },
})

export const DEPARTMENT = defineOptions({
  engineering: { label: '研發部' },
  product: { label: '產品部' },
  design: { label: '設計部' },
  marketing: { label: '行銷部' },
  sales: { label: '業務部' },
  hr: { label: '人資部' },
  finance: { label: '財務部' },
})
