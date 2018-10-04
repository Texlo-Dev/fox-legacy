<template>
   <div class="hero" style="background-color: #2b2f33">
       <br>
         <div class="columns is-centered">
            <div class="column is-half">
               <br><br>
               <nav class="level">
                  <div class="level-item">
                    <figure class="image is-48x48">
                        <img v-if="$store.state.cachedGuild.icon" class="is-rounded" :src="`https://cdn.discordapp.com/icons/${$store.state.cachedGuild.id}/${$store.state.cachedGuild.icon}.jpg?size=128`">
                        <div v-if="!$store.state.cachedGuild.icon" class="icon">{{ getInitials($store.state.cachedGuild.name) }}</div>
                     </figure>
                     <h1 class="subtitle has-text-centered has-text-light has-text-weight-bold has-text-left">
                        &nbsp; {{ $store.state.cachedGuild.name }}
                     </h1>
                  </div>
               </nav>
            </div>
            <div class="column is-half">
               <br>
               <b-tabs @input="redirect" size="is-medium" position="is-centered">
                  <b-tab-item label="Packages">
                  </b-tab-item>
                  <b-tab-item label="Permissions">
                  </b-tab-item>
               </b-tabs>
            </div>
         </div>
      </div>
</template>

<style scoped>
.icon {
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
</style>


<script>
import API from "~/API.js";
import secrets from '~/secrets.js';
export default {
    name: "DashTabs",
    data() {
        return { selected: 0 };
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
