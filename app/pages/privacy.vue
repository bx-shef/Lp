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
      Сайт <a
        href="https://bx-shef.by"
        class="text-[rgb(var(--color-accent-primary-ch))] hover:underline"
      >bx-shef.by</a>
      принадлежит ИП Шевчик Игорь (далее — оператор). Текст ниже описывает, какие данные
      собираются и как используются.
    </p>

    <h2 class="text-2xl font-bold text-white mt-8 mb-3">
      Какие данные собираются
    </h2>
    <ul class="list-disc list-outside ml-5 space-y-2 mb-6">
      <li><strong class="text-white">Данные форм:</strong> только то, что вы сами вписали в поля формы (например, имя, e-mail, телефон, описание задачи) — состав полей у каждой формы свой и виден в ней. Данные отправляются в Битрикс24 оператора при отправке формы и попадают в CRM для обработки обращения.</li>
      <li>
        <strong class="text-white">Аналитика:</strong> сайт использует <a
          href="https://metrika.yandex.ru"
          target="_blank"
          rel="noopener"
          class="text-[rgb(var(--color-accent-primary-ch))] hover:underline"
        >Яндекс Метрику</a>. Сервис собирает данные о посещениях: страницы, источники трафика, клики, скролл. Включён <strong class="text-white">Вебвизор</strong> — запись сессий (движения мыши и действия на странице); данные сессий хранятся на серверах Яндекса и недоступны нам напрямую. Подробнее — в <a
          href="https://yandex.ru/legal/confidential/"
          target="_blank"
          rel="noopener"
          class="text-[rgb(var(--color-accent-primary-ch))] hover:underline"
        >политике конфиденциальности Яндекса</a>.
      </li>
      <li><strong class="text-white">Шрифты:</strong> загружаются с того же домена (self-hosted) — не уходят в Google Fonts CDN.</li>
      <li><strong class="text-white">Серверные логи:</strong> веб-сервер ведёт стандартный журнал запросов (IP-адрес, время, адрес страницы, браузер) — для защиты от атак и разбора сбоев; журнал не используется для идентификации посетителей и хранится ограниченное время.</li>
    </ul>

    <h2 class="text-2xl font-bold text-white mt-8 mb-3">
      Как используются данные
    </h2>
    <ul class="list-disc list-outside ml-5 space-y-2 mb-6">
      <li>Данные форм — только для ответа на ваш запрос и последующей коммуникации.</li>
      <li>Третьим лицам данные не передаются. Рекламные письма — только клиентам, в каждом есть ссылка «Отписаться»; письма по договору (счёт, окончание лицензии) приходят и после отписки.</li>
      <li>
        По запросу данные удаляются — напишите на <a
          href="mailto:offer@bx-shef.by"
          class="text-[rgb(var(--color-accent-primary-ch))] hover:underline"
        >offer@bx-shef.by</a>.
      </li>
    </ul>

    <h2 class="text-2xl font-bold text-white mt-8 mb-3">
      Контакты оператора
    </h2>
    <ul class="list-disc list-outside ml-5 space-y-1">
      <li>
        Email: <a
          href="mailto:offer@bx-shef.by"
          class="text-[rgb(var(--color-accent-primary-ch))] hover:underline"
        >offer@bx-shef.by</a>
      </li>
    </ul>
  </div>
</template>
