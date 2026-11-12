import { expect, test } from '@playwright/test'

test.describe('人員管理', () => {
  test('新增員工：即時驗證，成功後出現在列表', async ({ page }) => {
    await page.goto('/employees')
    await page.getByRole('button', { name: '新增員工' }).click()
    const dialog = page.getByRole('dialog', { name: '新增員工' })

    // 空白送出：顯示錯誤，視窗不關閉
    await dialog.getByRole('button', { name: '儲存' }).click()
    await expect(dialog.getByText('請輸入姓名')).toBeVisible()

    // 輸入時即時檢查格式
    const email = dialog.getByRole('textbox', { name: /Email/ })
    await email.fill('not-an-email')
    await expect(dialog.getByText('Email 格式不正確')).toBeVisible()

    await dialog.getByRole('textbox', { name: /姓名/ }).fill('測試員')
    await email.fill('tester@example.com')
    await dialog.getByRole('textbox', { name: /手機/ }).fill('0900111222')
    await dialog.getByRole('combobox', { name: /部門/ }).selectOption({ index: 1 })
    await dialog.getByRole('textbox', { name: /職稱/ }).fill('QA 工程師')
    await dialog.getByLabel(/到職日/).fill('2026-01-05')
    await dialog.getByRole('button', { name: '儲存' }).click()

    await expect(dialog).toBeHidden()
    await expect(page.getByText('已新增員工')).toBeVisible()
    await expect(page.getByRole('row', { name: /測試員/ })).toBeVisible()
  })

  test('編輯與刪除員工', async ({ page }) => {
    await page.goto('/employees')
    const row = page.getByRole('row', { name: /王小明/ })

    await row.getByRole('button', { name: '編輯' }).click()
    const dialog = page.getByRole('dialog', { name: '編輯員工' })
    await dialog.getByRole('textbox', { name: /職稱/ }).fill('前端技術主管')
    await dialog.getByRole('button', { name: '儲存' }).click()
    await expect(row).toContainText('前端技術主管')

    await row.getByRole('button', { name: '刪除' }).click()
    await page.getByRole('dialog').getByRole('button', { name: '確定刪除' }).click()
    await expect(page.getByText('已刪除員工')).toBeVisible()
    await expect(page.getByRole('row', { name: /王小明/ })).toHaveCount(0)
  })

  test('有未儲存的修改時，關閉前會先詢問', async ({ page }) => {
    await page.goto('/employees')
    await page.getByRole('button', { name: '新增員工' }).click()
    const dialog = page.getByRole('dialog')
    await dialog.getByRole('textbox', { name: /姓名/ }).fill('還沒存')
    await page.keyboard.press('Escape')

    await expect(dialog.getByText('變更尚未儲存，確定要放棄嗎？')).toBeVisible()
    await dialog.getByRole('button', { name: '繼續編輯' }).click()
    await expect(dialog.getByRole('textbox', { name: /姓名/ })).toHaveValue('還沒存')

    await page.keyboard.press('Escape')
    await dialog.getByRole('button', { name: '放棄變更' }).click()
    await expect(dialog).toBeHidden()
  })
})

test.describe('搜尋與篩選', () => {
  test('搜尋條件寫在網址上，重新整理後保留', async ({ page }) => {
    await page.goto('/employees')
    await page.getByRole('searchbox').fill('工程師')
    await expect(page).toHaveURL(/q=/)
    await page.reload()
    await expect(page.getByRole('searchbox')).toHaveValue('工程師')
    await expect(page.getByRole('row', { name: /王小明/ })).toBeVisible()
  })

  test('查無資料時可一鍵清除篩選', async ({ page }) => {
    await page.goto('/employees?q=不存在的人')
    await expect(page.getByText('找不到符合條件的員工')).toBeVisible()
    await page.getByRole('button', { name: '清除搜尋與篩選' }).click()
    await expect(page.getByRole('searchbox')).toHaveValue('')
    await expect(page.getByRole('row', { name: /王小明/ })).toBeVisible()
  })

  test('注音選字過程中不會重複字元', async ({ page, browserName }) => {
    test.skip(browserName !== 'chromium', '使用 Chromium 的 CDP 模擬輸入法')
    await page.goto('/employees')
    const search = page.getByRole('searchbox')
    await search.click()

    const cdp = await page.context().newCDPSession(page)
    for (const text of ['ㄨ', 'ㄨㄤ', 'ㄨㄤˊ']) {
      await cdp.send('Input.imeSetComposition', {
        text,
        selectionStart: text.length,
        selectionEnd: text.length,
      })
      // 等超過防抖時間，確認選字中不會寫入網址、也不會改動輸入框內容
      await page.waitForTimeout(400)
      await expect(search).toHaveValue(text)
      await expect(page).not.toHaveURL(/q=/)
    }
    await cdp.send('Input.insertText', { text: '王' })

    await expect(search).toHaveValue('王')
    await expect(page).toHaveURL(/q=%E7%8E%8B/)
    await expect(page.getByRole('row', { name: /王小明/ })).toBeVisible()
  })
})
