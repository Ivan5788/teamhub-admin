import { useState } from 'react'

/**
 * 管理列表頁上「新增 / 編輯表單」與「刪除確認」兩種彈窗的開關狀態。
 *
 * - formOpen + editing：editing 為 null 代表新增，有值代表編輯
 * - deleting：要刪除的那一筆，有值時顯示確認框
 */
export function useCrudDialogs<T>() {
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<T | null>(null)
  const [deleting, setDeleting] = useState<T | null>(null)

  return {
    formOpen,
    editing,
    deleting,
    openCreate: () => {
      setEditing(null)
      setFormOpen(true)
    },
    openEdit: (item: T) => {
      setEditing(item)
      setFormOpen(true)
    },
    closeForm: () => setFormOpen(false),
    openDelete: (item: T) => setDeleting(item),
    closeDelete: () => setDeleting(null),
  }
}
