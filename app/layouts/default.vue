<template>
  <div>
    <!-- SkipLink (T-23) goes above the nav. -->
    <SiteNav />
    <main id="main">
      <slot />
    </main>
    <SiteFooter />
  </div>
</template>
