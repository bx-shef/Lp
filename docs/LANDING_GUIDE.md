# Гайд: как делать посадочные страницы bx-shef

> Last reviewed: 2026-07-03

Инструкция по дизайну, стеку, процессу и **настройке** лендингов в экосистеме
`bx-shef` (основной сайт `offer.bx-shef.by` и продуктовые лендинги вроде
`bank-import.bx-shef.by`). Держим одинаковый вид и одинаковый порядок работы —
чтобы новые страницы получались «как надо» с первого раза. Конфигурация (env,
форма, Метрика, деплой) — в §9.

---

## 1. Что это за дизайн (визуальный язык)

Тёмная брендовая тема в стилистике vibecode.bitrix24.tech:

- **Фон** — глубокий синий `#030022` + два слоя радиального сияния (cyan сверху,
  purple снизу-справа), `background-attachment: fixed`.
- **Акценты** — cyan `#00d4ff` (главный), brand-blue `#0044e4` (партнёрский),
  success `#34e8bb`, special `#bc4aff`. Все — CSS-переменные `--color-accent-*-ch`
  в `app/assets/css/main.css` (формат «R G B» под `rgb(var(--…)/alpha)`).
- **Шрифты** — self-hosted `Rubik` (текст) + `Roboto Mono` (моно/технические
  подписи). Без Google Fonts CDN (`@fontsource/*`).
- **Карточки** — `rounded-2xl border border-white/10 bg-white/[0.03]`, при
  наведении подсветка-glow за курсором (`data-glow-card` + `useCardGlow`).
- **Кнопки** — b24ui `B24Button` с air-цветами: `air-primary` (главный CTA),
  `air-secondary-no-accent` (вторичный), `air-tertiary-no-accent` (третичный).
- **Хром** — b24ui `B24App`/`B24Header`/`B24Footer`/`B24Separator`
  (логотип `AppLogo`, навигация `B24NavigationMenu`, подвал `SiteFooter`).

**Правило:** цвета/отступы/типографику берём из существующих компонентов и
токенов, не вводим новые «на глаз». Тёмная тема — по умолчанию
(`app.config.ts: colorModeInitialValue = 'dark'`).

## 2. Структура лендинга (проверенный каркас)

1. **Hero** — `HeroGraph` (canvas-фон), бейдж «Партнёр Битрикс24»
   (`PartnerBadge`), H1 с cyan-акцентом на ключевом слове, подзаголовок, пара
   CTA, мелкая подпись, tech-строка (модели/банки/форматы). Фото — справа на
   desktop, первым на мобиле.
2. **Боль → результат** — две карточки (нейтральная «Было» + success «Стало»).
3. **Как это работает** — 3 нумерованных шага (моно-номер cyan).
4. **Почему мы / что делаю** — сетка карточек-преимуществ (glow).
5. **Целевой блок** (интеграторам / услуга) — градиентная карточка.
6. **Форма заявки** — встроенная CRM-форма B24 в тёмной градиентной карточке.
7. **Sticky-CTA на мобиле** (`MobileBriefCta`).

**Воронка — «два входа, одна точка».** Главный CTA ведёт к форме (`#brief`),
вторичный — на онлайн-запись Б24 (`B24_BOOKING_URL`). Инструменты-крючки и
второстепенные ссылки — в подвал, вне зоны конверсии.

## 3. Ключевые компоненты и где что лежит

| Что | Файл |
|-----|------|
| Тексты/контент лендинга (единый источник) | `app/pages/index.vue` (данные вверху `<script>`), у продуктовых — `app/utils/landing.ts` |
| Анимация фона hero | `app/components/HeroGraph.vue` |
| Визитка (модалка) | `app/components/BusinessCardModal.vue` |
| Встроенная CRM-форма B24 | `app/components/BriefForm.vue` |
| Подвал (реквизиты, инструменты, коммит-ссылка) | `app/components/SiteFooter.vue` |
| Логотип / партнёрский бейдж | `app/components/AppLogo.vue`, `PartnerBadge.vue` |
| Sticky-CTA (мобайл) | `app/components/MobileBriefCta.vue` |
| Glow за курсором | `app/composables/useCardGlow.ts` |
| Цели Метрики | `app/composables/useMetrikaGoal.ts` |
| Ссылка онлайн-записи Б24 | `app/utils/booking.ts` |
| Тема/токены/фон/glow | `app/assets/css/main.css` |

**Единый источник контента и SEO.** H1/описание и SEO-title не должны
расходиться. На основном сайте они берут из `app/utils/content.ts` (бренд-слово,
`HERO_TITLE_*`, `SEO_TITLE`/`SEO_DESCRIPTION`): H1 (`app/pages/index.vue`) и
`title`/meta (`app/app.vue`) читают оттуда — по файлам разъехаться уже не могут.
На продуктовых лендингах роль такого модуля играет `app/utils/landing.ts`.

## 4. Обязательные требования к анимации фона (`HeroGraph`)

Красиво — но не в ущерб батарее/CPU. Любая canvas-анимация обязана:

- уважать `prefers-reduced-motion` — рисовать один статичный кадр;
- **ставиться на паузу** при скрытой вкладке (`visibilitychange`) и когда канвас
  ушёл из вида (`IntersectionObserver`);
- троттлить **рендер** до ~30fps (физику можно каждый кадр — она дешёвая);
- чистить всё в `onUnmounted` (RAF, обсерверы, слушатели);
- держать узлы/частицы вне зоны фото и текста — репеллер зоны фото (на desktop
  обязательно; на мобиле желательно — в HeroGraph основного сайта он пока
  desktop-only, а в продуктовом лендинге `bank-import` включён и на мобиле);
- **пере-использовать статичные градиенты**: glow узлов запекаем один раз в
  offscreen-спрайты и рисуем `drawImage`, а не `createRadialGradient` каждый кадр.

Два рабочих варианта фона: force-directed «облако» вокруг фото (основной сайт) и
«импульсы, бегущие в центральный хаб» (продуктовый лендинг). Оба — по правилам выше.

## 5. Форма и Метрика

- Форма — официальный embed CRM-формы Bitrix24, загрузка скрипта только через
  **allowlist доменов** Б24 (`.bitrix24.by/.ru/.com/.kz/.tech`) и валидацию
  id/secret. На продуктовом лендинге форма вынесена в изолированный same-origin
  документ со своим form-scoped CSP — чтобы строгий CSP страницы не ослаблять.
- Событие сабмита формы → цель Метрики `brief_submit` (через `postMessage`,
  т.к. событие живёт внутри iframe).
- Цели Метрики — только через `useMetrikaGoal().reachGoal()`, snake_case
  (`brief_submit`, `booking_click`, `sticky_cta_click`, `bankimport_click`, …).
  Новую цель после добавления надо зарегистрировать в кабинете Метрики.

## 6. Доступность (a11y) — минимум для модалок

Модальная визитка обязана быть настоящим диалогом:

- `role="dialog"`, `aria-modal="true"`, `aria-labelledby` на заголовок;
- фокус переводится **внутрь** при открытии и **возвращается на триггер** при
  закрытии;
- **focus-trap**: `Tab`/`Shift+Tab` циклятся внутри диалога;
- `Esc` закрывает; скролл body блокируется на время открытия.

## 7. Процесс работы над лендингом (Definition of Done)

1. Требования — в **issue** (маркетолог/владелец). Тексты используем дословно.
2. Контент — в единый источник (константы/`landing.ts`), не хардкодим по шаблону.
3. Реализация — чистую логику в `app/utils/*` (+тесты), реактивную в
   `composables/*`, UI в компонентах.
4. **Визуальная верификация обязательна:** `pnpm generate` → скриншот
   (mobile/desktop, и обязательно открытую модалку/анимацию) → **смотреть на
   пиксели**, а не верить «собралось».
5. **5 проверяющих ревью** параллельно (perf/lifecycle, ссылки/навигация,
   визуал/UX, deploy/CSP/тема, correctness/a11y) → замечания устранить.
6. `pnpm lint && pnpm typecheck && pnpm test` — зелёные; для Lp ещё
   `pnpm test:visual` (снапшоты визитки и `/legal`).
7. PR (не в `main` напрямую), после зелёного CI — squash-merge. Деплой Lp —
   rsync на VPS через GitHub Actions.

## 8. Анализ этой работы (что делали и почему)

Кратко — что было сделано в ходе создания продуктового лендинга
`bank-import.bx-shef.by` и параллельных правок, чтобы не повторять грабли:

**Что делали.** Собрали продуктовый лендинг импорта выписки клиент-банка,
переиспользовав визуальную оболочку `offer.bx-shef.by` (шапка, тёмная тема,
hero+граф, подвал, визитка, форма), с контентом из маркетинг-issue.

**Что просили улучшить/исправить (и как решили):**

| Замечание | Решение |
|-----------|---------|
| Сначала сделали «своё», не как offer.bx-shef.by | Перенесли оболочку 1:1, тему форсим только для лендинга, in-portal страницы не трогаем |
| Не было шапки/подвала, фон не тот, форма на белом фоне | Портировали `B24Header`/`SiteFooter`, тёмный фон-токены, тёмный контейнер формы |
| В визитке не было QR по нажатию | Полная визитка с QR (десктоп + мобильный hold-to-reveal) |
| Hero не 1:1 (уменьшили размеры) | Вернули точные размеры оригинала |
| Анимацию графа заменить на «импульсы в центр» | Переписали на импульсы к хабу; хаб — в открытой зоне, не за фото |
| QR вёл не туда | Направили на нужный домен продукта |
| Вернуть «Документацию»/добавить «Операторам» в меню; коммит-ссылку в подвал | Сделали |

**Выводы (грабли → правила):**

- «Похоже» ≠ «как в образце»: если просят повторить страницу — берём оболочку
  **1:1** и меняем только контент.
- Тёмную оболочку вешаем **отдельным layout** и форсим dark **только на лендинге**
  (`data-force-dark`), чтобы не сломать светлые in-portal страницы.
- Брендовый фон должен быть в **SSR-кадре** (на `html[data-force-dark] body`), а
  не появляться после гидрации.
- После правки UI — **обязательно скриншот** (в т.ч. открытая модалка/анимация).
- Единый источник контента ловит расхождение H1 и SEO-title.
- Чистые куски (билдер vCard, сборка URL формы) выносим в `utils` и покрываем
  тестами; inline-копии в разных местах ловим drift-тестом.

## 9. Настройка и запуск (env, форма, Метрика, деплой)

Справочник по конфигурации — сверено с кодом (`nuxt.config.ts`, `.github/workflows/`).

### Команды (`package.json`)

```bash
pnpm dev                  # дев-сервер (localhost:3000)
pnpm generate             # SSG-сборка → .output/public/
pnpm lint                 # ESLint
pnpm typecheck            # nuxt typecheck (vue-tsc)
pnpm test                 # vitest (юниты чистой логики из shared/)
pnpm test:visual          # Playwright visual smoke (нужен pnpm generate; эталоны — test/visual)
pnpm test:visual:update   # перегенерировать эталоны снапшотов (после осознанной правки вида)
pnpm og                   # перегенерация public/og-image.png (после смены текста/фото)
```

### Переменные окружения (все `NUXT_PUBLIC_*` — публичные, видны в HTML)

| Переменная | Где читается | Дефолт | Назначение |
|-----------|--------------|--------|------------|
| `NUXT_PUBLIC_SITE_URL` | `nuxt.config.ts` → `siteUrl` | `https://offer.bx-shef.by` | канонический URL, og/twitter, canonical, Schema.org |
| `NUXT_PUBLIC_METRIKA_ID` | `nuxt.config.ts` (фильтр `\D` — только цифры) | `109399587` | id счётчика Метрики; пустой ⇒ счётчик не вставляется |
| `NUXT_PUBLIC_B24_FORM_ID` | `runtimeConfig.public` → `BriefForm.vue` | `1` | id встроенной CRM-формы Б24 |
| `NUXT_PUBLIC_B24_FORM_SECRET` | там же | `3c735r` | публичный embed-секрет формы (не тайна) |
| `NUXT_PUBLIC_B24_FORM_SCRIPT_URL` | там же | `…/b37817748/crm/form/loader_1.js` | URL загрузчика формы (хост из allowlist Б24) |
| `NUXT_PUBLIC_BUILD_ID` | `runtimeConfig.public` → подвал | `dev` (в CI — `github.sha`) | коммит сборки в подвале |
| `NUXT_ALLOWED_HOSTS` | `nuxt.config.ts` → vite | — | только для dev-туннелей (доп. hostnames) |
| `GITHUB_TOKEN` | `server/api/github-contrib.get.ts` | — | GraphQL для heatmap контрибуций (в Actions выдаётся авто; локально — PAT scope `read:user`) |
| `PLAYWRIGHT_CHROMIUM_PATH` | `scripts/generate-og.mjs` | — | путь к Chromium для `pnpm og` (если бандл Playwright не найден); иначе — авто |

### Настроить B24-форму

Форма — официальный embed CRM-формы Bitrix24 (`app/components/BriefForm.vue`), скрипт
грузится **только с allowlist-доменов** Б24 (`.bitrix24.com/.by/.ru/.kz/.tech`) + валидация
id/secret. По умолчанию вшита форма #1 портала `b37817748`. Сменить форму — задать три
`NUXT_PUBLIC_B24_FORM_*` (id, secret, script-url из конструктора формы Б24). Пустые
значения ⇒ остаются дефолты (в CI пустые `vars` не перебивают дефолт — см. деплой).

### Настроить Метрику и цели

Счётчик — inline-сниппет в `nuxt.config.ts` (обязан быть в HTML для валидатора Метрики),
id из `NUXT_PUBLIC_METRIKA_ID`. Цели шлём **только** через `useMetrikaGoal().reachGoal()`.
Список целей в коде: `brief_submit` (сабмит формы, `BriefForm.vue`), `booking_click`,
`sticky_cta_click`, `bankimport_click`, `card_copy_link`, `card_qr_reveal`. **Новую цель
после добавления надо завести в кабинете Метрики** — иначе события не считаются.

### Прочая конфигурация

- Ссылка онлайн-записи Б24 — `app/utils/booking.ts` (`B24_BOOKING_URL`); при смене портала — там.
- Тема — `app/app.config.ts` (`colorModeInitialValue: 'dark'`, ключ хранения `bx-shef-lp`).
- Домен — `public/CNAME` (`offer.bx-shef.by`); фавикон версионируется (`?v=3`); `theme-color` `#030022`.
- Единый источник контента/SEO — `app/utils/content.ts` (H1 + `SEO_TITLE`/`SEO_DESCRIPTION`).
- Пререндер — `nitro.prerender.routes` (`/`, `/api/github-contrib`) + `crawlLinks` (тянет `/privacy`, `/legal`).

### Деплой (GitHub Actions → rsync на VPS)

- **CI на ветках** (`ci.yml`, всё кроме `main`) → переиспользует `build.yml`: lint → typecheck →
  test → generate → `test:visual`. Это и есть проверки PR.
- **Деплой** (`deploy.yml`) — на push в `main` **и по cron `0 22 * * *`** (ежедневный пересбор,
  чтобы GitHub-граф контрибуций не устаревал в статике). Сначала `build.yml`, затем `rsync`
  (`--delete --checksum`, с бэкапом `.bak` и авто-rollback) на VPS + smoke (проверка `index.html`
  и `og:image`).
- **Конфиг сборки в CI берётся из GitHub-настроек репо, не из кода:**
  - **Variables** (`Settings → Secrets and variables → Actions → Variables`):
    `NUXT_PUBLIC_B24_FORM_ID/SECRET/SCRIPT_URL` — пустые **пропускаются шагом сборки**
    (`build.yml`), остаются дефолты; `NUXT_PUBLIC_METRIKA_ID` — передаётся всегда, но
    пустой падает в дефолт через `|| '…'` и фильтр `\D` в `nuxt.config.ts`. Итог для обоих:
    не задал ⇒ дефолт.
  - **Secrets**: `DEPLOY_HOST`, `DEPLOY_USER`, `DEPLOY_PORT`, `DEPLOY_PATH`, `DEPLOY_SSH_KEY`,
    `DEPLOY_HOST_KEY` (пиннинг ключа хоста — без него keyscan отключён, деплой падает, анти-MITM).
  - Внешние GitHub-экшены запинены к commit-SHA (guard в `build.yml` роняет сборку при откате к `@vN`).

## 10. Чеклист перед PR

- [ ] Тексты — из issue, в едином источнике; H1 = SEO title.
- [ ] Секции по каркасу §2; воронка «два входа, одна точка».
- [ ] Тема/токены/шрифты — существующие, без «новых на глаз».
- [ ] Анимация фона по правилам §4 (пауза/reduced-motion/30fps/спрайты/repel).
- [ ] Модалки — диалог по §6 (role/aria/focus-trap/restore).
- [ ] Форма — allowlist доменов, цель `brief_submit`.
- [ ] `lint`/`typecheck`/`test`(+`test:visual`) зелёные; `generate` собирается.
- [ ] Скриншоты mobile/desktop сняты и просмотрены.
- [ ] 5 ревью пройдены, замечания устранены.
