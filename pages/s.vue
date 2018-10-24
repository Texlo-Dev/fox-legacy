<template>
   <div class="hero is-large">
      <div class="hero-body">
         <div class="columns">
            <div class="column is-half">
               <div class="column is-half">
                  <div class="container has-text-centered">
                     &nbsp;<img width="128" height="128" :src="require('@/static/icon.png')" alt="">
                     <br>
                     <h1 style="font-size; 125px;" class="title has-text-centered has-text-white">Mr.Fox Bot</h1>
                  </div>
               </div>
            </div>
            <div class="is-divider-vertical"></div>
            <div class="column is-half">
               <br>
               <h1 class="title has-text-left has-text-white">Welcome</h1>
               <nav class="level">
                  <div class="level-left" transiton="page">
                     <br>
                     <div class="level-item">
                        <div class="button box is-outlined has-background-primary" @click="navTo('callback?id=pwa', false)">
                           <div class="content">
                              <p class="has-text-white subtitle">
                                 <font-awesome-icon size="s" :icon="['fab', 'discord']"/>
                                 &nbsp;Log In
                              </p>
                           </div>
                        </div>
                     </div>
                     <div class="level-item">
                        <div id="buttondocs" class="button box has-background-link" @click="navTo('commands')">
                           <div class="content">
                              <p class="has-text-white subtitle">
                                 <font-awesome-icon size="s" icon="book" />
                                 &nbsp;Documentation
                              </p>
                           </div>
                        </div>
                     </div>
                  </div>
               </nav>
            </div>
         </div>
      </div>
   </div>
</template>

<script>
export default {
    auth: false,
    head: {
        bodyAttrs: null
    },
    computed: {
        quote() {
            return this.quotes[Math.floor(Math.random() * this.quotes.length)];
        }
    },
    async fetch({ store, redirect }) {
        if (process.server || store.state.pwaStart === 'active') await store.commit('isPWA', 'Yes');
        else redirect('/');
    },
    methods: {
        navTo(route, commit = true) {
            if (commit) this.$store.commit('isPWA', 'active');
            this.$router.push(`/${route}`);
        }
    }
}
</script>

