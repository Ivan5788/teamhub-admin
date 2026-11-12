import { expect, test } from './fixtures'

test.describe('活動管理', () => {
  test('上架立即反映在畫面上，並顯示提示', async ({ page }) => {
    await page.goto('/events')
    const row = page.getByRole('row', { name: /2026 年度尾牙/ })
    await expect(row).toContainText('草稿')

    await row.getByRole('button', { name: '上架', exact: true }).click()
    // 樂觀更新：不等 API 回應（模擬延遲 300ms）就切換
    await expect(row).toContainText('已上架', { timeout: 200 })
    await expect(page.getByText('「2026 年度尾牙」已上架')).toBeVisible()
    await expect(row.getByRole('button', { name: '下架' })).toBeVisible()
  })

  test('結束時間早於開始時間時顯示錯誤', async ({ page }) => {
    await page.goto('/events')
    await page.getByRole('button', { name: '新增活動' }).click()
    const dialog = page.getByRole('dialog')
    await dialog.getByLabel(/開始時間/).fill('2027-03-01T10:00')
    await dialog.getByLabel(/結束時間/).fill('2027-03-01T09:00')
    await expect(dialog.getByText('結束時間需晚於開始時間')).toBeVisible()
  })

  test('直接開啟子頁面網址不會 404', async ({ page }) => {
    const response = await page.goto('/events?status=published')
    expect(response?.status()).toBe(200)
    await expect(page.getByRole('heading', { name: '活動管理' })).toBeVisible()
    await expect(page).toHaveTitle('活動管理｜TeamHub')
  })
})
