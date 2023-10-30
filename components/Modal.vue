<template>
  <div class="fixed top-0 bottom-0 left-0 right-0">
    <div class="flex flex-col items-center justify-center min-h-full p-3">
      <transition name="fade">
        <div v-if="isModalVisible">
          <div
            @click="onToggle"
            class="absolute bg-black opacity-70 inset-0 z-0"
          ></div>
          <div
            class="w-full max-w-lg p-3 relative mx-auto my-auto rounded-xl shadow-lg bg-white"
          >
            <div>
              <div class="text-center p-3 flex-auto justify-center leading-6">
                <slot name="body"></slot>
              </div>
              <div class="p-3 mt-2 text-center space-x-4 md:block">
                <slot name="footer"></slot>
              </div>
            </div>
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

let isOpen = ref(true);

let isModalVisible = computed(() => {
  return isOpen.value;
});

function onToggle() {
  isOpen.value = !isOpen.value;
}
</script>
<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
}

.fade-enter,
.fade-leave-to {
  opacity: 0;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 500ms ease-out;
}
</style>
