<script setup lang="ts">
// Реквизиты ИП.
const { public: { buildId } } = useRuntimeConfig()

const legal = {
  short: 'ИП Шевчик И. С.',
  unp: 'УНП 192049017',
  email: 'offer@bx-shef.by',
  city: 'Минск, Беларусь'
}

interface ToolLink {
  id: string
  label: string
  href: string
}

// Бесплатные мини-инструменты — крючок/доверие, держим вне зоны конверсии.
const tools: ToolLink[] = [
  { id: 'currency', label: 'Конвертер валют', href: 'https://currency-converter.bx-shef.by/' },
  { id: 'bbcode', label: 'BBCode ↔ Markdown', href: 'https://bx-shef.github.io/app-convert-bbocode-md/' }
]
</script>

<template>
  <div class="flex flex-col gap-2 text-xs text-white/55">
    <div class="flex flex-wrap items-center gap-x-4 gap-y-1">
      <span>© {{ new Date().getFullYear() }} {{ legal.short }}</span>
      <span class="font-mono">{{ legal.unp }}</span>
      <span>{{ legal.city }}</span>
    </div>
    <div class="flex flex-wrap items-center gap-x-4 gap-y-1">
      <a
        :href="`mailto:${legal.email}`"
        class="hover:text-white hover:underline"
      >{{ legal.email }}</a>
      <NuxtLink
        to="/legal"
        class="hover:text-white hover:underline"
      >
        Реквизиты
      </NuxtLink>
      <NuxtLink
        to="/privacy"
        class="hover:text-white hover:underline"
      >
        Политика конфиденциальности
      </NuxtLink>
      <span class="font-mono text-white/30">build {{ buildId.slice(0, 7) }}</span>
    </div>
    <div class="flex flex-wrap items-center gap-x-4 gap-y-1 pt-1">
      <span class="uppercase tracking-[0.14em] text-white/30 font-mono text-[10px]">Бесплатные инструменты</span>
      <a
        v-for="t in tools"
        :key="t.id"
        :href="t.href"
        target="_blank"
        rel="noopener noreferrer"
        class="font-mono hover:text-white hover:underline"
      >{{ t.label }}</a>
    </div>
  </div>
</template>
