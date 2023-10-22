<template>
  <transition name="modal-fade">
    <div
      class="fixed top-6 left-4 right-4 md:top-40 md:left-40 md:right-40 lg:right-1/3 lg:left-1/3 max-w-lg overflow-y-auto bg-white rounded-3xl p-4 shadow-2xl"
    >
      <div class="flex justify-end">
        <Icon
          name="uil:x"
          color="#dc2626"
          size="30px"
          class="cursor-pointer brightness-100 hover:brightness-125"
          @click="handleCloseModal()"
        />
      </div>
      <div class="mt-4">
        <h2 class="text-3xl text-[#F2664A]">Let's talk</h2>
        <p class="font-extralight mt-4 text-justify">
          If you would like to schedule a meeting for a conversation, whether
          it's for a coffee or any other purpose, please don't hesitate to get
          in touch with me directly or fill out the form below. I will be
          delighted to get in touch with you as soon as possible.
        </p>
      </div>
      <div class="mt-6">
        <form method="POST" action="/contact.php">
          <div class="mt-6">
            <label
              for="fullName"
              class="block text-lg text-primary-dark font-extralight text-sm"
              >Your Name</label
            >
            <input
              name="fullName"
              id="fullName"
              type="text"
              class="w-full px-5 py-2 border border-gray-300 border-opacity-50 text-primary-dark bg-ternary-light rounded-md shadow-sm text-md"
              v-model="fullName"
              required
            />
          </div>
          <div class="mt-6">
            <label
              for="email"
              class="block text-lg text-primary-dark font-extralight text-sm"
              >Your Email</label
            >
            <input
              name="email"
              id="email"
              type="text"
              class="w-full px-5 py-2 border border-gray-300 border-opacity-50 text-primary-dark bg-ternary-light rounded-md shadow-sm text-md"
              v-model="email"
              required
            />
          </div>
          <div class="mt-6">
            <label
              for="message"
              class="block text-lg text-primary-dark font-extralight text-sm"
              >Your Message</label
            >
            <textarea
              name="message"
              id="message"
              cols="14"
              rows="6"
              aria-label="Message"
              class="w-full px-5 py-2 border border-gray-300 border-opacity-50 text-primary-dark bg-ternary-light rounded-md shadow-sm text-md"
              v-model="message"
              required
            />
          </div>
          <div class="mt-6">
            <button
              type="submit"
              title="Send Message"
              aria-label="Send Message"
              class="px-12 py-2.5 text-white tracking-wider bg-[#F2664A] hover:bg-orange-400 focus:ring-1 focus:ring-indigo-900 rounded-3xl duration-500 shadow-xl"
            >
              Send Message
            </button>
          </div>
        </form>
      </div>
      <div @click.stop></div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { ref, defineEmits } from 'vue';

let fullName = ref('');
let email = ref('');
let message = ref('');

const emit = defineEmits(['close']);

function handleCloseModal() {
  emit('close');
}
</script>

<style scoped lang="sass">
.modal-fade-enter,
.modal-fade-leave-to
  opacity: 0

.modal-fade-enter-active,
.modal-fade-leave-active
  transition: opacity 0.5s ease
</style>
