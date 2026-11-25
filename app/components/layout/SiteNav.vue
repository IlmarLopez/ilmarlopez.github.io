<script setup lang="ts">
import { profile } from '~/data/profile'

// Plain anchors: on the home page they scroll in place, and from /versions or the 404 page they load the
// home page at that section. The targets arrive with the sections (T-26 onwards).
const links = [
  { label: 'Experience', href: '/#experience' },
  { label: 'Work', href: '/#work' },
  { label: 'Tools', href: '/#tools' },
  { label: 'Contact', href: '/#contact' },
]
</script>

<template>
  <header class="sticky top-0 z-(--z-sticky-nav) border-b border-rule bg-paper">
    <div class="site-container flex min-h-(--space-2xl) items-center justify-between gap-(--space-lg)">
      <NuxtLink to="/" class="nav-link font-display text-lg font-bold tracking-(--tracking-display)">{{ profile.name }}</NuxtLink>
      <nav aria-label="Primary">
        <ul class="m-0 flex list-none items-center gap-(--space-lg) p-0">
          <!-- At 60rem and below only the wordmark and the switch remain. -->
          <li v-for="link in links" :key="link.href" class="max-md:hidden">
            <a :href="link.href" class="nav-link">{{ link.label }}</a>
          </li>
          <li><ThemeSwitch /></li>
        </ul>
      </nav>
    </div>
  </header>
</template>

<style scoped>
/* A coral line grows under the link on hover and focus. */
.nav-link {
  text-decoration: none;
  padding-block: var(--space-xs);
  background: linear-gradient(var(--color-accent), var(--color-accent)) 0 100% / 0 2px no-repeat;
  transition: background-size var(--dur-short) var(--ease-out);
}

.nav-link:focus-visible {
  background-size: 100% 2px;
}

@media (hover: hover) {
  .nav-link:hover {
    background-size: 100% 2px;
  }
}
</style>
