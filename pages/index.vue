<template>
  <section class="container">
    <header class="header">
      <logo/>
    </header>
    <div class="wrapper">
      <div class="wrapper-content">
        <h1 class="welcome-text">
          coming soon
        </h1>
        <p class="welcome-subtext">
          My new website will launch very soon.
          <br>
          Stay tuned!
        </p>
      </div>
    </div>
    <!-- <div class="social-icons"></div> -->
  </section>
</template>

<script>
import Logo from '~/components/Logo.vue'

export default {
  components: {
    Logo
  }
}
</script>

<style>
.container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
}

.header {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  /* height: 50px; */
  overflow: hidden;
}

.header .logo {
  float: left;
}

.wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
}

.wrapper-content {
  padding: 20px;
  text-align: center;
  animation: dynamic-fade 1s linear forwards 1s;
  opacity: 0;
  margin-top: -30px;
}

.welcome-text {
  font-family: 'Quicksand', 'Source Sans Pro', -apple-system, BlinkMacSystemFont,
    'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  display: block;
  font-weight: 600;
  font-size: 50px;
  color: #35495e;
  letter-spacing: 1px;
  margin-bottom: 30px;
  text-shadow: 0px 10px 10px rgba(0, 0, 0, 0.4);
  text-transform: uppercase;
}

.welcome-subtext {
  font-size: 14px;
  line-height: 24px;
  letter-spacing: 4px;
  width: 280px;
  text-shadow: 0px 2px 3px rgba(0, 0, 0, 0.3), 0px 5px 10px rgba(0, 0, 0, 0.5);
  text-transform: uppercase;
  margin: 0 auto;
}

@keyframes dynamic-fade {
  100% {
    opacity: 1;
    margin-top: 0;
  }
  80% {
    margin-top: -5;
  }
  40% {
    margin-top: -15;
  }
  10% {
    opacity: 1;
    margin-top: -25;
  }
}
</style>
