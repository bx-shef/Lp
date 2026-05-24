<script setup lang="ts">
// Слот для встройки Битрикс24 веб-формы.
//
// Как подключить:
// 1. Битрикс24 → CRM → CRM-формы → Создать. Поля:
//    - Имя (обязательное)
//    - Email (обязательное)
//    - Описание задачи (textarea, обязательное)
// 2. Тексты в форме:
//    - Заголовок: «Расскажите о задаче»
//    - Подзаголовок: «Прочитаю и отвечу в течение рабочего дня. Бюджет и сроки обсудим в созвоне.»
//    - Кнопка: «Отправить»
//    - После отправки: «Получил вашу заявку. Отвечу в течение рабочего дня на указанный контакт.»
//    - При ошибке: «Не удалось отправить. Проверьте подключение или напишите в Telegram @IgorShevchik»
// 3. Embed-код из вкладки «Встраивание» — атрибуты:
//    - src= → NUXT_PUBLIC_B24_FORM_SCRIPT_URL
//    - data-b24-form="inline/ID/SECRET" → ID/SECRET в соответствующие переменные

const config = useRuntimeConfig()
const hasForm = computed(() => !!config.public.b24FormScriptUrl)

onMounted(() => {
  if (!hasForm.value) return
  const s = document.createElement('script')
  s.async = true
  s.src = config.public.b24FormScriptUrl
  s.setAttribute('data-b24-form', 'inline/' + (config.public.b24FormId || '') + '/' + (config.public.b24FormSecret || ''))
  s.setAttribute('data-skip-moving', 'true')
  document.getElementById('b24-form-host')?.appendChild(s)
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
            <a href="mailto:hi@bx-shef.by" class="text-[rgb(var(--color-accent-primary-ch))] hover:underline">hi@bx-shef.by</a>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>
