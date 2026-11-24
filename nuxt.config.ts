import tailwindcss from '@tailwindcss/vite'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  // Static site: every route is prerendered by `nuxt generate` and hydrated on the client.
  ssr: true,

  modules: ['@nuxt/fonts', '@nuxt/image'],

  // Components are auto-imported by file name, without the folder as a prefix.
  components: [{ path: '~/components', pathPrefix: false }],

  // Tailwind v4 runs as a Vite plugin. The CSS entry point (`css: ['~/assets/css/main.css']`) is added in T-07.
  vite: { plugins: [tailwindcss()] },

  experimental: {
    // `true` (not 'always'): Nuxt skips the transition when the user prefers reduced motion.
    viewTransition: true,
    // Render error.vue into 404.html at build time instead of an empty shell.
    prerenderErrorPages: true,
  },

  // Top-level `prerender` replaces the deprecated `nitro.prerender.{routes,ignore,crawlLinks}`.
  // `/versions` is added to `routes` in T-43, when the page exists.
  prerender: { crawlLinks: true, routes: ['/'] },

  // `NUXT_PUBLIC_WEB3FORMS_KEY` fills this at build time. The key never lives in the code.
  runtimeConfig: { public: { web3formsKey: '' } },

  typescript: { strict: true },
})
