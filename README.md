# bx-shef.by — Lp

Лендинг ИП Шевчик: «Кастомная разработка под Битрикс24. AI, интеграции, MCP».

**Стек:** Nuxt 4 + `@bitrix24/b24ui-nuxt` + Tailwind v4 + TypeScript, статическая
генерация (`pnpm generate`), деплой на GitHub Pages с кастомным доменом `bx-shef.by`.

## Старт

```bash
pnpm install
pnpm dev              # локальный dev-сервер на http://localhost:3000
pnpm generate         # статическая сборка в .output/public/
pnpm preview          # предпросмотр сборки
pnpm og               # перегенерация public/og-image.png (один раз, коммитится)
pnpm lint             # ESLint
pnpm typecheck        # vue-tsc
```

`pnpm og` нужен только после изменений текста/палитры в `scripts/generate-og.mjs`
или замены `public/igor.jpg`. Готовая картинка лежит в репо — на каждый билд не нужна.

## ENV

Все переменные публичные (`NUXT_PUBLIC_*`), значения по умолчанию вшиты в `nuxt.config.ts`
и работают «из коробки». Переопределение через `.env` (см. `.env.example`) или
GitHub Actions Variables (для деплой-окружения).

| Переменная | Что |
|---|---|
| `NUXT_PUBLIC_SITE_URL` | Канонический URL для SEO/OG (по умолч. `https://bx-shef.by`) |
| `NUXT_PUBLIC_B24_FORM_ID` | ID веб-формы Битрикс24 |
| `NUXT_PUBLIC_B24_FORM_SECRET` | Публичный embed-идентификатор формы (не секрет) |
| `NUXT_PUBLIC_B24_FORM_SCRIPT_URL` | URL loader-скрипта формы (cdn-ru.bitrix24.by/...) |
| `NUXT_PUBLIC_COUNTER_NAMESPACE` | counterapi.dev namespace |
| `NUXT_PUBLIC_COUNTER_KEY` | counterapi.dev key |
| `NUXT_ALLOWED_HOSTS` | Только для dev-сервера через туннели (ngrok). В production не нужна |

## Деплой

GitHub Pages через `.github/workflows/deploy.yml`:

1. `push` в `main` (или ручной запуск) → CI чекает lint, typecheck, generate
2. Артефакт `.output/public` уезжает в GitHub Pages
3. Кастомный домен берётся из `public/CNAME`

DNS у регистратора домена: `CNAME bx-shef.by → <username>.github.io`.
SSL автоматически выдаётся GitHub Pages при включённой опции «Enforce HTTPS».

## Структура

```
app/
  app.vue              # B24App skeleton + SEO meta + header/footer
  app.config.ts        # b24ui тема (dark по умолчанию)
  error.vue            # NotFound/Error
  assets/css/main.css  # Tailwind + b24ui + brand-токены + self-hosted шрифты
  components/          # AppLogo, PartnerBadge, BriefForm, SiteFooter, VisitCounter
  composables/         # useCardGlow (mouse-follow glow на карточках)
  pages/               # index, privacy, legal
public/
  igor.jpg             # фото в карточке «не bus factor»
  og-image.png         # OG (генерируется через pnpm og)
  CNAME                # bx-shef.by для GH Pages
  favicon.ico
scripts/
  generate-og.mjs      # Playwright-рендер OG из HTML-шаблона
docs/
  copy-v6-proposal.md  # актуальная редакторская версия текстов
  copy-v5.md           # устаревшая (для истории)
  kp-pipeline-*.md     # внутренние методички (не отображается на сайте)
legacy/                # архив пред. итераций (статический HTML v1/v2)
```

## Заметки для следующего разработчика

- **`@bitrix24/b24ui-nuxt`** — официальная UI-библиотека Битрикс24. Выбрана осознанно
  для визуальной консистентности с экосистемой Б24 (полезно как сигнал клиенту).
  Минус: тяжёлый бандл. Альтернатива — переписать на чистый Tailwind, но потеряем сигнал.
- **dark по умолчанию** через `app.config.ts:colorModeInitialValue = 'dark'`. Палитра
  взята с `vibecode.bitrix24.tech` (cyan #00d4ff, partner-blue #0044e4).
- **Форма** через embed-скрипт Битрикс24 (см. `app/components/BriefForm.vue`).
  Подменить форму — через ENV `NUXT_PUBLIC_B24_FORM_*`, без перебилда.
- **Шрифты** — self-hosted через `@fontsource/rubik` и `@fontsource/roboto-mono`.
  Не зависим от Google Fonts CDN (важно для РБ/GDPR).
- **Счётчик посещений** — `counterapi.dev` (free, без cookies). Если упадёт —
  компонент молча скроется (`v-if="!isErr"`).
- **Тесты** — пока минимальные (Playwright smoke). Расширять по мере роста.

## Контакты

ИП Шевчик И. С., УНП 192049017, Минск. См. `/legal` и `/privacy`.
