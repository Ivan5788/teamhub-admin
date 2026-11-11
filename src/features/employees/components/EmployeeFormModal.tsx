import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Field, FormModal, FormSection, Input, Select } from '@/components/ui'
import { employeeHooks } from '../api'
import { DEPARTMENT, EMPLOYEE_STATUS } from '../constants'
import { employeeFormSchema, type Employee, type EmployeeFormValues } from '../schema'

interface Props {
  /** null = 新增模式 */
  employee: Employee | null
  onClose: () => void
}

export function EmployeeFormModal({ employee, onClose }: Props) {
  const isEdit = !!employee
  const createMutation = employeeHooks.useCreate()
  const updateMutation = employeeHooks.useUpdate()

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeFormSchema),
    mode: 'onChange',
    defaultValues: employee ?? { status: 'active' },
  })

  const onSubmit = (values: EmployeeFormValues) => {
    const options = { onSuccess: onClose }
    if (isEdit) updateMutation.mutate({ id: employee.id, input: values }, options)
    else createMutation.mutate(values, options)
  }

  return (
    <FormModal
      title={isEdit ? '編輯員工' : '新增員工'}
      onClose={onClose}
      handleSubmit={handleSubmit}
      onValid={onSubmit}
      isDirty={isDirty}
      submitting={createMutation.isPending || updateMutation.isPending}
    >
      <FormSection title="基本資料">
        <Field label="姓名" required error={errors.name?.message} className="sm:col-span-2">
          <Input
            {...register('name')}
            aria-invalid={!!errors.name}
            placeholder="王小明"
            autoComplete="off"
          />
        </Field>
        <Field label="Email" required error={errors.email?.message}>
          <Input
            type="email"
            {...register('email')}
            aria-invalid={!!errors.email}
            placeholder="name@example.com"
            autoComplete="off"
            autoCapitalize="none"
          />
        </Field>
        <Field label="手機" required error={errors.phone?.message}>
          <Input
            type="tel"
            inputMode="numeric"
            {...register('phone')}
            aria-invalid={!!errors.phone}
            placeholder="0912345678"
            autoComplete="off"
          />
        </Field>
      </FormSection>

      <FormSection title="職務資訊">
        <Field label="部門" required error={errors.department?.message}>
          <Select
            {...register('department')}
            options={DEPARTMENT.options}
            placeholder="請選擇部門"
            aria-invalid={!!errors.department}
          />
        </Field>
        <Field label="職稱" required error={errors.title?.message}>
          <Input {...register('title')} aria-invalid={!!errors.title} placeholder="前端工程師" />
        </Field>
        <Field label="到職日" required error={errors.hireDate?.message}>
          <Input type="date" {...register('hireDate')} aria-invalid={!!errors.hireDate} />
        </Field>
        <Field label="狀態" required error={errors.status?.message}>
          <Select {...register('status')} options={EMPLOYEE_STATUS.options} />
        </Field>
      </FormSection>
    </FormModal>
  )
}
