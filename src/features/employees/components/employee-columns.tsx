import { Pencil, Trash2 } from 'lucide-react'
import type { Column } from '@/components/data-table'
import { Badge, Button } from '@/components/ui'
import { formatDate } from '@/lib/utils'
import { DEPARTMENT, EMPLOYEE_STATUS } from '../constants'
import type { Employee } from '../schema'

interface Actions {
  onEdit: (row: Employee) => void
  onDelete: (row: Employee) => void
}

/** 表格欄位定義。要調整列表顯示內容，只需要改這個檔案 */
export function getEmployeeColumns({ onEdit, onDelete }: Actions): Column<Employee>[] {
  return [
    {
      key: 'name',
      header: '員工',
      mobile: 'title',
      render: (r) => (
        <div className="flex items-center gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-indigo-50 font-medium text-indigo-700">
            {r.name.slice(0, 1)}
          </div>
          <div className="min-w-0">
            <div className="font-medium text-slate-900">{r.name}</div>
            <div className="truncate text-xs text-slate-500">{r.email}</div>
          </div>
        </div>
      ),
    },
    { key: 'department', header: '部門', render: (r) => DEPARTMENT.label(r.department) },
    { key: 'title', header: '職稱', render: (r) => r.title },
    { key: 'phone', header: '手機', render: (r) => <span className="tabular-nums">{r.phone}</span> },
    {
      key: 'status',
      header: '狀態',
      render: (r) => (
        <Badge tone={EMPLOYEE_STATUS.tone(r.status)}>{EMPLOYEE_STATUS.label(r.status)}</Badge>
      ),
    },
    {
      key: 'hireDate',
      header: '到職日',
      mobile: 'hidden',
      render: (r) => <span className="tabular-nums">{formatDate(r.hireDate)}</span>,
    },
    {
      key: 'actions',
      header: <span className="sr-only">操作</span>,
      mobile: 'actions',
      className: 'text-right',
      render: (r) => (
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="icon" onClick={() => onEdit(r)} aria-label="編輯">
            <Pencil className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(r)}
            aria-label="刪除"
            className="text-red-600 hover:bg-red-50"
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      ),
    },
  ]
}
