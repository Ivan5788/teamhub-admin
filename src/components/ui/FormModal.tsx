import { useId, useState, type ReactNode } from 'react'
import type { FieldValues, SubmitHandler, UseFormHandleSubmit } from 'react-hook-form'
import { Button } from './Button'
import { Modal } from './Modal'

interface FormModalProps<T extends FieldValues> {
  title: string
  onClose: () => void
  /** useForm 回傳的 handleSubmit */
  handleSubmit: UseFormHandleSubmit<T>
  /** 驗證通過時執行；驗證失敗時彈窗會輕微震動 */
  onValid: SubmitHandler<T>
  /** formState.isDirty。有未儲存的變更時，關閉前會先確認 */
  isDirty?: boolean
  submitting?: boolean
  submitText?: string
  size?: 'sm' | 'md' | 'lg'
  children: ReactNode
}

/**
 * 「彈窗 + 表單 + 取消/儲存按鈕」的組合。
 * 由父層用 {open && <XxxFormModal />} 控制掛載，每次打開都是全新的表單狀態，不需要手動 reset。
 */
export function FormModal<T extends FieldValues>({
  title,
  onClose,
  handleSubmit,
  onValid,
  isDirty,
  submitting,
  submitText = '儲存',
  size = 'lg',
  children,
}: FormModalProps<T>) {
  const formId = useId()
  const [shaking, setShaking] = useState(false)
  const [confirmingDiscard, setConfirmingDiscard] = useState(false)

  const requestClose = () => {
    if (submitting) return
    if (isDirty) setConfirmingDiscard(true)
    else onClose()
  }

  return (
    <Modal
      open
      onClose={requestClose}
      title={title}
      size={size}
      shaking={shaking}
      onShakeEnd={() => setShaking(false)}
      footer={
        confirmingDiscard ? (
          <>
            <p
              role="alert"
              className="basis-full self-center text-sm text-slate-700 sm:mr-auto sm:basis-auto"
            >
              變更尚未儲存，確定要放棄嗎？
            </p>
            <Button variant="danger" onClick={onClose}>
              放棄變更
            </Button>
            <Button variant="secondary" onClick={() => setConfirmingDiscard(false)} autoFocus>
              繼續編輯
            </Button>
          </>
        ) : (
          <>
            <Button variant="secondary" onClick={requestClose} disabled={submitting}>
              取消
            </Button>
            <Button type="submit" form={formId} loading={submitting}>
              {submitText}
            </Button>
          </>
        )
      }
    >
      <form
        id={formId}
        onSubmit={handleSubmit(onValid, () => setShaking(true))}
        noValidate
        className="grid gap-6"
      >
        {children}
      </form>
    </Modal>
  )
}

/** 把相關欄位分組，長表單比較好掃讀 */
export function FormSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h3 className="mb-3 text-sm font-semibold text-slate-900">{title}</h3>
      <div className="grid gap-4 sm:grid-cols-2">{children}</div>
    </section>
  )
}
