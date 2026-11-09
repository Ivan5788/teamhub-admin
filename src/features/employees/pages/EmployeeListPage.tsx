import { Plus } from 'lucide-react'
import { DataTable, Pagination, TableToolbar } from '@/components/data-table'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button, Card, ConfirmDialog, Select } from '@/components/ui'
import { useCrudDialogs } from '@/hooks/useCrudDialogs'
import { useListState } from '@/hooks/useListState'
import { employeeHooks } from '../api'
import { EmployeeFormModal } from '../components/EmployeeFormModal'
import { getEmployeeColumns } from '../components/employee-columns'
import { DEPARTMENT, EMPLOYEE_STATUS } from '../constants'
import type { Employee } from '../schema'

/**
 * 標準 CRUD 列表頁範本 —— 新模組可以直接複製這個檔案開始改。
 * 結構：列表狀態(useListState) → 取資料(useList) → 表格 → 彈窗(useCrudDialogs)
 */
export function EmployeeListPage() {
  const list = useListState({ filterKeys: ['status', 'department'] })
  const { data, isLoading, isFetching, isError, refetch } = employeeHooks.useList(list.params)
  const removeMutation = employeeHooks.useRemove()
  const dialogs = useCrudDialogs<Employee>()

  const columns = getEmployeeColumns({ onEdit: dialogs.openEdit, onDelete: dialogs.openDelete })

  return (
    <>
      <PageHeader
        title="人員管理"
        description="管理公司員工基本資料與在職狀態"
        actions={
          <Button onClick={dialogs.openCreate}>
            <Plus className="size-4" />
            新增員工
          </Button>
        }
      />

      <Card>
        <TableToolbar
          keyword={list.keyword}
          onKeywordChange={list.setKeyword}
          placeholder="搜尋姓名、Email、手機、職稱"
        >
          <Select
            value={list.filters.department}
            onChange={(e) => list.setFilter('department', e.target.value)}
            options={DEPARTMENT.options}
            placeholder="全部部門"
            aria-label="依部門篩選"
          />
          <Select
            value={list.filters.status}
            onChange={(e) => list.setFilter('status', e.target.value)}
            options={EMPLOYEE_STATUS.options}
            placeholder="全部狀態"
            aria-label="依狀態篩選"
          />
        </TableToolbar>

        <DataTable
          columns={columns}
          data={data?.items}
          rowKey={(r) => r.id}
          loading={isLoading}
          fetching={isFetching}
          error={isError}
          onRetry={refetch}
          emptyText="找不到符合條件的員工"
        />
        <Pagination
          page={list.page}
          pageSize={list.pageSize}
          total={data?.total}
          onChange={list.setPage}
        />
      </Card>

      {dialogs.formOpen && (
        <EmployeeFormModal employee={dialogs.editing} onClose={dialogs.closeForm} />
      )}

      <ConfirmDialog
        open={!!dialogs.deleting}
        title="刪除員工"
        description={`確定要刪除「${dialogs.deleting?.name}」嗎？此操作無法復原。`}
        loading={removeMutation.isPending}
        onClose={dialogs.closeDelete}
        onConfirm={() =>
          removeMutation.mutate(dialogs.deleting!.id, { onSuccess: dialogs.closeDelete })
        }
      />
    </>
  )
}
