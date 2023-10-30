<template>
  <NuxtLayout>
    <section id="home" class="h-full">
      <div
        class="flex flex-col md:flex-row md:justify-center md:items-center w-full h-full"
      >
        <div class="order-last md:order-first md:w-1/3">
          <h1
            class="sm:text-center md:text-left font-bold text-4xl title mb-2 p-2 max-w-sm"
          >
            Hi 👋, I'm Ilmar Lopez
          </h1>
          <div class="max-w-sm p-2">
            <p class="lead-paragraph text-justify">
              I'm a dedicated Full Stack Developer focused on crafting
              innovative digital solutions. My passion is pushing boundaries,
              embracing new challenges, and continually expanding my knowledge.
            </p>
            <div class="flex flex-col items-center md:items-end mt-8 md:flex-row md:justify-between">
              <button
                class="btn-contact shadow-2xl text-white px-10 py-4 uppercase"
                @click="openContactFormModal"
              >
                Say hi
              </button>
              <div class="flex items-end mt-2 md:mt-0">
                <button class="underline" @click="isCVVitaeModal = true">View CV</button>
              </div>
            </div>
          </div>
        </div>
        <div class="relative mb-6 md:mb-0 w-96">
          <img
            src="/img/hero/me.jpg"
            alt="Ilmar Lopez coding and programming as a Full Stack Developer."
            class="h-auto rounded-lg shadow-xl object-fill h-120 bg-[#F2664A]"
          />
          <div class="absolute bottom-0 px-4 py-3 bg-gray-500/50 w-full">
            <p class="text-gray-200 text-center">
              I aspire to create
              <span class="bg-[#F2664A] p-1 rounded-sm"
                >impactful contributions</span
              >.
            </p>
          </div>
        </div>
      </div>
    </section>
    <LazyContactFormModal v-if="showContactFormModal" @close="handleClose" />
    <LazyCVVitaeModal :show="isCVVitaeModal" @close="isCVVitaeModal = false" />
  </NuxtLayout>
</template>

<script setup lang="ts">
import { ref } from 'vue';

useHead({
  title: 'Ilmar Lopez | Official Website',
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Person',
        name: 'Ilmar Lopez',
        url: 'https://ilmarlopez.com/',
        sameAs: [
          'https://github.com/IlmarLopez',
          'https://mx.linkedin.com/in/ilmarlopez',
          'https://www.facebook.com/ilmar.lopezr',
          'https://wa.me/526647291355',
          'https://www.twitch.tv/ilmarlopez',
          'https://codepen.io/ilmarlopez',
          'https://dev.to/ilmarlopez',
        ],
        jobTitle: 'Full Stack Developer',
        email: 'me@ilmarlopez.com',
        image: 'https://ilmarlopez.com/img/hero/me.jpg',
      }),
    },
  ],
});

const isCVVitaeModal = ref(false);

const showContactFormModal = ref(false);

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
