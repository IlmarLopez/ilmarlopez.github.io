<script setup lang="ts">
// The shell every home section shares: a hairline above, a heading in the left column and the content in the
// right one. `stacked` puts the content under the heading instead (Work needs the full width).
withDefaults(defineProps<{ id: string; headingId: string; title: string; layout?: 'split' | 'stacked' }>(), {
  layout: 'split',
})
</script>

<template>
  <section :id="id" :aria-labelledby="headingId" class="section">
    <div class="site-container layout" :class="layout">
      <h2 :id="headingId" class="heading">{{ title }}</h2>
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
  /* The box is as wide as the text, so the arrival line below can be as wide as the word. */
  position: relative;
  width: fit-content;
  font-size: var(--text-section);
  font-weight: 700;
  line-height: 1.02;
  letter-spacing: var(--tracking-h2);
  max-width: 12ch;
}

/* M-20. The line a click in the nav leaves under the heading it landed on: it draws from the left, holds, and
   fades. utils/nav/spy.ts sets `data-arrived` when the glide has stopped and takes it off after 1.9 s. It is
   out of the flow, so nothing moves, and only transform and opacity change. Without the attribute it is not there. */
.heading::after {
  content: '';
  position: absolute;
  inset: auto 0 -0.1em 0;
  height: 0.075em;
  background: var(--color-accent);
  transform: scaleX(0);
  transform-origin: 0 50%;
  pointer-events: none;
}

.heading[data-arrived]::after {
  animation: arrive 1900ms linear both;
}

@keyframes arrive {
  0% {
    transform: scaleX(0);
    opacity: 1;
    animation-timing-function: var(--ease-out);
  }
  21% {
    transform: scaleX(1);
    opacity: 1;
  }
  79% {
    transform: scaleX(1);
    opacity: 1;
    animation-timing-function: var(--ease-out);
  }
  100% {
    transform: scaleX(1);
    opacity: 0;
  }
}

/* Reduced motion makes every animation instant, which would leave nothing to see: the line is simply there while
   the attribute is, and the script takes the attribute off after the same 1.9 s. The global rule of base.css also
   gives every element a 0.01 ms transition on `all`, which would make scaleX(0) -> none a transition that lands one
   frame late; `transition: none` keeps it a state, there from the first frame. */
@media (prefers-reduced-motion: reduce) {
  .heading[data-arrived]::after {
    animation: none;
    transform: none;
    transition: none;
  }
}

.body {
  display: grid;
  gap: var(--space-lg);
  align-content: start;
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
}
</style>
