#!/usr/bin/env bash
# Проверка страниц реквизитов и политики в собранной статике (после pnpm generate):
# продавец — ООО «БэИксШефБай», документы — прямые ссылки на license.bx-shef.by,
# «ИП Шевчик» как продавца на сайте нет.
#   scripts/check-legal.sh [.output/public]
set -uo pipefail

DIR="${1:-.output/public}"
fail=0
err() { echo "::error::$*"; fail=1; }

flat() { tr '\n' ' ' < "$1"; }

legal="$DIR/legal/index.html"
[ -f "$legal" ] || { echo "::error::$legal отсутствует"; exit 1; }
L="$(flat "$legal")"

for needle in 'ООО «БэИксШефБай»' \
  'href="https://license.bx-shef.by/privacy"' \
  'href="https://license.bx-shef.by/cookies"' \
  'href="https://license.bx-shef.by/offer/shef.toolsai"' \
  'href="https://license.bx-shef.by/offer/shef.toolsai-mcp"' \
  'href="https://license.bx-shef.by/eula/shef.toolsai"' \
  'href="https://license.bx-shef.by/eula/shef.toolsai-mcp"' \
  'партнёр «Битрикс24»; программы — разработка партнёра, не продукты компании «1С‑Битрикс»'; do
  case "$L" in *"$needle"*) ;; *) err "legal: нет «$needle»" ;; esac
done

# Продавец — не ИП: ни в одной странице, ни в двойниках для агентов.
for f in index.html legal/index.html privacy/index.html legal.md index.md llms.txt; do
  [ -f "$DIR/$f" ] || continue
  if flat "$DIR/$f" | grep -qE 'ИП[[:space:]]+Шевчик|ИП Шевчик'; then
    err "$f: «ИП Шевчик» как продавец"
  fi
done

# /privacy — страница со ссылками на документы; подвал ведёт на политику на license.bx-shef.by.
P="$(flat "$DIR/privacy/index.html")"
case "$P" in *'href="https://license.bx-shef.by/privacy"'*) ;; *) err "privacy: нет ссылки на license.bx-shef.by/privacy" ;; esac
case "$P" in *'href="https://license.bx-shef.by/cookies"'*) ;; *) err "privacy: нет ссылки на license.bx-shef.by/cookies" ;; esac
for f in index.html legal/index.html privacy/index.html; do
  flat "$DIR/$f" | grep -qE 'href="https://license.bx-shef.by/privacy"[^>]*>[[:space:]]*Политика конфиденциальности' \
    || err "$f: подвал — «Политика конфиденциальности» должна вести на https://license.bx-shef.by/privacy"
done

[ "$fail" -eq 0 ] && echo "OK: реквизиты и документы"
exit "$fail"
