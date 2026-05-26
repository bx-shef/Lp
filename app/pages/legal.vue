<script setup lang="ts">
useSeoMeta({
  title: 'Реквизиты — bx-shef.by',
  description: 'Юридические и банковские реквизиты ИП Шевчик И. С.'
})

const rows = [
  ['Сокращённое наименование', 'ИП Шевчик И. С.'],
  ['Ф.И.О.', 'Шевчик Игорь Сергеевич'],
  ['№ свидетельства о гос. регистрации', '192049017'],
  ['Дата свидетельства', '12.09.2013'],
  ['УНП', '192049017'],
  ['Юридический адрес', 'пр. Дзержинского, д. 131, оф. 234, г. Минск, Беларусь, 220025'],
  ['Почтовый адрес', 'пр. Дзержинского, д. 131, оф. 234, г. Минск, Беларусь, 220025']
]

const contacts = [
  ['Email', 'shevchik.mail@gmail.com', 'mailto:shevchik.mail@gmail.com']
]

const bank = [
  ['Банк', 'ЗАО «Альфа-Банк»'],
  ['Адрес банка', 'Республика Беларусь, г. Минск, ул. Сурганова, 43-47'],
  ['БИК', 'ALFABY2X'],
  ['Расчётный счёт', 'BY09ALFA30132120160130270000'],
  ['Валюта счёта', 'BYN'],
  ['SWIFT', 'ALFABY2X']
]
</script>

<template>
  <div class="max-w-[820px] mx-auto px-[22px] lg:px-8 py-16 text-white/80">
    <h1 class="text-4xl font-bold text-white mb-8 tracking-tight">
      Реквизиты
    </h1>

    <section class="mb-12">
      <h2 class="text-xl font-bold text-white mb-4">
        Юридические данные
      </h2>
      <div class="rounded-2xl border border-white/10 bg-white/[0.03] divide-y divide-white/5">
        <div
          v-for="([k, v]) in rows"
          :key="k"
          class="grid grid-cols-1 sm:grid-cols-[260px_1fr] gap-2 sm:gap-6 px-5 py-3.5"
        >
          <div class="text-sm text-white/55">
            {{ k }}
          </div>
          <div class="text-sm text-white/90">
            {{ v }}
          </div>
        </div>
      </div>
    </section>

    <section class="mb-12">
      <h2 class="text-xl font-bold text-white mb-4">
        Контакты
      </h2>
      <div class="rounded-2xl border border-white/10 bg-white/[0.03] divide-y divide-white/5">
        <div
          v-for="([k, v, href]) in contacts"
          :key="k"
          class="grid grid-cols-1 sm:grid-cols-[260px_1fr] gap-2 sm:gap-6 px-5 py-3.5"
        >
          <div class="text-sm text-white/55">
            {{ k }}
          </div>
          <div class="text-sm text-white/90">
            <a
              :href="href"
              target="_blank"
              rel="noopener"
              class="text-[rgb(var(--color-accent-primary-ch))] hover:underline"
            >{{ v }}</a>
          </div>
        </div>
      </div>
    </section>

    <section class="mb-12">
      <h2 class="text-xl font-bold text-white mb-4">
        Банковские реквизиты
      </h2>
      <div class="rounded-2xl border border-white/10 bg-white/[0.03] divide-y divide-white/5">
        <div
          v-for="([k, v]) in bank"
          :key="k"
          class="grid grid-cols-1 sm:grid-cols-[260px_1fr] gap-2 sm:gap-6 px-5 py-3.5"
        >
          <div class="text-sm text-white/55">
            {{ k }}
          </div>
          <div class="text-sm text-white/90 font-mono">
            {{ v }}
          </div>
        </div>
      </div>
    </section>

    <p class="text-xs text-white/45">
      Документы и счета по запросу — напишите на <a
        href="mailto:shevchik.mail@gmail.com"
        class="text-[rgb(var(--color-accent-primary-ch))] hover:underline"
      >shevchik.mail@gmail.com</a>.
    </p>
  </div>
</template>
