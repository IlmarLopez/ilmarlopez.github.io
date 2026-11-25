<script setup lang="ts">
import { profile } from '~/data/profile'
</script>

<template>
  <div class="pt-(--space-xl) pb-(--space-2xl)">
    <!-- One mask per line (.ln > span): M-01 (T-51) slides each line up from behind it. -->
    <h1 id="h1" class="max-w-[12ch] text-display leading-none font-bold tracking-(--tracking-h1)">
      <span class="ln"><span>Hi, I’m</span></span> <span class="ln"><span>{{ profile.name }}.</span></span>
    </h1>
    <p class="mt-(--space-lg) max-w-[30ch] text-lead text-ink-2">{{ profile.lead }}</p>
    <div class="mt-(--space-xl) flex flex-wrap gap-(--space-md)">
      <!-- A plain mailto: link, so it works without JS. `data-action` lets T-36 open the dialog instead. -->
      <BaseButton :href="`mailto:${profile.email}`" data-action="say-hi" class="max-sm:[@media(max-height:46rem)]:w-auto">Say hi</BaseButton>
      <CvLink class="max-sm:[@media(max-height:46rem)]:w-auto" />
    </div>
  </div>
</template>

<style scoped>
/* The mask clips the line while it slides; the padding and the matching negative margin keep descenders and the
   side bearings from being cut. */
.ln {
  display: block;
  overflow: clip;
  padding: 0.12em 0.08em;
  margin: -0.12em -0.08em;
}

.ln > span {
  display: block;
}
</style>
