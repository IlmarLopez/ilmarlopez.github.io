<script setup lang="ts">
import { cvEntries } from '~/data/cv'

withDefaults(defineProps<{ variant?: 'solid' | 'quiet' }>(), { variant: 'quiet' })

// One entry means a direct link. The menu for several languages arrives in T-39, so for now only the first is read.
const [entry] = cvEntries
</script>

<template>
  <!-- The PDF opens in a new tab and has no `download` attribute, so "View CV" says what happens (Q2). -->
  <BaseButton :href="entry.href" :variant="variant" target="_blank" rel="noopener"><slot>View CV</slot></BaseButton>
</template>
