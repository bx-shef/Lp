const extraAllowedHosts = (process?.env.NUXT_ALLOWED_HOSTS?.split(',').map((s: string) => s.trim()).filter(Boolean)) ?? []

const siteUrl = process.env.NUXT_PUBLIC_SITE_URL || 'https://bx-shef.by'
// Только цифры — защита от случайной опечатки или компрометации ENV в CI
const metrikaId = (process.env.NUXT_PUBLIC_METRIKA_ID || '109399587').replace(/\D/g, '')
if (!metrikaId) {
  console.warn('[nuxt.config] NUXT_PUBLIC_METRIKA_ID после фильтрации пустой — скрипт Яндекс Метрики не будет вставлен')
}

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@bitrix24/b24ui-nuxt'
  ],

  devtools: {
    enabled: false
  },

  app: {
    head: {
      htmlAttrs: { lang: 'ru', class: 'dark' },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'theme-color', content: '#030022' },
        { name: 'referrer', content: 'strict-origin-when-cross-origin' },
        ...(metrikaId ? [{ name: 'ym-id', content: metrikaId }] : [])
      ],
      link: [
        { rel: 'icon', href: '/favicon.ico?v=3' }
      ],
      script: metrikaId ? [{ src: '/metrika.js', async: true }] : [],
      noscript: metrikaId
        ? [{ innerHTML: `<div><img src="https://mc.yandex.ru/watch/${metrikaId}" style="position:absolute;left:-9999px;" alt="" /></div>` }]
        : []
    }
  },

  css: ['~/assets/css/main.css'],

  runtimeConfig: {
    public: {
      siteUrl,
      buildId: process.env.NUXT_PUBLIC_BUILD_ID || 'dev',
      metrikaId,
      // Битрикс24 веб-форма (embed). Эти параметры — публичные
      // идентификаторы, не секреты. По умолчанию вшита форма Игоря Шевчика
      // (форма #1 на портале b37817748); смена формы — через ENV без перебилда.
      b24FormId: process.env.NUXT_PUBLIC_B24_FORM_ID || '1',
      b24FormSecret: process.env.NUXT_PUBLIC_B24_FORM_SECRET || '3c735r',
      b24FormScriptUrl: process.env.NUXT_PUBLIC_B24_FORM_SCRIPT_URL || 'https://cdn-ru.bitrix24.by/b37817748/crm/form/loader_1.js'
    }
  },

  compatibilityDate: '2025-01-15',

  // Static generation: nitro обходит ссылки с главной и преренедерит всё,
  // что найдёт (/, /privacy, /legal). routeRules для '/' не нужен — дубль.
  nitro: {
    prerender: {
      crawlLinks: true,
      routes: ['/', '/api/github-contrib']
    }
  },

  vite: {
    server: {
      allowedHosts: [...extraAllowedHosts],
      cors: true
    },
    optimizeDeps: {
      include: [
        '@bitrix24/b24icons-vue/actions/DownloadIcon',
        '@bitrix24/b24icons-vue/common-service/Bitrix24Icon',
        '@bitrix24/b24icons-vue/common-service/CodeIcon',
        '@bitrix24/b24icons-vue/main/CloudTransferDataIcon',
        '@bitrix24/b24icons-vue/main/CopilotAi1Icon',
        '@bitrix24/b24icons-vue/main/MagicImageIcon',
        '@bitrix24/b24icons-vue/main/OpenBookIcon',
        '@bitrix24/b24icons-vue/main/RocketIcon',
        '@bitrix24/b24icons-vue/outline/ArrowRightLIcon',
        '@bitrix24/b24icons-vue/outline/CheckLIcon',
        '@bitrix24/b24icons-vue/outline/CircleMinusIcon',
        '@bitrix24/b24icons-vue/outline/ContactDetailsIcon',
        '@bitrix24/b24icons-vue/outline/CrossLIcon',
        '@bitrix24/b24icons-vue/outline/MoneyIcon',
        '@bitrix24/b24icons-vue/outline/PhoneAddIcon',
        '@bitrix24/b24icons-vue/outline/ReceiptIcon',
        '@bitrix24/b24icons-vue/outline/TelegramIcon',
        '@bitrix24/b24icons-vue/outline/ThemeIcon',
        '@bitrix24/b24icons-vue/social/GitHubIcon',
        '@bitrix24/b24icons-vue/solid/AppsIcon',
        '@bitrix24/b24icons-vue/solid/DeveloperResourcesIcon',
        'qrcode' // CJS
      ]
    }
  },

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  }
})
