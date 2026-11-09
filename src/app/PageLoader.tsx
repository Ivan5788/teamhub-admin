import { Loader2 } from 'lucide-react'

/** lazy 頁面第一次載入程式碼時顯示（版面會保留，只有內容區顯示） */
export function PageLoader() {
  return (
    <div className="flex justify-center py-24">
      <Loader2 className="size-8 animate-spin text-slate-400" />
    </div>
  )
}
