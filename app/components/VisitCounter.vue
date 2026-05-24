<script setup lang="ts">
// Простой публичный счётчик посещений через counterapi.dev
// Бесплатно, без регистрации, без cookies. На каждый mount — +1 к счётчику.
const config = useRuntimeConfig()
const count = ref<number | null>(null)
const isErr = ref(false)

onMounted(async () => {
  try {
    const ns = config.public.counterNamespace
    const k = config.public.counterKey
    // up = инкремент и возврат текущего значения
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
  <span v-if="!isErr" class="text-(--air-base-50) text-xs">
    Посещений: <span class="font-mono">{{ formatted }}</span>
  </span>
</template>
