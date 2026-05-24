<script setup lang="ts">
/**
 * Слот для встройки Битрикс24 веб-формы.
 *
 * Точное воспроизведение оригинальной B24-встройки. Оригинал состоит из inline
 * script-тега с атрибутом data-b24-form и тела-IIFE, который создаёт второй
 * script с loader_1.js?(timestamp). Loader при загрузке ищет на странице тег
 * с атрибутом data-b24-form и рендерит форму на его месте.
 *
 * Воссоздаём оба тега программно:
 *  1) marker-script с data-b24-form (БЕЗ src) — отмечает позицию формы
 *  2) loader-script с src и cache-busting timestamp (без data-b24-form)
 *
 * Безопасность: src loader проверяется против allowlist доменов Битрикс24,
 * при HMR в dev-режиме не делаем повторную вставку.
 */
const config = useRuntimeConfig()
const hasForm = computed(() => !!config.public.b24FormScriptUrl)

const B24_HOST_ALLOWLIST = [
  '.bitrix24.com',
  '.bitrix24.by',
  '.bitrix24.ru',
  '.bitrix24.kz',
  '.bitrix24.tech'
] as const

function isAllowedB24Host(rawUrl: string): boolean {
  try {
    const u = new URL(rawUrl)
    if (u.protocol !== 'https:') return false
    return B24_HOST_ALLOWLIST.some(suffix => u.hostname.endsWith(suffix))
  } catch {
    return false
  }
}

onMounted(() => {
  if (!hasForm.value) return
  const host = document.getElementById('b24-form-host')
  if (!host) return
  // HMR-guard
  if (host.querySelector('script[data-b24-form]')) return
  if (!isAllowedB24Host(config.public.b24FormScriptUrl)) {
    console.warn('[BriefForm] script URL не из allowlist Битрикс24, форма не загружена')
    return
  }

  // 1. Marker — отмечает позицию, куда B24-loader вставит форму
  const marker = document.createElement('script')
  marker.setAttribute('data-b24-form', `inline/${config.public.b24FormId || ''}/${config.public.b24FormSecret || ''}`)
  marker.setAttribute('data-skip-moving', 'true')
  host.appendChild(marker)

  // 2. Loader с cache-busting (как в оригинальном IIFE: Date.now()/180000|0 = новое значение каждые 3 минуты)
  const loader = document.createElement('script')
  loader.async = true
  loader.src = `${config.public.b24FormScriptUrl}?${Math.floor(Date.now() / 180000)}`
  host.appendChild(loader)
})
</script>

<template>
  <div class="rounded-2xl border border-white/10 bg-black/30 backdrop-blur-sm p-6 sm:p-8">
    <div id="b24-form-host" />

    <div
      v-if="!hasForm"
      class="space-y-4"
    >
      <div class="text-white/55 text-sm">
        Здесь будет форма Битрикс24. Подключите её через переменные окружения
        <code class="px-1.5 py-0.5 bg-white/10 rounded text-xs font-mono text-[rgb(var(--color-accent-primary-ch))]">NUXT_PUBLIC_B24_FORM_*</code>
      </div>
      <div class="text-sm space-y-2">
        <p class="font-semibold text-white">
          А пока — прямые контакты:
        </p>
        <ul class="space-y-1 list-disc list-inside text-white/70">
          <li>
            Telegram:
            <a
              href="https://t.me/bxshefby"
              class="text-[rgb(var(--color-accent-primary-ch))] hover:underline"
            >@bxshefby</a>
          </li>
          <li>
            Email:
            <a
              href="mailto:shevchik.mail@gmail.com"
              class="text-[rgb(var(--color-accent-primary-ch))] hover:underline"
            >shevchik.mail@gmail.com</a>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>
