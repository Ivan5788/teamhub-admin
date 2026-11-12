import { cn } from '@/lib/utils'
import type { CompanyEvent } from '../schema'

/** 報名進度條：八成以上轉為橘色提醒、額滿為紅色 */
export function CapacityBar({ count, capacity }: { count: number; capacity: number }) {
  const ratio = capacity > 0 ? Math.min(count / capacity, 1) : 0
  return (
    <div
      role="progressbar"
      aria-label="報名進度"
      aria-valuemin={0}
      aria-valuemax={capacity}
      aria-valuenow={count}
      className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100"
    >
      <div
        className={cn(
          'h-full rounded-full transition-[width]',
          ratio >= 1 ? 'bg-red-500' : ratio >= 0.8 ? 'bg-amber-500' : 'bg-indigo-500',
        )}
        style={{ width: `${ratio * 100}%` }}
      />
    </div>
  )
}

/** 列表上的「報名 / 名額」欄位，點擊開啟報名名單 */
export function RegistrationCount({
  event,
  onOpen,
}: {
  event: CompanyEvent
  onOpen: (event: CompanyEvent) => void
}) {
  const count = event.registeredCount ?? 0
  return (
    <button
      type="button"
      onClick={() => onOpen(event)}
      aria-label={`查看「${event.title}」報名名單，已報名 ${count} / ${event.capacity} 人`}
      className="group block w-24 rounded text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
    >
      <span className="block text-sm whitespace-nowrap text-slate-700 tabular-nums group-hover:text-indigo-600 group-hover:underline">
        {count} / {event.capacity} 人
      </span>
      <span className="mt-1.5 block">
        <CapacityBar count={count} capacity={event.capacity} />
      </span>
    </button>
  )
}
