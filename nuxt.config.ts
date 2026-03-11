// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: [
    '@nuxthub/core',
    '@onmax/nuxt-better-auth',
    '@nuxt/ui',
    '@vueuse/nuxt',
  ],

  auth: {
    redirects: {
      login: '/login',
      guest: '/',
    },
  },

  routeRules: {
    '/admin/**': { auth: { user: { role: 'admin' } } },
    '/login': { auth: 'guest' },
    '/register': { auth: 'guest' },
  },

  css: ['~/assets/css/main.css'],

  hub: {
    db: 'sqlite',
    blob: true
  },

  nitro: {
    experimental: {
      tasks: true,
    },
  },
})