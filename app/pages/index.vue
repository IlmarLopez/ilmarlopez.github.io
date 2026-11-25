<template>
  <!-- The home grows one section at a time and T-33 assembles the final page. The journey is static markup
       (the camera is plain DOM code in plugins/journey.client.ts), so it never hydrates. -->
  <LazyJourneyFlight hydrate-never />
</template>
