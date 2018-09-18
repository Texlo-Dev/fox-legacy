<template>
    <div>
        <section class="section">
			<div class="container">
				<div class="columns is-multiline">
					<div v-for="p of packages" class="column is-one-quarter">
						<nuxt-link v-if="p.enabled" :to="{ path: `/servers/${$route.params.guildid}/${p.name.toLowerCase()}` }">
							<div class="box">
								<div class="content">
									<h2 class="title has-text-left has-text-white">{{ p.name }}</h2>
									<p class="subtitle has-text-grey">{{ p.description }}</p>
									<br>
									<a class="button is-success" :href="p.name.toLowerCase()">Enabled</a>
								</div>
							</div>
						</nuxt-link>
						<a v-else>
							<div class="box">
								<div class="content">
									<h2 class="title has-text-left has-text-white">{{ p.name }}</h2>
									<p class="subtitle has-text-grey">{{ p.description }}</p>
									<br>
									<a :id="`${p.name}-button`" @click="confirmPkg(p.name)" class="button is-light">Enable</a>
								</div>
							</div>
						</a>
					</div>


				</div>

			</div>
		</section>

    </div>
</template>

<script>
import API from '~/API.js';
import secrets from '~/secrets.js';
export default {
	head() {
		return {
			title: 'Mr.Fox Bot - Dashboard',	
		}
	},
	async fetch({ store, app, params }) {
		if (store.state.cachedGuild) return;
        const token = app.$auth.getToken('discord');
        const { data: guilds } = await app.$axios.get(`/api/userGuilds`, { headers: { Authorization: secrets.encrypt(token.split('Bearer')[1].trim())} })
        const thisguild = guilds.filter(g => g.id === params.guildid)[0];
        store.commit('cacheGuild', thisguild);
    },
	async asyncData({ app, params, store }) {
		const { data: packages } = await app.$axios.get(`/api/getPackages/${params.guildid}`, { headers: { Authorization: secrets.encrypt(app.$auth.user.id) } });
		await store.commit('dashLoading', true);
		await store.commit('toggleDash', true);
		return {
			packages
		}
	},
	data() {
		return {
			packages: null
		}
	}
}
</script>
