<script setup lang="ts">
// Реквизиты ИП. ВАЖНО: shevchik.mail@gmail.com используется как
// контактный email до момента, пока не будет настроен hi@bx-shef.by на домене.
const legal = {
  short: 'ИП Шевчик И. С.',
  unp: 'УНП 192049017',
  phone: '+375 29 736-01-26',
  email: 'shevchik.mail@gmail.com',
  telegram: '@bxshefby',
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
      <a
        :href="`tel:${legal.phone.replace(/\s|-/g, '')}`"
        class="hover:text-white hover:underline"
      >{{ legal.phone }}</a>
      <a
        :href="`https://t.me/${legal.telegram.replace('@', '')}`"
        target="_blank"
        rel="noopener"
        class="hover:text-white hover:underline"
      >{{ legal.telegram }}</a>
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
    </div>
  </div>
</template>
