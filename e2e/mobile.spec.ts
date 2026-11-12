import { expect, test } from '@playwright/test'

test.describe('手機版', () => {
  test('列表以卡片呈現，頁面沒有橫向捲動', async ({ page }) => {
    await page.goto('/employees')
    await expect(page.getByText('王小明')).toBeVisible()
    await expect(page.getByRole('table')).toHaveCount(0)

    const [scrollWidth, innerWidth] = await page.evaluate(() => [
      document.documentElement.scrollWidth,
      window.innerWidth,
    ])
    expect(scrollWidth).toBeLessThanOrEqual(innerWidth)
  })

  test('表單從底部滑出，儲存按鈕在可視範圍內且好點擊', async ({ page }) => {
    await page.goto('/events')
    await page.getByRole('button', { name: '新增活動' }).tap()
    const save = page.getByRole('dialog').getByRole('button', { name: '儲存' })
    await expect(save).toBeInViewport()

    const box = await save.boundingBox()
    expect(box?.height).toBeGreaterThanOrEqual(44)
  })

  test('側邊選單收合時，鍵盤無法走進裡面的連結', async ({ page }) => {
    await page.goto('/')
    const menu = page.locator('aside')
    await expect(menu).toHaveAttribute('inert')
    await page.getByRole('button', { name: '開啟選單' }).tap()
    await expect(menu).not.toHaveAttribute('inert')
    await page.getByRole('link', { name: '人員管理' }).tap()
    await expect(page).toHaveURL(/\/employees/)
  })
})
