import { test, expect } from '@playwright/test'

/**
 * Направления услуг (bx-shef/Lp#109, решение владельца 10.11): пять карточек,
 * ссылки на shef.cowork и shef.toolsai, импорт выписки клиент-банка остаётся;
 * AI-импорта документов, генерации контента и кейса RabbitMQ нет. На телефоне
 * карточки не шире экрана.
 */
test('услуги — пять направлений', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 })
  await page.goto('/')
  const sec = page.locator('#services')
  await expect(sec.locator('h3')).toHaveText([
    'AI в коробочном Битрикс24',
    'Анализ и улучшение работы в CRM',
    'Встраивание ваших модулей и приложений в AI-агента',
    'Интеграции и обмен данными',
    'Сопровождение и обновление Битрикс24'
  ])
  await expect(sec.locator('a[href="https://b24-crm-tools-ai.bx-shef.by/"]')).toBeVisible()
  await expect(sec.locator('a[href="https://b24-crm-tools-ai.bx-shef.by/toolsai"]')).toBeVisible()
  await expect(sec.locator('a[href="https://bank-import.bx-shef.by"]')).toBeVisible()
  await expect(sec).not.toContainText('RabbitMQ')
  await expect(sec.locator('a[href*="price-import"], a[href*="obmen"]')).toHaveCount(0)
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
  expect(overflow).toBeLessThanOrEqual(0)
})
