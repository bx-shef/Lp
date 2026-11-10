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

test('услуги — сетка без пустых мест', async ({ page }) => {
  const boxes = async () => {
    const cards = page.locator('#services [data-glow-card]')
    await expect(cards).toHaveCount(5)
    return Promise.all([0, 1, 2, 3, 4].map(async i => (await cards.nth(i).boundingBox())!))
  }
  await page.setViewportSize({ width: 800, height: 900 })
  await page.goto('/')
  let b = await boxes()
  expect(Math.abs(b[0].y - b[1].y)).toBeLessThan(2)
  expect(Math.abs(b[2].y - b[3].y)).toBeLessThan(2)
  expect(Math.abs(b[4].x - b[0].x)).toBeLessThan(2)
  expect(b[4].width).toBeGreaterThan(b[0].width * 1.8)
  await page.setViewportSize({ width: 1280, height: 900 })
  b = await boxes()
  expect(Math.abs(b[0].y - b[2].y)).toBeLessThan(2)
  expect(Math.abs(b[3].y - b[4].y)).toBeLessThan(2)
  expect(b[3].y).toBeGreaterThan(b[0].y)
  expect(Math.abs(b[3].width - b[4].width)).toBeLessThan(2)
})

test('услуги — цели Метрики на ссылках продуктов', async ({ page }) => {
  await page.addInitScript(() => {
    const w = window as unknown as { __goals: string[] }
    w.__goals = []
    const ym = (...a: unknown[]) => {
      if (a[1] === 'reachGoal') w.__goals.push(String(a[2]))
    }
    Object.defineProperty(window, 'ym', { configurable: true, get: () => ym, set: () => {} })
  })
  await page.goto('/')
  await page.waitForLoadState('networkidle')
  await page.evaluate(() => document.addEventListener('click', e => e.preventDefault(), true))
  for (const [href, goal] of [['https://b24-crm-tools-ai.bx-shef.by/', 'cowork_click'], ['https://b24-crm-tools-ai.bx-shef.by/toolsai', 'toolsai_click']]) {
    await page.click(`#services a[href="${href}"]`)
    expect(await page.evaluate(() => (window as unknown as { __goals: string[] }).__goals)).toContain(goal)
  }
})
