/**
 * Единый источник маркетингового контента и SEO лендинга — чтобы заголовок hero
 * и `<title>`/meta не расходились по разным файлам (см. docs/LANDING_GUIDE.md §8:
 * H1 в index.vue и title в app.vue раньше жили раздельно).
 */
export const SITE_NAME = 'bx-shef.by'

/** Бренд-слово (акцент cyan в H1) — держим в одном месте, отсюда же в SEO-title. */
export const BRAND = 'Битрикс24'

// Hero H1 рендерится с переносом строки и cyan-акцентом на бренд-слове.
export const HERO_TITLE_TOP = 'Кастомная разработка'
export const HERO_TITLE_PRE = 'под '
export const HERO_TITLE_ACCENT = BRAND

/** SEO — намеренно длиннее H1 (ключевые слова для поисковиков/шеринга). */
export const SEO_TITLE = `Кастомная разработка под ${BRAND}: AI, интеграции, MCP-серверы | ${SITE_NAME}`
export const SEO_DESCRIPTION = 'Разрабатываю AI-помощников, интеграции и MCP-серверы для Битрикс24. Беру задачи, которые маркетплейс не закрывает. Разбор задачи — 30 минут, бесплатно.'
