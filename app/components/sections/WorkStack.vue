<script setup lang="ts">
// A decorative stack of plates seen from above, one per layer, bottom layer first. Each plate has a label
// anchored to its right corner. The meaning is in the project text next to it, so the whole drawing is hidden
// from assistive technology. It is drawn open: the collapsed state and the way it opens are T-55.
defineProps<{ layers: readonly string[] }>()
</script>

<template>
  <div class="wk-stage" aria-hidden="true">
    <div class="wk-stack">
      <div
        v-for="(layer, index) in layers"
        :key="layer"
        class="plate"
        :class="{ 'plate--top': index === layers.length - 1 }"
        :style="{ '--i': index }"
      >
        <i></i><span class="tag">{{ layer }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.wk-stage {
  --pu: 13rem;
  --gap: 54px;
  --lead: 0.3;
  position: relative;
  height: 24rem;
  perspective: 2600px;
  display: grid;
  place-items: center;
}

.wk-stack {
  position: relative;
  width: var(--pu);
  height: var(--pu);
  transform: translateY(2.5rem) rotateX(58deg) rotateZ(-42deg);
  transform-style: preserve-3d;
}

.plate {
  --z: calc(var(--i) * var(--gap));
  position: absolute;
  inset: 0;
  transform-style: preserve-3d;
  transform: translateZ(var(--z));
}

.plate i {
  position: absolute;
  inset: 0;
  background: var(--color-paper-3);
  border: var(--rule-hair) solid var(--color-ink);
  border-radius: var(--radius-card);
}

.plate--top i {
  background: var(--scene-soft-top);
}

/* The label hangs from the plate's right corner (spec B7), upright to the viewer, with a dashed guide back to it. */
.tag {
  position: absolute;
  left: 100%;
  top: 100%;
  padding-left: calc(var(--pu) * var(--lead) + var(--space-sm));
  white-space: nowrap;
  font-family: var(--font-display);
  font-weight: 600;
  font-size: var(--text-md);
  color: var(--color-ink);
  transform-origin: 0 0;
  transform: rotateZ(42deg) rotateX(-58deg) translateY(-50%);
}

.tag::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  width: calc(var(--pu) * var(--lead));
  border-top: var(--rule-hair) dashed var(--color-muted);
}

/* The drawing is the diamond, a guide and the widest label. Where it fits the stage it keeps its size and place;
   where it does not, it shrinks to fit and slides left. --tag is the width of the widest label (126 px at 16 px,
   8rem); a longer label means a bigger --tag. The shift is 0 or negative and 0.71875 is half the width of the
   rotated diamond. */
@supports (width: 1cqw) {
  .wk-stage {
    container-type: inline-size;
    --tag: 8rem;
  }

  .wk-stack {
    --pu: clamp(5rem, (100cqw - var(--space-xs) * 2 - var(--space-sm) - var(--tag)) / (1.4375 + var(--lead)), 13rem);
    transform: translateX(min(0px, calc(50cqw - var(--space-xs) - (0.71875 + var(--lead)) * var(--pu) - var(--space-sm) - var(--tag))))
      translateY(2.5rem) rotateX(58deg) rotateZ(-42deg);
  }
}

@media (max-width: 60rem) {
  .wk-stage {
    --pu: 10rem;
    --gap: 44px;
    height: 21rem;
  }

  .tag {
    font-size: var(--text-sm);
  }

  @supports (width: 1cqw) {
    .wk-stage {
      --lead: 0.2;
      --tag: 7rem;
    }

    .wk-stack {
      --pu: clamp(5rem, (100cqw - var(--space-xs) * 2 - var(--space-sm) - var(--tag)) / (1.4375 + var(--lead)), 10rem);
      transform: translateX(calc((var(--lead) * var(--pu) + var(--space-sm) + var(--tag)) / -2)) translateY(2.5rem)
        rotateX(58deg) rotateZ(-42deg);
    }
  }
}
</style>
