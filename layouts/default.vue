<template>
  <div class="grid grid-rows-[1fr,auto] min-h-screen bg-[#F5F3EB]">
    <main class="container mx-auto z-0 px-4 py-6 lg:px-0">
      <slot />
    </main>
    <footer class="flex justify-items-start p-3">
      <div class="flex justify-between w-full">
        <SocialInfo />
        <div>
          <NuxtLink :to="'mailto:me@ilmarlopez.com'" class="lead-paragraph"
            >me@ilmarlopez.com</NuxtLink
          >
          <p class="font-extralight text-xs">
            Porfolio ©{{ new Date().getFullYear() }}
            <span class="text-red-600">&#x2665;&#xfe0f;</span>
          </p>
        </div>
      </div>
    </footer>
  </div>
</template>
