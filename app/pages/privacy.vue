<script setup lang="ts">
import { SELLER, POLICY_URL, COOKIES_URL } from '#shared/legal'

useSeoMeta({
  title: 'Политика обработки персональных данных — bx-shef.by',
  description: `Политика обработки персональных данных и политика cookie — ${SELLER.name}.`
})
</script>

<template>
  <div
    data-testid="privacy-content"
    class="max-w-[760px] mx-auto px-[22px] lg:px-8 py-16 text-white/80"
  >
    <h1 class="text-4xl font-bold text-white mb-6 tracking-tight">
      Политика обработки персональных данных
    </h1>

    <p class="mb-6">
      Оператор персональных данных — {{ SELLER.name }}, УНП {{ SELLER.unp }}, {{ SELLER.address }}.
      Действующие тексты документов размещены на сервере лицензий:
    </p>

    <ul class="list-disc list-outside ml-5 space-y-2 mb-6">
      <li>
        <a
          :href="POLICY_URL"
          class="text-[rgb(var(--color-accent-primary-ch))] hover:underline"
        >Политика обработки персональных данных</a>
      </li>
      <li>
        <a
          :href="COOKIES_URL"
          class="text-[rgb(var(--color-accent-primary-ch))] hover:underline"
        >Политика использования cookie</a>
      </li>
    </ul>

    <p>
      Вопросы и запросы по персональным данным — <a
        :href="`mailto:${SELLER.email}`"
        class="text-[rgb(var(--color-accent-primary-ch))] hover:underline"
      >{{ SELLER.email }}</a>.
      Изменить выбор по cookie — «Настроить cookie» внизу страницы.
    </p>
  </div>
</template>
