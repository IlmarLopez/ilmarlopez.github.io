<script setup lang="ts">
// A pill-shaped action. With an `href` it renders a link, otherwise a button. Attributes such as
// target, rel, type or data-* fall through to the element, and they win over the defaults below.
withDefaults(defineProps<{ href?: string; variant?: 'solid' | 'quiet' }>(), { href: undefined, variant: 'solid' })

const base =
  'inline-flex min-h-(--space-2xl) cursor-pointer items-center justify-center rounded-pill border px-(--space-xl) font-display text-md font-semibold no-underline transition-[background-color,color,border-color,scale] duration-(--dur-micro) ease-out active:scale-97 disabled:cursor-not-allowed disabled:opacity-50 aria-busy:cursor-progress aria-busy:border-accent aria-busy:bg-accent aria-busy:text-accent-ink max-sm:w-full'

// Solid is the primary action, ink-filled and coral on hover. Quiet is the outlined secondary one.
const variants = {
  solid: 'border-ink bg-ink text-paper hover:border-accent hover:bg-accent hover:text-accent-ink',
  quiet: 'border-rule bg-transparent text-ink hover:border-ink hover:bg-paper-2',
}
</script>

<template>
  <component :is="href ? 'a' : 'button'" :href="href" :type="href ? undefined : 'button'" :class="[base, variants[variant]]">
    <slot />
  </component>
</template>
