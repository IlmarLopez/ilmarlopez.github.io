<template>
  <div class="grid grid-rows-[1fr,auto] min-h-screen bg-[#F5F3EB]">
    <main class="container mx-auto z-0 px-4 py-6 lg:px-0">
      <slot />
    </main>
    <footer class="flex justify-items-start p-3">
      <div class="flex justify-between w-full">
        <SocialInfo />
        <div>
          <NuxtLink :to="'mailto:me@ilmarlopez.com'" class="lead-paragraph"
            >me@ilmarlopez.com</NuxtLink
          >
          <p class="font-extralight text-xs">
            Porfolio ©{{ new Date().getFullYear() }}
            <span class="text-red-600">&#x2665;&#xfe0f;</span>
          </p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
useHead({
  script: [
    {
      type: 'text/javascript',
      src: 'https://cdn.jsdelivr.net/npm/countly-sdk-web@latest/lib/countly.min.js',
    },
    {
      type: 'text/javascript',
      innerHTML: `
        Countly.init({
          app_key: "013abb4c65fe3eb1e51d46c8b2098dcadefdb64f",
          url: "ilmarlopez-6cb0ea1ea6450.flex.countly.com"
        });
        Countly.track_sessions();
        Countly.track_pageview();
      `
    }
  ]
})
</script>
