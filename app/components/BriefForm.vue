<script setup lang="ts">
/**
 * Собственный UI формы заявки — нативный для dark vibecode-стилистики лендинга.
 * Issue #2: вынесена из embed-скрипта в свой компонент.
 *
 * Стратегия отправки (выбирается автоматически по доступной конфигурации):
 *
 * 1. **REST через incoming webhook Битрикс24** (если задан NUXT_PUBLIC_B24_WEBHOOK_URL)
 *    POST {url}crm.lead.add.json с полями {NAME, EMAIL, COMMENTS, SOURCE}
 *    Создаёт лида в CRM напрямую, без iframe и без перерисовки нашего UI.
 *    Требует: в Битрикс24 → Разработчикам → Входящий вебхук → дать право `crm`.
 *
 * 2. **Embed-фолбэк** (если webhook не задан)
 *    Используется старый embed-скрипт Б24 — рендерит свою форму поверх нашего UI.
 *    Стилистически не идеален, но всегда работает.
 *
 * 3. **Mailto-фолбэк** (если и embed-параметры пусты)
 *    Открывает почтовый клиент с pre-filled темой и телом.
 */

import CircleCheckIcon from '@bitrix24/b24icons-vue/outline/CircleCheckIcon'
import AlertIcon from '@bitrix24/b24icons-vue/outline/AlertIcon'

const config = useRuntimeConfig()

const hasWebhook = computed(() => !!config.public.b24WebhookUrl)
const hasEmbed = computed(() => !!config.public.b24FormScriptUrl)

// Состояния формы
type FormState = 'idle' | 'submitting' | 'success' | 'error'
const state = ref<FormState>('idle')
const errorText = ref('')

// Поля
const name = ref('')
const email = ref('')
const task = ref('')

// Honeypot — скрытое поле для отлова ботов
const company = ref('')

const isValid = computed(() =>
  name.value.trim().length >= 2
  && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)
  && task.value.trim().length >= 10
)

// Allowlist хостов для webhook (страховка от подмены ENV)
const B24_HOST_ALLOWLIST = ['.bitrix24.com', '.bitrix24.by', '.bitrix24.ru', '.bitrix24.kz', '.bitrix24.tech']

function isAllowedB24Host(rawUrl: string): boolean {
  try {
    const u = new URL(rawUrl)
    if (u.protocol !== 'https:') return false
    return B24_HOST_ALLOWLIST.some(suffix => u.hostname.endsWith(suffix))
  } catch {
    return false
  }
}

async function submit() {
  if (company.value) return // honeypot triggered — silently ignore
  if (!isValid.value) return
  if (state.value === 'submitting') return

  state.value = 'submitting'
  errorText.value = ''

  try {
    if (hasWebhook.value && isAllowedB24Host(config.public.b24WebhookUrl)) {
      await submitViaWebhook()
    } else {
      // Если webhook не настроен — открываем mailto как универсальный fallback.
      // Embed-вариант не используем здесь, чтобы не плодить два UI на одной странице.
      submitViaMailto()
    }
    state.value = 'success'
  } catch (e) {
    state.value = 'error'
    errorText.value = e instanceof Error ? e.message : 'Не удалось отправить'
  }
}

async function submitViaWebhook() {
  const url = config.public.b24WebhookUrl.replace(/\/+$/, '') + '/crm.lead.add.json'
  const payload = {
    fields: {
      TITLE: `Заявка с bx-shef.by — ${name.value.trim()}`,
      NAME: name.value.trim(),
      EMAIL: [{ VALUE: email.value.trim(), VALUE_TYPE: 'WORK' }],
      COMMENTS: task.value.trim(),
      SOURCE_ID: 'WEB',
      SOURCE_DESCRIPTION: 'bx-shef.by'
    },
    params: { REGISTER_SONET_EVENT: 'Y' }
  }
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const data = await res.json()
  if (data.error) throw new Error(data.error_description || data.error)
}

function submitViaMailto() {
  const subject = encodeURIComponent(`Заявка с bx-shef.by — ${name.value.trim()}`)
  const body = encodeURIComponent(
    `Имя: ${name.value.trim()}\nEmail: ${email.value.trim()}\n\nЗадача:\n${task.value.trim()}\n\n— Отправлено через форму на bx-shef.by`
  )
  window.location.href = `mailto:shevchik.mail@gmail.com?subject=${subject}&body=${body}`
}

function reset() {
  state.value = 'idle'
  errorText.value = ''
  name.value = ''
  email.value = ''
  task.value = ''
  company.value = ''
}
</script>

<template>
  <div class="rounded-2xl border border-white/10 bg-black/30 backdrop-blur-sm p-6 sm:p-8">
    <!-- IDLE / SUBMITTING / ERROR -->
    <form
      v-if="state !== 'success'"
      class="flex flex-col gap-4"
      novalidate
      @submit.prevent="submit"
    >
      <!-- Honeypot — скрыто визуально, видно ботам -->
      <input
        v-model="company"
        type="text"
        name="company"
        tabindex="-1"
        autocomplete="off"
        aria-hidden="true"
        class="absolute -left-[9999px] -top-[9999px] opacity-0 pointer-events-none"
      >

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <label class="flex flex-col gap-1.5">
          <span class="text-xs font-mono uppercase tracking-[0.12em] text-white/55">Имя</span>
          <input
            v-model="name"
            type="text"
            required
            minlength="2"
            placeholder="Как к вам обращаться"
            :disabled="state === 'submitting'"
            class="bg-white/5 border border-white/10 focus:border-[rgb(var(--color-accent-primary-ch))] rounded-lg px-3.5 py-2.5 text-white placeholder:text-white/30 outline-none transition-colors disabled:opacity-50"
          >
        </label>

        <label class="flex flex-col gap-1.5">
          <span class="text-xs font-mono uppercase tracking-[0.12em] text-white/55">Email</span>
          <input
            v-model="email"
            type="email"
            required
            placeholder="your@email.com"
            :disabled="state === 'submitting'"
            class="bg-white/5 border border-white/10 focus:border-[rgb(var(--color-accent-primary-ch))] rounded-lg px-3.5 py-2.5 text-white placeholder:text-white/30 outline-none transition-colors disabled:opacity-50"
          >
        </label>
      </div>

      <label class="flex flex-col gap-1.5">
        <span class="text-xs font-mono uppercase tracking-[0.12em] text-white/55">Опишите задачу</span>
        <textarea
          v-model="task"
          required
          minlength="10"
          rows="5"
          placeholder="Например: к нам приходит 30 КП в месяц от поставщиков, менеджер тратит час на каждое. Хотим автоматизировать матчинг с каталогом и создание сделки."
          :disabled="state === 'submitting'"
          class="bg-white/5 border border-white/10 focus:border-[rgb(var(--color-accent-primary-ch))] rounded-lg px-3.5 py-2.5 text-white placeholder:text-white/30 outline-none transition-colors disabled:opacity-50 resize-y min-h-[120px]"
        />
      </label>

      <div v-if="state === 'error'" class="flex items-start gap-2 text-sm text-[rgb(var(--color-accent-alert-ch))]">
        <AlertIcon class="size-4 mt-0.5 shrink-0" />
        <span>Не удалось отправить ({{ errorText }}). Напишите в <a href="https://t.me/IgorShevchik" target="_blank" rel="noopener" class="underline">Telegram</a> или на <a href="mailto:shevchik.mail@gmail.com" class="underline">shevchik.mail@gmail.com</a>.</span>
      </div>

      <div class="flex flex-wrap items-center gap-4 pt-2">
        <button
          type="submit"
          :disabled="!isValid || state === 'submitting'"
          class="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-[rgb(var(--color-accent-primary-ch))] text-[#030022] font-semibold text-sm hover:brightness-110 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed transition"
        >
          <span
            v-if="state === 'submitting'"
            class="inline-block size-4 border-2 border-current border-t-transparent rounded-full animate-spin"
            aria-hidden="true"
          />
          <span>{{ state === 'submitting' ? 'Отправка…' : 'Отправить задачу' }}</span>
        </button>

        <span class="text-xs text-white/45">
          Без спама. Данные — только для ответа на запрос.
          <NuxtLink to="/privacy" class="underline hover:text-white/70">Подробнее</NuxtLink>
        </span>
      </div>

      <!-- Информер о fallback-канале (если webhook не настроен) -->
      <div v-if="!hasWebhook && hasEmbed" class="text-[10px] font-mono text-white/30 pt-2 border-t border-white/5">
        ⚠ Webhook не настроен — отправка идёт через mailto. Чтобы заявки попадали в CRM напрямую,
        задайте <code>NUXT_PUBLIC_B24_WEBHOOK_URL</code> в env.
      </div>
    </form>

    <!-- SUCCESS -->
    <div v-else class="flex flex-col items-start gap-4 py-4">
      <div class="inline-flex items-center justify-center size-12 rounded-full bg-[rgb(var(--color-accent-success-ch)/0.18)] text-[rgb(var(--color-accent-success-ch))]">
        <CircleCheckIcon class="size-6" />
      </div>
      <h3 class="text-2xl font-bold text-white">
        Получил вашу заявку
      </h3>
      <p class="text-white/70">
        Отвечу в течение рабочего дня на <span class="font-mono text-white">{{ email }}</span>.
        Если срочно — напишите в <a href="https://t.me/IgorShevchik" target="_blank" rel="noopener" class="text-[rgb(var(--color-accent-primary-ch))] hover:underline">Telegram @IgorShevchik</a>.
      </p>
      <button
        type="button"
        class="text-sm text-white/55 hover:text-white underline"
        @click="reset"
      >
        Отправить ещё одну заявку
      </button>
    </div>
  </div>
</template>
