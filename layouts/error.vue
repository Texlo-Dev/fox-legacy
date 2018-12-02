<template>
  <div class="container has-text-centered">
    <section v-if="error.statusCode === 404" class="section">
      <img
        :src="require('../static/Fox404.png')"
        align="center"
        style="border-radius: 75%;"
      ><br >
      <img
        :src="require('../static/404.png')"
        align="center"
        width="256"
        height="128"
      >
      <h1 class="title has-text-white has-text-bold">
        Sorry, Fox couldn't find this page!
      </h1>
      <nuxt-link to="/" class="button is-link is-large"
      ><p>Take me home!</p></nuxt-link
      >
    </section>
    <section v-else class="section">
      <br ><br ><br >
      <img
        :src="require('../static/error.png')"
        align="center"
        width="256"
        height="256"
      ><br >
      <h1 class="title has-text-white has-text-bold">
        Something wrong happened. Fox had a brain fart.
      </h1>
      <p class="subtitle has-text-white has-text-bold">{{ error.message }}</p>
      <nuxt-link to="/" class="button is-link is-large"
      ><p>Back to Safety</p></nuxt-link
      >
    </section>
  </div>
</template>

<script>
export default {
  props: ["error"],
  layout: "blog" // you can set a custom layout for the error page
};
</script>
