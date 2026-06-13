import { defineConfig, devices } from '@playwright/test'

/**
 * Визуальный smoke (issue #59): ловит CSS/визуальные регрессы, которых не видят
 * lint/typecheck/generate. Гоняет chromium против собранной статики (pnpm preview).
 *
 * Эталоны генерируются на Linux (как и CI), шрифты в проекте self-hosted —
 * рендер детерминирован между окружениями. maxDiffPixelRatio даёт небольшой
 * допуск на субпиксельный антиалиасинг.
 *
 * Эталоны обновлять: pnpm test:visual:update (после намеренных UI-правок).
 */
export default defineConfig({
  testDir: './test/visual',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  // В CI: github-аннотации + html-отчёт с diff-картинками (грузится артефактом
  // на падении). Локально — компактный line.
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'line',
  expect: {
    toHaveScreenshot: { maxDiffPixelRatio: 0.02 }
  },
  use: {
    baseURL: 'http://localhost:3000',
    reducedMotion: 'reduce'
  },
  projects: [
    { name: 'mobile', use: { ...devices['Pixel 7'] } },
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 800 } } }
  ],
  // Поднимаем собранную статику через nuxt preview (требует предварительного
  // pnpm generate). В CI сервер стартует заново, локально — переиспользуется.
  webServer: {
    command: 'pnpm run preview',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000
  }
})
