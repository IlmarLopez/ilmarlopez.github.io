<template>
  <!-- The home grows one section at a time and T-33 assembles the final page. HeroCopy is static, so it never hydrates. -->
  <div class="site-container">
    <LazyHeroCopy hydrate-never />
  </div>
</template>
