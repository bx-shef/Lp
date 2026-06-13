import { test, expect } from '@playwright/test'

/**
 * Визуальный smoke попап-визитки (BusinessCardModal) — компонент, который
 * чаще всего правится визуально (отступы, сегмент-кнопки, QR). Детерминирован:
 * фото статичное, QR кодирует фиксированный URL, динамики/токенов нет.
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

  await expect(card).toHaveScreenshot('business-card.png')
})
