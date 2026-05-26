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

type YmWindow = Window & { ym?: (id: number, action: string, goal: string) => void }

// Дедуп: не шлём цель дважды за одну отправку формы (srcdoc может дать
// и postMessage, и CustomEvent одновременно).
let goalFiredAt = 0
function reachGoal() {
  const now = Date.now()
  if (now - goalFiredAt < 3000) return
  goalFiredAt = now
  const meta = document.head.querySelector<HTMLMetaElement>('meta[name="ym-id"]')
  const id = meta ? Number(meta.content) : 0
  if (!id) return
  ;(window as YmWindow).ym?.(id, 'reachGoal', 'brief_submit')
}

function onMessage(event: MessageEvent) {
  if (event.data?.type === 'b24:form:submit') reachGoal()
}

onMounted(() => {
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
    + `</body>`

  // postMessage от B24 внутри srcdoc-iframe
  window.addEventListener('message', onMessage)
  // CustomEvent на родительском document (srcdoc — same-origin)
  document.addEventListener('b24:form:submit', reachGoal)
})

onUnmounted(() => {
  window.removeEventListener('message', onMessage)
  document.removeEventListener('b24:form:submit', reachGoal)
})
</script>

<template>
  <div class="rounded-2xl border border-[#272c2f]/10 bg-black/30 backdrop-blur-sm">
    <iframe
      v-if="srcdoc"
      :srcdoc="srcdoc"
      class="w-full min-h-[800px] sm:min-h-[600px] border-0 rounded-2xl"
      title="Форма обратной связи"
      loading="lazy"
    />

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
