const extraAllowedHosts = (process?.env.NUXT_ALLOWED_HOSTS?.split(',').map((s: string) => s.trim()).filter(Boolean)) ?? []

const siteUrl = process.env.NUXT_PUBLIC_SITE_URL || 'https://bx-shef.by'

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
        // Базовый CSP. Разрешён https для скриптов/стилей/коннектов — нужно
        // для Битрикс24-формы (cdn-домены могут меняться), counterapi и Google.
        // form-action ограничен своим origin + Б24 для веб-формы.
        {
          'http-equiv': 'Content-Security-Policy',
          'content': [
            'default-src \'self\'',
            'script-src \'self\' \'unsafe-inline\' https:',
            'style-src \'self\' \'unsafe-inline\'',
            'img-src \'self\' data: blob: https:',
            'font-src \'self\' data:',
            'connect-src \'self\' https:',
            'frame-src https:',
            'base-uri \'self\'',
            'form-action \'self\' https://*.bitrix24.com https://*.bitrix24.by https://*.bitrix24.ru',
            'object-src \'none\''
          ].join('; ')
        }
      ],
      link: [
        { rel: 'icon', href: '/favicon.ico?v=3' }
      ]
    }
  },

  css: ['~/assets/css/main.css'],

  runtimeConfig: {
    public: {
      siteUrl,
      // Битрикс24 веб-форма (embed). Эти параметры — публичные
      // идентификаторы, не секреты. По умолчанию вшита форма Игоря Шевчика
      // (форма #1 на портале b37817748); смена формы — через ENV без перебилда.
      b24FormId: process.env.NUXT_PUBLIC_B24_FORM_ID || '1',
      b24FormSecret: process.env.NUXT_PUBLIC_B24_FORM_SECRET || '3c735r',
      b24FormScriptUrl: process.env.NUXT_PUBLIC_B24_FORM_SCRIPT_URL || 'https://cdn-ru.bitrix24.by/b37817748/crm/form/loader_1.js',
      // Счётчик посещений (https://counterapi.dev — бесплатно, без регистрации)
      counterNamespace: process.env.NUXT_PUBLIC_COUNTER_NAMESPACE || 'bx-shef',
      counterKey: process.env.NUXT_PUBLIC_COUNTER_KEY || 'lp-visits'
    }
  },

  compatibilityDate: '2025-01-15',

  // Static generation: nitro обходит ссылки с главной и преренедерит всё,
  // что найдёт (/, /privacy, /legal). routeRules для '/' не нужен — дубль.
  nitro: {
    prerender: {
      crawlLinks: true,
      routes: ['/']
    }
  },

  vite: {
    server: {
      allowedHosts: [...extraAllowedHosts],
      cors: true
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
