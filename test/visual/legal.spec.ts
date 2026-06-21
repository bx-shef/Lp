import { test, expect } from '@playwright/test'

/**
 * Визуальный smoke страницы реквизитов /legal — ловит регресс вёрстки таблиц
 * реквизитов и кнопок копирования. Снимаем именно контейнер реквизитов
 * (`legal-content`), а не fullPage: глобальный футер содержит build-id и год,
 * меняющиеся между сборками — в кадре их быть не должно (детерминизм).
 */
test('реквизиты — страница /legal', async ({ page }) => {
  await page.goto('/legal')
  const content = page.getByTestId('legal-content')
  await expect(content).toBeVisible()
  await expect(content).toHaveScreenshot('legal.png')
})
