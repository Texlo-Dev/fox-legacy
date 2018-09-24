<template>
  <div class="container has-text-centered">
    <section class="section" v-if="error.statusCode === 404">

        <img align="center" style="border-radius: 75%;" :src="require('../static/Fox404.png')"><br>
        <img align="center" width="256" height="128" :src="require('../static/404.png')">
        <h1 class="title has-text-white has-text-bold">Sorry, Fox couldn't find this page!</h1>
        <nuxt-link to="/" class="button is-link is-large"><p>Take me home!</p></nuxt-link>
    </section>
    <section class="section" v-else>
        <br><br><br>
        <img align="center" width="256" height="256" :src="require('../static/error.png')"><br>
        <h1 class="title has-text-white has-text-bold">Something wrong happened. Fox had a brain fart.</h1>
        <p class="subtitle has-text-white has-text-bold">{{error.message }}</p>
        <nuxt-link to="/" class="button is-link is-large"><p>Back to Safety</p></nuxt-link>
    </section>

  </div>
</template>

<script>
export default {
  props: ['error'],
  layout: 'blog' // you can set a custom layout for the error page
}
</script>