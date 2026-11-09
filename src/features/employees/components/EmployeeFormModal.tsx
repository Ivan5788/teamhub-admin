import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Field, FormModal, Input, Select } from '@/components/ui'
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
    formState: { errors },
  } = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeFormSchema),
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
      onSubmit={handleSubmit(onSubmit)}
      submitting={createMutation.isPending || updateMutation.isPending}
    >
      <Field label="姓名" required error={errors.name?.message}>
        <Input {...register('name')} aria-invalid={!!errors.name} placeholder="王小明" />
      </Field>
      <Field label="Email" required error={errors.email?.message}>
        <Input
          type="email"
          {...register('email')}
          aria-invalid={!!errors.email}
          placeholder="name@example.com"
        />
      </Field>
      <Field label="手機" required error={errors.phone?.message}>
        <Input {...register('phone')} aria-invalid={!!errors.phone} placeholder="0912345678" />
      </Field>
      <Field label="到職日" required error={errors.hireDate?.message}>
        <Input type="date" {...register('hireDate')} aria-invalid={!!errors.hireDate} />
      </Field>
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
      <Field label="狀態" required error={errors.status?.message}>
        <Select {...register('status')} options={EMPLOYEE_STATUS.options} />
      </Field>
    </FormModal>
  )
}
