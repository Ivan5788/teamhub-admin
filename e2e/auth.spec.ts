import { expect, test } from './fixtures'

test.describe('登入', () => {
  test.use({ role: null })

  test('未登入開啟頁面會導向登入頁，登入後回到原本的網址', async ({ page }) => {
    await page.goto('/employees?q=王')
    await expect(page).toHaveURL(/\/login\?redirect=/)

    await page.getByRole('button', { name: '以管理員身分登入' }).click()

    await expect(page).toHaveURL(/\/employees\?q=/)
    await expect(page.getByRole('searchbox')).toHaveValue('王')
    await expect(page.getByRole('button', { name: /帳號選單：林雅婷/ })).toBeVisible()
  })

  test('帳號密碼錯誤時顯示錯誤', async ({ page }) => {
    await page.goto('/login')
    await page.getByLabel('Email').fill('admin@teamhub.dev')
    await page.getByLabel('密碼').fill('wrong')
    await page.getByRole('button', { name: '登入', exact: true }).click()
    await expect(page.getByRole('alert')).toHaveText('帳號或密碼錯誤')
  })

  test('不接受導向外部網站的 redirect 參數', async ({ page }) => {
    await page.goto('/login?redirect=//evil.example')
    await page.getByRole('button', { name: '以檢視者身分登入' }).click()
    await expect(page).toHaveURL(/localhost:\d+\/$/)
  })
})

test.describe('登出', () => {
  test('登出後回到登入頁，再開啟後台頁面也會被導回登入', async ({ page }) => {
    await page.goto('/employees')
    await page.getByRole('button', { name: /帳號選單/ }).click()
    await page.getByRole('button', { name: '登出' }).click()

    await expect(page).toHaveURL(/\/login/)
    await page.goto('/employees')
    await expect(page).toHaveURL(/\/login\?redirect=%2Femployees/)
  })
})

test.describe('檢視者', () => {
  test.use({ role: 'viewer' })

  test('只能瀏覽，看不到任何修改操作', async ({ page }) => {
    await page.goto('/events')
    await expect(page.getByText('檢視者模式')).toBeVisible()
    await expect(page.getByRole('row', { name: /React 19/ })).toBeVisible()
    await expect(page.getByRole('button', { name: '新增活動' })).toHaveCount(0)
    await expect(page.getByRole('button', { name: /^(上架|下架|編輯|刪除)$/ })).toHaveCount(0)
  })
})

test.describe('編輯者', () => {
  test.use({ role: 'editor' })

  test('可以上架與編輯，但不能刪除', async ({ page }) => {
    await page.goto('/events')
    const row = page.getByRole('row', { name: /2026 年度尾牙/ })
    await expect(row.getByRole('button', { name: '上架', exact: true })).toBeVisible()
    await expect(row.getByRole('button', { name: '編輯' })).toBeVisible()
    await expect(page.getByRole('button', { name: '刪除' })).toHaveCount(0)
  })
})
