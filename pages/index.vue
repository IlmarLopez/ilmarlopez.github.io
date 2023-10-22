<template>
  <NuxtLayout>
    <section id="home" class="h-full w-full flex items-center justify-center">
      <div class="w-full">
        <h1 class="font-bold text-4xl title text-center mb-4 hover:">
          Hi I'm Ilmar Lopez
        </h1>
        <div>
          <p class="lead-paragraph text-center mx-auto max-w-lg">
            I'm a dedicated full-stack developer focused on crafting innovative
            digital solutions. My passion is pushing boundaries, embracing new
            challenges, and continually expanding my knowledge.
          </p>
          <div class="hidden text-center mt-8">
            <button
              class="btn-contact shadow-2xl text-white px-10 py-4 uppercase"
              @click="openContactFormModal"
            >
              Say hi
            </button>
          </div>
        </div>
      </div>
    </section>
    <ContactFormModal v-if="showContactFormModal" @close="handleClose" />
  </NuxtLayout>
</template>

<script setup lang="ts">
import { ref } from 'vue';

useHead({
  title: 'Ilmar Lopez | Official Website',
});

let showContactFormModal = ref(false);

function handleClose() {
  showContactFormModal.value = false;
}

function openContactFormModal() {
  showContactFormModal.value = true;
}
</script>

<style lang="sass">
.title
  font-family: 'Inter', sans-serif
.lead-paragraph
  color: #696969
.btn-contact
  box-shadow: 0px 25px 45px rgba(242, 102, 73, 0.2)
  border-radius: 5px
  transition: 0.5s
  background-color: #F2664A
  &:hover
    color: #f5f2ea
    background-color: #241f21
    border-color: #241f21
</style>
