<script setup lang="ts">
// An inline link. Attributes such as target, rel or class fall through to the anchor.
defineProps<{ href: string }>()
</script>

<template>
  <a :href="href" class="text-link"><slot /></a>
</template>

<style scoped>
/* A coral line grows under the link on hover and focus. */
.text-link {
  text-decoration: none;
  padding-block: var(--space-xs);
  background: linear-gradient(var(--color-accent), var(--color-accent)) 0 100% / 0 2px no-repeat;
  transition: background-size var(--dur-short) var(--ease-out);
}

.text-link:focus-visible {
  background-size: 100% 2px;
}

@media (hover: hover) {
  .text-link:hover {
    background-size: 100% 2px;
  }
}
</style>
