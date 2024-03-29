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
        <form @submit.prevent="submitForm">
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
            <span v-if="fullNameIsRequiredErr" class="text-sm text-red-600"
              >Full name is required.</span
            >
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
              type="email"
              class="w-full px-5 py-2 border border-gray-300 border-opacity-50 text-primary-dark bg-ternary-light rounded-md shadow-sm text-md"
              v-model="email"
              required
            />
            <span v-if="emailIsRequiredErr" class="text-sm text-red-600"
              >Email is required.</span
            >
            <span v-else-if="emailIsNotValid" class="text-sm text-red-600"
              >Email is not valid.</span
            >
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
            <span v-if="messageIsRequiredErr" class="text-sm text-red-600"
              >Message is required.</span
            >
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
import { useToast } from 'vue-toast-notification';
import 'vue-toast-notification/dist/theme-sugar.css';

const { $api } = useNuxtApp();
const WEB3FORMS_ACCESS_KEY = '661f609d-7c79-4cfd-8325-9da6c4b4d14e';

let fullName = ref('');
let email = ref('');
let message = ref('');

let fullNameIsRequiredErr = ref(false);
let emailIsRequiredErr = ref(false);
let messageIsRequiredErr = ref(false);
let emailIsNotValid = ref(false);

const $toast = useToast();
const emit = defineEmits(['close']);

function handleCloseModal() {
  emit('close');
}

function submitForm() {
  if (!fullName.value) fullNameIsRequiredErr.value = true;
  if (!message.value) messageIsRequiredErr.value = true;
  if (!email.value) {
    emailIsRequiredErr.value = true;
  } else if (!validEmail(email.value)) emailIsNotValid.value = true;

  if (
    !fullNameIsRequiredErr.value &&
    !emailIsRequiredErr.value &&
    !messageIsRequiredErr.value &&
    !emailIsNotValid.value
  )
    sendEmail();
}

function sendEmail() {
  try {
    $api.post('https://api.web3forms.com/submit', {
      access_key: WEB3FORMS_ACCESS_KEY,
      name: fullName.value,
      email: email.value,
      message: message.value,
    }, {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    })
    .then(() => {
      handleCloseModal();
      $toast.success("Email sent successfully");
    })
    .catch(() => {
      $toast.error("Error sending your message");
    });
  } catch (error) {
    $toast.error("Error sending your message");
  }
}

function validEmail(email: string): boolean {
  var re =
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(email);
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
