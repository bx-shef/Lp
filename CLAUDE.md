# bx-shef.by — контекст для Claude Code

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
- **Яндекс Метрика** — inline в nuxt.config.ts, metrika ID переопределяем через ENV

## Структура

```
app/
  app.vue             # SEO, Schema.org, B24App skeleton, header/footer
  app.config.ts       # b24ui тема
  pages/              # index, privacy, legal
  components/         # AppLogo, PartnerBadge, BriefForm, SiteFooter, BusinessCardModal
  composables/        # useCardGlow (mouse-follow glow)
  assets/css/main.css # Tailwind + b24ui + brand-токены
public/
  igor.jpg / og-image.png / CNAME / favicon.ico
scripts/
  generate-og.mjs     # Playwright-рендер OG 1200×630
docs/
  copy-v6-proposal.md # актуальные тексты лендинга
  handoff-*.md        # handoff-документы (самый новый — актуален)
legacy/               # архив: старые версии HTML и тексты
.github/workflows/
  deploy.yml          # build → validate → rsync → smoke-test
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
| NUXT_ALLOWED_HOSTS | (только для dev-туннелей) |
