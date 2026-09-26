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

## Сервер (BitrixVM, делается руками один раз)

Сайт на BitrixVM: nginx спереди, Apache сзади. Проверено на проде по ответам (ETag, `Expires`, страницы 404):

| Кто отдаёт | Что |
|---|---|
| nginx сам | статика по расширению: `png`, `ico`, `css`, `js` (кэш 30 дней) |
| Apache (через nginx) | `.html`, `.txt`, `.md`, `.xml` и всё остальное |

Поэтому всё для агентов настраивается **в Apache через `.htaccess` в корне сайта**, а не в nginx: `llms.txt`, `.md` и HTML nginx не обслуживает, а свои конфиги в `/etc/nginx/bx/` BitrixVM перезаписывает при изменении настроек сайта из меню. `.htaccess` деплой не трогает (`rsync --exclude='.htaccess'`), поэтому он не версионируется на сервере — эталон лежит в репозитории: [`docs/server/agents.htaccess`](server/agents.htaccess).

Блок делает:

- `.md` → `text/markdown; charset=utf-8`, `.txt` → явный `utf-8` (`AddDefaultCharset` распространяется только на `text/html` и `text/plain`, и без charset кириллица в Markdown ломается);
- content negotiation: `/` и `/legal/` (и `…/index.html`) отдают двойник на `Accept: text/markdown`; `text/markdown;q=0` (в т. ч. `q=0.0`, пробелы, регистр) и `text/markdownx` получают HTML;
- `Vary: Accept` на HTML с двойником и на `.md`; `Link` с `alternate` + `describedby` на HTML и `canonical` + `describedby` на `.md`, `nosniff` на `.md`.

Проверено на Apache 2.4.58 с `AllowOverride All` и `AddDefaultCharset UTF-8` (как у BitrixVM): 11 вариантов `Accept` на обе страницы, `/privacy/` без изменений, `/sub/index.html` не цепляется.

### Установка

```bash
cd <DEPLOY_PATH>                              # корень сайта offer.bx-shef.by
cp -a .htaccess .htaccess.bak 2>/dev/null     # если уже есть — сохранить
# вставить содержимое docs/server/agents.htaccess В НАЧАЛО .htaccess (или создать файл)
```

Нужны модули `mod_rewrite`, `mod_headers`, `mod_mime` (в BitrixVM включены; блок обёрнут в `<IfModule>`, без модуля он молча не сработает, а не уронит сайт). Если в `.htaccess` уже есть правила Битрикс (`urlrewrite.php`) — блок ставится выше них.

### Проверка после установки

```bash
S=https://offer.bx-shef.by
curl -s -o /dev/null -w '%{content_type}\n' $S/index.md                                     # text/markdown; charset=utf-8
curl -s -o /dev/null -w '%{content_type}\n' -H 'Accept: text/markdown, */*' $S/            # text/markdown; charset=utf-8
curl -s -o /dev/null -w '%{content_type}\n' -H 'Accept: text/html,*/*;q=0.8' $S/           # text/html; charset=UTF-8
curl -s -o /dev/null -w '%{content_type}\n' -H 'Accept: text/markdown;q=0, text/html' $S/  # text/html; charset=UTF-8
curl -sI $S/ | grep -iE '^(vary|link):'                                                     # Vary: … Accept; Link: …index.md…
curl -sI $S/index.md | grep -i '^link:'                                                      # rel="canonical"
```

Если у `.md` нет `charset=utf-8` и negotiation не срабатывает — Apache не читает `.htaccess`: проверить `AllowOverride` для корня сайта в конфиге виртуального хоста Apache.

### Логи агентов (по желанию)

Сколько агентов приходит за Markdown — видно по `Accept` в логе Apache. Формат без `%h` (IP — персональные данные): `LogFormat "%t %>s \"%r\" \"%{Accept}i\" \"%{User-Agent}i\"" agents`, затем `grep -c text/markdown` по логу.
