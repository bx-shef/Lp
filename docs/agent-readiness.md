# Готовность offer.bx-shef.by для ИИ-агентов

> Правило для сайтов bx-shef.by — [`bx-shef/obmen/docs/agent-readiness.md`](https://github.com/bx-shef/obmen/blob/main/docs/agent-readiness.md).
> Здесь — как оно применено к этому лендингу и что осталось на стороне сервера.

## Что опубликовано

| URL | Источник | Зачем |
|---|---|---|
| `/llms.txt` | `public/llms.txt` | Индекс для агентов: кто, что делает, условия, контакт, ссылки |
| `/index.md` | `public/index.md` | Markdown-двойник главной (пишется вручную) |
| `/legal.md` | `public/legal.md` | Markdown-двойник реквизитов |
| `/robots.txt` | `public/robots.txt` | `Allow: /` для всех + ссылка на sitemap |
| `/sitemap.xml` | `public/sitemap.xml` | Три HTML-страницы; двойники `.md` сюда не входят |

В `<head>` каждой страницы (`app/app.vue`):

- `<link rel="canonical">` — на URL **этой** страницы (раньше `/legal/` и `/privacy/` указывали на главную);
- `<link rel="describedby" href="…/llms.txt">`;
- `<link rel="alternate" type="text/markdown">` — только у страниц с двойником (карта `MARKDOWN_TWINS`);
- OG-карточка: `og:image` + `:type`/`:width`/`:height`/`:alt`, `twitter:card=summary_large_image`, `twitter:image`.

`/privacy/` без двойника: агенту он не нужен, ссылка на HTML есть в `## Optional` в `llms.txt`.

## Где живёт текст — править вместе, в одном PR

| Что | Для людей | Для агентов |
|---|---|---|
| Главная | `app/pages/index.vue`, `app/utils/content.ts` | `public/index.md` |
| Условия (оффер-блок) | `app/pages/index.vue` (процесс, «возьмусь / не возьмусь») | `public/llms.txt` **и** `public/index.md` — блок между `<!-- offer:start -->` и `<!-- offer:end -->`, байт в байт |
| Реквизиты | `app/pages/legal.vue` | `public/legal.md` |
| Ссылка онлайн-записи | `app/utils/booking.ts` | `public/llms.txt`, `public/index.md` |

Тон — факты для человека в третьем лице, без обращений к агенту («тема письма `[AI] …` — пометка, что письмо составил ИИ-агент», а не «ИИ-ассистент, ставь [AI]»). Цифр, которых нет на сайте, в двойники не добавлять.

## Проверки

`scripts/check-agent-readiness.sh [.output/public]` — после `pnpm generate`, тот же скрипт в CI (шаг «Agent readiness» в `build.yml`). Проверяет: `llms.txt` (H1, разделы, `## Optional`), двойники и `<link>`-ы на каждой странице, одинаковый оффер-блок, что каждая ссылка `https://offer.bx-shef.by/…` из `llms.txt` и `.md` ведёт на файл статики и без приклеенной пунктуации, `robots.txt` не закрывает сайт, `sitemap.xml`, OG-теги и PNG 1200×630.

При добавлении страницы с двойником — дописать её в `MARKDOWN_TWINS` (`app/app.vue`) **и** в `TWINS`/`PAGES` скрипта.

После деплоя — руками против прода:

```bash
S=https://offer.bx-shef.by
curl -s -o /dev/null -w '%{http_code} %{content_type}\n' $S/llms.txt   # 200 text/plain; charset=utf-8
curl -s -o /dev/null -w '%{http_code} %{content_type}\n' $S/index.md   # 200 text/markdown; charset=utf-8
curl -s $S/ | grep -oE '<link rel="(canonical|alternate|describedby)"[^>]*>'
```

## Сервер (не в репозитории, делается руками)

Сайт отдаёт nginx → Apache (BitrixVM); конфиг сервера деплоем не трогается (`rsync` исключает `.htaccess`). Статика выше работает и без правок сервера. Что даёт только сервер:

1. **MIME и кодировка для `.md`.** Нужно `text/markdown; charset=utf-8`, иначе кириллица у части агентов станет кракозябрами. Проверить первой командой выше; если тип другой — добавить `text/markdown md;` в `types` и `text/markdown text/plain` в `charset_types` nginx (или `AddType 'text/markdown; charset=utf-8' .md` в Apache).
2. **Content negotiation** — главная отдаёт `index.md` на `Accept: text/markdown` (Claude Code и др. шлют такой заголовок). Рабочий пример для nginx с учётом `q=0` и якоря по URI — раздел 4 правила obmen; для этого сайта карта такая:

   ```nginx
   map "$uri|$http_accept" $markdown_target {
       default "";
       "~*^/(index\.html)?\|.*text/markdown(?!\s*;\s*q=0(?:\.0+)?\s*(?:[,;]|$))"     /index.md;
       "~*^/legal/(index\.html)?\|.*text/markdown(?!\s*;\s*q=0(?:\.0+)?\s*(?:[,;]|$))" /legal.md;
   }
   ```

   плюс `Vary: Accept` на HTML и `.md`, `Link: <…/index.md>; rel="alternate"; type="text/markdown"` на HTML и `Link: <https://offer.bx-shef.by/>; rel="canonical"` на `.md`.
3. **Логи агентов** (по желанию) — `log_format` с `$http_accept` и `$http_user_agent`, без `$remote_addr` (раздел 2.4 правила).
