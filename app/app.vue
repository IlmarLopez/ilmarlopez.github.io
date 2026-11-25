<script setup lang="ts">
import { profile } from '~/data/profile'

// Shell: language, color scheme, favicon and the boot script that applies the saved theme.
// The theme-color metas are not here: `useThemeHead` keeps them in step with the saved theme.
useThemeHead()
useHead({
  htmlAttrs: { lang: 'en' },
  // Fallback so no page is ever untitled (WCAG 2.4.2, found by verify:a11y). T-45 sets the title per route.
  title: `${profile.name}, ${profile.jobTitle}`,
  meta: [{ name: 'color-scheme', content: 'light dark' }],
  link: [{ rel: 'icon', href: '/favicon.ico' }],
  // Unhead sorts tags by a fixed weight (charset -20, viewport -15, importmap 25, stylesheet 60) and a numeric
  // tagPriority is an absolute weight, so 28 puts the script before the stylesheet: it runs before the first paint.
  script: [{ key: 'theme-boot', innerHTML: buildThemeBootScript(), tagPosition: 'head', tagPriority: 28 }],
})
</script>

<template>
  <NuxtRouteAnnouncer />
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
