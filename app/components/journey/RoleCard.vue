<script setup lang="ts">
import type { Role, RoleState } from '~/data/experience'
import { formatPeriod, monthsBetween, spokenDuration, splitMonths, unit } from '~/utils/tenure'

const props = defineProps<{ role: Role }>()

const STATE_LABEL: Record<RoleState, string> = { active: 'Active', ended: 'Ended', education: 'Education' }

// The readout is counted when the page is built, so it reads right without JS. With JS the client counts it
// again from today's date (a role that is still running keeps growing) and animates it in flight.
const readout = computed(() => {
  const { role } = props
  if (role.state === 'education') return null
  const duration = splitMonths(monthsBetween(role.from, role.to))
  return { from: role.from, to: role.to, period: formatPeriod(role.from, role.to), spoken: spokenDuration(duration), ...duration }
})
</script>

<template>
  <article class="plane card">
    <header class="card-head">
      <span class="mark" :data-now="role.state === 'active' ? '' : undefined" aria-hidden="true">{{ role.mark }}</span>
      <div class="card-title">
        <h3>
          <a v-if="role.url" :href="role.url" target="_blank" rel="noopener">{{ role.name }}</a>
          <template v-else>{{ role.name }}</template>
        </h3>
        <p class="role">{{ role.role }}</p>
      </div>
      <p class="state" :data-live="role.state === 'active' ? '' : undefined">{{ STATE_LABEL[role.state] }}</p>
    </header>
    <p v-if="role.summary" class="about">{{ role.summary }}</p>
    <template v-if="readout">
      <dl class="readout">
        <div>
          <dt>Period</dt>
          <dd class="when">{{ readout.period }}</dd>
        </div>
        <div>
          <dt>Duration</dt>
          <!-- The visible figure is aria-hidden because the client counts it up; the spoken text holds the final value. -->
          <dd class="dur">
            <span class="visually-hidden" data-spoken>{{ readout.spoken }}</span>
            <span aria-hidden="true" data-figure>
              <template v-if="readout.years"><b>{{ readout.years }}</b><small>{{ unit(readout.years, 'yr', 'yrs') }}</small></template>
              <template v-if="readout.months"><b>{{ readout.months }}</b><small>{{ unit(readout.months, 'mo', 'mos') }}</small></template>
            </span>
          </dd>
        </div>
      </dl>
      <RoleTimeline :from="readout.from" :to="readout.to" :label="role.short" />
    </template>
  </article>
</template>

<style scoped>
.card {
  --mark: 3.5rem;
  display: block;
  width: min(44rem, calc(100% - var(--gutter) * 2));
  margin: 0 auto var(--space-xl);
  padding: var(--space-xl);
  background: var(--color-paper);
  color: var(--color-ink);
  border: var(--rule-hair) solid var(--color-ink);
  border-radius: var(--radius-card);
}

.card h3 {
  font-size: var(--text-section);
  font-weight: 700;
  line-height: 1.05;
  letter-spacing: var(--tracking-title);
}

/* The card reads as a drawing sheet: the name and role on top, a readout block below it, and a scale bar for the years. */
.card-head {
  display: flex;
  align-items: flex-start;
  gap: var(--space-md);
}

.card-title {
  min-width: 0;
  flex: 1;
}

/* Each company gets a type-set monogram; the newest wears the filled one, so the stack still reads newest in front. */
.mark {
  flex: none;
  display: grid;
  place-items: center;
  width: var(--mark);
  height: var(--mark);
  margin-top: calc((var(--text-section) * 1.05 - var(--mark)) / 2);
  border: var(--rule-hair) solid var(--color-ink);
  border-radius: var(--radius-card);
  font-family: var(--font-display);
  font-weight: 700;
  font-size: var(--text-lg);
  letter-spacing: var(--tracking-title);
  line-height: 1;
  color: var(--color-ink);
}

.mark[data-now] {
  background: var(--color-ink);
  color: var(--color-paper);
}

/* The role that is still running links to the company. A quiet underline says it is a link; coral and a thicker
   line answer hover and focus. */
.card h3 a {
  text-decoration: underline;
  text-decoration-thickness: var(--rule-hair);
  text-underline-offset: 0.14em;
  text-decoration-color: color-mix(in oklch, var(--color-ink) 35%, transparent);
  transition:
    text-decoration-color var(--dur-short) var(--ease-out),
    text-decoration-thickness var(--dur-short) var(--ease-out);
}

.card h3 a:focus-visible {
  text-decoration-color: var(--color-accent);
  text-decoration-thickness: 0.08em;
}

@media (hover: hover) {
  .card h3 a:hover {
    text-decoration-color: var(--color-accent);
    text-decoration-thickness: 0.08em;
  }
}

.role {
  margin-top: var(--space-xs);
  font-size: var(--text-lg);
  color: var(--color-ink);
}

.state {
  flex: none;
  margin: 0;
  padding-top: var(--space-xs);
  font-size: var(--text-sm);
  color: var(--color-muted);
  white-space: nowrap;
}

.state[data-live] {
  color: var(--color-ink);
}

/* The one dot on the page that means live: it sits on the role that is still running. */
.state[data-live]::before {
  content: '';
  display: inline-block;
  width: 0.5rem;
  height: 0.5rem;
  margin-right: var(--space-xs);
  border-radius: 50%;
  background: var(--color-accent);
  vertical-align: 0.05em;
}

.about {
  margin-top: var(--space-md);
  font-size: var(--text-md);
  color: var(--color-ink-2);
  max-width: 52ch;
}

.readout {
  display: grid;
  grid-template-columns: 1fr auto;
  column-gap: var(--gap-columns);
  align-items: end;
  margin: var(--space-lg) 0 0;
  padding-top: var(--space-md);
  border-top: var(--rule-hair) solid var(--color-rule);
}

.readout > div:last-child {
  text-align: right;
}

.readout dt {
  font-size: var(--text-sm);
  color: var(--color-muted);
}

.readout dd {
  margin: var(--space-2xs) 0 0;
}

.when {
  font-size: var(--text-lg);
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

.dur {
  position: relative;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: var(--text-2xl);
  line-height: 1;
  letter-spacing: var(--tracking-title);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

/* The client rewrites the figure's children, so they are reached with :deep(). */
.dur :deep(small) {
  font-family: var(--font-body);
  font-weight: 400;
  font-size: var(--text-sm);
  letter-spacing: 0;
  color: var(--color-muted);
  margin-inline: 0.2em 0.5em;
}

.dur :deep(small:last-child) {
  margin-inline-end: 0;
}

/* In flight the readout wakes when the camera arrives: its two cells come in one after the other while the
   strip draws. Cards still behind show only the sheet. */
.readout > :nth-child(2) {
  --k: 1;
}

.js.flight .readout > div {
  opacity: 0;
  transform: translateY(6px);
  transition:
    opacity var(--dur-micro) var(--ease-in),
    transform var(--dur-micro) var(--ease-in);
}

.js.flight .plane[data-reached] .readout > div {
  opacity: 1;
  transform: none;
  transition:
    opacity var(--dur-short) var(--ease-out) calc(100ms + var(--k, 0) * 60ms),
    transform var(--dur-short) var(--ease-out) calc(100ms + var(--k, 0) * 60ms);
}

/* In flight the ink of a card fades with its depth, and so does its border. */
.flight .card {
  border-color: color-mix(in oklch, var(--color-ink) calc(var(--o, 1) * 100%), var(--color-paper));
}

.flight .card > * {
  opacity: var(--o, 1);
}

@media (max-width: 40rem) {
  .card {
    --mark: 2.75rem;
    position: relative;
    padding: var(--space-lg);
  }

  .role {
    font-size: var(--text-md);
  }

  .about {
    margin-top: var(--space-sm);
    font-size: var(--text-sm);
  }

  .readout {
    margin-top: var(--space-md);
    padding-top: var(--space-sm);
  }

  .when {
    font-size: var(--text-md);
  }

  .dur {
    font-size: var(--text-xl);
  }

  .mark {
    font-size: var(--text-md);
  }

  .card-head {
    gap: var(--space-sm);
  }
}
</style>
