<script setup lang="ts">
import { experience } from '~/data/experience'

// One mark per plane, front to back: the hero ("Now") and then every role, newest first.
const marks = ['Now', ...experience.map((role) => role.short)]
</script>

<template>
  <!-- Decoration for the flight: the roles are already in the page as text. It only shows with the `flight` class. -->
  <div class="depth" aria-hidden="true">
    <span class="bar"><i class="fill" /></span>
    <ol>
      <li v-for="mark in marks" :key="mark">{{ mark }}</li>
    </ol>
  </div>
</template>

<style scoped>
.depth {
  display: none;
}

.flight .depth {
  display: block;
  position: absolute;
  inset: auto var(--gutter) var(--space-lg);
}

/* Hidden until the camera exists, like the planes. */
.flight:not(.flight-ready) .depth {
  visibility: hidden;
}

.bar {
  display: block;
  height: var(--rule-hair);
  background: var(--color-rule);
}

/* The script sets --p (0 to 1) on the journey while you scroll. */
.fill {
  display: block;
  height: 3px;
  margin-top: -1px;
  background: var(--color-accent);
  transform-origin: 0 50%;
  transform: scaleX(var(--p, 0));
}

ol {
  display: flex;
  justify-content: space-between;
  margin: var(--space-xs) 0 0;
  padding: 0;
  list-style: none;
  font-size: var(--text-sm);
  color: var(--color-muted);
}

/* The label of the role in front of the camera takes the ink; the ones already flown past soften. */
li {
  transition: color var(--dur-short) var(--ease-out);
}

li[data-past] {
  color: var(--color-ink-2);
}

li[data-on] {
  color: var(--color-ink);
}

@media (max-width: 40rem) {
  li:nth-child(n + 3):nth-child(-n + 4) {
    display: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  li {
    transition: none;
  }
}
</style>
