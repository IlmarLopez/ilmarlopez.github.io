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
      <!-- `relative`: the line below is positioned against this element (plugins/nav.client.ts). -->
      <nav aria-label="Primary" class="relative">
        <ul class="m-0 flex list-none items-center gap-(--space-lg) p-0">
          <!-- At 60rem and below only the wordmark and the switch remain. -->
          <li v-for="link in links" :key="link.href" class="max-md:hidden">
            <a :href="link.href" class="nav-link">{{ link.label }}</a>
          </li>
          <li><ThemeSwitch /></li>
        </ul>
        <!-- The coral line under the link of the section on screen. The script gives it a place (--nx, --ny) and a width (--nw). -->
        <span class="nav-ind max-md:hidden" aria-hidden="true"></span>
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

/* M-17. The line is one pixel wide and stretched with scaleX, so moving it only costs a transform. Without the
   script it has no width (--nw is unset, so scaleX(0)) and is not there; `.js` only adds the fade. It does not
   slide in from the corner on its first placement (no `data-ready` yet), only between links afterwards. */
.nav-ind {
  position: absolute;
  left: 0;
  top: 0;
  width: 1px;
  height: 2px;
  background: var(--color-accent);
  transform-origin: 0 0;
  transform: translate(var(--nx, 0px), var(--ny, 0px)) scaleX(var(--nw, 0));
  pointer-events: none;
}

.js .nav-ind {
  opacity: 0;
  transition: opacity var(--dur-micro) var(--ease-out);
}

.js .nav-ind[data-on] {
  opacity: 1;
}

.js .nav-ind[data-ready] {
  transition:
    transform var(--dur-short) var(--ease-out),
    opacity var(--dur-micro) var(--ease-out);
}
</style>
