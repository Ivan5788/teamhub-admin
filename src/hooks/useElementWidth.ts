import { useCallback, useState } from 'react'

/**
 * 量測元素寬度並隨尺寸變化更新。用法：
 *   const [ref, width] = useElementWidth<HTMLDivElement>()
 *   <div ref={ref}>…</div>
 * 尚未量到或環境不支援 ResizeObserver（例如測試環境）時 width 為 undefined。
 * 在 ref callback（commit 階段）量第一次，畫面繪製前就套用正確版型，不會先閃一下錯的版型。
 */
export function useElementWidth<T extends HTMLElement>() {
  const [width, setWidth] = useState<number>()

  const ref = useCallback((element: T | null) => {
    if (!element || typeof ResizeObserver === 'undefined') return
    setWidth(element.getBoundingClientRect().width)
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width))
    observer.observe(element)
    // React 19：ref callback 回傳的函式會在元素卸載時呼叫
    return () => observer.disconnect()
  }, [])

  return [ref, width] as const
}
