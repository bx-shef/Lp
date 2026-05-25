<script setup lang="ts">
// Публичный счётчик через counterapi.dev (бесплатно, без регистрации, без cookies).
const config = useRuntimeConfig()
const count = ref<number | null>(null)
const isErr = ref(false)
let abortController: AbortController | null = null

onMounted(async () => {
  abortController = new AbortController()
  try {
    const ns = encodeURIComponent(config.public.counterNamespace)
    const k = encodeURIComponent(config.public.counterKey)
    const res = await fetch(`https://api.counterapi.dev/v1/${ns}/${k}/up`, {
      signal: abortController.signal
    })
    if (!res.ok) throw new Error('counter')
    const data = await res.json()
    if (typeof data.count === 'number') {
      count.value = data.count
    }
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') return
    isErr.value = true
  }
})

onUnmounted(() => {
  abortController?.abort()
})

const formatted = computed(() => count.value === null ? '…' : count.value.toLocaleString('ru-RU'))
</script>

<template>
  <span
    v-if="!isErr"
    class="text-white/40 text-xs"
  >
    Посещений: <span class="font-mono text-white/70">{{ formatted }}</span>
  </span>
</template>
