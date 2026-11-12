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

  test('模擬伺服器只攔截 API，頁面導覽不經過 Service Worker', async ({ page }) => {
    await page.goto('/events')
    await expect(page.getByRole('row', { name: /React 19/ })).toBeVisible()

    // Service Worker 已啟用後再導覽一次：頁面由伺服器直接回應，API 則由模擬伺服器回應
    const api = page.waitForResponse((r) => r.url().includes('/api/events'))
    const navigation = await page.goto('/events?status=published')
    expect(navigation?.fromServiceWorker()).toBe(false)
    expect((await api).fromServiceWorker()).toBe(true)
    await expect(page.getByRole('row', { name: /React 19/ })).toBeVisible()
  })

  test('直接開啟子頁面網址不會 404', async ({ page }) => {
    const response = await page.goto('/events?status=published')
    expect(response?.status()).toBe(200)
    await expect(page.getByRole('heading', { name: '活動管理' })).toBeVisible()
    await expect(page).toHaveTitle('活動管理｜TeamHub')
  })
})

test.describe('活動報名', () => {
  test('加入報名後，名單與列表上的人數都會更新', async ({ page }) => {
    await page.goto('/events')
    const row = page.getByRole('row', { name: /React 19/ })
    await row.getByRole('button', { name: /查看「React 19 新功能分享會」報名名單/ }).click()

    const dialog = page.getByRole('dialog', { name: /報名名單/ })
    await expect(dialog.getByText('6 / 50 人')).toBeVisible()
    await dialog
      .getByRole('combobox', { name: '選擇要報名的員工' })
      .selectOption({ label: '黃淑芬（人資部）' })
    await dialog.getByRole('button', { name: '加入報名' }).click()

    await expect(page.getByText('已加入報名')).toBeVisible()
    await expect(dialog.getByText('7 / 50 人')).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(row).toContainText('7 / 50 人')
  })

  test('額滿的活動顯示原因，不能再報名', async ({ page }) => {
    await page.goto('/events')
    await page.getByRole('button', { name: /查看「新進人員教育訓練」報名名單/ }).click()
    const dialog = page.getByRole('dialog')
    await expect(dialog.getByText('已額滿')).toBeVisible()
    await expect(dialog.getByText('名額已滿，目前無法新增報名。')).toBeVisible()
    await expect(dialog.getByRole('button', { name: '加入報名' })).toHaveCount(0)
  })
})
