<script setup lang="ts">
import { experience } from '~/data/experience'
</script>

<template>
  <!-- Static first: the hero, then the roles as a plain list. With the `flight` class on <html> (set before the
       first paint, never with reduced motion) the same markup becomes planes at different depths and the camera
       in plugins/journey.client.ts flies through them while you scroll. -->
  <section id="journey" class="journey" aria-labelledby="h1">
    <div class="viewport">
      <div class="world">
        <div class="plane plane--hero" style="--i: 0">
          <div class="site-container"><HeroCopy /></div>
        </div>
        <!-- The target of the Experience link. In the list it is the heading. In flight it sits pinned at the top
             left of the viewport, so the router's scroll to it moves nothing and flight.ts puts the camera on the
             first role instead. -->
        <h2 id="experience" class="exp-head">Experience.</h2>
        <RoleCard v-for="(role, i) in experience" :key="role.id" :role :style="{ '--i': i + 1 }" />
      </div>
      <DepthRuler />
    </div>
  </section>
</template>

<style scoped>
.exp-head {
  width: min(44rem, calc(100% - var(--gutter) * 2));
  margin: var(--space-xl) auto var(--space-lg);
  font-size: var(--text-section);
  font-weight: 700;
  line-height: 1.02;
  letter-spacing: var(--tracking-h2);
}

/* The flight. The script sets --x, --y, --z, --o and --po on every plane while you scroll. */
.flight .journey {
  height: 480svh;
}

.flight .viewport {
  position: sticky;
  top: var(--space-2xl);
  height: calc(100svh - var(--space-2xl));
  overflow: clip;
  perspective: 1100px;
  perspective-origin: 76% 34%;
}

.flight .world {
  position: absolute;
  inset: 0;
  transform-style: preserve-3d;
}

/* The heading stays for screen readers; the planes carry the visual story. It is also the target of #experience,
   and a link scrolls an element to (its scroll-margin-top + html's scroll-padding-top, which is --space-3xl in
   base.css) below the top. Here it is pinned at --space-2xl, so that sum must be exactly --space-2xl: then a link
   or the router scrolling to it moves nothing, and flight.ts puts the camera on the first role instead. */
.flight .exp-head {
  scroll-margin-top: calc(var(--space-2xl) - var(--space-3xl));
  position: absolute;
  width: 1px;
  height: 1px;
  margin: 0;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}

.flight .plane {
  position: absolute;
  left: 50%;
  top: 50%;
  margin: 0;
  transform: translate3d(calc(-50% + var(--x, 0px)), calc(-50% + var(--y, 0px)), calc(var(--z, 0px) + var(--zi, 0px)));
  opacity: calc(var(--po, 1) * var(--pi, 1));
}

/* Until the camera is set up the roles have no position, so they stay out of sight instead of piling up. */
.flight:not(.flight-ready) .plane:not(.plane--hero) {
  visibility: hidden;
}

.flight .plane--hero {
  width: 100%;
}

.flight .plane--hero .hero-copy {
  padding-block: 0;
}

/* The buttons leave with the hero: they cannot be pressed from behind the first role. */
.flight .plane--hero[data-passed] :deep(.actions) {
  visibility: hidden;
}

@media (max-width: 40rem) {
  .flight .viewport {
    perspective: 900px;
    perspective-origin: 60% 36%;
  }
}
</style>
