# bx-shef.by — контекст для Claude Code
<!-- Last reviewed: 2026-11-09 -->

Лендинг ООО «БэИксШефБай» (специалист — Игорь Шевчик): Nuxt 4 + @bitrix24/b24ui-nuxt + Tailwind v4 + TypeScript.
Статическая генерация (SSG). Деплой: rsync на VPS через GitHub Actions.

## Команды

```bash
pnpm dev          # dev-сервер (localhost:3000)
pnpm generate     # статическая сборка → .output/public/
pnpm lint         # ESLint
pnpm typecheck    # vue-tsc
pnpm test         # vitest (юниты чистой логики из shared/)
pnpm test:visual  # Playwright visual smoke (требует pnpm generate; эталоны в test/visual)
make deploy       # выкатка руками без Actions (см. «Выкатка руками» в README.md)
pnpm og           # перегенерация og-image.png (только после смены текста/фото)
```

## Ключевые решения

- **@bitrix24/b24ui-nuxt** — тяжёлый бандл, выбран осознанно: визуальная консистентность с экосистемой Б24
- **dark-тема по умолчанию** — через `app.config.ts:colorModeInitialValue = 'dark'`
- **Шрифты self-hosted** — `@fontsource/rubik` и `@fontsource/roboto-mono` (нет зависимости от Google Fonts CDN)
- **Форма Б24** — embed через два script-тега, загрузка только через allowlist доменов (см. `BriefForm.vue`)
- **b24FormSecret** — публичный embed-идентификатор (не секрет, виден в HTML)
- **Ссылка онлайн-записи Б24** — `B24_BOOKING_URL` в `app/utils/booking.ts` (общий модуль для hero и визитки); при смене портала менять там, обновляется через пересборку
- **Яндекс Метрика** — inline в nuxt.config.ts, metrika ID переопределяем через ENV; цели через `useMetrikaGoal().reachGoal()` (brief_submit, booking_click, sticky_cta_click, bankimport_click, priceimport_click, obmen_click, card_copy_link, card_qr_reveal)
- **Воронка лендинга** — «два входа, одна точка»: первичный CTA «Описать задачу» (#brief), вторичный «Назначить созвон» (B24-запись). На мобиле первичный продублирован sticky-кнопкой (`MobileBriefCta.vue`). Инструменты-крючки вынесены в футер, вне зоны конверсии
- **HeroGraph** — уважает `prefers-reduced-motion` (статичный кадр), ставит анимацию на паузу при скрытой вкладке и при уходе канваса за экран (IntersectionObserver); рендер троттлится до 30fps (физика — каждый кадр). Узлы по 3 уровням иерархии (TIERS). Glow узлов — pre-baked offscreen-спрайты (`drawImage`), без `createRadialGradient` каждый кадр. Батарея/CPU на мобиле
- **BusinessCardModal** — настоящий диалог: `role="dialog"`/`aria-modal`/`aria-labelledby`, фокус переводится внутрь и возвращается на триггер, focus-trap на `Tab`, `Esc` закрывает
- **Готовность для ИИ-агентов** — `public/llms.txt` + ручные Markdown-двойники (`public/index.md`, `public/legal.md`), `<link rel="alternate" type="text/markdown">`/`describedby` в `app.vue` (`MARKDOWN_TWINS`), проверка `scripts/check-agent-readiness.sh` в CI. **Правка текста страницы = правка её двойника в том же PR**; оффер-блок в `llms.txt` и `index.md` должен совпадать. См. [`docs/agent-readiness.md`](docs/agent-readiness.md)
- **Гайд по лендингам** — [`docs/LANDING_GUIDE.md`](docs/LANDING_GUIDE.md): дизайн-система, каркас, правила анимации/a11y/формы, процесс (issue → единый источник → скриншоты → 5 ревью → PR) и разбор проделанной работы

- **Продавец — ООО «БэИксШефБай»** (решение владельца 08–09.11, bx-shef/toolsai#653). Данные продавца и ссылки на документы — `shared/legal.ts` (УНП и банк — заглушки `XXXXXXX`, выкатываем так). Политика ПД, cookie, оферты и соглашения живут на `license.bx-shef.by`, у нас — только прямые ссылки; `/privacy` — страница-указатель. Имя Игоря Шевчика — как специалиста — остаётся. Проверка статики — `scripts/check-legal.sh` (в CI и `make deploy`), юнит — `test/legal.test.ts`. Правка реквизитов = правка `public/legal.md`, оффер-блока и `llms.txt` в том же PR.

## Выкатка руками

`make deploy` (`scripts/deploy.sh`, `--dry` или `DRY=1` — только rsync `-n`); подробности — README. Секретов в репозитории нет, всё из окружения.

- `DEPLOY_HOST` (не с «-»), `DEPLOY_USER`, `DEPLOY_PATH` — обязательные. `DEPLOY_PATH` — абсолютный, не меньше трёх сегментов, только `[A-Za-z0-9._/-]`, без `..` и `//`, не «/»; иначе отказ. В удалённые команды путь идёт через `printf %q`.
- Бэкап: старый `.bak` удаляется, новый без `|| true`; не создан — выкатки нет; откат из `.bak` — только если бэкап этого запуска создан.
- Проверки (`check-legal.sh`, `check-agent-readiness.sh`) — явным `|| { …; exit 1; }`, не только `set -e`; тест `test/deploy.test.ts` убирает `set -e` и краснеет, если провал проверки доходит до rsync.
- `GITHUB_TOKEN` обязателен при сборке (иначе на проде пропадёт граф GitHub-активности); `ALLOW_NO_GITHUB=1` — без графа, с предупреждением.
- `NUXT_PUBLIC_B24_FORM_ID`, `NUXT_PUBLIC_B24_FORM_SECRET`, `NUXT_PUBLIC_B24_FORM_SCRIPT_URL`, `NUXT_PUBLIC_METRIKA_ID` — из окружения (как `vars` в `deploy.yml`); не заданы — дефолты `nuxt.config.ts` с предупреждением. `NUXT_PUBLIC_BUILD_ID` — 7 знаков хеша HEAD.
- `check-legal.sh` смотрит и `_nuxt/*.js`, ловит `ИП&nbsp;Шевчик` и U+00A0.

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
shared/
  github-contrib.ts   # типы + чистая логика графа (weeks/monthLabels/level), общая для server и компонента
test/
  *.test.ts           # vitest-юниты чистой логики из shared/
public/
  igor.jpg / og-image.png / CNAME / favicon.ico
  llms.txt / index.md / legal.md  # для ИИ-агентов (см. docs/agent-readiness.md)
  robots.txt / sitemap.xml
scripts/
  generate-og.mjs     # Playwright-рендер OG 1200×630
  check-agent-readiness.sh  # проверка статики для агентов (CI + локально)
docs/server/
  agents.htaccess     # блок .htaccess для BitrixVM/Apache: MIME .md, negotiation, Link (ставится руками)
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
| NUXT_PUBLIC_SITE_URL | https://offer.bx-shef.by |
| NUXT_PUBLIC_B24_FORM_ID | 1 |
| NUXT_PUBLIC_B24_FORM_SECRET | 3c735r |
| NUXT_PUBLIC_B24_FORM_SCRIPT_URL | cdn-ru.bitrix24.by/... |
| NUXT_PUBLIC_METRIKA_ID | 109399587 |
| NUXT_PUBLIC_BUILD_ID | (пусто → 'dev'; в CI = github.sha, первые 7 символов) |
| NUXT_ALLOWED_HOSTS | (только для dev-туннелей) |
| GITHUB_TOKEN | авто-выдаётся GitHub Actions; для local dev — Personal Access Token с scope `read:user` |
