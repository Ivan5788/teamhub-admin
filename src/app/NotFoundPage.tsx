import { Link } from 'react-router'

export function NotFoundPage() {
  return (
    <div className="py-24 text-center">
      <p className="text-5xl font-semibold text-indigo-600">404</p>
      <p className="mt-4 text-slate-600">找不到這個頁面</p>
      <Link to="/" className="mt-6 inline-block text-sm font-medium text-indigo-600 hover:underline">
        回到總覽
      </Link>
    </div>
  )
}
