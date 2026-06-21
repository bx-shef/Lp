<script setup lang="ts">
import CopyIcon from '@bitrix24/b24icons-vue/outline/CopyIcon'
import CheckLIcon from '@bitrix24/b24icons-vue/outline/CheckLIcon'

useSeoMeta({
  title: 'Реквизиты — bx-shef.by',
  description: 'Юридические и банковские реквизиты ИП Шевчик И. С.'
})

const rows: [string, string][] = [
  ['Сокращённое наименование', 'ИП Шевчик И. С.'],
  ['Ф.И.О.', 'Шевчик Игорь Сергеевич'],
  ['№ свидетельства о гос. регистрации', '192049017'],
  ['Дата свидетельства', '12.09.2013'],
  ['Орган регистрации', 'Мингорисполком'],
  ['УНП', '192049017'],
  ['Юридический адрес', 'пр. Дзержинского, д. 131, оф. 234, г. Минск, Беларусь, 220025'],
  ['Почтовый адрес', 'пр. Дзержинского, д. 131, оф. 234, г. Минск, Беларусь, 220025']
]

const contacts: [string, string, string][] = [
  ['Email', 'shevchik.mail@gmail.com', 'mailto:shevchik.mail@gmail.com']
]

// Два набора банковских реквизитов: BYN (Беларусь) и RUB (для оплаты из РФ —
// рублёвый счёт в том же Альфа-Банке + корр. счёт в России).
const bankGroups: { title: string, rows: [string, string][] }[] = [
  {
    title: 'Для оплаты в BYN (Беларусь)',
    rows: [
      ['Банк', 'ЗАО «Альфа-Банк», г. Минск'],
      ['Адрес банка', 'Республика Беларусь, г. Минск, ул. Сурганова, 43-47'],
      ['БИК / SWIFT', 'ALFABY2X'],
      ['Расчётный счёт', 'BY09ALFA30132120160130270000'],
      ['Валюта счёта', 'BYN']
    ]
  },
  {
    title: 'Для оплаты в RUB (из России)',
    rows: [
      ['Банк', 'ЗАО «Альфа-Банк», г. Минск'],
      ['Адрес банка', 'Республика Беларусь, г. Минск, ул. Сурганова, 43-47'],
      ['БИК / SWIFT', 'ALFABY2X'],
      ['Расчётный счёт (RUB)', 'BY92ALFA30132120160010270000'],
      ['Корр. счёт (в РФ)', '30101810200000000593'],
      ['Валюта счёта', 'RUB']
    ]
  }
]

// Покнопочное копирование значения каждой строки реквизитов — удобно при
// ручном переносе. copiedId хранит id только что скопированной строки (для
// «галки»); copyToClipboard — общий util (app/utils/clipboard.ts).
const copiedId = ref<string | null>(null)
let copyTimer: ReturnType<typeof setTimeout> | null = null

async function copy(id: string, value: string) {
  if (!(await copyToClipboard(value))) return
  copiedId.value = id
  if (copyTimer) clearTimeout(copyTimer)
  copyTimer = setTimeout(() => (copiedId.value = null), 1500)
}

onUnmounted(() => {
  if (copyTimer) clearTimeout(copyTimer)
})
</script>

<template>
  <div
    data-testid="legal-content"
    class="max-w-[820px] mx-auto px-[22px] lg:px-8 py-16 text-white/80"
  >
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
          <div class="flex items-start gap-2 text-sm text-white/90">
            <span class="min-w-0 break-words">{{ v }}</span>
            <button
              type="button"
              class="shrink-0 mt-0.5 text-white/30 hover:text-white transition-colors"
              :aria-label="copiedId === 'legal:' + k ? 'Скопировано' : 'Скопировать: ' + k"
              @click="copy('legal:' + k, v)"
            >
              <component
                :is="copiedId === 'legal:' + k ? CheckLIcon : CopyIcon"
                class="size-3.5"
              />
            </button>
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
          <div class="flex items-center gap-2 text-sm text-white/90">
            <a
              :href="href"
              target="_blank"
              rel="noopener"
              class="text-[rgb(var(--color-accent-primary-ch))] hover:underline"
            >{{ v }}</a>
            <button
              type="button"
              class="shrink-0 text-white/30 hover:text-white transition-colors"
              :aria-label="copiedId === 'contact:' + k ? 'Скопировано' : 'Скопировать: ' + k"
              @click="copy('contact:' + k, v)"
            >
              <component
                :is="copiedId === 'contact:' + k ? CheckLIcon : CopyIcon"
                class="size-3.5"
              />
            </button>
          </div>
        </div>
      </div>
    </section>

    <section class="mb-12">
      <h2 class="text-xl font-bold text-white mb-4">
        Банковские реквизиты
      </h2>
      <div
        v-for="group in bankGroups"
        :key="group.title"
        class="mb-6 last:mb-0"
      >
        <h3 class="text-sm font-semibold text-white/70 mb-2">
          {{ group.title }}
        </h3>
        <div class="rounded-2xl border border-white/10 bg-white/[0.03] divide-y divide-white/5">
          <div
            v-for="([k, v]) in group.rows"
            :key="k"
            class="grid grid-cols-1 sm:grid-cols-[260px_1fr] gap-2 sm:gap-6 px-5 py-3.5"
          >
            <div class="text-sm text-white/55">
              {{ k }}
            </div>
            <div class="flex items-start gap-2 text-sm text-white/90 font-mono">
              <span class="min-w-0 break-all">{{ v }}</span>
              <button
                type="button"
                class="shrink-0 mt-0.5 text-white/30 hover:text-white transition-colors"
                :aria-label="copiedId === group.title + ':' + k ? 'Скопировано' : 'Скопировать: ' + k"
                @click="copy(group.title + ':' + k, v)"
              >
                <component
                  :is="copiedId === group.title + ':' + k ? CheckLIcon : CopyIcon"
                  class="size-3.5"
                />
              </button>
            </div>
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
