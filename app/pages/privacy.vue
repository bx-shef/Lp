<script setup lang="ts">
useSeoMeta({
  title: 'Политика конфиденциальности — bx-shef.by',
  description: 'Какие данные собираются на сайте и как используются.'
})
</script>

<template>
  <div class="max-w-[760px] mx-auto px-[22px] lg:px-8 py-16 text-white/80">
    <h1 class="text-4xl font-bold text-white mb-6 tracking-tight">
      Политика конфиденциальности
    </h1>

    <p class="mb-6">
      Сайт <a href="https://bx-shef.by" class="text-[rgb(var(--color-accent-primary-ch))] hover:underline">bx-shef.by</a>
      принадлежит ИП Шевчик Игорь (далее — оператор). Текст ниже описывает, какие данные
      собираются и как используются.
    </p>

    <h2 class="text-2xl font-bold text-white mt-8 mb-3">
      Какие данные собираются
    </h2>
    <ul class="list-disc list-outside ml-5 space-y-2 mb-6">
      <li><strong class="text-white">Данные формы:</strong> имя, email и текст описания задачи. Передаются в CRM Битрикс24 для обработки обращения.</li>
      <li><strong class="text-white">Счётчик посещений:</strong> анонимный, через counterapi.dev. Без cookies, без долговременного хранения IP.</li>
      <li><strong class="text-white">Серверные логи:</strong> стандартные access-логи хостинга, не более 30 дней.</li>
    </ul>

    <h2 class="text-2xl font-bold text-white mt-8 mb-3">
      Как используются данные
    </h2>
    <ul class="list-disc list-outside ml-5 space-y-2 mb-6">
      <li>Данные формы — только для ответа на ваш запрос и последующей коммуникации.</li>
      <li>Третьим лицам данные не передаются, в рассылки не включаются.</li>
      <li>По запросу данные удаляются — напишите на <a href="mailto:shevchik.mail@gmail.com" class="text-[rgb(var(--color-accent-primary-ch))] hover:underline">shevchik.mail@gmail.com</a>.</li>
    </ul>

    <h2 class="text-2xl font-bold text-white mt-8 mb-3">
      Контакты оператора
    </h2>
    <ul class="list-disc list-outside ml-5 space-y-1">
      <li>Email: <a href="mailto:shevchik.mail@gmail.com" class="text-[rgb(var(--color-accent-primary-ch))] hover:underline">shevchik.mail@gmail.com</a></li>
      <li>Telegram: <a href="https://t.me/IgorShevchik" class="text-[rgb(var(--color-accent-primary-ch))] hover:underline">@IgorShevchik</a></li>
    </ul>
  </div>
</template>
