<script setup lang="ts">
/**
 * Слот для встройки Битрикс24 веб-формы.
 *
 * Как подключить новую форму:
 * 1. Битрикс24 → CRM → CRM-формы → Создать. Поля:
 *    - Имя (обязательное)
 *    - Email (обязательное)
 *    - Описание задачи (textarea, обязательное)
 * 2. Тексты в форме:
 *    - Заголовок: «Расскажите о задаче»
 *    - Подзаголовок: «Прочитаю и отвечу в течение рабочего дня. Бюджет и сроки обсудим в созвоне.»
 *    - Кнопка: «Отправить задачу»
 *    - После отправки: «Получил вашу заявку. Отвечу в течение рабочего дня на указанный контакт.»
 *    - При ошибке: «Не удалось отправить. Проверьте подключение или напишите в Telegram @IgorShevchik»
 * 3. Embed-код из вкладки «Встраивание» — атрибуты:
 *    - src= → NUXT_PUBLIC_B24_FORM_SCRIPT_URL
 *    - data-b24-form="inline/ID/SECRET" → ID/SECRET в соответствующие переменные
 *
 * Безопасность: src скрипта валидируется против allowlist доменов Битрикс24
 * (cdn-ru.bitrix24.*, cdn.bitrix24.*). Если URL не из allowlist — скрипт не
 * добавляется, форма не загружается. При HMR в dev предотвращается дубль
 * через проверку, не вставлен ли скрипт ранее.
 */
const config = useRuntimeConfig()
const hasForm = computed(() => !!config.public.b24FormScriptUrl)

// Allowlist хостов Битрикс24-CDN для встроенных форм.
// Любой URL вне этого списка — НЕ загружается (защита от подмены ENV).
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
  // Защита от HMR-дубля: если форма уже добавлена при пред. mount — пропускаем
  if (host.querySelector('script[data-b24-form]')) return
  // Защита от подмены ENV: src должен быть с домена Битрикс24
  if (!isAllowedB24Host(config.public.b24FormScriptUrl)) {
    console.warn('[BriefForm] script URL не из allowlist Битрикс24, форма не загружена')
    return
  }
  const s = document.createElement('script')
  s.async = true
  s.src = config.public.b24FormScriptUrl
  s.setAttribute('data-b24-form', `inline/${config.public.b24FormId || ''}/${config.public.b24FormSecret || ''}`)
  s.setAttribute('data-skip-moving', 'true')
  host.appendChild(s)
})
</script>

<template>
  <div class="rounded-2xl border border-white/10 bg-black/30 backdrop-blur-sm p-6 sm:p-8">
    <div id="b24-form-host" />

    <div v-if="!hasForm" class="space-y-4">
      <div class="text-white/55 text-sm">
        Здесь будет форма Битрикс24. Подключите её через переменные окружения
        <code class="px-1.5 py-0.5 bg-white/10 rounded text-xs font-mono text-[rgb(var(--color-accent-primary-ch))]">NUXT_PUBLIC_B24_FORM_*</code>
      </div>
      <div class="text-sm space-y-2">
        <p class="font-semibold text-white">
          А пока — прямые контакты:
        </p>
        <ul class="space-y-1 list-disc list-inside text-white/70">
          <li>Telegram:
            <a href="https://t.me/IgorShevchik" class="text-[rgb(var(--color-accent-primary-ch))] hover:underline">@IgorShevchik</a>
          </li>
          <li>Email:
            <a href="mailto:shevchik.mail@gmail.com" class="text-[rgb(var(--color-accent-primary-ch))] hover:underline">shevchik.mail@gmail.com</a>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>
