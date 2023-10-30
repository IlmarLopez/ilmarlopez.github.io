<template>
  <div v-if="isModalVisible" class="fixed top-0 bottom-0 left-0 right-0">
    <div class="flex flex-col items-center justify-center min-h-full p-3">
      <transition name="fade">
        <div>
          <div
            @click="onToggle"
            class="absolute bg-black opacity-70 inset-0 z-0"
          ></div>
          <div
            class="w-full relative mx-auto my-auto rounded-xl shadow-lg bg-white p-2"
          >
            <div>
              <div class="text-center flex-auto justify-center leading-6">
                <slot name="body" />
              </div>
              <div class="mt-2 text-center space-x-4 md:block">
                <slot name="footer" />
              </div>
            </div>
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';

const props = defineProps({
  closeModal: Boolean,
});

let isOpen = ref(true);

let isModalVisible = computed(() => {
  return isOpen.value;
});

function onToggle() {
  isOpen.value = !isOpen.value;
}

watch(
  () => props.closeModal,
  () => {
    onToggle();
  }
);
</script>
<style scoped>
.fade-enter,
.fade-leave-to {
  opacity: 0;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 500ms ease-out;
}
</style>
