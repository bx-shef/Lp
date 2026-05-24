<script setup lang="ts">
// Слот для встройки Битрикс24 веб-формы.
//
// Как подключить:
// 1. Зайти в свой портал Битрикс24 → CRM → CRM-формы → создать форму с полями:
//    - Имя (обязательное)
//    - Email (обязательное)
//    - Описание задачи (textarea, обязательное)
// 2. Настроить тексты в форме:
//    - Заголовок: «Расскажите о задаче»
//    - Подзаголовок: «Прочитаю и отвечу в течение рабочего дня. Бюджет и сроки обсудим в созвоне.»
//    - Кнопка отправки: «Отправить»
//    - Сообщение после отправки: «Получил вашу заявку. Отвечу в течение рабочего дня на указанный контакт.»
//    - Сообщение при ошибке: «Не удалось отправить. Проверьте подключение или напишите в Telegram @IgorShevchik»
// 3. Взять embed-код (тег script) из вкладки «Встраивание».
// 4. В .env установить NUXT_PUBLIC_B24_FORM_SCRIPT_URL равным значению атрибута src,
//    NUXT_PUBLIC_B24_FORM_ID и NUXT_PUBLIC_B24_FORM_SECRET — из data-b24-form="inline/ID/SECRET".

const config = useRuntimeConfig()

const hasForm = computed(() => !!config.public.b24FormScriptUrl)

onMounted(() => {
  if (!hasForm.value) return
  // Стандартный паттерн встройки Б24 web-form: загружаем внешний скрипт,
  // который сам найдёт div и отрендерит форму в нужном месте.
  const s = document.createElement('script')
  s.async = true
  s.src = config.public.b24FormScriptUrl
  s.setAttribute('data-b24-form', 'inline/' + (config.public.b24FormId || '') + '/' + (config.public.b24FormSecret || ''))
  s.setAttribute('data-skip-moving', 'true')
  document.getElementById('b24-form-host')?.appendChild(s)
})
</script>

<template>
  <div class="rounded-2xl border border-(--air-border) bg-(--air-theme-bg-color) p-6 sm:p-9">
    <!-- Слот, в который Б24 встроит свою форму -->
    <div id="b24-form-host" />

    <!-- Fallback: показывается, если ENV переменные ещё не настроены -->
    <div v-if="!hasForm" class="space-y-4">
      <div class="text-(--air-base-50) text-sm">
        Здесь будет форма Битрикс24. Подключите её через переменные окружения
        <code class="px-1 py-0.5 bg-(--air-tinted) rounded text-xs">NUXT_PUBLIC_B24_FORM_*</code>.
      </div>
      <div class="text-sm space-y-2">
        <p class="font-semibold">А пока — прямые контакты:</p>
        <ul class="space-y-1 list-disc list-inside text-(--air-base-50)">
          <li>Telegram: <a href="https://t.me/IgorShevchik" class="text-[#0066a1] hover:underline">@IgorShevchik</a></li>
          <li>Email: <a href="mailto:hi@bx-shef.by" class="text-[#0066a1] hover:underline">hi@bx-shef.by</a></li>
        </ul>
      </div>
    </div>
  </div>
</template>
