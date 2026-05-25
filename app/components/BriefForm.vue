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

  const loaderSrc = `${b24FormScriptUrl}?${Math.floor(Date.now() / 180000)}`
  const formAttr = `inline/${b24FormId}/${b24FormSecret}`

  // Тег закрытия script разбит на '<' + '/script>', чтобы HTML-парсер не
  // выходил из блока раньше времени (актуально для srcdoc-строки).
  const closeScript = '<' + '/script>'

  srcdoc.value = `<!doctype html>`
    + `<meta charset="utf-8">`
    + `<meta name="viewport" content="width=device-width,initial-scale=1">`
    + `<style>*{box-sizing:border-box}body{margin:0;padding:0;background-color:#272c2f;}</style>`
    + `<body>`
    + `<script data-b24-form="${formAttr}" data-skip-moving="true">${closeScript}`
    + `<script src="${loaderSrc}" async>${closeScript}`
    + `</body>`
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
      class="p-6 sm:p-8 space-y-4"
    >
      <div class="text-white/55 text-sm">
        Здесь будет форма Битрикс24. Подключите её через переменные окружения
        <code class="px-1.5 py-0.5 bg-white/10 rounded text-xs font-mono text-[rgb(var(--color-accent-primary-ch))]">NUXT_PUBLIC_B24_FORM_*</code>
      </div>
      <div class="text-sm space-y-2">
        <p class="font-semibold text-white">
          А пока — прямые контакты:
        </p>
        <ul class="space-y-1 list-disc list-inside text-white/70">
          <li>
            Email:
            <a
              href="mailto:shevchik.mail@gmail.com"
              class="text-[rgb(var(--color-accent-primary-ch))] hover:underline"
            >shevchik.mail@gmail.com</a>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>
