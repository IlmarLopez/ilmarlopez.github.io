<script setup lang="ts">
const { toggle } = useTheme()
</script>

<template>
  <button
    type="button"
    class="theme-switch cursor-pointer rounded-pill whitespace-nowrap border border-rule bg-transparent px-(--space-md) py-(--space-xs) text-sm text-ink transition-[background-color,scale] duration-(--dur-micro) ease-out hover:bg-paper-2 active:scale-97"
    @click="toggle"
  >
    <!-- Two labels, one visible: CSS picks it from the theme in force, so the server's HTML and the client's agree. -->
    <span class="to-dark"><span class="visually-hidden">Switch to </span>Dark</span>
    <span class="to-light"><span class="visually-hidden">Switch to </span>Light</span>
  </button>
</template>

<!-- Not scoped on purpose: these selectors start at <html>, and Vue's `:global()` drops what follows it. Every rule is under `.theme-switch`. -->
<style>
/* The label names the theme the click switches to. With a light page it says "Dark". */
.theme-switch .to-light {
  display: none;
}

:root[data-theme='dark'] .theme-switch .to-dark {
  display: none;
}

:root[data-theme='dark'] .theme-switch .to-light {
  display: inline;
}

/* Nothing saved: the system decides. A saved light theme keeps the default above. */
@media (prefers-color-scheme: dark) {
  :root:not([data-theme='light']) .theme-switch .to-dark {
    display: none;
  }

  :root:not([data-theme='light']) .theme-switch .to-light {
    display: inline;
  }
}

/* Without JS the page follows the system and the button would do nothing, so it is not offered. */
html:not(.js) .theme-switch {
  display: none;
}
</style>
