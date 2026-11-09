import { CalendarDays, LayoutDashboard, Users, type LucideIcon } from 'lucide-react'

export interface NavItem {
  label: string
  path: string
  icon: LucideIcon
}

/** 側邊欄選單。新增模組時在這裡加一行，並到 app/router.tsx 註冊路由 */
export const navigation: NavItem[] = [
  { label: '總覽', path: '/', icon: LayoutDashboard },
  { label: '人員管理', path: '/employees', icon: Users },
  { label: '活動管理', path: '/events', icon: CalendarDays },
]
