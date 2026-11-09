import { Plus } from 'lucide-react'
import { DataTable, Pagination, TableToolbar } from '@/components/data-table'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button, Card, ConfirmDialog, Select, Tabs } from '@/components/ui'
import { useCrudDialogs } from '@/hooks/useCrudDialogs'
import { useListState } from '@/hooks/useListState'
import { eventHooks, useTogglePublish } from '../api'
import { EventFormModal } from '../components/EventFormModal'
import { getEventColumns } from '../components/event-columns'
import { EVENT_CATEGORY, EVENT_STATUS } from '../constants'
import type { CompanyEvent } from '../schema'

const statusTabs = [{ value: '', label: '全部' }, ...EVENT_STATUS.options]

export function EventListPage() {
  const list = useListState({ filterKeys: ['status', 'category'] })
  const { data, isLoading, isFetching, isError, refetch } = eventHooks.useList(list.params)
  const removeMutation = eventHooks.useRemove()
  const { toggle } = useTogglePublish()
  const dialogs = useCrudDialogs<CompanyEvent>()

  const columns = getEventColumns({
    onEdit: dialogs.openEdit,
    onDelete: dialogs.openDelete,
    onTogglePublish: toggle,
  })

  return (
    <>
      <PageHeader
        title="活動管理"
        description="建立公司活動並控制上架 / 下架，上架後員工即可在前台看到"
        actions={
          <Button onClick={dialogs.openCreate}>
            <Plus className="size-4" />
            新增活動
          </Button>
        }
      />

      <Card>
        <Tabs
          value={list.filters.status}
          onChange={(v) => list.setFilter('status', v)}
          options={statusTabs}
        />
        <TableToolbar
          keyword={list.keyword}
          onKeywordChange={list.setKeyword}
          placeholder="搜尋活動名稱、地點"
        >
          <Select
            value={list.filters.category}
            onChange={(e) => list.setFilter('category', e.target.value)}
            options={EVENT_CATEGORY.options}
            placeholder="全部類別"
            aria-label="依類別篩選"
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
          emptyText="找不到符合條件的活動"
        />
        <Pagination
          page={list.page}
          pageSize={list.pageSize}
          total={data?.total}
          onChange={list.setPage}
        />
      </Card>

      {dialogs.formOpen && <EventFormModal event={dialogs.editing} onClose={dialogs.closeForm} />}

      <ConfirmDialog
        open={!!dialogs.deleting}
        title="刪除活動"
        description={`確定要刪除「${dialogs.deleting?.title}」嗎？已上架的活動刪除後前台將立即消失。`}
        loading={removeMutation.isPending}
        onClose={dialogs.closeDelete}
        onConfirm={() =>
          removeMutation.mutate(dialogs.deleting!.id, { onSuccess: dialogs.closeDelete })
        }
      />
    </>
  )
}
