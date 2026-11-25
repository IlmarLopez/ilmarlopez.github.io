<script setup lang="ts">
// The shell every home section shares: a hairline above, a heading in the left column and the content in the
// right one. `stacked` puts the content under the heading instead (Work needs the full width). The optional
// `aside` slot sits under the heading in the left column and drops below the content on narrow screens.
withDefaults(defineProps<{ id: string; headingId: string; title: string; layout?: 'split' | 'stacked' }>(), {
  layout: 'split',
})
</script>

<template>
  <section :id="id" :aria-labelledby="headingId" class="section">
    <div class="site-container layout" :class="layout">
      <h2 :id="headingId" class="heading">{{ title }}</h2>
      <div v-if="$slots.aside" class="aside"><slot name="aside" /></div>
      <div class="body"><slot /></div>
    </div>
  </section>
</template>

<style scoped>
.section {
  padding-block: var(--section-gap-s);
  border-top: var(--rule-hair) solid var(--color-rule);
}

.layout {
  display: grid;
  gap: var(--gap-columns);
  align-items: start;
  grid-template-columns: minmax(0, 4fr) minmax(0, 8fr);
}

.heading {
  font-size: var(--text-section);
  font-weight: 700;
  line-height: 1.02;
  letter-spacing: var(--tracking-h2);
  max-width: 12ch;
}

.body {
  display: grid;
  gap: var(--space-lg);
  align-content: start;
}

/* With an aside the heading and the aside share the left column and the content spans both rows. */
.aside {
  grid-column: 1;
}

.split:has(.aside) .body {
  grid-column: 2;
  grid-row: 1 / span 2;
}

.stacked {
  grid-template-columns: minmax(0, 1fr);
}

.stacked .heading {
  margin-bottom: var(--space-2xl);
}

@media (max-width: 60rem) {
  .layout {
    grid-template-columns: minmax(0, 1fr);
  }

  .split:has(.aside) .body {
    grid-column: 1;
    grid-row: auto;
  }

  .aside {
    order: 3;
  }
}
</style>
