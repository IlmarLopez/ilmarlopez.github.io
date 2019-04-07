<template>
  <div class="logo">
    <h2>ilmar lópez</h2>
  </div>
</template>

<style scoped>
.logo {
  display: inline-block;
  /* animation: turn 1s linear forwards .5s; */
  /* transform: rotateX(180deg); */
  position: relative;
  overflow: hidden;
  height: 180px;
  width: 245px;
  opacity: 1;
}
.logo h2 {
  text-transform: capitalize;
  margin-top: 20px;
  margin-left: 20px;
}
@keyframes turn {
  100% {
    transform: rotateX(0deg);
    opacity: 1;
  }
  50% {
    opacity: 0;
  }
}
</style>