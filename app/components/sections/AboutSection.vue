<script setup lang="ts">
import { profile } from '~/data/profile'

const { photo } = profile
</script>

<template>
  <PageSection id="about" heading-id="about-h" title="About.">
    <!-- The reference has no photo. This composition (a framed portrait under the heading) is provisional until
         the Hallmark pass of spec 10.3 designs it. -->
    <template #aside>
      <figure class="portrait" :style="{ '--photo-width': `${photo.width}px` }">
        <!-- AVIF, then WebP, then a resized JPEG. Never the 5 MB original. width and height reserve the space.
             The portrait never renders wider than photo.width, so `sizes` is one fixed size (its key is a screen
             width in px, and only has to be a number) and `densities` gives the 1x and 2x files. Without `sizes`,
             NuxtPicture falls back to every screen width up to 3072 px and ignores `densities`. -->
        <NuxtPicture
          :src="photo.src"
          :alt="photo.alt"
          :width="photo.width"
          :height="photo.height"
          :sizes="{ 1536: `${photo.width}px` }"
          format="avif,webp"
          densities="x1 x2"
          loading="lazy"
          :img-attrs="{ class: 'portrait-img', decoding: 'async' }"
        />
      </figure>
    </template>

    <div class="copy">
      <p v-for="paragraph in profile.about" :key="paragraph">{{ paragraph }}</p>
    </div>
  </PageSection>
</template>

<style scoped>
.copy {
  display: grid;
  gap: var(--space-lg);
}

.copy p {
  font-size: var(--text-lead);
  max-width: 52ch;
}

/* The first paragraph is the statement. */
.copy p:first-child {
  font-family: var(--font-display);
  font-weight: 600;
  font-size: var(--text-xl);
  letter-spacing: -0.02em;
  line-height: 1.25;
  max-width: 36ch;
}

.portrait {
  margin: 0;
  /* The frame is the photo's own width plus its two borders, so the 1x file is shown at its real size. */
  width: min(100%, calc(var(--photo-width) + 2 * var(--rule-hair)));
  overflow: hidden;
  background: var(--color-paper-3);
  border: var(--rule-hair) solid var(--color-ink);
  border-radius: var(--radius-card);
}

/* The picture and its image are rendered by NuxtPicture, so the rules reach them through :deep(). */
.portrait :deep(picture) {
  display: block;
}

.portrait :deep(.portrait-img) {
  width: 100%;
  height: auto;
  aspect-ratio: 3 / 4;
  object-fit: cover;
}
</style>
