#!/usr/bin/env node
/**
 * Генератор OG-картинки 1200×630 в dark vibecode-стилистике.
 * Запуск: pnpm og
 */
import { chromium } from 'playwright'
import { mkdirSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const out = resolve(__dirname, '../public/og-image.png')
const photoPath = resolve(__dirname, '../public/igor.jpg')

// Встраиваем фото как data: URL, чтобы playwright не зависел от dev-сервера
let photoDataUri = ''
try {
  const buf = readFileSync(photoPath)
  photoDataUri = `data:image/jpeg;base64,${buf.toString('base64')}`
} catch {
  console.warn('public/igor.jpg не найден — OG будет без портрета')
}

// OG-картинку рендерим с Google Fonts (одноразовая локальная генерация —
// без render-blocking рисков для пользователя). Альтернатива через
// data: URI .woff2 — громоздко и не даёт визуального выигрыша.
const html = `<!DOCTYPE html>
<html lang="ru"><head><meta charset="UTF-8">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Rubik:wght@400;600;800&family=Roboto+Mono:wght@500&display=swap" rel="stylesheet">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: #030022;
    --bg2: #0a0634;
    --cyan: #00d4ff;
    --partner: #0044e4;
    --special: #bc4aff;
  }
  body {
    width: 1200px; height: 630px;
    font-family: 'Rubik', system-ui, sans-serif;
    background: var(--bg);
    color: white;
    padding: 80px;
    position: relative;
    overflow: hidden;
  }
  .glow1 {
    position: absolute; top: -160px; left: 50%;
    transform: translateX(-50%);
    width: 1100px; height: 600px;
    background: radial-gradient(ellipse at center, rgba(0, 212, 255, 0.30) 0%, transparent 60%);
    pointer-events: none;
  }
  .glow2 {
    position: absolute; right: -100px; bottom: -100px;
    width: 600px; height: 600px;
    background: radial-gradient(circle at center, rgba(188, 74, 255, 0.18) 0%, transparent 70%);
    pointer-events: none;
  }
  .grid {
    position: absolute; inset: 0;
    background-image:
      linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
    background-size: 60px 60px;
    mask-image: linear-gradient(180deg, transparent 0%, black 30%, black 70%, transparent 100%);
  }
  .content { position: relative; z-index: 2; height: 100%; display: flex; flex-direction: column; justify-content: space-between; padding-right: 220px; }
  .badge {
    display: inline-flex; align-items: center; gap: 10px;
    padding: 8px 14px; border-radius: 8px;
    border: 1px solid rgba(0, 68, 228, 0.6);
    background: rgba(0, 68, 228, 0.18);
    width: fit-content;
  }
  .badge .label { color: var(--cyan); font-weight: 700; font-size: 18px; letter-spacing: -0.01em; }
  .badge .sub { color: rgba(255,255,255,0.75); font-size: 12px; letter-spacing: 0.14em; text-transform: uppercase; font-weight: 600; }
  h1 {
    font-size: 76px; line-height: 1.05; font-weight: 800;
    letter-spacing: -0.025em; margin-top: 28px; color: white;
  }
  h1 .accent { color: var(--cyan); }
  p {
    font-size: 28px; color: rgba(255, 255, 255, 0.72);
    margin-top: 20px; max-width: 820px; line-height: 1.35;
  }
  .footer {
    display: flex; justify-content: space-between; align-items: flex-end;
  }
  .author { font-size: 24px; font-weight: 600; color: white; }
  .author .dot { color: var(--cyan); }
  .url {
    font-size: 20px; color: rgba(255,255,255,0.55);
    font-family: 'Roboto Mono', ui-monospace, monospace;
  }
  .portrait {
    position: absolute;
    right: 80px; top: 50%;
    transform: translateY(-50%);
    width: 180px; height: 180px;
    border-radius: 50%;
    object-fit: cover;
    border: 3px solid rgba(0, 212, 255, 0.5);
    box-shadow: 0 0 60px rgba(0, 212, 255, 0.25), 0 8px 24px rgba(0, 0, 0, 0.4);
    z-index: 3;
  }
</style></head><body>
  <div class="glow1"></div>
  <div class="glow2"></div>
  <div class="grid"></div>
  ${photoDataUri ? `<img class="portrait" src="${photoDataUri}" alt="Игорь Шевчик">` : ''}
  <div class="content">
    <div>
      <div class="badge">
        <span class="label">Битрикс24</span>
        <span class="sub">Партнёр</span>
      </div>
      <h1>Кастомная разработка<br>под <span class="accent">Битрикс24</span></h1>
      <p>AI, интеграции, MCP. То, чего нет в маркетплейсе —<br>собираю под вас.</p>
    </div>
    <div class="footer">
      <div class="author">Игорь Шевчик<span class="dot">.</span></div>
      <div class="url">bx-shef.by</div>
    </div>
  </div>
</body></html>`

mkdirSync(dirname(out), { recursive: true })

const browser = await chromium.launch({
  executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH || undefined
})
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } })
await page.setContent(html, { waitUntil: 'networkidle' })
// Дожидаемся реальной готовности шрифтов вместо ненадёжного таймаута —
// иначе на медленном CI скриншот может попасть с fallback-шрифтом.
await page.evaluate(() => document.fonts.ready)
await page.screenshot({ path: out, type: 'png' })
await browser.close()

console.log(`OG image written to ${out}`)
