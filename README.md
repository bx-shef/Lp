# bx-shef.by — Lp

Лендинг ИП Шевчик: «Кастомная разработка под Битрикс24. AI, интеграции, MCP».

**Стек:** Nuxt 4 + `@bitrix24/b24ui-nuxt` + Tailwind v4 + TypeScript, статическая
генерация (`pnpm generate`), деплой на собственный хостинг. Контент живёт на
`offer.bx-shef.by` (apex `bx-shef.by` 301-редиректит сюда).

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
| `NUXT_PUBLIC_SITE_URL` | Канонический URL для SEO/OG (по умолч. `https://offer.bx-shef.by`) |
| `NUXT_PUBLIC_B24_FORM_ID` | ID веб-формы Битрикс24 |
| `NUXT_PUBLIC_B24_FORM_SECRET` | Публичный embed-идентификатор формы (не секрет) |
| `NUXT_PUBLIC_B24_FORM_SCRIPT_URL` | URL loader-скрипта формы (cdn-ru.bitrix24.by/...) |
| `NUXT_PUBLIC_METRIKA_ID` | ID счётчика Яндекс Метрики (по умолч. `109399587`) |
| `NUXT_ALLOWED_HOSTS` | Только для dev-сервера через туннели (ngrok). В production не нужна |

## Деплой

Через `.github/workflows/deploy.yml`:

1. `push` в `main` (или ручной запуск) → CI чекает lint, typecheck, generate
2. Артефакт `.output/public` упаковывается и готов к выгрузке на хостинг
3. Залить содержимое `.output/public/` в корень веб-хоста (FTP, rsync или панель хостинга)

SSL настраивается на стороне хостинга (Let's Encrypt или сертификат провайдера).

### VPS (автоматический деплой через rsync)

Тот же артефакт синхронизируется на сервер через rsync/SSH. Job пропускается
автоматически если `DEPLOY_HOST` не задан — безопасно для форков и PRs.

**Секреты** (Settings → Secrets and variables → Actions → New repository secret):

| Секрет | Что | Пример |
|---|---|---|
| `DEPLOY_SSH_KEY` | Приватный ed25519-ключ для подключения | `-----BEGIN OPENSSH...` |
| `DEPLOY_HOST` | IP или hostname сервера | `192.168.1.1` |
| `DEPLOY_PORT` | SSH-порт | `2202` |
| `DEPLOY_USER` | SSH-пользователь | `bitrix` |
| `DEPLOY_PATH` | Путь к веб-руту на сервере | `/home/bitrix/www` |
| `DEPLOY_HOST_KEY` | *(опционально)* Строка fingerprint сервера — защита от MITM. Получить: `ssh-keyscan -p PORT HOST \| grep ed25519` | `hostname ssh-ed25519 AAAA...` |

**Настройка ключа на сервере (один раз):**

```bash
mkdir -p /home/bitrix/.ssh
# Сгенерировать ключ (приватный → в GitHub Secret DEPLOY_SSH_KEY):
ssh-keygen -t ed25519 -C "github-deploy" -f /root/.ssh/github_deploy -N ""
# Разрешить подключение от этого ключа для юзера bitrix:
cat /root/.ssh/github_deploy.pub >> /home/bitrix/.ssh/authorized_keys
chmod 700 /home/bitrix/.ssh && chmod 600 /home/bitrix/.ssh/authorized_keys
chown -R bitrix:bitrix /home/bitrix/.ssh
```

После rsync job проверяет что `index.html` появился на сервере и что nginx
отдаёт страницу на `localhost`. Перед синхронизацией создаётся backup
предыдущей версии (`DEPLOY_PATH.bak`) для ручного rollback.

## Структура

```
app/
  app.vue              # B24App skeleton + SEO meta + header/footer
  app.config.ts        # b24ui тема (dark по умолчанию)
  error.vue            # NotFound/Error
  assets/css/main.css  # Tailwind + b24ui + brand-токены + self-hosted шрифты
  components/          # AppLogo, PartnerBadge, BriefForm, SiteFooter
  composables/         # useCardGlow (mouse-follow glow на карточках)
  pages/               # index, privacy, legal
public/
  igor.jpg             # фото в карточке «не bus factor»
  og-image.png         # OG (генерируется через pnpm og)
  CNAME                # домен offer.bx-shef.by
  favicon.ico
scripts/
  generate-og.mjs      # Playwright-рендер OG из HTML-шаблона
docs/
  copy-v6-proposal.md  # актуальная редакторская версия текстов
  copy-v5.md           # устаревшая (для истории)
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
- **Аналитика** — Яндекс Метрика (счётчик `NUXT_PUBLIC_METRIKA_ID`, дефолт `109399587`).
  Включены Вебвизор и clickmap. ID можно переопределить через ENV без перебилда.
- **Тесты** — CI запускает lint + typecheck + generate + validate output. Playwright в devDependencies используется только для `pnpm og` (рендер OG-картинки). E2e-тесты не написаны — если потребуются, добавить `playwright.config.ts`.

## Контакты

ИП Шевчик И. С., УНП 192049017, Минск. См. `/legal` и `/privacy`.
