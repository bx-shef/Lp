#!/usr/bin/env bash
# Выкатка вручную, без GitHub Actions: те же шаги, что в .github/workflows/deploy.yml
# (generate → validate → backup → rsync → verify → smoke, откат из .bak при сбое).
# Никаких секретов в репозитории: хост, порт, пользователь, путь, ключ и known_hosts — из окружения.
#
#   DEPLOY_HOST=… DEPLOY_USER=… DEPLOY_PATH=/home/bitrix/www make deploy
#
# Обязательные: DEPLOY_HOST (не начинается с «-»), DEPLOY_USER, DEPLOY_PATH (абсолютный, не меньше
#   трёх сегментов, только [A-Za-z0-9._/-], без «..»; иначе отказ — rsync --delete и rm -rf идут по нему).
# Необязательные: DEPLOY_PORT (22), DEPLOY_SSH_KEY (путь к ключу), DEPLOY_HOST_KEY
#   (строка known_hosts «host ssh-ed25519 AAAA…»; без неё берётся ~/.ssh/known_hosts,
#   StrictHostKeyChecking=yes остаётся), DRY=1 или аргумент --dry (rsync --dry-run, на сервере
#   ничего не меняется), SKIP_BUILD=1 (взять готовый .output/public), NUXT_PUBLIC_SITE_URL,
#   NUXT_PUBLIC_BUILD_ID (по умолчанию — 7 знаков хеша HEAD, как в CI).
# Сборка (без SKIP_BUILD): GITHUB_TOKEN обязателен — без него граф GitHub-активности на проде пропадёт;
#   ALLOW_NO_GITHUB=1 — выкатить без графа, с предупреждением. NUXT_PUBLIC_B24_FORM_ID,
#   NUXT_PUBLIC_B24_FORM_SECRET, NUXT_PUBLIC_B24_FORM_SCRIPT_URL, NUXT_PUBLIC_METRIKA_ID — из окружения
#   (в CI это vars репозитория); не заданы — дефолты nuxt.config.ts, с предупреждением.
set -euo pipefail
cd "$(dirname "$0")/.."

err() { echo "ERR: $*" >&2; exit 1; }

DRY="${DRY:-0}"
for a in "$@"; do
  case "$a" in
    --dry) DRY=1 ;;
    *) err "неизвестный аргумент: $a (поддерживается только --dry)" ;;
  esac
done

: "${DEPLOY_HOST:?задайте DEPLOY_HOST}"
: "${DEPLOY_USER:?задайте DEPLOY_USER}"
: "${DEPLOY_PATH:?задайте DEPLOY_PATH}"
PORT="${DEPLOY_PORT:-22}"
DIST=.output/public

# Всё, что уходит в ssh и в удалённую оболочку, проверяется до первого сетевого вызова.
[[ "$DEPLOY_HOST" =~ ^[A-Za-z0-9][A-Za-z0-9._:-]*$ ]] \
  || err "DEPLOY_HOST: допустимы [A-Za-z0-9._:-], первым знаком не «-»"
[[ "$DEPLOY_USER" =~ ^[A-Za-z0-9_][A-Za-z0-9._-]*$ ]] \
  || err "DEPLOY_USER: допустимы [A-Za-z0-9._-], первым знаком не «-»"
[[ "$PORT" =~ ^[0-9]{1,5}$ ]] || err "DEPLOY_PORT: только число"
while [[ "$DEPLOY_PATH" == */ && "$DEPLOY_PATH" != "/" ]]; do DEPLOY_PATH="${DEPLOY_PATH%/}"; done
[[ "$DEPLOY_PATH" =~ ^/[A-Za-z0-9._/-]+$ ]] \
  || err "DEPLOY_PATH: абсолютный путь, только [A-Za-z0-9._/-] (получено: «$DEPLOY_PATH»)"
[[ "$DEPLOY_PATH" != *//* && "$DEPLOY_PATH" != *..* ]] || err "DEPLOY_PATH: без «//» и «..»"
IFS=/ read -r -a _segs <<< "${DEPLOY_PATH#/}"
[ "${#_segs[@]}" -ge 3 ] || err "DEPLOY_PATH: нужно не меньше трёх сегментов (например /home/bitrix/www), получено «$DEPLOY_PATH»"
TARGET="$DEPLOY_USER@$DEPLOY_HOST"
Q_PATH="$(printf '%q' "$DEPLOY_PATH")"
Q_BAK="$(printf '%q' "$DEPLOY_PATH.bak")"

# Пути, которыми владеет Битрикс/сервер: деплой их не трогает (как в deploy.yml).
EXCLUDES=(--exclude=bitrix --exclude=local --exclude=personal --exclude=support --exclude=upload
          --exclude=.access.php --exclude=.htaccess --exclude=.htsecure)
Q_EXCLUDES="$(printf '%q ' "${EXCLUDES[@]}")"

tmpd="$(mktemp -d)"; trap 'rm -rf "$tmpd"' EXIT
kh="$tmpd/known_hosts"; : > "$kh"
if [ -f "$HOME/.ssh/known_hosts" ]; then cat "$HOME/.ssh/known_hosts" > "$kh"; fi
if [ -n "${DEPLOY_HOST_KEY:-}" ]; then printf '%s\n' "$DEPLOY_HOST_KEY" >> "$kh"; fi
[ -s "$kh" ] || err "нет known_hosts: задайте DEPLOY_HOST_KEY (ssh-keyscan -p PORT HOST | grep ed25519)"
# Опции ssh — массивом; для rsync -e и ssh_ они упакованы в обёртку, поэтому пути с пробелами не ломаются.
SSH_OPTS=(-p "$PORT" -o StrictHostKeyChecking=yes -o "UserKnownHostsFile=$kh")
if [ -n "${DEPLOY_SSH_KEY:-}" ]; then SSH_OPTS+=(-i "$DEPLOY_SSH_KEY" -o IdentitiesOnly=yes); fi
{ echo '#!/usr/bin/env bash'; printf 'exec ssh'; printf ' %q' "${SSH_OPTS[@]}"; printf ' "$@"\n'; } > "$tmpd/ssh"
chmod 700 "$tmpd/ssh"
RSH="$tmpd/ssh"
ssh_() { "$RSH" "$TARGET" "$@"; }

if [ "${SKIP_BUILD:-0}" != 1 ]; then
  if [ -z "${GITHUB_TOKEN:-}" ]; then
    if [ "${ALLOW_NO_GITHUB:-0}" = 1 ]; then
      echo "WARN: GITHUB_TOKEN не задан, ALLOW_NO_GITHUB=1 — выкатываю без графа GitHub-активности" >&2
    else
      err "GITHUB_TOKEN не задан: без него на проде пропадёт граф GitHub-активности. Задайте токен (scope read:user) или ALLOW_NO_GITHUB=1, чтобы выкатить без графа."
    fi
  fi
  for v in NUXT_PUBLIC_B24_FORM_ID NUXT_PUBLIC_B24_FORM_SECRET NUXT_PUBLIC_B24_FORM_SCRIPT_URL NUXT_PUBLIC_METRIKA_ID; do
    if [ -z "${!v:-}" ]; then
      echo "WARN: $v не задан — будет дефолт из nuxt.config.ts (в CI это vars репозитория)" >&2
    else
      export "${v?}"
    fi
  done
  export NUXT_APP_BASE_URL=/
  export NUXT_PUBLIC_SITE_URL="${NUXT_PUBLIC_SITE_URL:-https://offer.bx-shef.by}"
  BUILD_ID="${NUXT_PUBLIC_BUILD_ID:-$(git rev-parse HEAD 2>/dev/null || echo manual)}"
  export NUXT_PUBLIC_BUILD_ID="${BUILD_ID:0:7}"
  pnpm install --frozen-lockfile || err "pnpm install не прошёл"
  pnpm run generate || err "pnpm run generate не прошёл"
fi

# --- validate (то же, что «Validate output» в build.yml, минимум для выкатки) ---
test -f "$DIST/index.html"         || { echo "ERR: index.html missing"; exit 1; }
test -f "$DIST/privacy/index.html" || { echo "ERR: privacy missing"; exit 1; }
test -f "$DIST/legal/index.html"   || { echo "ERR: legal missing"; exit 1; }
test -s "$DIST/og-image.png"       || { echo "ERR: og-image.png missing or empty"; exit 1; }
test -f "$DIST/CNAME"              || { echo "ERR: CNAME missing"; exit 1; }
grep -q 'og:image' "$DIST/index.html" || { echo "ERR: og:image meta missing"; exit 1; }
scripts/check-legal.sh "$DIST" || { echo "ERR: check-legal.sh не прошёл — выкатка отменена"; exit 1; }
scripts/check-agent-readiness.sh "$DIST" || { echo "ERR: check-agent-readiness.sh не прошёл — выкатка отменена"; exit 1; }
test "$(ls -A "$DIST")" || { echo "ERR: $DIST пуст — rsync с --delete отменён"; exit 1; }

if [ "$DRY" = 1 ]; then
  echo "DRY=1: показываю, что изменилось бы на $TARGET:$DEPLOY_PATH"
  rsync -azn --delete --checksum --itemize-changes "${EXCLUDES[@]}" -e "$RSH" "$DIST/" "$TARGET:$DEPLOY_PATH/" \
    || { echo "ERR: rsync --dry-run не прошёл"; exit 1; }
  exit 0
fi

# --- backup: старый .bak убираем, свежий делаем жёсткими ссылками; не вышло — выкатки нет ---
BACKUP_OK=0
ssh_ "rm -rf $Q_BAK && rsync -a --delete --link-dest=$Q_PATH $Q_EXCLUDES $Q_PATH/ $Q_BAK/" \
  || { echo "ERR: бэкап $DEPLOY_PATH.bak не создан — выкатка отменена, сервер не тронут"; exit 1; }
BACKUP_OK=1

rollback() {
  echo "ERR: выкатка не прошла"
  if [ "$BACKUP_OK" != 1 ]; then
    echo "WARN: бэкап этого запуска не создан — откат не выполняется"
    exit 1
  fi
  echo "откат из $DEPLOY_PATH.bak"
  ssh_ "rsync -a --delete $Q_EXCLUDES $Q_BAK/ $Q_PATH/" && echo "OK: rollback выполнен из .bak" \
    || echo "ERR: откат не удался, проверьте $DEPLOY_PATH.bak вручную"
  exit 1
}

# --- sync → verify → smoke ---
rsync -az --delete --checksum "${EXCLUDES[@]}" -e "$RSH" "$DIST/" "$TARGET:$DEPLOY_PATH/" || rollback
ssh_ "test -f $Q_PATH/index.html" || { echo "ERR: index.html не найден на сервере"; rollback; }
ssh_ "grep -q 'og:image' $Q_PATH/index.html" || { echo "ERR: og:image не найден в index.html"; rollback; }
echo "OK: выкачено в $TARGET:$DEPLOY_PATH"
