<script setup lang="ts">
import CopyIcon from '@bitrix24/b24icons-vue/outline/CopyIcon'
import CheckLIcon from '@bitrix24/b24icons-vue/outline/CheckLIcon'
import { SELLER, BANK, POLICY_URL, COOKIES_URL, PRODUCT_DOCS } from '#shared/legal'

useSeoMeta({
  title: 'Реквизиты — bx-shef.by',
  description: `Юридические и банковские реквизиты ${SELLER.name}`
})

// Реквизиты продублированы для ИИ-агентов в public/legal.md — менять вместе.
// Источник данных — shared/legal.ts.
const rows: [string, string][] = [
  ['Сокращённое наименование', SELLER.name],
  ['УНП', SELLER.unp],
  ['Юридический адрес', SELLER.address],
  ['Почтовый адрес', SELLER.address]
]

const contacts: [string, string, string][] = [
  ['Телефон', SELLER.phone, `tel:${SELLER.phoneTel}`],
  ['Email', SELLER.email, `mailto:${SELLER.email}`]
]

// Банковские реквизиты — заглушки до регистрации счёта.
const bankGroups: { title: string, rows: [string, string][] }[] = [
  {
    title: 'Для оплаты в BYN (Беларусь)',
    rows: [
      ['Банк', BANK.bank],
      ['БИК', BANK.bic],
      ['Расчётный счёт (BYN)', BANK.account],
      ['Расчётный счёт (RUB)', BANK.accountRub],
      ['Валюта счёта', 'BYN']
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
              <span class="min-w-0 break-words">{{ v }}</span>
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

    <section class="mb-12">
      <h2 class="text-xl font-bold text-white mb-4">
        Документы
      </h2>
      <ul
        data-testid="legal-docs"
        class="rounded-2xl border border-white/10 bg-white/[0.03] divide-y divide-white/5 text-sm"
      >
        <li class="px-5 py-3.5">
          <a
            :href="POLICY_URL"
            target="_blank"
            rel="noopener"
            class="text-[rgb(var(--color-accent-primary-ch))] hover:underline"
          >Политика обработки персональных данных</a>
        </li>
        <li class="px-5 py-3.5">
          <a
            :href="COOKIES_URL"
            target="_blank"
            rel="noopener"
            class="text-[rgb(var(--color-accent-primary-ch))] hover:underline"
          >Политика использования cookie</a>
        </li>
        <li
          v-for="p in PRODUCT_DOCS"
          :key="p.code"
          class="px-5 py-3.5 flex flex-wrap gap-x-4 gap-y-1"
        >
          <span class="text-white/90">{{ p.title }}:</span>
          <a
            :href="p.offer"
            target="_blank"
            rel="noopener"
            class="text-[rgb(var(--color-accent-primary-ch))] hover:underline"
          >Публичная оферта</a>
          <a
            :href="p.eula"
            target="_blank"
            rel="noopener"
            class="text-[rgb(var(--color-accent-primary-ch))] hover:underline"
          >Лицензионное соглашение</a>
        </li>
      </ul>
    </section>

    <p class="text-xs text-white/45 mb-4">
      {{ SELLER.partner }}.
    </p>

    <p class="text-xs text-white/45">
      Документы и счета по запросу — напишите на <a
        href="mailto:offer@bx-shef.by"
        class="text-[rgb(var(--color-accent-primary-ch))] hover:underline"
      >offer@bx-shef.by</a>.
    </p>
  </div>
</template>
