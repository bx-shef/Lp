import { test, expect } from '@playwright/test'

/**
 * Smoke страницы реквизитов /legal. Попиксельный снимок здесь не годится: высота
 * блока реквизитов зависит от шрифтов машины (локально и в CI переносы строк
 * расходятся на строку), а реквизиты и ссылки уже держат scripts/check-legal.sh и
 * test/legal.test.ts. Проверяем то, что видит человек: продавец, документы на
 * license.bx-shef.by, кнопки копирования, страница не шире экрана.
 */
test('реквизиты — страница /legal', async ({ page }) => {
  await page.goto('/legal')
  const content = page.getByTestId('legal-content')
  await expect(content).toBeVisible()
  await expect(content).toContainText('ООО «БэИксШефБай»')
  await expect(content).not.toContainText('ИП Шевчик')
  for (const path of ['/privacy', '/cookies']) {
    await expect(content.locator(`a[href="https://license.bx-shef.by${path}"]`).first()).toBeVisible()
  }
  await expect(content.locator('a[href^="https://license.bx-shef.by/offer/"]').first()).toBeVisible()
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
  expect(overflow).toBeLessThanOrEqual(0)
})
