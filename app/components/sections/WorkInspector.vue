<script setup lang="ts">
import { projects } from '~/data/projects'

// The only stateful piece of the home. Without scripts (or when the bundle never starts and the boot script takes
// the `js` class off) every project is shown open, one under the other, and the tab list is hidden because its
// buttons would do nothing. With scripts it is the ARIA tabs pattern: arrows, Home and End move between tabs,
// and only the selected tab is in the tab order.

const active = ref(0)
const tabs = useTemplateRef<HTMLButtonElement[]>('tabs')

type MoveKey = 'ArrowDown' | 'ArrowRight' | 'ArrowUp' | 'ArrowLeft' | 'Home' | 'End'

const MOVES: Record<MoveKey, (index: number, count: number) => number> = {
  ArrowDown: (index, count) => (index + 1) % count,
  ArrowRight: (index, count) => (index + 1) % count,
  ArrowUp: (index, count) => (index - 1 + count) % count,
  ArrowLeft: (index, count) => (index - 1 + count) % count,
  Home: () => 0,
  End: (_index, count) => count - 1,
}

function isMoveKey(key: string): key is MoveKey {
  return Object.hasOwn(MOVES, key)
}

function select(index: number, focus = false) {
  active.value = index
  if (focus) tabs.value?.[index]?.focus()
}

function onKeydown(event: KeyboardEvent, index: number) {
  if (!isMoveKey(event.key)) return
  event.preventDefault()
  select(MOVES[event.key](index, projects.length), true)
}

const number = (index: number) => String(index + 1).padStart(2, '0')
</script>

<template>
  <div class="wk">
    <ul class="wk-list" role="tablist" aria-label="Projects" aria-orientation="vertical">
      <li v-for="(project, index) in projects" :key="project.id" role="presentation">
        <button
          ref="tabs"
          :id="`wk-t${index}`"
          class="wk-tab"
          role="tab"
          type="button"
          :aria-controls="`wk-p${index}`"
          :aria-selected="index === active"
          :tabindex="index === active ? 0 : -1"
          @click="select(index)"
          @keydown="onKeydown($event, index)"
        >
          <span class="no">{{ number(index) }}</span>
          <span class="nm">{{ project.name }}</span>
          <span class="tg">{{ project.stack }}</span>
        </button>
      </li>
    </ul>

    <div class="wk-view">
      <div
        v-for="(project, index) in projects"
        :id="`wk-p${index}`"
        :key="project.id"
        class="wk-panel"
        role="tabpanel"
        :aria-labelledby="`wk-t${index}`"
        :data-active="index === active ? '' : undefined"
      >
        <WorkStack :layers="project.layers" />
        <div class="wk-detail">
          <h3>{{ project.name }}</h3>
          <p>{{ project.summary }}</p>
          <p class="links">
            <template v-for="(repo, i) in project.repos" :key="repo.href">
              <template v-if="i > 0">{{ ' and ' }}</template>
              <TextLink :href="repo.href">{{ repo.label }}</TextLink>
            </template>
            {{ ' on GitHub' }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Plain markup first: one column, every project open, no tab list. */
.wk {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: var(--space-xl);
  align-items: start;
}

.wk-list {
  display: none;
  list-style: none;
  padding: 0;
  margin: 0;
  border-top: var(--rule-hair) solid var(--color-rule);
}

.wk-view {
  display: grid;
  gap: var(--space-2xl);
}

.wk-detail {
  max-width: 34rem;
}

.wk-detail h3 {
  font-size: var(--text-title);
  font-weight: 700;
  letter-spacing: -0.02em;
  margin-bottom: var(--space-sm);
}

.wk-detail p {
  color: var(--color-ink-2);
  margin-bottom: var(--space-sm);
}

.wk-detail .links {
  font-size: var(--text-sm);
}

/* With scripts: the tab list, and one panel at a time. The panels share one grid cell, so the section keeps the
   height of the tallest one and nothing below it jumps when a tab changes. The inactive ones are only hidden, not
   removed from the layout; `visibility` also takes them out of the focus order and the accessibility tree.
   The panel changes at once; M-09 (T-54) adds the fade. */
.js .wk-list {
  display: block;
}

.js .wk-view > .wk-panel {
  grid-area: 1 / 1;
  min-width: 0;
}

.js .wk-view > .wk-panel:not([data-active]) {
  visibility: hidden;
  pointer-events: none;
}

.wk-tab {
  white-space: nowrap;
  display: grid;
  grid-template-columns: 3rem 1fr;
  column-gap: var(--space-sm);
  width: 100%;
  padding: var(--space-lg) var(--space-sm);
  text-align: left;
  font: inherit;
  color: var(--color-muted);
  background: transparent;
  border: 0;
  border-bottom: var(--rule-hair) solid var(--color-rule);
  cursor: pointer;
  transition: color var(--dur-short) var(--ease-out);
}

@media (hover: hover) {
  .wk-tab:hover {
    color: var(--color-ink);
  }
}

.wk-tab[aria-selected='true'] {
  color: var(--color-ink);
  box-shadow: inset 3px 0 0 var(--color-accent);
}

.wk-tab .no {
  grid-row: span 2;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: var(--text-xl);
  letter-spacing: var(--tracking-title);
  font-variant-numeric: tabular-nums;
}

.wk-tab .nm {
  white-space: normal;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: var(--text-title);
  letter-spacing: -0.02em;
  line-height: 1.15;
}

.wk-tab .tg {
  font-size: var(--text-sm);
}

@media (min-width: 60.0625rem) {
  .js .wk {
    grid-template-columns: minmax(0, 5fr) minmax(0, 7fr);
    gap: var(--space-2xl);
  }
}
</style>
