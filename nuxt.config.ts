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

  css: ['~/assets/css/main.css'],

  // Static generation: prerender the landing
  nitro: {
    prerender: {
      crawlLinks: true,
      routes: ['/']
    }
  },

  routeRules: {
    '/': { prerender: true }
  },

  runtimeConfig: {
    public: {
      siteUrl,
      // Bitrix24 web form embed details — заполняются после создания формы в Б24
      b24FormId: process.env.NUXT_PUBLIC_B24_FORM_ID || '',
      b24FormSecret: process.env.NUXT_PUBLIC_B24_FORM_SECRET || '',
      b24FormScriptUrl: process.env.NUXT_PUBLIC_B24_FORM_SCRIPT_URL || '',
      // Visit counter (https://counterapi.dev — free, no signup)
      counterNamespace: process.env.NUXT_PUBLIC_COUNTER_NAMESPACE || 'bx-shef',
      counterKey: process.env.NUXT_PUBLIC_COUNTER_KEY || 'lp-visits'
    }
  },

  app: {
    head: {
      htmlAttrs: { lang: 'ru' },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'theme-color', content: '#2fc7f7' }
      ],
      link: [
        { rel: 'icon', href: '/favicon.ico?v=3' }
      ]
    }
  },

  compatibilityDate: '2025-01-15',

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
