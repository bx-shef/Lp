#!/usr/bin/env bash
# Выкатка вручную, без GitHub Actions: те же шаги, что в .github/workflows/deploy.yml
# (generate → validate → backup → rsync → verify → smoke, откат из .bak при сбое).
# Никаких секретов в репозитории: хост, порт, пользователь, путь, ключ и known_hosts — из окружения.
#
#   DEPLOY_HOST=… DEPLOY_USER=… DEPLOY_PATH=/home/bitrix/www make deploy
#
# Обязательные: DEPLOY_HOST, DEPLOY_USER, DEPLOY_PATH.
# Необязательные: DEPLOY_PORT (22), DEPLOY_SSH_KEY (путь к ключу), DEPLOY_HOST_KEY
#   (строка known_hosts «host ssh-ed25519 AAAA…»; без неё берётся ~/.ssh/known_hosts,
#   StrictHostKeyChecking=yes остаётся), DRY=1 (rsync --dry-run, на сервере ничего не меняется),
#   SKIP_BUILD=1 (взять готовый .output/public), NUXT_PUBLIC_SITE_URL, NUXT_PUBLIC_BUILD_ID
#   (по умолчанию — короткий хеш HEAD).
set -euo pipefail
cd "$(dirname "$0")/.."

: "${DEPLOY_HOST:?задайте DEPLOY_HOST}"
: "${DEPLOY_USER:?задайте DEPLOY_USER}"
: "${DEPLOY_PATH:?задайте DEPLOY_PATH}"
PORT="${DEPLOY_PORT:-22}"
DRY="${DRY:-0}"
DIST=.output/public
TARGET="$DEPLOY_USER@$DEPLOY_HOST"

# Пути, которыми владеет Битрикс/сервер: деплой их не трогает (как в deploy.yml).
EXCLUDES=(--exclude=bitrix --exclude=local --exclude=personal --exclude=support --exclude=upload
          --exclude=.access.php --exclude=.htaccess --exclude=.htsecure)

kh="$(mktemp)"; trap 'rm -f "$kh"' EXIT
[ -f "$HOME/.ssh/known_hosts" ] && cat "$HOME/.ssh/known_hosts" > "$kh"
[ -n "${DEPLOY_HOST_KEY:-}" ] && printf '%s\n' "$DEPLOY_HOST_KEY" >> "$kh"
[ -s "$kh" ] || { echo "ERR: нет known_hosts: задайте DEPLOY_HOST_KEY (ssh-keyscan -p PORT HOST | grep ed25519)"; exit 1; }
SSH_OPTS=(-p "$PORT" -o StrictHostKeyChecking=yes -o "UserKnownHostsFile=$kh")
[ -n "${DEPLOY_SSH_KEY:-}" ] && SSH_OPTS+=(-i "$DEPLOY_SSH_KEY" -o IdentitiesOnly=yes)
ssh_() { ssh "${SSH_OPTS[@]}" "$TARGET" "$@"; }
RSH="ssh ${SSH_OPTS[*]}"

if [ "${SKIP_BUILD:-0}" != 1 ]; then
  export NUXT_APP_BASE_URL=/
  export NUXT_PUBLIC_SITE_URL="${NUXT_PUBLIC_SITE_URL:-https://offer.bx-shef.by}"
  export NUXT_PUBLIC_BUILD_ID="${NUXT_PUBLIC_BUILD_ID:-$(git rev-parse HEAD 2>/dev/null || echo manual)}"
  pnpm install --frozen-lockfile
  pnpm run generate
fi

# --- validate (то же, что «Validate output» в build.yml, минимум для выкатки) ---
test -f "$DIST/index.html"         || { echo "ERR: index.html missing"; exit 1; }
test -f "$DIST/privacy/index.html" || { echo "ERR: privacy missing"; exit 1; }
test -f "$DIST/legal/index.html"   || { echo "ERR: legal missing"; exit 1; }
test -s "$DIST/og-image.png"       || { echo "ERR: og-image.png missing or empty"; exit 1; }
test -f "$DIST/CNAME"              || { echo "ERR: CNAME missing"; exit 1; }
grep -q 'og:image' "$DIST/index.html" || { echo "ERR: og:image meta missing"; exit 1; }
scripts/check-legal.sh "$DIST"
scripts/check-agent-readiness.sh "$DIST"
test "$(ls -A "$DIST")" || { echo "ERR: $DIST пуст — rsync с --delete отменён"; exit 1; }

if [ "$DRY" = 1 ]; then
  echo "DRY=1: показываю, что изменилось бы на $TARGET:$DEPLOY_PATH"
  rsync -azn --delete --checksum --itemize-changes "${EXCLUDES[@]}" -e "$RSH" "$DIST/" "$TARGET:$DEPLOY_PATH/"
  exit 0
fi

# --- backup ---
ssh_ "rsync -a --delete --link-dest=$DEPLOY_PATH ${EXCLUDES[*]} $DEPLOY_PATH/ $DEPLOY_PATH.bak/ 2>/dev/null || true"

rollback() {
  echo "ERR: выкатка не прошла — откат из $DEPLOY_PATH.bak"
  ssh_ "if test -d $DEPLOY_PATH.bak; then rsync -a --delete ${EXCLUDES[*]} $DEPLOY_PATH.bak/ $DEPLOY_PATH/ && echo 'OK: rollback выполнен из .bak'; else echo 'WARN: .bak не найден, rollback пропущен'; fi"
  exit 1
}

# --- sync → verify → smoke ---
rsync -az --delete --checksum "${EXCLUDES[@]}" -e "$RSH" "$DIST/" "$TARGET:$DEPLOY_PATH/" || rollback
ssh_ "test -f $DEPLOY_PATH/index.html && echo OK || (echo 'ERR: index.html не найден на сервере' && exit 1)" || rollback
ssh_ "grep -q 'og:image' $DEPLOY_PATH/index.html || (echo 'ERR: og:image не найден в index.html' && exit 1)" || rollback
echo "OK: выкачено в $TARGET:$DEPLOY_PATH"
