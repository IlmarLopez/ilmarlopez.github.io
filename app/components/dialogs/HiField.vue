<script setup lang="ts">
// One field of the "Say hi" form: a visible label, the control, and a helper line that is always there (so
// showing an error does not move what is below) and that the error replaces. The control's own attributes
// (autocomplete, type, rows, readonly...) arrive as attributes and go to it.
defineOptions({ inheritAttrs: false })

const model = defineModel<string>({ required: true })

defineProps<{ id: string; label: string; help: string; invalid: boolean; multiline?: boolean }>()
defineEmits<{ blur: [] }>()
</script>

<template>
  <div class="field" :data-invalid="invalid || undefined">
    <label :for="id">{{ label }}</label>
    <textarea
      v-if="multiline"
      :id="id"
      v-model="model"
      v-bind="$attrs"
      required
      aria-required="true"
      :aria-invalid="invalid ? 'true' : undefined"
      :aria-describedby="`${id}-help`"
      @blur="$emit('blur')"
    />
    <input
      v-else
      :id="id"
      v-model="model"
      v-bind="$attrs"
      required
      aria-required="true"
      :aria-invalid="invalid ? 'true' : undefined"
      :aria-describedby="`${id}-help`"
      @blur="$emit('blur')"
    />
    <p :id="`${id}-help`" class="help">{{ help }}</p>
  </div>
</template>

<style scoped>
.field {
  display: grid;
  align-content: start;
  gap: var(--space-2xs);
}

label {
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--color-ink-2);
}

/* A line tall, empty or not: the layout is the same whether or not the field has a problem. */
.help {
  min-height: 1lh;
  margin: 0;
  font-size: var(--text-sm);
  color: var(--color-muted);
}

.field[data-invalid] .help {
  color: var(--hi-error);
}

input,
textarea {
  width: 100%;
  box-sizing: border-box;
  min-height: 52px;
  padding: 0 var(--space-md);
  border: var(--rule-hair) solid var(--color-muted);
  border-radius: var(--radius-card);
  background: var(--color-paper);
  color: var(--color-ink);
  font: inherit;
  font-size: var(--text-md);
  /* The focus ring is drawn inside the border, so a field at the edge of the sheet is not clipped. */
  outline: 2px solid transparent;
  outline-offset: -3px;
  transition:
    background-color var(--dur-micro) var(--ease-out),
    border-color var(--dur-micro) var(--ease-out);
}

textarea {
  min-height: 7rem;
  padding-block: var(--space-sm);
  line-height: 1.5;
  resize: vertical;
}

@media (hover: hover) {
  input:hover,
  textarea:hover {
    background: var(--color-paper-2);
  }
}

input:focus-visible,
textarea:focus-visible {
  outline-color: var(--color-ink);
  border-color: var(--color-ink);
}

/* More specific than the focus rule on purpose: a field with a problem keeps its red border while it has focus. */
input[aria-invalid='true'],
textarea[aria-invalid='true'] {
  border-color: var(--hi-error);
}

[readonly] {
  color: var(--color-muted);
}
</style>
