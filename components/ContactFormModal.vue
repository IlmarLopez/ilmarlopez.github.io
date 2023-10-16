<template>
  <transition name="modal-fade">
    <div class="modal-overlay bg-white rounded-3xl p-4 opacity-90 shadow-2xl">
      <div class="flex justify-end">
        <Icon
          name="uil:x"
          color="#ef4444"
          size="30px"
          class="cursor-pointer brightness-100 hover:brightness-125"
          @click="$emit('close')"
        />
      </div>
      <div class="mt-4">
        <h2 class="text-3xl">Let's talk</h2>
        <p class="font-extralight mt-4 text-justify">
          If you would like to schedule a meeting for a conversation, whether
          it's for a coffee or any other purpose, please don't hesitate to get
          in touch with me directly or fill out the form below. I will be
          delighted to get in touch with you as soon as possible.
        </p>
      </div>
      <div>
        <form @submit="(e) => e.preventDefault">
          <div>
            <label for="">Your Name</label>
            <input type="text">
          </div>
          <div>
            <label for="">Your Email</label>
            <input type="text">
          </div>
          <div>
            <label for="">Your Message</label>
            <input type="text">
          </div>
          <div>
            <button type="submit" title="Send Message" @click="sendEmail" />
          </div>
        </form>
      </div>
      <div @click.stop></div>
    </div>
  </transition>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
const WEB3FORMS_ACCESS_KEY = '661f609d-7c79-4cfd-8325-9da6c4b4d14e';

export default defineComponent({
  emits: ['close'],
  setup() {
    let name = ref('');
    let email = ref('');
    let message = ref('');

    async function submitForm() {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          access_key: WEB3FORMS_ACCESS_KEY,
          name: name.value,
          email: email.value,
          message: message.value,
        }),
      });
      const result = await response.json();
      if (result.success) {
        console.debug(result);
      }
    }

    function sendEmail() {
      console.log('Email sended.');
    }

    return {
      name,
      email,
      message,
      submitForm,
      sendEmail
    };
  },
});
</script>

<style scoped lang="sass">
.modal-overlay
  position: fixed
  top: 30%
  left: 50%
  transform: translate(-50%, -50%)
  max-width: 650px

.modal-fade-enter,
.modal-fade-leave-to
  opacity: 0

.modal-fade-enter-active,
.modal-fade-leave-active
  transition: opacity 0.5s ease
</style>
