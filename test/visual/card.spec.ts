import { test, expect } from '@playwright/test'

/**
 * Smoke попап-визитки (BusinessCardModal): открывается, фото и QR загружаются,
 * продавец — ООО, окно не шире экрана. Без попиксельного сравнения
 * (решение владельца 09.11): снимки зависят от шрифтов машины.
 */
test('визитка — открытая модалка', async ({ page }) => {
  await page.goto('/')

  // Кнопка «Визитка» в шапке открывает модалку (компонент ClientOnly — клик
  // работает после гидрации, getByRole дожидается её появления).
  await page.getByRole('button', { name: 'Визитка' }).click()

  const card = page.getByTestId('business-card')
  await expect(card).toBeVisible()

  // На десктопе (≥ sm) показан QR — дождёмся его генерации, иначе в кадр
  // попадёт пульсирующий skeleton (на мобиле QR скрыт — ждать нечего).
  if ((page.viewportSize()?.width ?? 0) >= 640) {
    await expect(card.locator('img[alt^="QR"]')).toBeVisible()
  }

  // Фото — дождёмся фактической загрузки (visible ≠ loaded), чтобы кадр был стабилен.
  await card.locator('img[src="/igor.jpg"]').evaluate(
    (img: HTMLImageElement) => img.complete || new Promise<void>((r) => { img.onload = () => r() })
  )

  await expect(card).toContainText('ООО «БэИксШефБай»')
  const box = await card.boundingBox()
  expect(box?.width ?? 0).toBeLessThanOrEqual(page.viewportSize()?.width ?? 0)
})
