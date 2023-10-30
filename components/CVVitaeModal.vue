<template>
  <Modal :close-modal="isShowModal">
    <template #body>
      <div :style="{ width: screenWidth + 'px' }">
        <iframe
          src="/files/cv-en.pdf"
          :width="screenWidth + 'px'"
          height="700px"
          class="mx-auto"
        />
      </div>
    </template>
    <template #footer>
      <button
        @click="handleCloseModal"
        class="mb-2 md:mb-0 bg-[#F2664A] border border-[#F2664A] px-5 py-2 text-sm shadow-sm font-medium tracking-wider text-white rounded-md hover:shadow-lg hover:bg-[#241f21] hover:border-[#241f21]"
      >
        Close
      </button>
    </template>
  </Modal>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

const props = defineProps({
  show: Boolean,
});

const emit = defineEmits(['close']);

const isShowModal = ref(false);

watch(
  () => props.show,
  (newValue, _) => {
    isShowModal.value = newValue;
  }
);

const screenWidth = ref(0);

const updateScreenWidth = () => {
  if (window.innerWidth < 1080) {
    screenWidth.value = window.innerWidth - 30;
  } else {
    screenWidth.value = 1080;
  }
};

onMounted(() => {
  updateScreenWidth();
  window.addEventListener('resize', updateScreenWidth);
});

onUnmounted(() => {
  window.removeEventListener('resize', updateScreenWidth);
});

function handleCloseModal() {
  isShowModal.value = false;
  emit('close')
}

</script>