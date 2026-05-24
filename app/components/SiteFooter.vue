<script setup lang="ts">
// Реквизиты ИП. ЗАПОЛНИТЕ под себя.
const legal = {
  name: 'ИП Шевчик Игорь — заполнить полное имя',
  unp: 'УНП — заполнить',
  email: 'hi@bx-shef.by',
  telegram: '@IgorShevchik'
}
</script>

<template>
  <div class="flex flex-col gap-2 text-xs text-white/55">
    <div class="flex flex-wrap items-center gap-x-4 gap-y-1">
      <span>© {{ new Date().getFullYear() }} {{ legal.name }}</span>
      <span class="font-mono">{{ legal.unp }}</span>
      <VisitCounter />
    </div>
    <div class="flex flex-wrap items-center gap-x-4 gap-y-1">
      <a :href="`mailto:${legal.email}`" class="hover:text-white hover:underline">{{ legal.email }}</a>
      <a :href="`https://t.me/${legal.telegram.replace('@', '')}`" target="_blank" rel="noopener" class="hover:text-white hover:underline">{{ legal.telegram }}</a>
      <NuxtLink to="/privacy" class="hover:text-white hover:underline">
        Политика конфиденциальности
      </NuxtLink>
    </div>
  </div>
</template>
