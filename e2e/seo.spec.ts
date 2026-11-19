import { expect, test } from './fixtures'

test.describe('SEO 與分享', () => {
  test.use({ role: null })

  test('具備描述、分享卡片與結構化資料，但不讓搜尋引擎收錄', async ({ page, request }) => {
    await page.goto('/login')
    const meta = (selector: string) => page.locator(selector).getAttribute('content')

    await expect(page).toHaveTitle('登入｜TeamHub')
    expect(await meta('meta[name="robots"]')).toBe('noindex, nofollow')
    expect(await meta('meta[name="description"]')).toBeTruthy()
    expect(await meta('meta[property="og:image"]')).toMatch(/^https:\/\/.+\/og-image\.png$/)

    const jsonLd = await page.locator('script[type="application/ld+json"]').textContent()
    expect(JSON.parse(jsonLd!)).toMatchObject({ '@type': 'WebApplication' })

    // 分享圖片確實存在，不會被 SPA fallback 換成 index.html
    const image = await request.get('/og-image.png')
    expect(image.headers()['content-type']).toBe('image/png')
  })

  test('robots.txt 允許爬取，搜尋引擎才讀得到 noindex', async ({ request }) => {
    const res = await request.get('/robots.txt')
    expect(res.ok()).toBe(true)
    expect(await res.text()).toMatch(/Allow: \//)
    expect(await res.text()).not.toMatch(/Disallow: \/\s/)
  })
})
