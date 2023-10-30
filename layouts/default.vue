<template>
  <div class="grid grid-rows-[1fr,auto] min-h-screen bg-[#F5F3EB]">
    <main class="container mx-auto z-0">
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
    <!-- countly to track users with disabled Javascript -->
    <noscript><img src='https://ilmarlopez-6cb0ea1ea6450.flex.countly.com/pixel.png?app_key=013abb4c65fe3eb1e51d46c8b2098dcadefdb64f&begin_session=1'/></noscript>
  </div>
</template>

<script setup lang="ts">
useHead({
  script: [
    // {
    //   type: 'text/javascript',
    //   innerHTML: `
    //     //some default pre init
    //     var Countly = Countly || {};
    //     Countly.q = Countly.q || [];

    //     //provide countly initialization parameters
    //     Countly.app_key = '013abb4c65fe3eb1e51d46c8b2098dcadefdb64f';
    //     Countly.url = 'https://ilmarlopez-6cb0ea1ea6450.flex.countly.com';

    //     Countly.q.push(['track_sessions']);
    //     Countly.q.push(['track_pageview']);
    //     Countly.q.push(['track_clicks']);
    //     Countly.q.push(['track_scrolls']);
    //     Countly.q.push(['track_errors']);
    //     Countly.q.push(['track_links']);
    //     Countly.q.push(['track_forms']);
    //     Countly.q.push(['collect_from_forms']);

    //     //load countly script asynchronously
    //     (function() {
    //       var cly = document.createElement('script'); cly.type = 'text/javascript';
    //       cly.async = true;
    //       //enter url of script here
    //       cly.src = 'https://ilmarlopez-6cb0ea1ea6450.flex.countly.com/sdk/web/countly.min.js';
    //       cly.onload = function(){Countly.init()};
    //       var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(cly, s);
    //     })();
    //   `
    // }
  ]
})
</script>
