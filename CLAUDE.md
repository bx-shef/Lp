# bx-shef.by — контекст для Claude Code
<!-- Last reviewed: 2026-05-31 -->

Лендинг ИП Шевчик: Nuxt 4 + @bitrix24/b24ui-nuxt + Tailwind v4 + TypeScript.
Статическая генерация (SSG). Деплой: rsync на VPS через GitHub Actions.

## Команды

```bash
pnpm dev          # dev-сервер (localhost:3000)
pnpm generate     # статическая сборка → .output/public/
pnpm lint         # ESLint
pnpm typecheck    # vue-tsc
pnpm og           # перегенерация og-image.png (только после смены текста/фото)
```

## Ключевые решения

- **@bitrix24/b24ui-nuxt** — тяжёлый бандл, выбран осознанно: визуальная консистентность с экосистемой Б24
- **dark-тема по умолчанию** — через `app.config.ts:colorModeInitialValue = 'dark'`
- **Шрифты self-hosted** — `@fontsource/rubik` и `@fontsource/roboto-mono` (нет зависимости от Google Fonts CDN)
- **Форма Б24** — embed через два script-тега, загрузка только через allowlist доменов (см. `BriefForm.vue`)
- **b24FormSecret** — публичный embed-идентификатор (не секрет, виден в HTML)
- **Ссылка онлайн-записи Б24** — `B24_BOOKING_URL` в `app/utils/booking.ts` (общий модуль для hero и визитки); при смене портала менять там, обновляется через пересборку
- **Яндекс Метрика** — inline в nuxt.config.ts, metrika ID переопределяем через ENV; цели через `useMetrikaGoal().reachGoal()` (brief_submit, booking_click, sticky_cta_click)
- **Воронка лендинга** — «два входа, одна точка»: первичный CTA «Описать задачу» (#brief), вторичный «Назначить созвон» (B24-запись). На мобиле первичный продублирован sticky-кнопкой (`MobileBriefCta.vue`). Инструменты-крючки вынесены в футер, вне зоны конверсии
- **HeroGraph** — уважает `prefers-reduced-motion` (статичный кадр) и ставит анимацию на паузу при скрытой вкладке (батарея/CPU на мобиле)

## Структура

```
app/
  app.vue             # SEO, Schema.org, B24App skeleton, header/footer
  app.config.ts       # b24ui тема
  pages/              # index, privacy, legal
  components/
    AppLogo, PartnerBadge, BriefForm, SiteFooter, BusinessCardModal
    HeroGraph.vue     # canvas force-directed граф (анимация фона hero)
    GithubContrib.vue # heatmap GitHub-контрибуций (данные из SSG prerender)
    MobileBriefCta.vue # sticky-CTA «Описать задачу» на мобиле (IntersectionObserver)
  composables/        # useCardGlow (mouse-follow glow), useMetrikaGoal (reachGoal)
  utils/              # booking.ts → B24_BOOKING_URL (общая ссылка записи Б24)
  assets/css/main.css # Tailwind + b24ui + brand-токены
server/
  api/
    github-contrib.get.ts  # GraphQL → GitHub API, вызывается при pnpm generate
public/
  igor.jpg / og-image.png / CNAME / favicon.ico
scripts/
  generate-og.mjs     # Playwright-рендер OG 1200×630
docs/
  handoff-*.md        # handoff-документы (самый новый — актуален)
legacy/               # архив: старые версии HTML и тексты
.github/workflows/
  deploy.yml          # build → validate → rsync → smoke-test;
                      # + cron 22:00 UTC (01:00 Минск) — ежедневный пересбор,
                      #   чтобы GitHub-граф контрибуций не устаревал в статике
```

## Стиль кода

- Vue `<script setup lang="ts">` + Composition API
- Интерфейсы TypeScript для всех данных (ServiceItem, DifferentiatorItem и т.п.)
- v-for с `:key` по семантическому id (не индексу)
- Комментарии только когда WHY неочевиден
- ESLint: `@typescript-eslint/no-explicit-any: error`

## Переменные окружения (все публичные)

| Переменная | Дефолт |
|---|---|
| NUXT_PUBLIC_SITE_URL | https://bx-shef.by |
| NUXT_PUBLIC_B24_FORM_ID | 1 |
| NUXT_PUBLIC_B24_FORM_SECRET | 3c735r |
| NUXT_PUBLIC_B24_FORM_SCRIPT_URL | cdn-ru.bitrix24.by/... |
| NUXT_PUBLIC_METRIKA_ID | 109399587 |
| NUXT_PUBLIC_BUILD_ID | (пусто → 'dev'; в CI = github.sha, первые 7 символов) |
| NUXT_ALLOWED_HOSTS | (только для dev-туннелей) |
| GITHUB_TOKEN | авто-выдаётся GitHub Actions; для local dev — Personal Access Token с scope `read:user` |
