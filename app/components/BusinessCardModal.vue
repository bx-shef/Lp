<script setup lang="ts">
import QRCode from 'qrcode'
import DownloadIcon from '@bitrix24/b24icons-vue/actions/DownloadIcon'
import PhoneAddIcon from '@bitrix24/b24icons-vue/outline/PhoneAddIcon'
import TelegramIcon from '@bitrix24/b24icons-vue/outline/TelegramIcon'
import CrossLIcon from '@bitrix24/b24icons-vue/outline/CrossLIcon'
import CheckLIcon from '@bitrix24/b24icons-vue/outline/CheckLIcon'
import FingerprintIcon from '@bitrix24/b24icons-vue/outline/FingerprintIcon'
import CopyIcon from '@bitrix24/b24icons-vue/outline/CopyIcon'

const props = defineProps<{ open: boolean }>()
const emit = defineEmits<{ close: [] }>()

const qrDataUrl = ref('')
// Отдельный высококонтрастный QR (тёмный на белом) для мобильного hold-to-reveal —
// его нужно реально сканировать, в отличие от декоративного белого-на-прозрачном.
const qrScanUrl = ref('')
const contactAdded = ref(false)
const linkCopied = ref(false)
const requisitesSaved = ref(false)
// Удержание кнопки на мобиле показывает QR во весь попап (как «глазик» на пароле).
const showQr = ref(false)
let feedbackTimer: ReturnType<typeof setTimeout> | null = null
let copyTimer: ReturnType<typeof setTimeout> | null = null
let reqTimer: ReturnType<typeof setTimeout> | null = null
// Цель Метрики на показ QR — один раз за открытие, чтобы повторные удержания
// не дублировали событие.
let qrRevealed = false

const { reachGoal } = useMetrikaGoal()

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
  // Ссылка онлайн-записи Б24 — общий модуль (используется и в hero).
  callUrl: B24_BOOKING_URL
} as const

// Генерируем оба QR один раз при маунте компонента.
onMounted(async () => {
  const target = 'https://' + card.site
  try {
    // Десктоп: декоративный белый-на-прозрачном, вписан в тёмную тему карточки.
    qrDataUrl.value = await QRCode.toDataURL(target, {
      width: 180,
      margin: 1,
      color: { dark: '#ffffff', light: '#00000000' },
      errorCorrectionLevel: 'M'
    })
    // Мобильный reveal: тёмный на белом, крупнее — под реальное сканирование.
    qrScanUrl.value = await QRCode.toDataURL(target, {
      width: 260,
      margin: 2,
      color: { dark: '#0a1220', light: '#ffffff' },
      errorCorrectionLevel: 'M'
    })
  } catch {
    // QR остаётся '', пользователь видит skeleton — не критично.
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
    // Сброс при закрытии: иначе если закрыть, удерживая QR, при следующем
    // открытии overlay покажется сразу (pointerup уже не придёт — DOM снят).
    showQr.value = false
    qrRevealed = false
  }
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKey)
  document.body.style.overflow = ''
  if (feedbackTimer) clearTimeout(feedbackTimer)
  if (copyTimer) clearTimeout(copyTimer)
  if (reqTimer) clearTimeout(reqTimer)
})

function handleKey(e: KeyboardEvent) {
  if (e.key === 'Escape') emit('close')
}

// Hold-to-reveal QR: pointer capture удерживает событие на кнопке, даже если
// палец сместился — отпускание гарантированно скрывает QR обратно.
function startQr(e: PointerEvent) {
  const el = e.currentTarget as HTMLElement
  el.setPointerCapture?.(e.pointerId)
  showQr.value = true
  if (!qrRevealed) {
    qrRevealed = true
    reachGoal('card_qr_reveal')
  }
}

function stopQr() {
  showQr.value = false
}

async function copyCallLink() {
  // copyToClipboard — общий util (app/utils/clipboard.ts), авто-импорт.
  const ok = await copyToClipboard(card.callUrl)
  if (!ok) return
  linkCopied.value = true
  reachGoal('card_copy_link')
  if (copyTimer) clearTimeout(copyTimer)
  copyTimer = setTimeout(() => (linkCopied.value = false), 2200)
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

БАНКОВСКИЕ РЕКВИЗИТЫ — ДЛЯ ОПЛАТЫ В BYN
${'─'.repeat(44)}
Банк:                 ЗАО «Альфа-Банк», г. Минск
Адрес банка:          Республика Беларусь, г. Минск,
                      ул. Сурганова, 43-47
БИК / SWIFT:          ALFABY2X
Расчётный счёт:       BY09ALFA30132120160130270000
Валюта:               BYN

БАНКОВСКИЕ РЕКВИЗИТЫ — ДЛЯ ОПЛАТЫ В RUB (из России)
${'─'.repeat(44)}
Банк:                 ЗАО «Альфа-Банк», г. Минск
БИК / SWIFT:          ALFABY2X
Расчётный счёт (RUB): BY92ALFA30132120160010270000
Корр. счёт (в РФ):    30101810200000000593
Валюта:               RUB

${'═'.repeat(44)}
${siteUrl}
`
  triggerDownload(new Blob([txt], { type: 'text/plain;charset=utf-8' }), 'ip-shevchik-requisites.txt')

  requisitesSaved.value = true
  if (reqTimer) clearTimeout(reqTimer)
  reqTimer = setTimeout(() => (requisitesSaved.value = false), 2200)
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
            data-testid="business-card"
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

            <!-- Mobile QR overlay — виден только пока удерживается кнопка снизу.
                 sm:hidden: на десктопе QR и так всегда показан в левой колонке. -->
            <div
              v-if="showQr"
              class="sm:hidden absolute inset-0 z-30 flex flex-col items-center justify-center gap-5 px-6"
              style="background: linear-gradient(135deg, rgba(15,22,36,0.99) 0%, rgba(10,18,30,0.99) 100%);"
            >
              <div class="text-[10px] uppercase tracking-[0.18em] text-white/40 font-mono">
                Сканируйте
              </div>
              <div class="p-4 rounded-2xl bg-white shadow-2xl">
                <img
                  v-if="qrScanUrl"
                  :src="qrScanUrl"
                  alt="QR-код offer.bx-shef.by"
                  class="size-[240px] block"
                >
                <div
                  v-else
                  class="size-[240px] rounded bg-black/5 animate-pulse"
                />
              </div>
              <div class="text-xs text-white/50 font-mono">
                {{ card.site }}
              </div>
            </div>

            <div class="flex flex-col sm:flex-row">
              <!-- LEFT: QR + avatar -->
              <div
                class="flex flex-col items-center justify-center gap-5 px-8 pt-10 pb-5 sm:py-12 sm:w-[220px] shrink-0"
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
                    alt="QR-код offer.bx-shef.by"
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
              <!-- На мобиле верхний паддинг меньше (pt-5): фото и ФИО стоят
                   столбиком, py-10 с обеих сторон давал ~80px пустоты. -->
              <div class="flex flex-col justify-center gap-6 px-8 pt-5 pb-10 sm:py-12 flex-1 min-w-0">
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
                  <!-- Главный CTA + копирование ссылки — сегментированная пара:
                       крупная «Назначить созвон» + узкая кнопка копии справа
                       (общий cyan, разделены тёмной гранью, скруглён весь блок). -->
                  <div
                    class="flex items-stretch w-full rounded-xl overflow-hidden"
                    style="box-shadow: 0 0 24px rgb(var(--color-accent-primary-ch)/0.25);"
                  >
                    <a
                      :href="card.callUrl"
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Назначить созвон — выбрать время (откроется в новой вкладке)"
                      class="flex flex-1 items-center justify-center gap-2.5 h-11 text-sm font-semibold transition-all duration-200 hover:brightness-110"
                      style="background: rgb(var(--color-accent-primary-ch)); color: #0a1220;"
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
                    <button
                      type="button"
                      :aria-label="linkCopied ? 'Ссылка скопирована' : 'Скопировать ссылку на созвон'"
                      class="flex items-center justify-center w-12 shrink-0 h-11 transition-all duration-200 hover:brightness-110"
                      style="background: rgb(var(--color-accent-primary-ch)); color: #0a1220; border-left: 1px solid rgba(10,18,30,0.4);"
                      @click="copyCallLink"
                    >
                      <component
                        :is="linkCopied ? CheckLIcon : CopyIcon"
                        class="size-4"
                      />
                    </button>
                  </div>

                  <!-- Вторичные действия одним сегментом (B24FieldGroup) — компактнее
                       отдельных строк. Фидбек (сохранён) — сменой иконки на «галку»
                       и короткого лейбла на «Готово». -->
                  <B24FieldGroup
                    size="sm"
                    class="w-full"
                  >
                    <B24Button
                      :icon="contactAdded ? CheckLIcon : PhoneAddIcon"
                      :label="contactAdded ? 'Готово' : 'Контакт'"
                      color="air-tertiary-no-accent"
                      aria-label="Добавить в контакты (vCard)"
                      class="flex-1 justify-center"
                      @click="downloadVCard"
                    />
                    <B24Button
                      :icon="requisitesSaved ? CheckLIcon : DownloadIcon"
                      :label="requisitesSaved ? 'Готово' : 'Реквизиты'"
                      color="air-tertiary-no-accent"
                      aria-label="Скачать реквизиты"
                      class="flex-1 justify-center"
                      @click="downloadRequisites"
                    />
                  </B24FieldGroup>

                  <!-- QR hold-to-reveal — круглая кнопка-«отпечаток» (mobile only).
                       Логика удержания та же: setPointerCapture + overlay выше.
                       relative z-40 — над overlay (z-30): при удержании кнопка
                       остаётся видимой и подсвеченной (палец на ней).
                       touch-none/select-none + contextmenu.prevent гасят long-press. -->
                  <div class="sm:hidden relative z-40 flex flex-col items-center gap-2 pt-1">
                    <button
                      type="button"
                      class="flex items-center justify-center size-16 rounded-full transition-all duration-200 select-none touch-none active:scale-95"
                      :style="showQr
                        ? 'background: rgba(var(--color-accent-primary-ch)/0.22); border: 1px solid rgba(var(--color-accent-primary-ch)/0.6); box-shadow: 0 0 28px rgb(var(--color-accent-primary-ch)/0.35); -webkit-touch-callout: none;'
                        : 'background: rgba(var(--color-accent-primary-ch)/0.1); border: 1px solid rgba(var(--color-accent-primary-ch)/0.3); -webkit-touch-callout: none;'"
                      aria-label="Показать QR-код для сканирования — удерживайте"
                      @pointerdown.prevent="startQr"
                      @pointerup="stopQr"
                      @pointercancel="stopQr"
                      @contextmenu.prevent
                    >
                      <FingerprintIcon
                        class="size-8"
                        :style="{ color: 'rgb(var(--color-accent-primary-ch))' }"
                      />
                    </button>
                    <span class="text-[11px] font-mono text-white/40">
                      {{ showQr ? 'Отпустите' : 'Удерживайте — покажет QR' }}
                    </span>
                  </div>
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
