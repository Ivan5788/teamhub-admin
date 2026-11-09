import { useId, type FormEventHandler, type ReactNode } from 'react'
import { Button } from './Button'
import { Modal } from './Modal'

interface FormModalProps {
  title: string
  onClose: () => void
  /** 直接傳 react-hook-form 的 handleSubmit(onValid) */
  onSubmit: FormEventHandler<HTMLFormElement>
  submitting?: boolean
  submitText?: string
  size?: 'sm' | 'md' | 'lg'
  children: ReactNode
}

/**
 * 「彈窗 + 表單 + 取消/儲存按鈕」的組合。
 * 由父層用 {open && <XxxFormModal />} 控制掛載，每次打開都是全新的表單狀態，不需要手動 reset。
 */
export function FormModal({
  title,
  onClose,
  onSubmit,
  submitting,
  submitText = '儲存',
  size = 'lg',
  children,
}: FormModalProps) {
  const formId = useId()
  return (
    <Modal
      open
      onClose={onClose}
      title={title}
      size={size}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={submitting}>
            取消
          </Button>
          <Button type="submit" form={formId} loading={submitting}>
            {submitText}
          </Button>
        </>
      }
    >
      <form id={formId} onSubmit={onSubmit} noValidate className="grid gap-5 sm:grid-cols-2">
        {children}
      </form>
    </Modal>
  )
}
