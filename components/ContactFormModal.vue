<template>
  <transition name="modal-fade">
    <div class="modal-overlay bg-white rounded-3xl p-4 opacity-90 shadow-2xl">
      <div class="flex flex-row-reverse">
        <Icon name="uil:x" color="#ef4444" size="30px" class="cursor-pointer brightness-100 hover:brightness-125" @click="$emit('close')"/>
      </div>
      <div @click.stop>

      </div>
    </div>
  </transition>
</template>

<script lang="ts">
  import { defineComponent, ref } from 'vue';
  const WEB3FORMS_ACCESS_KEY = "661f609d-7c79-4cfd-8325-9da6c4b4d14e";

  export default defineComponent ({
    emits: ['close'],
    setup() {
      let name = ref('');
      let email = ref('');
      let message = ref('');

      async function submitForm() {
        const response = await fetch("https://api.web3forms.com/submit", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
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

      return {
        name,
        email,
        message,
        submitForm,
      }
    },
  });
</script>

<style scoped lang="sass">
.modal-overlay
    position: fixed
    top: 15%
    bottom: 40%
    left: 35%
    right: 35%

.modal-fade-enter,
.modal-fade-leave-to
    opacity: 0

.modal-fade-enter-active,
.modal-fade-leave-active
    transition: opacity 0.5s ease
</style>