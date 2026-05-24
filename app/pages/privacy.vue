<script setup lang="ts">
useSeoMeta({
  title: 'Политика конфиденциальности — bx-shef.by',
  description: 'Какие данные собираются на сайте и как используются.'
})
</script>

<template>
  <div class="max-w-[760px] mx-auto px-[22px] lg:px-8 py-16 prose prose-zinc">
    <ProseH1>Политика конфиденциальности</ProseH1>

    <ProseP>
      Сайт <a href="https://bx-shef.by">bx-shef.by</a> принадлежит ИП Шевчик Игорь
      (далее — оператор). Текст ниже описывает, какие данные собираются и как используются.
    </ProseP>

    <ProseH2>Какие данные собираются</ProseH2>
    <ul>
      <li><strong>Данные формы:</strong> имя, email и текст описания задачи. Передаются в CRM Битрикс24 для обработки обращения.</li>
      <li><strong>Счётчик посещений:</strong> анонимный, через сервис counterapi.dev. Не использует cookies, не сохраняет IP и user-agent в долговременную базу.</li>
      <li><strong>Серверные логи:</strong> стандартные access-логи хостинга (IP, время запроса), хранятся не более 30 дней для целей безопасности.</li>
    </ul>

    <ProseH2>Как используются данные</ProseH2>
    <ul>
      <li>Данные формы — только для ответа на ваш запрос и последующей коммуникации в рамках обсуждения проекта.</li>
      <li>Третьим лицам данные не передаются, в рассылки не включаются.</li>
      <li>По вашему запросу данные могут быть удалены — напишите на <a href="mailto:hi@bx-shef.by">hi@bx-shef.by</a>.</li>
    </ul>

    <ProseH2>Контакты оператора</ProseH2>
    <ul>
      <li>Email: <a href="mailto:hi@bx-shef.by">hi@bx-shef.by</a></li>
      <li>Telegram: <a href="https://t.me/IgorShevchik">@IgorShevchik</a></li>
    </ul>
  </div>
</template>
