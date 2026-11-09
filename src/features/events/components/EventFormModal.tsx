import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Field, FormModal, Input, Select, Textarea } from '@/components/ui'
import { toDateTimeLocal } from '@/lib/utils'
import { eventHooks } from '../api'
import { EVENT_CATEGORY, EVENT_STATUS } from '../constants'
import { eventFormSchema, type CompanyEvent, type EventFormValues } from '../schema'

interface Props {
  /** null = 新增模式 */
  event: CompanyEvent | null
  onClose: () => void
}

/** 後端資料（ISO 時間）→ 表單初始值（datetime-local） */
function toFormValues(event: CompanyEvent): EventFormValues {
  return { ...event, startAt: toDateTimeLocal(event.startAt), endAt: toDateTimeLocal(event.endAt) }
}

export function EventFormModal({ event, onClose }: Props) {
  const isEdit = !!event
  const createMutation = eventHooks.useCreate()
  const updateMutation = eventHooks.useUpdate()

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: event
      ? toFormValues(event)
      : { status: 'draft', description: '', coverUrl: '', capacity: 30 },
  })

  const coverUrl = watch('coverUrl')

  const onSubmit = (values: EventFormValues) => {
    // 表單值（datetime-local）→ 後端資料（ISO 時間）
    const input = {
      ...values,
      startAt: new Date(values.startAt).toISOString(),
      endAt: new Date(values.endAt).toISOString(),
    }
    const options = { onSuccess: onClose }
    if (isEdit) updateMutation.mutate({ id: event.id, input }, options)
    else createMutation.mutate(input, options)
  }

  return (
    <FormModal
      title={isEdit ? '編輯活動' : '新增活動'}
      onClose={onClose}
      onSubmit={handleSubmit(onSubmit)}
      submitting={createMutation.isPending || updateMutation.isPending}
    >
      <Field label="活動名稱" required error={errors.title?.message} className="sm:col-span-2">
        <Input {...register('title')} aria-invalid={!!errors.title} />
      </Field>
      <Field label="類別" required error={errors.category?.message}>
        <Select
          {...register('category')}
          options={EVENT_CATEGORY.options}
          placeholder="請選擇類別"
          aria-invalid={!!errors.category}
        />
      </Field>
      <Field label="人數上限" required error={errors.capacity?.message}>
        <Input
          type="number"
          min={1}
          {...register('capacity', { valueAsNumber: true })}
          aria-invalid={!!errors.capacity}
        />
      </Field>
      <Field label="開始時間" required error={errors.startAt?.message}>
        <Input type="datetime-local" {...register('startAt')} aria-invalid={!!errors.startAt} />
      </Field>
      <Field label="結束時間" required error={errors.endAt?.message}>
        <Input type="datetime-local" {...register('endAt')} aria-invalid={!!errors.endAt} />
      </Field>
      <Field label="地點" required error={errors.location?.message} className="sm:col-span-2">
        <Input {...register('location')} aria-invalid={!!errors.location} />
      </Field>
      <Field
        label="封面圖片網址"
        error={errors.coverUrl?.message}
        hint="選填，建議比例 16:9"
        className="sm:col-span-2"
      >
        <div className="flex gap-3">
          <Input
            {...register('coverUrl')}
            aria-invalid={!!errors.coverUrl}
            placeholder="https://"
          />
          {coverUrl && !errors.coverUrl && (
            <img src={coverUrl} alt="" className="h-10 w-16 shrink-0 rounded object-cover" />
          )}
        </div>
      </Field>
      <Field label="活動說明" error={errors.description?.message} className="sm:col-span-2">
        <Textarea {...register('description')} aria-invalid={!!errors.description} />
      </Field>
      <Field label="上架狀態" required error={errors.status?.message}>
        <Select {...register('status')} options={EVENT_STATUS.options} />
      </Field>
    </FormModal>
  )
}
