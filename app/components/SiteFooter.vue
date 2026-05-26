<script setup lang="ts">
// Реквизиты ИП. ВАЖНО: shevchik.mail@gmail.com используется как
// контактный email до момента, пока не будет настроен hi@bx-shef.by на домене.
const { public: { buildId } } = useRuntimeConfig()

const legal = {
  short: 'ИП Шевчик И. С.',
  unp: 'УНП 192049017',
  email: 'shevchik.mail@gmail.com',
  city: 'Минск, Беларусь'
}
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
  </div>
</template>
