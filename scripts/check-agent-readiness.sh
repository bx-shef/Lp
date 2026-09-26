#!/usr/bin/env bash
# Проверка готовности статики для ИИ-агентов (docs/agent-readiness.md):
# llms.txt, Markdown-двойники, <link>-ы в <head>, общий оффер-блок, живые
# внутренние ссылки, robots/sitemap, Open Graph. Гоняется по собранной статике.
#   scripts/check-agent-readiness.sh [.output/public]
set -uo pipefail

DIR="${1:-.output/public}"
SITE='https://offer.bx-shef.by'
fail=0
err() { echo "::error::$*"; fail=1; }

# Страница → её Markdown-двойник (держать в синхроне с MARKDOWN_TWINS в app/app.vue).
declare -A TWINS=( [index.html]=index.md [legal/index.html]=legal.md )
PAGES=(index.html legal/index.html privacy/index.html)

# --- llms.txt ---------------------------------------------------------------
if [ ! -s "$DIR/llms.txt" ]; then
  err "llms.txt отсутствует или пуст"
else
  head -1 "$DIR/llms.txt" | grep -q '^# ' || err "llms.txt: первая строка должна быть H1 (# …)"
  grep -q '^## ' "$DIR/llms.txt"         || err "llms.txt: нет ни одного раздела ## со ссылками"
  grep -q '^## Optional$' "$DIR/llms.txt" || err "llms.txt: нет раздела ## Optional"
fi

# --- Markdown-двойники и <link> в <head> -----------------------------------
for page in "${PAGES[@]}"; do
  html="$DIR/$page"
  [ -f "$html" ] || { err "$page отсутствует"; continue; }
  grep -qF "<link rel=\"describedby\" href=\"$SITE/llms.txt\">" "$html" \
    || err "$page: нет <link rel=\"describedby\" href=\"$SITE/llms.txt\">"
  twin="${TWINS[$page]:-}"
  if [ -n "$twin" ]; then
    [ -s "$DIR/$twin" ] || { err "$twin (двойник $page) отсутствует или пуст"; continue; }
    head -1 "$DIR/$twin" | grep -q '^# ' || err "$twin: первая строка должна быть H1"
    grep -qF "<link rel=\"alternate\" type=\"text/markdown\" href=\"$SITE/$twin\">" "$html" \
      || err "$page: нет <link rel=\"alternate\" type=\"text/markdown\" href=\"$SITE/$twin\">"
  elif grep -q 'type="text/markdown"' "$html"; then
    err "$page: ссылается на Markdown-двойник, которого нет в TWINS"
  fi
done

# --- Оффер-блок одинаковый в llms.txt и index.md ----------------------------
offer() { sed -n '/<!-- offer:start/,/<!-- offer:end -->/p' "$1" 2>/dev/null || true; }
for f in llms.txt index.md; do
  [ -f "$DIR/$f" ] || continue
  [ "$(grep -c '<!-- offer:start' "$DIR/$f" || true)" = 1 ] && [ "$(grep -c '<!-- offer:end -->' "$DIR/$f" || true)" = 1 ] \
    || err "$f: маркеры <!-- offer:start --> и <!-- offer:end --> должны встречаться ровно по одному разу"
done
a="$(offer "$DIR/llms.txt")"; b="$(offer "$DIR/index.md")"
if [ -z "$a" ] || [ -z "$b" ]; then
  err "оффер-блок (<!-- offer:start … offer:end -->) не найден в llms.txt или index.md"
elif [ "$a" != "$b" ]; then
  err "оффер-блок в llms.txt и index.md различается:"; diff <(echo "$a") <(echo "$b") || true
fi

# --- Внутренние ссылки из llms.txt и двойников ведут на существующие файлы --
for f in llms.txt index.md legal.md; do
  [ -f "$DIR/$f" ] || continue
  links="$(grep -oE "$SITE[^ )>\`\"]*" "$DIR/$f" || true)"
  while IFS= read -r url; do
    [ -n "$url" ] || continue
    path="${url#"$SITE"}"; path="${path%%#*}"; path="${path%%\?*}"
    case "$path" in
      ''|/) target=index.html ;;
      */)   target="${path#/}index.html" ;;
      *)    target="${path#/}" ;;
    esac
    [ -f "$DIR/$target" ] || err "$f: ссылка $url не ведёт на файл статики ($target)"
    case "$url" in *[.,\;:]) err "$f: к ссылке приклеена пунктуация: $url" ;; esac
  done <<< "$links"
done

# --- robots.txt / sitemap.xml ----------------------------------------------
[ -s "$DIR/robots.txt" ] || err "robots.txt отсутствует"
grep -qiE '^Disallow:[[:space:]]*/[[:space:]]*$' "$DIR/robots.txt" 2>/dev/null \
  && err "robots.txt закрывает весь сайт (Disallow: /) — агенты не смогут прочитать страницы"
[ -s "$DIR/sitemap.xml" ] || err "sitemap.xml отсутствует"

# --- Open Graph --------------------------------------------------------------
for page in "${PAGES[@]}"; do
  html="$DIR/$page"; [ -f "$html" ] || continue
  n="$(grep -o '<meta property="og:image"' "$html" | wc -l)"
  [ "$n" -eq 1 ] || err "$page: og:image должен быть ровно один (найдено $n)"
  grep -qF "<meta property=\"og:image\" content=\"$SITE/og-image.png\">" "$html" \
    || err "$page: og:image не $SITE/og-image.png"
  for tag in 'property="og:image:type" content="image/png"' \
             'property="og:image:width" content="1200"' \
             'property="og:image:height" content="630"' \
             'property="og:image:alt"' \
             'name="twitter:card" content="summary_large_image"' \
             'name="twitter:image"'; do
    grep -qF "<meta $tag" "$html" || err "$page: нет <meta $tag>"
  done
done
size="$(python3 -c 'import struct,sys; d=open(sys.argv[1],"rb").read(24); print("%dx%d" % struct.unpack(">II", d[16:24]) if d[:8]==b"\x89PNG\r\n\x1a\n" else "not-png")' "$DIR/og-image.png" 2>/dev/null || echo missing)"
[ "$size" = "1200x630" ] || err "og-image.png должен быть PNG 1200×630 (сейчас: $size)"

[ "$fail" -eq 0 ] && echo "OK: статика готова для ИИ-агентов"
exit "$fail"
