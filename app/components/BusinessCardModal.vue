<script setup lang="ts">
import QRCode from 'qrcode'
import DownloadIcon from '@bitrix24/b24icons-vue/actions/DownloadIcon'
import PhoneAddIcon from '@bitrix24/b24icons-vue/outline/PhoneAddIcon'
import TelegramIcon from '@bitrix24/b24icons-vue/outline/TelegramIcon'
import CrossLIcon from '@bitrix24/b24icons-vue/outline/CrossLIcon'
import CheckLIcon from '@bitrix24/b24icons-vue/outline/CheckLIcon'

const props = defineProps<{ open: boolean }>()
const emit = defineEmits<{ close: [] }>()

const qrDataUrl = ref('')
const contactAdded = ref(false)
let feedbackTimer: ReturnType<typeof setTimeout> | null = null

const siteUrl = useRuntimeConfig().public.siteUrl as string

// Публичные реквизиты ИП — намеренно хардкодены, это публичная визитка.
const card = {
  name: 'Игорь Шевчик',
  role: 'Кастомная разработка под Битрикс24',
  org: 'ИП Шевчик И. С.',
  unp: 'УНП 192049017',
  phone: '+375 29 736-01-26',
  phoneTel: '+375297360126',
  email: 'shevchik.mail@gmail.com',
  telegram: '@bxshefby',
  city: 'Минск, Беларусь',
  legalAddress: 'пр. Дзержинского, д. 131, кв. 234, г. Минск, Беларусь, 220025',
  site: 'offer.bx-shef.by',
  // Публичная ссылка на онлайн-запись в календарь Б24 — согласовать время созвона.
  callUrl: 'https://bel.bitrix24.by/~IEg2A'
} as const

// Генерируем QR один раз при маунте компонента.
onMounted(async () => {
  try {
    qrDataUrl.value = await QRCode.toDataURL('https://' + card.site, {
      width: 180,
      margin: 1,
      color: { dark: '#ffffff', light: '#00000000' },
      errorCorrectionLevel: 'M'
    })
  } catch {
    // qrDataUrl остаётся '', пользователь видит skeleton — не критично.
  }
})

// Scroll-lock и keyboard-trap привязаны к состоянию open, а не к маунту.
watch(() => props.open, (isOpen) => {
  if (!import.meta.client) return
  if (isOpen) {
    document.addEventListener('keydown', handleKey)
    document.body.style.overflow = 'hidden'
  } else {
    document.removeEventListener('keydown', handleKey)
    document.body.style.overflow = ''
  }
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKey)
  document.body.style.overflow = ''
  if (feedbackTimer) clearTimeout(feedbackTimer)
})

function handleKey(e: KeyboardEvent) {
  if (e.key === 'Escape') emit('close')
}

function onBackdropClick(e: MouseEvent) {
  if ((e.target as HTMLElement).dataset.backdrop) emit('close')
}

function downloadVCard() {
  const vcf = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `FN:${card.name}`,
    `N:Шевчик;Игорь;Сергеевич;;`,
    `ORG:${card.org}`,
    `TITLE:${card.role}`,
    `TEL;TYPE=CELL:${card.phoneTel}`,
    `EMAIL:${card.email}`,
    `URL:https://${card.site}`,
    `ADR;TYPE=WORK:;;пр. Дзержинского\\, д. 131\\, кв. 234;Минск;;220025;BY`,
    `NOTE:AI\\, интеграции\\, MCP под Битрикс24. ${card.unp}.`,
    'END:VCARD'
  ].join('\r\n')

  triggerDownload(new Blob([vcf], { type: 'text/vcard;charset=utf-8' }), 'igor-shevchik.vcf')

  contactAdded.value = true
  if (feedbackTimer) clearTimeout(feedbackTimer)
  // 2.2 с — достаточно чтобы прочесть «Контакт сохранён» и не затягивать.
  feedbackTimer = setTimeout(() => (contactAdded.value = false), 2200)
}

function downloadRequisites() {
  const txt = `РЕКВИЗИТЫ
${card.org}
${'═'.repeat(44)}

ЮРИДИЧЕСКИЕ ДАННЫЕ
${'─'.repeat(44)}
Наименование:         ИП Шевчик И. С.
Ф.И.О.:               Шевчик Игорь Сергеевич
УНП:                  192049017
Свидетельство:        192049017 от 12.09.2013
Юр. адрес:            ${card.legalAddress}

КОНТАКТЫ
${'─'.repeat(44)}
Телефон:              ${card.phone}
Email:                ${card.email}
Telegram:             ${card.telegram}
Сайт:                 ${siteUrl}

БАНКОВСКИЕ РЕКВИЗИТЫ
${'─'.repeat(44)}
Банк:                 ЗАО «Альфа-Банк»
Адрес банка:          Республика Беларусь, г. Минск,
                      ул. Сурганова, 43-47
БИК / SWIFT:          ALFABY2X
Расчётный счёт:       BY09ALFA30132120160130270000
Валюта:               BYN

${'═'.repeat(44)}
${siteUrl}
`
  triggerDownload(new Blob([txt], { type: 'text/plain;charset=utf-8' }), 'ip-shevchik-requisites.txt')
}

// Вставляем <a> в DOM перед кликом — без этого Firefox не скачивает text/vcard.
// revokeObjectURL через setTimeout — Safari читает blob асинхронно.
// 1000 мс вместо 100: на медленных устройствах браузер успевает начать скачивание до отзыва URL.
function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = Object.assign(document.createElement('a'), { href: url, download: filename })
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
</script>

<template>
  <!-- v-if живёт здесь, а не в родителе — чтобы leave-анимация отрабатывала. -->
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="open"
        data-backdrop="1"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/70 backdrop-blur-sm"
        @click="onBackdropClick"
      >
        <!-- Card -->
        <Transition
          appear
          enter-active-class="transition duration-[250ms] ease-out"
          enter-from-class="opacity-0 scale-95 translate-y-2"
          enter-to-class="opacity-100 scale-100 translate-y-0"
        >
          <div
            class="relative w-full max-w-[680px] rounded-3xl overflow-hidden shadow-2xl"
            style="background: linear-gradient(135deg, rgba(15,22,36,0.98) 0%, rgba(10,18,30,0.98) 100%); border: 1px solid rgba(255,255,255,0.1);"
          >
            <!-- Glow accent top -->
            <div
              class="absolute inset-x-0 top-0 h-px"
              style="background: linear-gradient(90deg, transparent, rgb(var(--color-accent-primary-ch)/0.8), transparent);"
            />

            <!-- Close -->
            <button
              type="button"
              class="absolute top-4 right-4 z-10 flex items-center justify-center size-8 rounded-xl text-white/40 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Закрыть"
              @click="emit('close')"
            >
              <CrossLIcon class="size-4" />
            </button>

            <div class="flex flex-col sm:flex-row">
              <!-- LEFT: QR + avatar -->
              <div
                class="flex flex-col items-center justify-center gap-5 px-8 py-10 sm:py-12 sm:w-[220px] shrink-0"
                style="background: linear-gradient(160deg, rgba(var(--color-accent-primary-ch)/0.08) 0%, rgba(0,0,0,0) 70%);"
              >
                <!-- Photo -->
                <img
                  src="/igor.jpg"
                  alt="Игорь Шевчик"
                  class="size-20 rounded-full object-cover border-2 shadow-lg shrink-0"
                  style="border-color: rgb(var(--color-accent-primary-ch)/0.5); box-shadow: 0 0 28px rgb(var(--color-accent-primary-ch)/0.2);"
                  loading="eager"
                >

                <!-- QR Code -->
                <div
                  class="hidden sm:block relative p-3 rounded-2xl"
                  style="background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 0 32px rgb(var(--color-accent-primary-ch)/0.12);"
                >
                  <img
                    v-if="qrDataUrl"
                    :src="qrDataUrl"
                    alt="QR-код bx-shef.by"
                    class="size-[120px] block"
                  >
                  <div
                    v-else
                    class="size-[120px] rounded-lg bg-white/5 animate-pulse"
                  />
                </div>

                <div class="hidden sm:block text-center">
                  <div class="text-[10px] uppercase tracking-[0.18em] text-white/30 font-mono">
                    Сканируй
                  </div>
                  <div class="text-xs text-white/50 font-mono mt-0.5">
                    {{ card.site }}
                  </div>
                </div>
              </div>

              <!-- Divider -->
              <div class="hidden sm:block w-px self-stretch my-8 bg-white/[0.07]" />
              <div class="sm:hidden h-px mx-8 bg-white/[0.07]" />

              <!-- RIGHT: Details -->
              <div class="flex flex-col justify-center gap-6 px-8 py-10 sm:py-12 flex-1 min-w-0">
                <!-- Name & title -->
                <div>
                  <h2 class="text-2xl font-bold text-white tracking-tight leading-tight">
                    {{ card.name }}
                  </h2>
                  <p class="mt-1 text-sm text-white/50 leading-snug max-w-[240px]">
                    {{ card.role }}
                  </p>
                  <p class="mt-2 text-xs font-mono text-white/30">
                    {{ card.org }} · {{ card.unp }}
                  </p>
                </div>

                <!-- Contacts -->
                <!-- PhoneIcon и MailIcon отсутствуют в b24icons — используем inline SVG. -->
                <ul class="flex flex-col gap-2.5">
                  <li>
                    <a
                      :href="`tel:${card.phoneTel}`"
                      class="group flex items-center gap-3 text-sm text-white/70 hover:text-white transition-colors"
                    >
                      <span
                        class="flex items-center justify-center size-8 rounded-lg shrink-0 transition-colors"
                        style="background: rgba(var(--color-accent-primary-ch)/0.12);"
                      >
                        <svg
                          class="size-4"
                          :style="{ color: 'rgb(var(--color-accent-primary-ch))' }"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="1.8"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        >
                          <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 8.63 19.79 19.79 0 01.01 5.01 2 2 0 012 2.84l3-.01a2 2 0 012 1.72c.127.96.362 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0122 16.92z" />
                        </svg>
                      </span>
                      <span class="font-mono">{{ card.phone }}</span>
                    </a>
                  </li>
                  <li>
                    <a
                      :href="`mailto:${card.email}`"
                      class="group flex items-center gap-3 text-sm text-white/70 hover:text-white transition-colors"
                    >
                      <span
                        class="flex items-center justify-center size-8 rounded-lg shrink-0"
                        style="background: rgba(var(--color-accent-primary-ch)/0.12);"
                      >
                        <svg
                          class="size-4"
                          :style="{ color: 'rgb(var(--color-accent-primary-ch))' }"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="1.8"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        >
                          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                          <polyline points="22,6 12,13 2,6" />
                        </svg>
                      </span>
                      <span>{{ card.email }}</span>
                    </a>
                  </li>
                  <li>
                    <a
                      :href="`https://t.me/${card.telegram.replace('@', '')}`"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="group flex items-center gap-3 text-sm text-white/70 hover:text-white transition-colors"
                    >
                      <span
                        class="flex items-center justify-center size-8 rounded-lg shrink-0"
                        style="background: rgba(var(--color-accent-primary-ch)/0.12);"
                      >
                        <TelegramIcon
                          class="size-4"
                          :style="{ color: 'rgb(var(--color-accent-primary-ch))' }"
                        />
                      </span>
                      <span class="font-mono">{{ card.telegram }}</span>
                    </a>
                  </li>
                </ul>

                <!-- Actions -->
                <div class="flex flex-col gap-2.5">
                  <!-- Schedule a call — главный CTA: онлайн-согласование времени созвона (календарь Б24) -->
                  <a
                    :href="card.callUrl"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="flex items-center justify-center gap-2.5 w-full h-11 rounded-xl text-sm font-semibold transition-all duration-200 hover:brightness-110"
                    style="background: rgb(var(--color-accent-primary-ch)); color: #0a1220; box-shadow: 0 0 24px rgb(var(--color-accent-primary-ch)/0.25);"
                  >
                    <svg
                      class="size-4 shrink-0"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="1.8"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <rect
                        x="3"
                        y="4"
                        width="18"
                        height="18"
                        rx="2"
                      />
                      <line
                        x1="16"
                        y1="2"
                        x2="16"
                        y2="6"
                      />
                      <line
                        x1="8"
                        y1="2"
                        x2="8"
                        y2="6"
                      />
                      <line
                        x1="3"
                        y1="10"
                        x2="21"
                        y2="10"
                      />
                    </svg>
                    <span>Назначить созвон</span>
                  </a>

                  <!-- Add to contacts -->
                  <button
                    type="button"
                    class="group relative flex items-center justify-center gap-2.5 w-full h-11 rounded-xl text-sm font-semibold overflow-hidden transition-all duration-200"
                    :class="contactAdded
                      ? 'text-white'
                      : 'text-[rgb(var(--color-accent-primary-ch))] hover:text-white'"
                    :style="contactAdded
                      ? 'background: rgba(var(--color-accent-success-ch)/0.25); border: 1px solid rgba(var(--color-accent-success-ch)/0.4);'
                      : 'background: rgba(var(--color-accent-primary-ch)/0.12); border: 1px solid rgba(var(--color-accent-primary-ch)/0.25);'"
                    @click="downloadVCard"
                  >
                    <Transition
                      mode="out-in"
                      enter-active-class="transition duration-200"
                      enter-from-class="opacity-0 scale-75"
                      enter-to-class="opacity-100 scale-100"
                      leave-active-class="transition duration-150"
                      leave-from-class="opacity-100 scale-100"
                      leave-to-class="opacity-0 scale-75"
                    >
                      <CheckLIcon
                        v-if="contactAdded"
                        class="size-4 shrink-0"
                        style="color: rgb(var(--color-accent-success-ch));"
                      />
                      <PhoneAddIcon
                        v-else
                        class="size-4 shrink-0"
                      />
                    </Transition>
                    <span>{{ contactAdded ? 'Контакт сохранён' : 'Добавить в контакты' }}</span>
                  </button>

                  <!-- Download requisites -->
                  <button
                    type="button"
                    class="flex items-center justify-center gap-2.5 w-full h-11 rounded-xl text-sm font-semibold text-white/60 hover:text-white/90 transition-colors"
                    style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08);"
                    @click="downloadRequisites"
                  >
                    <DownloadIcon class="size-4 shrink-0" />
                    <span>Скачать реквизиты</span>
                  </button>
                </div>
              </div>
            </div>

            <!-- Bottom accent line -->
            <div
              class="absolute inset-x-0 bottom-0 h-px"
              style="background: linear-gradient(90deg, transparent, rgba(var(--color-accent-partner-ch)/0.4), transparent);"
            />
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>
