import { render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { DataTable, type Column } from './DataTable'

interface Row {
  id: string
  name: string
}

const columns: Column<Row>[] = [
  { key: 'name', header: '姓名', mobile: 'title', render: (r) => r.name },
  { key: 'dept', header: '部門', render: () => '研發部' },
  { key: 'hire', header: '到職日', mobile: 'hidden', render: () => '2024/01/01' },
  { key: 'actions', header: '操作', mobile: 'actions', render: () => <button>編輯</button> },
]

describe('DataTable 手機版', () => {
  beforeEach(() => {
    vi.stubGlobal('matchMedia', () => ({
      matches: false,
      addEventListener: () => {},
      removeEventListener: () => {},
    }))
  })
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('以卡片呈現，欄位名稱作為標籤，並依設定隱藏欄位', () => {
    render(
      <DataTable columns={columns} data={[{ id: '1', name: '王小明' }]} rowKey={(r) => r.id} />,
    )

    expect(screen.queryByRole('table')).not.toBeInTheDocument()
    const card = screen.getByRole('listitem')
    expect(within(card).getByText('王小明')).toBeInTheDocument()
    expect(within(card).getByText('部門')).toBeInTheDocument()
    expect(within(card).getByText('研發部')).toBeInTheDocument()
    expect(within(card).getByRole('button', { name: '編輯' })).toBeInTheDocument()
    expect(within(card).queryByText('到職日')).not.toBeInTheDocument()
    // 標題與操作不重複出現成資料格
    expect(within(card).queryByText('姓名')).not.toBeInTheDocument()
  })

  it('載入中顯示骨架，並提供螢幕閱讀器文字', () => {
    render(<DataTable columns={columns} data={undefined} rowKey={(r) => r.id} loading />)
    expect(screen.getByRole('status')).toHaveTextContent('載入中')
  })

  it('空狀態提供下一步操作', () => {
    render(
      <DataTable
        columns={columns}
        data={[]}
        rowKey={(r) => r.id}
        emptyText="查無資料"
        emptyAction={<button>清除篩選</button>}
      />,
    )
    expect(screen.getByText('查無資料')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '清除篩選' })).toBeInTheDocument()
  })
})
