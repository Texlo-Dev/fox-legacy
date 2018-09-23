<template>
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
	async fetch({ store, app, params: { guildid } }) {
		if (store.state.cachedGuild) return;
        const token = app.$auth.getToken('discord');
        const { data: guild } = await app.$axios.get(`/api/guilds/${guildid}`, { headers: { Authorization: secrets.encrypt(app.$auth.user.id)} })
       
        return store.commit('cacheGuild', guild);
    },
	async asyncData({ app, params: { guildid }, store }) {
		const { data: packages } = await app.$axios.get(`/api/guilds/${guildid}/packages`, { headers: { Authorization: secrets.encrypt(app.$auth.user.id) } });
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
	},
	methods: {
		confirmPkg(pkg) {
            this.$dialog.confirm({
                title: "Enable Package",
                message: `Are you sure that you want to enable the package ${pkg}?`,
                cancelText: "Cancel",
                confirmText: "Enable",
                type: "is-success",
                onConfirm: () => this.togglePackage(pkg, true)
            });
		},
		togglePackage(pkg, option) {
            this.$axios.patch(`/api/guilds/${this.$route.params.guildid}/packages`, {
                pkg,
                guildID: this.$route.params.guildid,
                enabled: option
            },
            { headers: { Authorization: secrets.encrypt(this.$auth.user.id)} }).then(() => {
                document.getElementById(`${pkg}-button`).className = 'button is-success';
                document.getElementById(`${pkg}-button`).innerHTML = 'Enabled';
                this.$router.push({ path: `/servers/${this.$route.params.guildid}/${pkg.toLowerCase()}` });
            }).catch(error => {
                this.$dialog.alert({
                    title: "Error",
                    message: `There was an error enabling this package.\n"${error.message}"`,
                    type: "is-danger",
                    hasIcon: true,
                    icon: "times-circle",
                    iconPack: "fa"
                });
            });
        }

	}
}
</script>
