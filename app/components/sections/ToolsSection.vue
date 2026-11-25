<script setup lang="ts">
import { spokenLanguages, toolGroups } from '~/data/tools'
</script>

<template>
  <PageSection id="tools" heading-id="tools-h" title="Tools.">
    <div class="cols">
      <div v-for="group in toolGroups" :key="group.title">
        <h3>{{ group.title }}</h3>
        <ul>
          <li v-for="item in group.items" :key="item">{{ item }}</li>
        </ul>
      </div>
    </div>
    <p class="lang">{{ spokenLanguages }}</p>
  </PageSection>
</template>

<style scoped>
/* A plain spec sheet: four columns, then two, then one. */
.cols {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: var(--gap-columns);
}

h3 {
  font-family: var(--font-body);
  font-weight: 400;
  font-size: var(--text-sm);
  color: var(--color-muted);
  padding-bottom: var(--space-sm);
  border-bottom: var(--rule-hair) solid var(--color-rule);
}

ul {
  list-style: none;
  margin: var(--space-md) 0 0;
  padding: 0;
  display: grid;
  gap: var(--space-xs);
  font-size: var(--text-lg);
  font-family: var(--font-display);
  font-weight: 600;
  letter-spacing: -0.01em;
}

.lang {
  margin-top: var(--space-xl);
  color: var(--color-muted);
}

@media (max-width: 70rem) {
  .cols {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    row-gap: var(--space-xl);
  }
}

@media (max-width: 40rem) {
  .cols {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
