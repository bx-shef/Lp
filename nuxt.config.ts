const extraAllowedHosts = (process?.env.NUXT_ALLOWED_HOSTS?.split(',').map((s: string) => s.trim()).filter(Boolean)) ?? []

const siteUrl = process.env.NUXT_PUBLIC_SITE_URL || 'https://bx-shef.by'
// Только цифры — защита от случайной опечатки или компрометации ENV в CI
const metrikaId = (process.env.NUXT_PUBLIC_METRIKA_ID || '109399587').replace(/\D/g, '')

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
        // Базовый CSP. Разрешён https для скриптов/стилей/коннектов — нужно
        // для Битрикс24-формы (cdn-домены могут меняться), Яндекс Метрики и Google.
        // form-action ограничен своим origin + Б24 для веб-формы.
        {
          'http-equiv': 'Content-Security-Policy',
          'content': [
            'default-src \'self\'',
            'script-src \'self\' \'unsafe-inline\' https:',
            // https: required for Bitrix24 form CDN stylesheets (e.g. bel.bitrix24.by)
            'style-src \'self\' \'unsafe-inline\' https:',
            'img-src \'self\' data: blob: https:',
            'font-src \'self\' data: https:',
            'connect-src \'self\' https:',
            'frame-src https:',
            'worker-src blob:',
            'base-uri \'self\'',
            'form-action \'self\' https://*.bitrix24.com https://*.bitrix24.by https://*.bitrix24.ru',
            'object-src \'none\''
          ].join('; ')
        }
      ],
      link: [
        { rel: 'icon', href: '/favicon.ico?v=3' }
      ],
      script: [
        {
          type: 'text/javascript',
          innerHTML: `(function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};m[i].l=1*new Date();for(var j=0;j<document.scripts.length;j++){if(document.scripts[j].src===r){return;}}k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})(window,document,'script','https://mc.yandex.ru/metrika/tag.js?id=${metrikaId}','ym');ym(${metrikaId},'init',{ssr:true,webvisor:true,clickmap:true,accurateTrackBounce:true,trackLinks:true});`
        }
      ],
      noscript: [
        { innerHTML: `<div><img src="https://mc.yandex.ru/watch/${metrikaId}" style="position:absolute;left:-9999px;" alt="" /></div>` }
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
      b24FormScriptUrl: process.env.NUXT_PUBLIC_B24_FORM_SCRIPT_URL || 'https://cdn-ru.bitrix24.by/b37817748/crm/form/loader_1.js'
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
