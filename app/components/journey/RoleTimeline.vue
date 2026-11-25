<script setup lang="ts">
import { experience, type YearMonth } from '~/data/experience'

defineProps<{
  from: YearMonth
  to: YearMonth | 'now'
  /** Name of this role's row in the chart. */
  label: string
}>()

// One row per dated role. The strip reserves that height up front, so building the chart on the client
// does not push the page down.
const rows = experience.filter((role) => role.state !== 'education').length
</script>

<template>
  <!-- Empty and hidden until journey.client.ts draws the chart from these attributes; without JS the dates
       above already say everything. -->
  <div class="tenure" aria-hidden="true" :data-from="from" :data-to="to" :data-label="label" :style="{ '--rows': rows }" />
</template>

<style scoped>
/* Every role on one shared scale, newest first. The role this card is about is in ink with its name in bold,
   the rest is grey context. The script builds the rows and sets --a (start), --w (length), --x (year position)
   and --k (draw order), so everything it creates is reached with :deep(). */
.tenure {
  display: none;
}

.js .tenure {
  --name: 6.5rem;
  --row: 1.375rem;
  display: grid;
  grid-template-columns: var(--name) minmax(0, 1fr);
  column-gap: var(--space-sm);
  position: relative;
  min-height: calc((var(--rows) + 1) * var(--row));
  margin-top: var(--space-lg);
  padding-top: var(--space-md);
  font-size: var(--text-sm);
  color: var(--color-muted);
  font-variant-numeric: tabular-nums;
}

.tenure :deep(.row) {
  display: contents;
}

.tenure :deep(.name) {
  grid-column: 1;
  height: var(--row);
  line-height: var(--row);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tenure :deep(.track) {
  grid-column: 2;
  position: relative;
  height: var(--row);
}

.tenure :deep(.bar) {
  position: absolute;
  left: var(--a, 0%);
  top: 50%;
  width: max(var(--w, 0%), 6px);
  height: 6px;
  translate: 0 -50%;
  border-radius: 3px;
  background: color-mix(in oklch, var(--color-ink) 32%, var(--color-paper));
  transform-origin: 0 50%;
  transition: transform var(--dur-long) var(--ease-out) calc(120ms + var(--k, 0) * 80ms);
}

.tenure :deep(.row[data-self] .name) {
  color: var(--color-ink);
  font-weight: 600;
}

.tenure :deep(.row[data-self] .bar) {
  height: 10px;
  border-radius: 5px;
  background: var(--color-ink);
}

/* One hairline per January behind the bars, and a coral line for today at the right edge. */
.tenure :deep(.grid) {
  position: absolute;
  left: calc(var(--name) + var(--space-sm));
  right: 0;
  top: var(--space-md);
  bottom: var(--row);
  pointer-events: none;
  background: repeating-linear-gradient(90deg, var(--color-rule) 0 var(--rule-hair), transparent var(--rule-hair) var(--yr, 10%));
}

.tenure :deep(.grid)::after {
  content: '';
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: var(--rule-hair);
  background: var(--color-accent);
  transition: opacity var(--dur-short) var(--ease-out) 450ms;
}

.tenure :deep(.axis) {
  grid-column: 2;
  position: relative;
  height: var(--row);
  border-top: var(--rule-hair) solid var(--color-ink);
}

.tenure :deep(.axis span) {
  position: absolute;
  top: 0;
  line-height: var(--row);
}

/* A year is labelled every second year; on a phone, every third. */
.tenure :deep(.year) {
  display: none;
  left: var(--x);
  transform: translateX(-50%);
}

.tenure :deep(.year.y2) {
  display: block;
}

.tenure :deep(.now) {
  right: 0;
  color: var(--color-ink);
  font-weight: 600;
}

/* In flight the bars are drawn when the role arrives, and the line for today lands last. */
.flight .tenure :deep(.bar) {
  transform: scaleX(0);
}

.flight .tenure :deep(.grid)::after {
  opacity: 0;
}

.flight .plane[data-reached] .tenure :deep(.bar) {
  transform: none;
}

.flight .plane[data-reached] .tenure :deep(.grid)::after {
  opacity: 1;
}

@media (max-width: 40rem) {
  .js .tenure {
    --name: 5.5rem;
    --row: 1.25rem;
    margin-top: var(--space-md);
    padding-top: var(--space-sm);
    font-size: var(--text-xs);
  }

  .tenure :deep(.grid) {
    top: var(--space-sm);
  }

  .tenure :deep(.year.y2) {
    display: none;
  }

  .tenure :deep(.year.y3) {
    display: block;
  }
}

@media (prefers-reduced-motion: reduce) {
  .tenure :deep(.bar),
  .tenure :deep(.grid)::after {
    transition: none;
  }
}
</style>
