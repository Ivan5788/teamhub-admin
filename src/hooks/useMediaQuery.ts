import { useCallback, useSyncExternalStore } from 'react'

/**
 * 訂閱 CSS media query。需要依螢幕尺寸渲染不同結構時使用，只是樣式差異請用 Tailwind 斷點。
 * 環境不支援 matchMedia 時回傳 fallback。
 */
export function useMediaQuery(query: string, fallback = true) {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const media = window.matchMedia?.(query)
      media?.addEventListener('change', onChange)
      return () => media?.removeEventListener('change', onChange)
    },
    [query],
  )
  return useSyncExternalStore(subscribe, () => window.matchMedia?.(query).matches ?? fallback)
}
