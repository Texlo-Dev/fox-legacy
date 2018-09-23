<template>
<section class="section">
   <h1 class="title has-text-white">
      Select A Server
   </h1>
   <div v-if="guilds" v-for="guild in guilds" :key="guild.id" class="container" align="center">
      <b-tooltip :label="guild.name" type="is-light" position="is-right">
         <figure v-if="guild.canManage && guild.icon" class="image is-128x128">
            <img @click="enterDash(guild)" class="is-rounded" :src="guild.iconURL">
         </figure>
         <a v-else-if="guild.canManage && !guild.icon" class="image is-128x128">
            <div @click="enterDash(guild)" class="icon"><span>{{ getInitials(guild.name) }}</span></div>
         </a>
         <figure v-else-if="guild.icon" class="image is-128x128">
            <a @click="popup(guild)"><img class="is-rounded" :src="guild.iconURL"></a>
         </figure>
         <a v-else @click="popup(guild)">
            <div class="icon"><span>{{ getInitials(guild.name) }}</span></div>
         </a>
      </b-tooltip>
      <br>
      <br>
   </div>
   <div v-show="!guilds" class="container">
      <h1 class="subtitle has-text-centered">
         No servers. Make sure you are the owner of a server or have the Manage Server Permission to use the dashboard.
      </h1>
   </div>
</section>
</template>

<script>
import API from '~/API.js';
import secrets from '~/secrets.js';
import { mapGetters } from 'vuex';
export default {
    head() {
		return {
			title: 'Mr.Fox Bot - Servers',
			meta: [
				{ hid: 'description', name: 'description', content: 'Configure Mr.Fox settings for your server on the online dashboard, or add him to a server you currently own.'}
			]
		}
	},
    data() {
        return {
            guilds: null
        };
    },
    fetch({ store, redirect }) {
        //if (process.server) return redirect({ path: '/ldgservers'});
        return store.commit('dashLoading', false)
    },
    async asyncData({ app }) {
        const token = app.$auth.getToken('discord');
        const { data: guilds } = await app.$axios.get(`/api/guilds`, { headers: { Authorization: secrets.encrypt(token.split('Bearer')[1].trim()) } })
            return {
                guilds
             }
    }, 
    methods: {
        getInitials(word) {
            return Array.prototype.map.call(word.split(" "), x => x.substring(0, 1).toUpperCase()).join("");
        },
        async enterDash(guild) {
            this.$store.commit('cacheGuild', guild);
            this.$router.push({ path: `/servers/${guild.id}` });
        },
        async popup(guild) {
            await this.$store.commit('cacheGuild', guild);
            const popup = window.open(`${process.env.SERVERURL}&guild_id=${guild.id}`, "Discord", "dependent=yes,toolbar=no,scrollbars=yes,resizable=yes,width=464,height=742");
            if (popup.focus) popup.focus();
        }
    }
    
}
</script>

<style>
.icon {
        border-radius: 128px;
        background-color: #2f3136;
        width: 128px;
        height: 128px;
        display: flex;
        justify-content: center;
        align-items: center;
        color: white;
        font-family: 'Raleway';
        font-size: xx-large
    }
</style>
