<template>
    <section class="hero is-black">
		<div class="hero-footer">
			<nav class="navbar is-spaced has-background-black is-transparent is-black is-fixed-top">
				<div class="container">
					<div class="navbar-brand">
						<nuxt-link class="navbar-item" to="/">
							<img id="foxlogo" :src="require('../assets/FoxLogov2.png')">
							<h1 class="title">Fox</h1>&nbsp;
						</nuxt-link>
						<div class="navbar-burger burger" @click="showNav = !showNav" :class="{ 'is-active': showNav }">
							<span></span>
							<span></span>
							<span></span>
						</div>
					</div>
					<div class="navbar-menu" :class="{ 'is-active': showNav }">
						<div class="navbar-start" @click="showNav = !showNav">
							<nuxt-link class="navbar-item has-text-weight-bold" to="/about">
								<h1 class="subtitle has-text-left">About</h1>
							</nuxt-link>
							<div class="navbar-item has-dropdown is-hoverable has-text-weight-semi-bold">
								<a class="navbar-link">
									<h1 class="subtitle has-text-left">Documentation</h1>
								</a>
								<div class="navbar-dropdown is-boxed">
									<router-link class="navbar-item" to="/getstarted">
										<p class='has-text-primary'>Getting Started</p>
									</router-link>
									<nuxt-link class="navbar-item" to="/commands">
										<p class='has-text-primary'>Commands</p>
									</nuxt-link>
									<nuxt-link class="navbar-item" to="/permissions">
										<p class='has-text-primary'>Permissions</p>
									</nuxt-link>
								</div>
							</div>
							<a class="navbar-item has-text-weight-semi-bold" href="https://discord.gg/3R4Em2w">
								<h2 class="subtitle">Support</h2>
							</a>
						</div>
						<div class="navbar-end">
							<div class="navbar-item">
								<b-dropdown v-if="$auth.loggedIn">
									<button class="button is-medium is-black" slot="trigger">
										<img :src="getAvatar" height="30" width="30" style="border-radius: 50px">
										&nbsp;&nbsp;<p class="has-text-weight-semi-bold">{{ $auth.user.username }}</p>
										&nbsp;<font-awesome-icon size="1x" pull="right" icon="angle-down" />
									</button>
									<b-dropdown-item @click="showNav = !showNav" has-link>
										<nuxt-link class="has-text-black" to="/servers">Servers</nuxt-link>
									</b-dropdown-item>
									<b-dropdown-item @click="logout()">Log Out</b-dropdown-item>
								</b-dropdown>
								<button v-if="!$auth.loggedIn" class="button is-rounded is-black is-inverted is-outlined" @click="$auth.loginWith('discord')">
									<font-awesome-icon size="s" pull="left" :icon="['fab', 'discord']"/>Login
								</button>
							</div>
						</div>
					</div>
				</div>
			</nav>
		</div>
	</section>
</template>

<script>
export default {
	computed: {
		getAvatar() {
			const auth = this.$auth;
			if (auth.user.avatar) return `https://cdn.discordapp.com/avatars/${auth.user.id}/${auth.user.avatar}.${auth.user.avatar.startsWith("a_") ? "gif" : "png"}?size=128`;
			else return `https://discordapp.com/assets/dd4dbc0016779df1378e7812eabaa04d.png`;

		}
	},
	data: () => ({ showNav: false }),
	methods: {
		logout() {
			this.$auth.logout().then(this.showNav = false);
		}
	}
}
</script>

<style>

.bm-burger-button {
    height: 20px;
    width: 25px;
    top: 41px;
	left: 20px

  }
</style>
