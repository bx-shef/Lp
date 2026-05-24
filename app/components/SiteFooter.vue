<script setup lang="ts">
// Реквизиты ИП. ЗАПОЛНИТЕ под себя.
// Источник: ваша визитка на b24-egthuw.b24site.online (фетч заблокирован
// сетевой политикой, поэтому placeholder — замените на реальные данные).
const legal = {
  name: 'ИП Шевчик Игорь — заполнить полное имя',
  unp: 'УНП — заполнить',
  address: 'г. ___ , Республика Беларусь — заполнить',
  email: 'hi@bx-shef.by',
  telegram: '@IgorShevchik',
  registered: 'Год регистрации — заполнить'
}
</script>

<template>
  <div class="flex flex-col gap-2 text-xs text-(--air-base-50)">
    <div class="flex flex-wrap items-center gap-x-4 gap-y-1">
      <span>© {{ new Date().getFullYear() }} {{ legal.name }}</span>
      <span>{{ legal.unp }}</span>
      <VisitCounter />
    </div>
    <div class="flex flex-wrap items-center gap-x-4 gap-y-1">
      <a :href="`mailto:${legal.email}`" class="hover:text-(--air-base) hover:underline">{{ legal.email }}</a>
      <a :href="`https://t.me/${legal.telegram.replace('@', '')}`" target="_blank" rel="noopener" class="hover:text-(--air-base) hover:underline">{{ legal.telegram }}</a>
      <a href="/privacy" class="hover:text-(--air-base) hover:underline">Политика конфиденциальности</a>
    </div>
  </div>
</template>
