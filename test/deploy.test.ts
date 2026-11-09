import { spawnSync } from 'node:child_process'
import { chmodSync, cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

// Скрипты гоняются в песочнице: подложные ssh/rsync/pnpm пишут вызовы в журнал, сети нет.
let root: string
const calls = () => (existsSync(join(root, 'calls.log')) ? readFileSync(join(root, 'calls.log'), 'utf8') : '')

function sandbox(opts: { legalOk?: boolean, stripSetE?: boolean } = {}) {
  rmSync(join(root, 'repo'), { recursive: true, force: true })
  rmSync(join(root, 'calls.log'), { force: true })
  const repo = join(root, 'repo')
  mkdirSync(join(repo, 'scripts'), { recursive: true })
  mkdirSync(join(repo, '.output/public'), { recursive: true })
  let deploy = readFileSync('scripts/deploy.sh', 'utf8')
  if (opts.stripSetE) deploy = deploy.replace('set -euo pipefail', 'set -uo pipefail')
  writeFileSync(join(repo, 'scripts/deploy.sh'), deploy, { mode: 0o755 })
  writeFileSync(join(repo, 'scripts/check-legal.sh'), `#!/usr/bin/env bash\n${opts.legalOk === false ? 'echo подложный провал; exit 1' : 'exit 0'}\n`, { mode: 0o755 })
  writeFileSync(join(repo, 'scripts/check-agent-readiness.sh'), '#!/usr/bin/env bash\nexit 0\n', { mode: 0o755 })
  const out = join(repo, '.output/public')
  mkdirSync(join(out, 'privacy'), { recursive: true })
  mkdirSync(join(out, 'legal'), { recursive: true })
  writeFileSync(join(out, 'index.html'), '<meta property="og:image">')
  writeFileSync(join(out, 'privacy/index.html'), 'p')
  writeFileSync(join(out, 'legal/index.html'), 'l')
  writeFileSync(join(out, 'og-image.png'), 'png')
  writeFileSync(join(out, 'CNAME'), 'offer.bx-shef.by')
  return repo
}

function run(repo: string, env: Record<string, string> = {}, args: string[] = []) {
  const r = spawnSync('bash', [join(repo, 'scripts/deploy.sh'), ...args], {
    encoding: 'utf8',
    env: {
      PATH: `${join(root, 'bin')}:${process.env.PATH}`,
      HOME: root,
      LOG: join(root, 'calls.log'),
      SKIP_BUILD: '1',
      DEPLOY_HOST: 'example.test',
      DEPLOY_USER: 'bitrix',
      DEPLOY_PATH: '/home/bitrix/www',
      DEPLOY_HOST_KEY: 'example.test ssh-ed25519 AAAA',
      ...env
    }
  })
  return { code: r.status, out: `${r.stdout}${r.stderr}` }
}

beforeAll(() => {
  root = mkdtempSync(join(tmpdir(), 'deploy-test-'))
  mkdirSync(join(root, 'bin'))
  for (const n of ['ssh', 'rsync', 'pnpm']) {
    const p = join(root, 'bin', n)
    writeFileSync(p, `#!/usr/bin/env bash\necho "${n} $*" >> "$LOG"\n[ "\${FAIL_${n.toUpperCase()}:-0}" = 1 ] && exit 1\nexit 0\n`)
    chmodSync(p, 0o755)
  }
})
afterAll(() => rmSync(root, { recursive: true, force: true }))

describe('deploy.sh: DEPLOY_PATH и хост', () => {
  for (const bad of ['/', '/home', '/home/bitrix', 'home/bitrix/www', '/home/bitrix/www; rm -rf /', '/home/bi trix/www', '/home/bitrix/../www', '/home/$(id)/www', '/home/bitrix//www']) {
    it(`отказ: «${bad}»`, () => {
      const r = run(sandbox(), { DEPLOY_PATH: bad })
      expect(r.code).not.toBe(0)
      expect(r.out).toMatch(/DEPLOY_PATH/)
      expect(calls()).toBe('')
    })
  }
  it('хост с «-» в начале — отказ', () => {
    const r = run(sandbox(), { DEPLOY_HOST: '-oProxyCommand=x' })
    expect(r.code).not.toBe(0)
    expect(r.out).toMatch(/DEPLOY_HOST/)
    expect(calls()).toBe('')
  })
  it('путь из трёх сегментов проходит, в ssh он экранирован', () => {
    const r = run(sandbox(), { DEPLOY_PATH: '/home/bitrix/www/' })
    expect(r.code).toBe(0)
    expect(calls()).toContain('/home/bitrix/www/')
  })
})

describe('deploy.sh: проверки без полагания на set -e', () => {
  for (const stripSetE of [false, true]) {
    it(`провал check-legal не доходит до rsync (set -e ${stripSetE ? 'убран' : 'есть'})`, () => {
      const r = run(sandbox({ legalOk: false, stripSetE }), {}, ['--dry'])
      expect(r.code).not.toBe(0)
      expect(r.out).toMatch(/check-legal\.sh не прошёл/)
      expect(calls()).not.toMatch(/rsync/)
    })
  }
  it('при зелёных проверках --dry доходит до rsync -n', () => {
    const r = run(sandbox(), {}, ['--dry'])
    expect(r.code).toBe(0)
    expect(calls()).toMatch(/rsync -azn/)
  })
})

describe('deploy.sh: бэкап и откат', () => {
  it('бэкап не создан — выкатки и отката нет', () => {
    const r = run(sandbox(), { FAIL_SSH: '1' })
    expect(r.code).not.toBe(0)
    expect(r.out).toMatch(/бэкап .* не создан/)
    expect(calls()).not.toMatch(/rsync -az --delete/)
    expect(calls()).not.toMatch(/rollback/)
  })
  it('старый .bak удаляется перед бэкапом', () => {
    run(sandbox())
    expect(calls().split('\n')[0]).toMatch(/rm -rf \/home\/bitrix\/www\.bak && rsync/)
  })
  it('сбой rsync — откат из .bak', () => {
    const r = run(sandbox(), { FAIL_RSYNC: '1' })
    expect(r.code).not.toBe(0)
    expect(calls()).toMatch(/www\.bak\/ .*www\/|www\.bak\//)
    expect(r.out).toMatch(/откат из/)
  })
})

describe('deploy.sh: GITHUB_TOKEN и переменные формы', () => {
  it('без GITHUB_TOKEN — отказ до сборки', () => {
    const r = run(sandbox(), { SKIP_BUILD: '0' })
    expect(r.code).not.toBe(0)
    expect(r.out).toMatch(/GITHUB_TOKEN/)
    expect(calls()).not.toMatch(/pnpm/)
  })
  it('ALLOW_NO_GITHUB=1 — сборка с предупреждением и дефолтами формы', () => {
    const r = run(sandbox(), { SKIP_BUILD: '0', ALLOW_NO_GITHUB: '1' })
    expect(r.code).toBe(0)
    expect(r.out).toMatch(/WARN: GITHUB_TOKEN/)
    expect(r.out).toMatch(/WARN: NUXT_PUBLIC_B24_FORM_ID/)
    expect(r.out).toMatch(/WARN: NUXT_PUBLIC_METRIKA_ID/)
    expect(calls()).toMatch(/pnpm run generate/)
  })
})

describe('check-legal.sh: «ИП Шевчик» в бандле и с nbsp', () => {
  function site(extra: { file: string, text: string }) {
    const d = join(root, 'site')
    rmSync(d, { recursive: true, force: true })
    cpSync('test/fixtures/legal-site', d, { recursive: true })
    mkdirSync(join(d, '_nuxt'), { recursive: true })
    writeFileSync(join(d, extra.file), extra.text)
    return spawnSync('bash', ['scripts/check-legal.sh', d], { encoding: 'utf8' })
  }
  it('чистая сборка проходит', () => {
    expect(site({ file: '_nuxt/a.js', text: 'const a=1' }).status).toBe(0)
  })
  for (const [name, text] of [['пробел', 'ИП Шевчик'], ['&nbsp;', 'ИП&nbsp;Шевчик'], ['U+00A0', 'ИП Шевчик'], ['\\u00a0', 'ИП\\u00a0Шевчик']]) {
    it(`_nuxt/*.js: ${name} — краснеет`, () => {
      const r = site({ file: '_nuxt/a.js', text: `var s="${text}"` })
      expect(r.status).not.toBe(0)
      expect(r.stdout + r.stderr).toMatch(/_nuxt\/a\.js/)
    })
  }
  it('index.md: U+00A0 — краснеет', () => {
    expect(site({ file: 'index.md', text: 'ИП Шевчик' }).status).not.toBe(0)
  })
})
