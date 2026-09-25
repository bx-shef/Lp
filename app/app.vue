<script setup lang="ts">
import GitHubIcon from '@bitrix24/b24icons-vue/social/GitHubIcon'
import Bitrix24Icon from '@bitrix24/b24icons-vue/common-service/Bitrix24Icon'
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
        { label: 'b24ui', icon: ThemeIcon, to: 'https://bitrix24.github.io/b24ui/', target: '_blank' },
        { label: 'b24jssdk', icon: CodeIcon, to: 'https://bitrix24.github.io/b24jssdk/', target: '_blank' },
        { label: 'b24icons', icon: AppsIcon, to: 'https://bitrix24.github.io/b24icons/', target: '_blank' },
        { label: 'REST API', icon: DeveloperResourcesIcon, to: 'https://apidocs.bitrix24.ru/', target: '_blank' }
      ]
    }
  ]
]

// Единый источник — app/utils/content.ts (H1 берёт оттуда же, см. index.vue).
const title = SEO_TITLE
const description = SEO_DESCRIPTION
const ogImage = `${config.public.siteUrl}/og-image.png`

// Canonical по маршруту: раньше /legal/ и /privacy/ указывали canonical на главную
// и выпадали из индекса. Слэш на конце — так статика отдаёт вложенные страницы
// (/legal → 301 → /legal/).
const route = useRoute()
const pageUrl = computed(() => route.path === '/'
  ? config.public.siteUrl
  : `${config.public.siteUrl}${route.path.replace(/\/$/, '')}/`)

// Markdown-двойники страниц для ИИ-агентов (public/*.md, пишутся вручную —
// при правке текста страницы править и двойник). См. docs/agent-readiness.md.
const MARKDOWN_TWINS: Record<string, string> = {
  '/': '/index.md',
  '/legal': '/legal.md'
}
const markdownTwin = computed(() => MARKDOWN_TWINS[route.path.replace(/(.)\/$/, '$1')])

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description,
  ogImage,
  ogImageType: 'image/png',
  ogImageWidth: 1200,
  ogImageHeight: 630,
  ogImageAlt: 'Кастомная разработка под Битрикс24 — Игорь Шевчик. AI, интеграции, MCP',
  ogUrl: pageUrl,
  ogType: 'website',
  ogLocale: 'ru_RU',
  ogSiteName: 'bx-shef.by',
  twitterCard: 'summary_large_image',
  twitterTitle: title,
  twitterDescription: description,
  twitterImage: ogImage
})

useHead({
  link: () => [
    { rel: 'canonical', href: pageUrl.value },
    { rel: 'describedby', href: `${config.public.siteUrl}/llms.txt` },
    ...(markdownTwin.value
      ? [{ rel: 'alternate', type: 'text/markdown', href: `${config.public.siteUrl}${markdownTwin.value}` }]
      : [])
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
            'email': 'offer@bx-shef.by',
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
                'https://github.com/IgorShevchik'
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
        <B24Button
          aria-label="Визитка"
          color="air-tertiary-no-accent"
          :icon="ContactDetailsIcon"
          size="sm"
          @click="cardOpen = true"
        />
      </template>
      <template #body>
        <B24NavigationMenu
          :items="navItems"
          orientation="vertical"
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
      <template #right>
        <B24Button
          to="https://github.com/IgorShevchik"
          target="_blank"
          aria-label="GitHub"
          color="air-tertiary-no-accent"
          :icon="GitHubIcon"
          size="sm"
        />
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
