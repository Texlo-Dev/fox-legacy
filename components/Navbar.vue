<template>
    <section class="hero is-black">
		<div class="hero-footer">
			<nav class="navbar is-transparent is-black">
				<div class="container">
					<nav class="level is-hidden-desktop is-mobile">
						<div class="level-left">
							<div class="level-item">
								<no-ssr>
									<slide class="is-hidden-desktop" noOverlay width="250">
									<nuxt-link to="/">
										<span>
											<h1 class="title">Fox</h1>
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
								</slide>
								</no-ssr>
							</div>
						</div>
						<div class="level-right">
							<div class="level-item">
								<br>
								<br>
								<br>
								<br>
								<a v-if="!$auth.loggedIn" class="button is-grey" @click="tokifyUser()">
									Log In
								</a>
								<b-dropdown :mobile-modal="false" v-if="$auth.loggedIn">
									<button class="button is-grey" slot="trigger">
										<figure class="image is-24x24">
											<img :src="getAvatar()" class="is-rounded">
										</figure>
										<span>&nbsp;&nbsp;{{ $auth.user.username }}</span>
										<font-awesome-icon size="1x" pull="right" icon="angle-down" />
									</button>
									<b-dropdown-item has-link position="is-top-left">
										<nuxt-link class="has-text-black" to="/servers">Servers</nuxt-link>
									</b-dropdown-item>
									<b-dropdown-item @click="$auth.logout()">Log Out</b-dropdown-item>
								</b-dropdown>
							</div>
						</div>
					</nav>
					<br class="is-hidden-touch"><br class="is-hidden-touch"><br class="is-hidden-touch"><br class="is-hidden-touch">
					<div class="navbar-brand is-hidden-touch">
						<nuxt-link class="navbar-item" to="/">
							<img id="foxlogo" :src="require('../assets/FoxLogov2.png')">
							<h1 class="subtitle">Fox</h1>
						</nuxt-link>
					</div>
					<div class="navbar-menu" id="navMenu">
						<div class="navbar-start">
							<nuxt-link class="navbar-item has-text-weight-semi-bold is-large" to="/about">
								<h1 class="subtitle">About</h1>
							</nuxt-link>
							<div class="navbar-item has-dropdown is-hoverable has-text-weight-semi-bold">
								<a class="navbar-link">
									<h1 class="subtitle">Documentation</h1>
								</a>
								<div class="navbar-dropdown is-boxed">
									<nuxt-link class="navbar-item" to="/getstarted">
										<p class='has-text-black'>Getting Started</p>
									</nuxt-link>
									<nuxt-link class="navbar-item" to="/commands">
										<p class='has-text-black'>Commands</p>
									</nuxt-link>
									<nuxt-link class="navbar-item" to="/permissions">
										<p class='has-text-black'>Permissions</p>
									</nuxt-link>
								</div>
							</div>
							<a class="navbar-item has-text-weight-semi-bold" href="https://discord.gg/3R4Em2w">
								<h1 class="subtitle">Support</h1>
							</a>
						</div>
						<div class="navbar-end">
							<div class="navbar-item">
								<b-dropdown :hoverable="true" :mobile-modal="false" v-if="$auth.loggedIn">
									<button class="button is-grey" slot="trigger">
										<figure class="image is-24x24">
											<img :src="getAvatar()" class="is-rounded">
										</figure>
										<span>&nbsp;&nbsp;{{ $auth.user.username }}</span>
										&nbsp;<font-awesome-icon size="1x" pull="right" icon="angle-down" />
									</button>
									<b-dropdown-item has-link position="is-top-left">
										<nuxt-link class="has-text-black" to="/servers">Servers</nuxt-link>
									</b-dropdown-item>
									<b-dropdown-item @click="$auth.logout()">Log Out</b-dropdown-item>
								</b-dropdown>
								<button v-if="!$auth.loggedIn" class="button is-grey" @click="tokifyUser()">
									Log In
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
	methods: {
		tokifyUser() {
			this.$auth.loginWith('discord');
		},
		getAvatar() {
			const auth = this.$auth;
			if (auth.user.avatar) return `https://cdn.discordapp.com/avatars/${auth.user.id}/${auth.user.avatar}.${auth.user.avatar.startsWith("a_") ? "gif" : "png"}?size=2048`;
			else return `https://discordapp.com/assets/dd4dbc0016779df1378e7812eabaa04d.png`
		}
	}
}
</script>
