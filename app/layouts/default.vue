<script setup lang="ts">
// The "Say hi" dialog is not part of the first load: the first request (plugins/actions.client.ts) sets this flag
// and only then does the layout mount it. `Lazy` makes its code a chunk of its own.
const { state: hi } = useHiDialog()
</script>

<template>
  <div>
    <!-- SkipLink (T-23) goes above the nav. -->
    <SiteNav />
    <main id="main">
      <slot />
    </main>
    <SiteFooter />
    <LazyHiDialog v-if="hi.requested" />
  </div>
</template>
