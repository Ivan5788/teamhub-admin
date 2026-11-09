import { useEffect, useState } from 'react'

/** 值停止變動 delay 毫秒後才更新，常用於搜尋框避免每打一個字就打 API */
export function useDebounce<T>(value: T, delay = 300) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  return debounced
}
