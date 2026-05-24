<script setup lang="ts">
// Публичный счётчик через counterapi.dev (бесплатно, без регистрации, без cookies).
const config = useRuntimeConfig()
const count = ref<number | null>(null)
const isErr = ref(false)

onMounted(async () => {
  try {
    const ns = config.public.counterNamespace
    const k = config.public.counterKey
    const res = await fetch(`https://api.counterapi.dev/v1/${ns}/${k}/up`)
    if (!res.ok) throw new Error('counter')
    const data = await res.json()
    count.value = data.count ?? null
  } catch {
    isErr.value = true
  }
})

const formatted = computed(() => count.value === null ? '…' : count.value.toLocaleString('ru-RU'))
</script>

<template>
  <span v-if="!isErr" class="text-white/40 text-xs">
    Посещений: <span class="font-mono text-white/70">{{ formatted }}</span>
  </span>
</template>
