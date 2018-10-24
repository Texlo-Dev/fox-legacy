<template>
   <div class="hero is-large is-black">
       <div class="hero-head">
           <nav class="navbar is-black has-background-black">
               <div class="navbar-brand">

               </div>
           </nav>
       </div>
      <div class="hero-body">
         <div class="columns">
            <div class="column is-half">
                <nav class="level">
                    <div id="placeholder" class="level-item is-hidden-touch">
                        <img align="right" width="128" height="128" :src="require('@/static/icon.png')" alt="">
                        &nbsp;&nbsp;&nbsp;<h1 style="font-size; 125px;" class="title has-text-centered has-text-white">Mr.Fox Bot</h1>
                    </div>
                    <div class="level-item is-hidden-desktop">
                        <img align="right" width="128" height="128" :src="require('@/static/icon.png')" alt="">
                        &nbsp;&nbsp;&nbsp;<h1 style="font-size; 125px;" class="title has-text-centered has-text-white">Mr.Fox Bot</h1>
                    </div>
                </nav>
               <!--<div class="column is-half">
                  <div class="container has-text-centered">
                     &nbsp;<img width="128" height="128" :src="require('@/static/icon.png')" alt="">
                     <br>
                     <h1 style="font-size; 125px;" class="title has-text-centered has-text-white">Mr.Fox Bot</h1>
                  </div>
               </div>-->
            </div>
            <div class="column is-half">
               <br><br>
               <nav class="level">
                  <div class="level-left" transiton="page">
                     <div class="level-item">
                        <button class="button is-outlined is-medium is-primary" @click="navTo('callback?id=pwa', false)">
                             <font-awesome-icon size="s" :icon="['fab', 'discord']"/>
                            &nbsp;Log In
                        </button>
                     </div>
                     <div class="level-item">
                        <button class="button is-medium is-outlined is-link" @click="navTo('commands', false)">
                             <font-awesome-icon size="s" icon="book"/>
                            &nbsp;Documentation
                        </button>
                     </div>
                  </div>
               </nav>
            </div>
         </div>
      </div>
      <div id="foote" class="hero-footer">
          <footer class="footer has-background-black">
              <div class="content has-text-centered">
                  <p>Need help? Come join us on our <a class="has-text-link" href="https://discordapp.com/invite/3R4Em2w">Discord Server!</a></p>
              </div>
          </footer>
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

<style>
#placeholder {
    padding-left: 480px
}


#foote {
    padding-bottom: 150px
    
}

</style>
