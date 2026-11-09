import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { DataTable, type Column } from './DataTable'

interface Row {
  id: string
}
const columns: Column<Row>[] = [{ key: 'id', header: 'ID', render: (r) => r.id }]
const rowKey = (r: Row) => r.id

describe('DataTable', () => {
  it('載入失敗時顯示錯誤，而不是查無資料', async () => {
    const onRetry = vi.fn()
    render(
      <DataTable
        columns={columns}
        data={undefined}
        rowKey={rowKey}
        error
        onRetry={onRetry}
        emptyText="查無資料"
      />,
    )

    expect(screen.getByRole('alert')).toHaveTextContent('資料載入失敗')
    expect(screen.queryByText('查無資料')).not.toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: '重新載入' }))
    expect(onRetry).toHaveBeenCalledOnce()
  })

  it('背景更新失敗時保留舊資料', () => {
    render(<DataTable columns={columns} data={[{ id: 'a' }]} rowKey={rowKey} error />)
    expect(screen.getByText('a')).toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('成功但沒有資料時顯示空狀態', () => {
    render(<DataTable columns={columns} data={[]} rowKey={rowKey} emptyText="查無資料" />)
    expect(screen.getByText('查無資料')).toBeInTheDocument()
  })
})
