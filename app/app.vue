<script setup lang="ts">
import GitHubIcon from '@bitrix24/b24icons-vue/social/GitHubIcon'
import Bitrix24Icon from '@bitrix24/b24icons-vue/common-service/Bitrix24Icon'
import TelegramIcon from '@bitrix24/b24icons-vue/outline/TelegramIcon'
import ContactDetailsIcon from '@bitrix24/b24icons-vue/outline/ContactDetailsIcon'
import ReceiptIcon from '@bitrix24/b24icons-vue/outline/ReceiptIcon'
import OpenBookIcon from '@bitrix24/b24icons-vue/main/OpenBookIcon'
import ThemeIcon from '@bitrix24/b24icons-vue/outline/ThemeIcon'
import CodeIcon from '@bitrix24/b24icons-vue/common-service/CodeIcon'
import AppsIcon from '@bitrix24/b24icons-vue/solid/AppsIcon'
import DeveloperResourcesIcon from '@bitrix24/b24icons-vue/solid/DeveloperResourcesIcon'

const cardOpen = ref(false)

const config = useRuntimeConfig()

const navItems = [
  [
    {
      label: 'Реквизиты',
      icon: ReceiptIcon,
      to: '/legal'
    },
    {
      label: 'Документация',
      icon: OpenBookIcon,
      children: [
        [
          { label: 'b24ui', icon: ThemeIcon, to: 'https://bitrix24.github.io/b24ui/', target: '_blank' },
          { label: 'b24jssdk', icon: CodeIcon, to: 'https://bitrix24.github.io/b24jssdk/', target: '_blank' },
          { label: 'b24icons', icon: AppsIcon, to: 'https://bitrix24.github.io/b24icons/', target: '_blank' },
          { label: 'REST API', icon: DeveloperResourcesIcon, to: 'https://apidocs.bitrix24.ru/', target: '_blank' }
        ]
      ]
    }
  ]
]

const title = 'Кастомная разработка под Битрикс24: AI, интеграции, MCP-серверы | bx-shef.by'
const description = 'Разрабатываю AI-помощников, интеграции и MCP-серверы для Битрикс24. Беру задачи, которые маркетплейс не закрывает. Разбор задачи — 30 минут, бесплатно.'
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
  ],
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'ProfessionalService',
            '@id': `${config.public.siteUrl}/#organization`,
            'name': 'ИП Шевчик И. С.',
            'alternateName': 'bx-shef.by',
            'url': config.public.siteUrl,
            'telephone': '+375297360126',
            'email': 'shevchik.mail@gmail.com',
            'address': {
              '@type': 'PostalAddress',
              'addressLocality': 'Минск',
              'addressCountry': 'BY'
            },
            'description': 'Кастомная разработка под Битрикс24: AI-помощники, интеграции, MCP-серверы. Разбор задачи — 30 минут, бесплатно.',
            'founder': {
              '@type': 'Person',
              '@id': `${config.public.siteUrl}/#igor`,
              'name': 'Игорь Шевчик',
              'jobTitle': 'Разработчик Битрикс24',
              'image': {
                '@type': 'ImageObject',
                'url': `${config.public.siteUrl}/igor.jpg`
              },
              'sameAs': [
                'https://github.com/IgorShevchik',
                'https://t.me/bxshefby'
              ]
            },
            'areaServed': 'BY',
            'sameAs': [
              'https://github.com/IgorShevchik'
            ]
          },
          {
            '@type': 'WebSite',
            '@id': `${config.public.siteUrl}/#website`,
            'url': config.public.siteUrl,
            'name': 'bx-shef.by',
            'inLanguage': 'ru-RU',
            'publisher': {
              '@id': `${config.public.siteUrl}/#organization`
            }
          }
        ]
      })
    }
  ]
})
</script>

<template>
  <B24App>
    <B24Header>
      <template #left>
        <NuxtLink
          to="/"
          class="flex items-center gap-3"
        >
          <AppLogo class="w-auto h-[40px] shrink-0" />
        </NuxtLink>
      </template>

      <B24NavigationMenu :items="navItems" />

      <template #right>
        <ClientOnly>
          <B24Button
            to="https://t.me/bxshefby"
            target="_blank"
            aria-label="Telegram"
            color="air-tertiary-no-accent"
            :icon="TelegramIcon"
            size="sm"
          />
          <template #fallback>
            <B24Skeleton
              accent="less"
              class="size-7 rounded-[8px]"
            />
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
        <B24Button
          aria-label="Визитка"
          color="air-tertiary-no-accent"
          :icon="ContactDetailsIcon"
          size="sm"
          @click="cardOpen = true"
        />
      </template>
      <template #body>
        <B24NavigationMenu :items="navItems" orientation="vertical" />
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

    <ClientOnly>
      <BusinessCardModal
        :open="cardOpen"
        @close="cardOpen = false"
      />
    </ClientOnly>
  </B24App>
</template>
