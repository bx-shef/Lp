<script setup lang="ts">
import type { NuxtError } from '#app'

defineProps<{
  error: NuxtError
}>()

// Тема и язык наследуются из nuxt.config.ts (htmlAttrs).
// Здесь оставляем только то, что специфично для страницы ошибки.
useHead({
  link: [
    { rel: 'icon', href: '/favicon.ico' }
  ]
})
</script>

<template>
  <B24App>
    <B24Error :error="error" />
  </B24App>
</template>
