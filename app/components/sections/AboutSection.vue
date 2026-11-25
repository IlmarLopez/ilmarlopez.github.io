<script setup lang="ts">
import { profile } from '~/data/profile'
</script>

<template>
  <!-- As in design/hallmark/f/: the two paragraphs and nothing else. The photo (Q1) waits for the Hallmark pass of
       spec 10.3 that decides where it goes; it was tried under the heading and Ilmar rejected that composition. -->
  <PageSection id="about" heading-id="about-h" title="About.">
    <div class="copy">
      <p v-for="paragraph in profile.about" :key="paragraph">{{ paragraph }}</p>
    </div>
  </PageSection>
</template>

<style scoped>
.copy {
  display: grid;
  gap: var(--space-lg);
}

.copy p {
  font-size: var(--text-lead);
  max-width: 52ch;
}

/* The first paragraph is the statement. */
.copy p:first-child {
  font-family: var(--font-display);
  font-weight: 600;
  font-size: var(--text-xl);
  letter-spacing: -0.02em;
  line-height: 1.25;
  max-width: 36ch;
}
</style>
