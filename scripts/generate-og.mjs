#!/usr/bin/env node
/**
 * Генератор OG-картинки: рендерит HTML-шаблон 1200×630 в PNG.
 *
 * Запуск: pnpm og
 * Требует: playwright (devDep) и установленный chromium.
 *
 * Перегенерируйте после изменения заголовка/подзаголовка.
 */
import { chromium } from 'playwright'
import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const out = resolve(__dirname, '../public/og-image.png')

const html = `<!DOCTYPE html>
<html lang="ru"><head><meta charset="UTF-8">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    width: 1200px; height: 630px;
    font-family: 'Inter', system-ui, sans-serif;
    background: linear-gradient(135deg, #ffffff 0%, #f0f8ff 60%, #e0f1fc 100%);
    color: #292426;
    padding: 80px;
    position: relative;
    overflow: hidden;
  }
  .grid {
    position: absolute; inset: 0;
    background-image:
      linear-gradient(rgba(47, 199, 247, 0.06) 1px, transparent 1px),
      linear-gradient(90deg, rgba(47, 199, 247, 0.06) 1px, transparent 1px);
    background-size: 60px 60px;
  }
  .blob {
    position: absolute; right: -120px; top: -120px;
    width: 560px; height: 560px; border-radius: 50%;
    background: radial-gradient(circle, #2fc7f7 0%, rgba(47, 199, 247, 0) 70%);
    opacity: 0.5;
  }
  .content { position: relative; z-index: 2; height: 100%; display: flex; flex-direction: column; justify-content: space-between; }
  .badge {
    display: inline-flex; align-items: center; gap: 10px;
    padding: 8px 16px; border-radius: 10px;
    border: 2px solid #0066a1; background: white;
    font-size: 20px; font-weight: 700;
    width: fit-content;
  }
  .badge .label { color: #0066a1; }
  .badge .sub { color: #292426; font-size: 14px; letter-spacing: 0.12em; text-transform: uppercase; }
  h1 {
    font-size: 88px; line-height: 1.05; font-weight: 800;
    letter-spacing: -0.025em; margin-top: 40px;
  }
  h1 .accent { color: #0066a1; }
  p {
    font-size: 32px; color: #555;
    margin-top: 24px; max-width: 920px;
    line-height: 1.35;
  }
  .footer {
    display: flex; justify-content: space-between; align-items: flex-end;
  }
  .author {
    font-size: 24px; font-weight: 600; color: #292426;
  }
  .author .dot { color: #2fc7f7; }
  .url {
    font-size: 22px; color: #6b6b6b; font-family: ui-monospace, monospace;
  }
</style></head><body>
  <div class="grid"></div>
  <div class="blob"></div>
  <div class="content">
    <div>
      <div class="badge">
        <span class="label">Битрикс24</span>
        <span class="sub">Партнёр</span>
      </div>
      <h1>AI-агент внутри<br>вашего <span class="accent">Битрикс24</span></h1>
      <p>Документы, заказы, запросы — разбирает сам.<br>Менеджер только согласует в привычной карточке.</p>
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
await page.screenshot({ path: out, type: 'png' })
await browser.close()

console.log(`OG image written to ${out}`)
