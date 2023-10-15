<template>
  <div class="flex flex-col w-full h-screen overflow-hidden bg-custom">
    <main class="flex-grow w-full h-full p-4 mx-auto max-w-7xl">
      <slot />
    </main>
    <footer class="flex items-center justify-center w-full h-16 text-black">
      <div>
        <SocialInfo />        
        <p class="text-gray-700">
          Porfolio ©{{ new Date().getFullYear() }} <span class="text-red-600">&#x2665;&#xfe0f;</span>
        </p>
      </div>
    </footer>
  </div>
</template>

<style lang="sass">
.bg-custom
  background-color: #F5F3EB
</style>