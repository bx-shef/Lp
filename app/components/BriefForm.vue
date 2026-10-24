<script setup lang="ts">
const config = useRuntimeConfig()

const ID_RE = /^[a-zA-Z0-9_-]+$/

const B24_HOST_ALLOWLIST = [
  '.bitrix24.com',
  '.bitrix24.by',
  '.bitrix24.ru',
  '.bitrix24.kz',
  '.bitrix24.tech'
] as const

function isAllowedB24Host(rawUrl: string): boolean {
  try {
    const u = new URL(rawUrl)
    if (u.protocol !== 'https:') return false
    return B24_HOST_ALLOWLIST.some(suffix => u.hostname.endsWith(suffix))
  } catch {
    return false
  }
}

const srcdoc = ref('')

// b24:form:submit fires inside the srcdoc iframe; events don't cross frame
// boundaries, so the iframe relays via postMessage and we listen here.
function onFrameMessage(e: MessageEvent) {
  if (e.data !== 'b24:form:submit') return
  const id = Number(config.public.metrikaId)
  if (!id) return
  const w = window as Window & { ym?: (...args: unknown[]) => void }
  w.ym?.(id, 'reachGoal', 'brief_submit')
}

// Загрузчик формы Б24 пишет метки посетителя (b24_crm_guest_*) — до согласия на cookie
// форма грузится только по кнопке: человек сам просит форму.
const needsClick = ref(false)

onMounted(() => {
  const w = window as Window & { BxConsent?: { granted: () => boolean, onAnalytics: (fn: () => void) => void } }
  if (w.BxConsent && !w.BxConsent.granted()) {
    needsClick.value = true
    w.BxConsent.onAnalytics(loadForm)
    return
  }
  loadForm()
})

function loadForm() {
  needsClick.value = false
  if (srcdoc.value) return
  const { b24FormScriptUrl, b24FormId, b24FormSecret } = config.public

  if (!b24FormScriptUrl || !b24FormId || !b24FormSecret) return

  if (!isAllowedB24Host(b24FormScriptUrl)) {
    console.warn('[BriefForm] script URL не из allowlist Битрикс24, форма не загружена')
    return
  }

  if (!ID_RE.test(b24FormId) || !ID_RE.test(b24FormSecret)) {
    console.warn('[BriefForm] невалидный b24FormId или b24FormSecret, форма не загружена')
    return
  }

  const formAttr = `inline/${b24FormId}/${b24FormSecret}`

  // Тег закрытия script разбит на '<' + '/script>', чтобы Vue SFC-парсер не
  // закрывал блок <script setup> раньше времени.
  const closeScript = '<' + '/script>'

  // Точная копия официального Bitrix24 embed: маркер с IIFE внутри, который
  // создаёт тег загрузчика и вставляет его перед маркером. Загрузчик при запуске
  // находит следующий за собой элемент с [data-b24-form] и рендерит форму там.
  srcdoc.value = `<!doctype html>`
    + `<meta charset="utf-8">`
    + `<meta name="viewport" content="width=device-width,initial-scale=1">`
    + `<style>*{box-sizing:border-box}body{margin:0;padding:0;background-color:#1e2226;}</style>`
    + `<body>`
    + `<script data-b24-form="${formAttr}" data-skip-moving="true">`
    + `(function(w,d,u){var s=d.createElement('script');s.async=true;s.src=u+'?'+(Date.now()/180000|0);var h=d.getElementsByTagName('script')[0];h.parentNode.insertBefore(s,h);})(window,document,'${b24FormScriptUrl}');`
    + `${closeScript}`
    + `<script>document.addEventListener('b24:form:submit',function(){window.parent.postMessage('b24:form:submit','*')})${closeScript}`
    + `</body>`

  window.addEventListener('message', onFrameMessage)
}

onUnmounted(() => {
  window.removeEventListener('message', onFrameMessage)
})
</script>

<template>
  <div class="rounded-2xl border border-[#272c2f]/10 bg-black/30 backdrop-blur-sm">
    <iframe
      v-if="srcdoc"
      :srcdoc="srcdoc"
      class="w-full min-h-[800px] sm:min-h-[640px] border-0 rounded-2xl"
      title="Форма обратной связи"
      loading="lazy"
    />

    <div
      v-else-if="needsClick"
      class="min-h-[400px] flex flex-col items-center justify-center gap-4 px-6 text-center"
    >
      <p class="text-white/70 text-sm max-w-[420px]">
        Форма работает на Битрикс24 и сохраняет в браузере метки визита.
      </p>
      <button
        type="button"
        class="min-h-[44px] px-5 rounded-xl bg-[#2fc6f6] text-[#0b1a22] font-semibold"
        @click="loadForm"
      >
        Показать форму
      </button>
    </div>

    <div
      v-else
      class="min-h-[400px] flex items-center justify-center"
    >
      <p class="text-white/50 text-sm">
        Форма не настроена — задайте переменные <code class="font-mono">NUXT_PUBLIC_B24_FORM_*</code>
      </p>
    </div>
  </div>
</template>
