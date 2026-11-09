import { ArrowDownToLine, ArrowUpFromLine, ImageOff, Pencil, Trash2 } from 'lucide-react'
import type { Column } from '@/components/data-table'
import { Badge, Button } from '@/components/ui'
import { formatDate } from '@/lib/utils'
import { EVENT_CATEGORY, EVENT_STATUS } from '../constants'
import type { CompanyEvent } from '../schema'
import { getEventPhase, isPublished } from '../utils'

interface Actions {
  onEdit: (row: CompanyEvent) => void
  onDelete: (row: CompanyEvent) => void
  onTogglePublish: (row: CompanyEvent) => void
}

export function getEventColumns({
  onEdit,
  onDelete,
  onTogglePublish,
}: Actions): Column<CompanyEvent>[] {
  return [
    {
      key: 'title',
      header: '活動',
      render: (r) => (
        <div className="flex items-center gap-3">
          {r.coverUrl ? (
            <img src={r.coverUrl} alt="" className="h-12 w-20 shrink-0 rounded-md object-cover" />
          ) : (
            <div className="flex h-12 w-20 shrink-0 items-center justify-center rounded-md bg-slate-100">
              <ImageOff className="size-4 text-slate-400" />
            </div>
          )}
          <div className="min-w-0">
            <div className="max-w-64 truncate font-medium text-slate-900">{r.title}</div>
            <div className="mt-1">
              <Badge tone={EVENT_CATEGORY.tone(r.category)}>
                {EVENT_CATEGORY.label(r.category)}
              </Badge>
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'time',
      header: '活動時間',
      render: (r) => {
        const phase = getEventPhase(r)
        return (
          <div className="space-y-1">
            <div className="text-xs whitespace-nowrap tabular-nums">
              {formatDate(r.startAt, true)}
              <span className="text-slate-400"> ～ </span>
              {formatDate(r.endAt, true)}
            </div>
            <Badge tone={phase.tone}>{phase.label}</Badge>
          </div>
        )
      },
    },
    {
      key: 'location',
      header: '地點',
      render: (r) => <span className="line-clamp-2 max-w-48">{r.location}</span>,
    },
    { key: 'capacity', header: '人數上限', render: (r) => `${r.capacity} 人` },
    {
      key: 'status',
      header: '上架狀態',
      render: (r) => <Badge tone={EVENT_STATUS.tone(r.status)}>{EVENT_STATUS.label(r.status)}</Badge>,
    },
    {
      key: 'actions',
      header: <span className="sr-only">操作</span>,
      className: 'text-right',
      render: (r) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant={isPublished(r) ? 'secondary' : 'primary'}
            size="sm"
            onClick={() => onTogglePublish(r)}
          >
            {isPublished(r) ? (
              <>
                <ArrowDownToLine className="size-4" />
                下架
              </>
            ) : (
              <>
                <ArrowUpFromLine className="size-4" />
                上架
              </>
            )}
          </Button>
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
