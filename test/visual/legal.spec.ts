import { test, expect } from '@playwright/test'

/**
 * Визуальный smoke страницы реквизитов /legal — статична и детерминирована
 * (нет графа/токенов/анимаций), хороший кандидат на эталон. Ловит регресс
 * вёрстки таблиц реквизитов и кнопок копирования.
 */
test('реквизиты — страница /legal', async ({ page }) => {
  await page.goto('/legal')
  await expect(page.getByRole('heading', { name: 'Реквизиты', level: 1 })).toBeVisible()
  await expect(page).toHaveScreenshot('legal.png', { fullPage: true })
})
