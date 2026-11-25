<script setup lang="ts">
import { profile } from '~/data/profile'

// Two things wait for later tasks, and both are left out on purpose instead of shipping a dead end:
// - "All versions" (/versions): the page is T-43. Nuxt crawls every link at build time, so a link to a page that
//   does not exist fails `nuxt generate`. Add `<li><TextLink href="/versions">All versions</TextLink></li>` back
//   with the page.
// - The ⌘K hint (Q6) waits for the command palette (T-41) and for the Hallmark pass that designs it.
</script>

<template>
  <footer class="footer">
    <div class="site-container footer-row">
      <!-- `#top` is the browser's own "scroll to the top" fragment: it works on every page. -->
      <a href="#top" class="wordmark">{{ profile.name }}</a>
      <ul>
        <li><TextLink href="https://v1.ilmarlopez.com">Version 1, archived</TextLink></li>
      </ul>
      <small>Version 2, 2026</small>
    </div>
  </footer>
</template>

<style scoped>
/* The graphite field closes the page in both themes. */
.footer {
  padding-block: var(--space-xl);
  background: var(--color-field);
  color: var(--color-field-ink);
}

.footer-row {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--space-md) var(--space-xl);
}

.wordmark {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: var(--text-lg);
  letter-spacing: var(--tracking-display);
  text-decoration: none;
}

ul {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-lg);
  list-style: none;
  margin: 0;
  padding: 0;
  font-size: var(--text-sm);
}

small {
  color: var(--color-field-muted);
  font-size: var(--text-sm);
}

/* On the graphite field the ring uses the accent coral: it has more contrast there than --color-focus. */
.footer :focus-visible {
  outline-color: var(--color-accent);
}
</style>
