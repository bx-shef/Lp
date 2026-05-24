<script setup lang="ts">
import GitHubIcon from '@bitrix24/b24icons-vue/social/GitHubIcon'
import Bitrix24Icon from '@bitrix24/b24icons-vue/common-service/Bitrix24Icon'
import TelegramIcon from '@bitrix24/b24icons-vue/outline/TelegramIcon'

const config = useRuntimeConfig()

const title = 'Кастомная разработка под Битрикс24 — AI, интеграции, MCP — Игорь Шевчик'
const description = 'AI-помощники, интеграции с внешними системами, MCP-серверы для Битрикс24. Там, где коробки и маркетплейса уже не хватает.'
const ogImage = `${config.public.siteUrl}/og-image.png`

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description,
  ogImage,
  ogUrl: config.public.siteUrl,
  ogType: 'website',
  ogLocale: 'ru_RU',
  ogSiteName: 'bx-shef.by',
  twitterCard: 'summary_large_image',
  twitterTitle: title,
  twitterDescription: description,
  twitterImage: ogImage
})

useHead({
  link: [
    { rel: 'canonical', href: config.public.siteUrl }
  ]
})
</script>

<template>
  <B24App>
    <B24Header>
      <template #left>
        <NuxtLink to="/" class="flex items-center gap-3">
          <AppLogo class="w-auto h-[40px] shrink-0" />
        </NuxtLink>
      </template>

      <template #right>
        <ClientOnly>
          <B24Button
            to="https://t.me/IgorShevchik"
            target="_blank"
            aria-label="Telegram"
            color="air-tertiary-no-accent"
            :icon="TelegramIcon"
            size="sm"
          />
          <template #fallback>
            <B24Skeleton accent="less" class="size-7 rounded-[8px]" />
          </template>
        </ClientOnly>
        <B24Button
          to="https://github.com/IgorShevchik"
          target="_blank"
          aria-label="GitHub"
          color="air-tertiary-no-accent"
          :icon="GitHubIcon"
          size="sm"
        />
      </template>
    </B24Header>

    <B24Main>
      <NuxtPage />
    </B24Main>

    <B24Separator :icon="Bitrix24Icon" />

    <B24Footer>
      <template #left>
        <SiteFooter />
      </template>
    </B24Footer>
  </B24App>
</template>
