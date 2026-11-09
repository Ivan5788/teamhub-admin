import { createResourceApi } from '@/lib/api'
import { createResourceHooks } from '@/lib/query/create-resource-hooks'
import { employeeSeed } from './mock-data'
import type { Employee } from './schema'

export const employeeApi = createResourceApi<Employee>({
  resource: 'employees',
  mock: { seed: employeeSeed, searchFields: ['name', 'email', 'phone', 'title'] },
})

/** employeeHooks.useList / useCreate / useUpdate / useRemove / useDetail */
export const employeeHooks = createResourceHooks('employees', employeeApi, '員工')
