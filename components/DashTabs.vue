<template>
   <div class="hero" style="background-color: #2b2f33">
       <br class="is-hidden-touch">
       <br>
    
         <div class="hero-head">
            <div class="container">
                
                 <nav class="level">
                     <div class="level-item has-text-centered">
                            <figure class="image is-48x48">
                        <img v-if="$store.state.cachedGuild.icon" class="is-rounded" :src="`https://cdn.discordapp.com/icons/${$store.state.cachedGuild.id}/${$store.state.cachedGuild.icon}.jpg?size=128`">
                        <div v-if="!$store.state.cachedGuild.icon" class="guildicon">{{ getInitials($store.state.cachedGuild.name) }}</div>
                        <br>
                        </figure>
                        <h1 class="subtitle has-text-light has-text-weight-bold has-text-left">
                            &nbsp; {{ $store.state.cachedGuild.name }}
                        </h1>
                        </div>
                        <br>
                        <div class="level-item has-text-centered">
                            <div class="field has-addons">
                                <p class="control">
                                    <nuxt-link :to="`/servers/${this.$route.params.guildid}`" :class="{ 'is-outlined': selected === 1 }" class="button is-hidden-mobile is-primary"><p class="has-text-weight-bold">Packages</p></nuxt-link>
                                    <nuxt-link :to="`/servers/${this.$route.params.guildid}`" :class="{ 'is-outlined': selected === 1 }" class="button is-hidden-desktop is-hidden-tablet-only  is-small is-primary"><p class="has-text-weight-bold">Packages</p></nuxt-link>
                                </p>
                                <p class="control">
                                    <nuxt-link :to="`/servers/${this.$route.params.guildid}/permissions`" :class="{ 'is-outlined': selected === 0 }" class="button is-hidden-mobile is-primary"><p class="has-text-weight-bold">Permissions</p></nuxt-link>
                                    <nuxt-link :to="`/servers/${this.$route.params.guildid}/permissions`" :class="{ 'is-outlined': selected === 0 }" class="button is-hidden-desktop is-hidden-tablet-only is-small is-primary"><p class="has-text-weight-bold">Permissions</p></nuxt-link>
                                </p>
                                <p class="control">
                                    <nuxt-link :to="`/servers/${this.$route.params.guildid}`" class="button is-hidden-mobile is-success is-outlined"><p class="has-text-weight-bold">Change Server</p></nuxt-link>
                                     <nuxt-link :to="`/servers/${this.$route.params.guildid}`" class="button is-success is-hidden-desktop is-hidden-tablet-only is-small is-outlined"><p class="has-text-weight-bold">Change Server</p></nuxt-link>
                                </p>
                            </div>
                        </div>
                  <div id="guild" class="level-left">
                    
                </div>
                      <!--<div id="tabss" class="level-item">
                        <b-tabs @input="redirect" v-model="selected" size="is-medium">
                            <b-tab-item id="packages" label="Packages">
                            </b-tab-item>
                            <b-tab-item id="permissions" label="Permissions">
                            </b-tab-item>
                        </b-tabs>
                      </div>-->
                  <!--<div class="level-right">
                      <div class="level-item has-text-centered">
                        <b-tabs @input="redirect" v-model="selected" size="is-medium" position="is-centered">
                            <b-tab-item id="packages" label="Packages">
                            </b-tab-item>
                            <b-tab-item id="permissions" label="Permissions">
                            </b-tab-item>
                        </b-tabs>
                      </div>
                  </div>-->
               </nav>
         </div>
         <br>
      </div>
   </div>
</template>

<style>
.guildicon {
        border-radius: 128px;
        background-color: #2f3136;
        width: 48px;
        height: 48px;
        display: flex;
        justify-content: center;
        align-items: center;
        color: white;
        font-family: 'Raleway';
        font-size: small
    }

    .tabs li.is-active a {
    border-width: 3px

}

.tabs li a {
    border-width: 3px
}

.tabs span {
    font-family: 'Poppins';
}

.label {
    font-family: 'Poppins';
}


#tabss {
    height: 115px;
}


</style>


<script>
import API from "~/API.js";
import secrets from '~/secrets.js';
export default {
    name: "DashTabs",
    computed: {
        selected() {
            if (this.$route.name === 'servers-guildid-permissions') return 1;
            else return 0;
        }
    },
    methods: {
        getInitials(word) {
            return Array.prototype.map.call(word.split(" "), x => x.substring(0, 1).toUpperCase()).join("");
        },
        redirect(value) {
            if (value === 0) {
                return this.$router.push({ path: `/servers/${this.$route.params.guildid}`});
            } else if (value === 1) {
                return this.$router.push({ path: `/servers/${this.$route.params.guildid}/permissions`});
            }
        }
    },
    
};
</script>
