<template>
  <div>
    <!-- SkipLink (T-23) goes above the nav; SiteFooter (T-32) goes below main. -->
    <SiteNav />
    <main id="main">
      <slot />
    </main>
  </div>
</template>
