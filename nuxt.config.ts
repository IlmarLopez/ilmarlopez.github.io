import tailwindcss from '@tailwindcss/vite'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  // Static site: every route is prerendered by `nuxt generate` and hydrated on the client.
  ssr: true,

  modules: ['@nuxt/fonts', '@nuxt/image'],

  // Self-hosted fonts: @nuxt/fonts downloads them at build time and serves them from /_nuxt/fonts/.
  // Fontsource keeps the files versioned, so builds are reproducible. `latin` covers all the visible text.
  fonts: {
    // font-display: swap is already the module's default.
    defaults: { subsets: ['latin'], styles: ['normal'] },
    families: [
      // Display. Only the hero heading (700) is preloaded: it is the LCP text.
      {
        name: 'Rethink Sans',
        provider: 'fontsource',
        weights: [600, 700],
        preload: { subsets: ['latin'], styles: ['normal'], weights: [700] },
      },
      // Body. Variable range, so 500 resolves without synthesizing. Not preloaded.
      { name: 'Hanken Grotesk', provider: 'fontsource', weights: ['400 600'], preload: false },
    ],
  },

  // main.css starts with the Hallmark stamp, then imports Tailwind, the tokens and the base styles.
  css: ['~/assets/css/main.css'],

  // Components are auto-imported by file name, without the folder as a prefix.
  components: [{ path: '~/components', pathPrefix: false }],

  // Tailwind v4 runs as a Vite plugin.
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
