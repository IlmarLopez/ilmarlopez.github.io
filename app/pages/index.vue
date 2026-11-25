<template>
  <!-- Everything is static markup except the Work tabs (spec 8.4). The journey never hydrates (its camera is plain
       DOM code in plugins/journey.client.ts), and Work hydrates when it is about to be seen. -->
  <LazyJourneyFlight hydrate-never />
  <LazyAboutSection hydrate-never />
  <LazyWorkSection :hydrate-on-visible="{ rootMargin: '200px' }" />
  <LazyToolsSection hydrate-never />
  <LazyContactSection hydrate-never />
</template>
