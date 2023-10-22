<template>
  <div class="flex flex-col w-full h-screen overflow-hidden bg-[#F5F3EB]">
    <main class="flex-grow w-full h-full p-4 mx-auto max-w-7xl">
      <slot />
    </main>
    <footer class="w-full">
      <div class="flex justify-items-start p-3">
        <div>
          <SocialInfo />
        </div>
        <div class="flex justify-end w-full">
          <div>
            <NuxtLink :to="'mailto:me@ilmarlopez.com'" class="lead-paragraph">me@ilmarlopez.com</NuxtLink>
            <p class="font-extralight text-xs">
              Porfolio ©{{ new Date().getFullYear() }} <span class="text-red-600">&#x2665;&#xfe0f;</span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>
