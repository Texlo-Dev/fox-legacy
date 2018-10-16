<template>
    <section class="hero is-black">
		<div class="hero-footer">
			<nav class="navbar has-background-black is-transparent is-black is-fixed-top">
				<div class="container">
					<nav class="level is-hidden-desktop is-mobile">
						<div class="level-left">
							<no-ssr>
									<slide class="is-hidden-desktop" noOverlay width="250">
									<nuxt-link to="/">
										<span>
											<h1 class="title">Mr.Fox</h1>
										</span>
									</nuxt-link>
									<nuxt-link to="/about">
										<span>
											<p>About</p>
										</span>
									</nuxt-link>
									<nuxt-link to="/getstarted">
										<span>
											<p>Getting Started</p>
										</span>
									</nuxt-link>
									<nuxt-link to="/commands">
										<span>
											<p>Commands</p>
										</span>
									</nuxt-link>
									<nuxt-link to="/permissions">
										<span>
											<p>Permissions</p>
										</span>
									</nuxt-link>
									<a href="https://discord.gg/3R4Em2w">
										<span>
											<p>Support Server</p>
										</span>
									</a>
									<div v-if="$auth.loggedIn">
										<span>
											<figure class="image is-48x48">
												<img :src="getAvatar" class="is-rounded">
											</figure>
										</span>
										<span>
											<p class="has-text-weight-bold">{{ $auth.user.username }}</p>
											<nuxt-link to="/servers"><p class="has-text-weight-light">Servers</p></nuxt-link>
											<a @click="$auth.logout()"><p class="has-text-weight-light is-danger">Log Out</p></a>
										</span>
									</div>
									<div v-else>
										<button v-if="!$auth.loggedIn" class="button is-rounded is-black is-inverted is-outlined" @click="$auth.loginWith('discord')">
											<font-awesome-icon size="s" pull="left" :icon="['fab', 'discord']"/> Login
										</button>

									</div>
								</slide>
								</no-ssr>
						</div>
						<div class="level-item">
							<nuxt-link to="/">
									<br><img id="foxlogo" align="center" width="85" height="85" :src="require('../assets/FoxLogov2.png')">
								</nuxt-link>
						</div>
					</nav>
					<br class="is-hidden-touch"><br class="is-hidden-touch"><br class="is-hidden-touch"><br class="is-hidden-touch">
					<div class="navbar-brand is-hidden-touch">
						<nuxt-link class="navbar-item" to="/">
							<img id="foxlogo" :src="require('../assets/FoxLogov2.png')">
							<h1 class="title">Fox</h1>&nbsp;
						</nuxt-link>
					</div>
					<div class="navbar-menu" id="navMenu">
						<div class="navbar-start">
							<nuxt-link class="navbar-item has-text-weight-bold is-large" to="/about">
								<h1 class="subtitle">About</h1>
							</nuxt-link>
							<div class="navbar-item has-dropdown is-hoverable has-text-weight-semi-bold">
								<a class="navbar-link">
									<h1 class="subtitle">Documentation</h1>
								</a>
								<div class="navbar-dropdown is-boxed">
									<router-link class="navbar-item" to="/getstarted">
										<p class='has-text-black'>Getting Started</p>
									</router-link>
									<nuxt-link class="navbar-item" to="/commands">
										<p class='has-text-black'>Commands</p>
									</nuxt-link>
									<nuxt-link class="navbar-item" to="/permissions">
										<p class='has-text-black'>Permissions</p>
									</nuxt-link>
								</div>
							</div>
							<a class="navbar-item has-text-weight-semi-bold" href="https://discord.gg/3R4Em2w">
								<h2 class="subtitle">Support</h2>
							</a>
						</div>
						<div class="navbar-end">
							<div class="navbar-item">
								<b-dropdown :hoverable="true" :mobile-modal="false" v-if="$auth.loggedIn">
									<button class="button is-medium is-black is-rounded" slot="trigger">
										<figure class="image is-24x24">
											<img :src="getAvatar" class="is-rounded">
										</figure>
										&nbsp;&nbsp;<p class="has-text-weight-bold">{{ $auth.user.username }}</p>
										&nbsp;<font-awesome-icon size="1x" pull="right" icon="angle-down" />
									</button>
									<b-dropdown-item has-link position="is-top-left">
										<nuxt-link class="has-text-black" to="/servers">Servers</nuxt-link>
									</b-dropdown-item>
									<b-dropdown-item @click="$auth.logout()">Log Out</b-dropdown-item>
								</b-dropdown>
								<button v-if="!$auth.loggedIn" class="button is-rounded is-black is-inverted is-outlined" @click="$auth.loginWith('discord')">
									<font-awesome-icon size="s" pull="left" :icon="['fab', 'discord']"/> Login
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
			if (auth.user.avatar) return `https://cdn.discordapp.com/avatars/${auth.user.id}/${auth.user.avatar}.${auth.user.avatar.startsWith("a_") ? "gif" : "png"}?size=2048`;
			else return `https://discordapp.com/assets/dd4dbc0016779df1378e7812eabaa04d.png`;

		}
	}
	/*methods: {
		getAvatar() {
			const auth = this.$auth;
			if (auth.user.avatar) return `https://cdn.discordapp.com/avatars/${auth.user.id}/${auth.user.avatar}.${auth.user.avatar.startsWith("a_") ? "gif" : "png"}?size=2048`;
			else return `https://discordapp.com/assets/dd4dbc0016779df1378e7812eabaa04d.png`
		}
	}*/
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
