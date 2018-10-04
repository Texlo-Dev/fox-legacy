<template>
	<body>
		<section class="section">
			<div class="container">
				<h1 class="has-text-white title">
					About Mr.Fox
				</h1>
			</div>
		</section>

		<section class="section">
			<div class="container">
				<div align="center">
					<figure class="image is-128x128">
						<img class="fox-logo" src="https://cdn.discordapp.com/avatars/288855795951599617/f46b526cee3e472674ad285953f79b42.png">
					</figure>
					<br>
					<p align="center" class="has-text-white title">iTexlo</p>
					<p align="center" class="has-text-white subtitle">Developer/Founder</p>
				</div>
				<br>
				<p>Mr.Fox originated as a bot named Encipio in April 2017, and it was renamed to Mr.Fox the following month. I created the bot privately for my own server as I needed a moderation bot to combat spammers that were disrupting the server. I enjoyed coding the bot so much, I decided to make the bot publicly available. Since then, Mr.Fox has been a big success, gaining lots of popularity, and the feedback I have recieved was very helpful. I hope to continue development of Mr.Fox as long as I am able, and I hope you all enjoy Fox!</p>
			</div>
		</section>

		<section class="section hero">
			<div class="hero-body">
				<div class="container">
					<h1 class="has-text-centered has-text-white title">Meet the Developers</h1>
					<div class="columns">
						<div class="column is-one-third">
							<div class="box">
								<article class="media">
									<div class="media-left">
										<figure class="image is-64x64">
											<img class="is-rounded" src="https://cdn.discordapp.com/avatars/272689325521502208/a_fc6b0e9992f1f2148f82ab9cd4f028ac.png" alt="Image">
										</figure>
									</div>
									<div class="media-content">
										<div class="content">
											<p>
												<br><strong class="has-text-white">Jacz</strong>, <small>Command and Website Development</small>
											</p>
										</div>
									</div>
								</article>
							</div>
						</div>
						<div class="column is-one-third">
							<div class="box">
								<article class="media">
									<div class="media-left">
										<figure class="image is-64x64">
											<img class="is-rounded" src="https://cdn.discordapp.com/avatars/131857875973701633/10fed51dcf9db57630cb56dcd4be7486.png" alt="Image">
										</figure>
									</div>
									<div class="media-content">
										<div class="content">
											<p>
												<br><strong class="has-text-white">Phaze</strong>, <small>Command Development</small>
											</p>
										</div>
									</div>
								</article>
							</div>
						</div>
						<div class="column is-one-third">
							<div class="box">
								<article class="media">
									<div class="media-left">
										<figure class="image is-64x64">
											<img class="is-rounded" src="https://jaczaus.me/i/jkhdew2bb11e3cb.png" alt="Image">
										</figure>
									</div>
									<div class="media-content">
										<div class="content">
											<p>
												<br><strong class="has-text-white">SciencyScience</strong>, <small>Command Development</small>
											</p>
										</div>
									</div>
								</article>
							</div>
						</div>
					</div>
				</div>

			</div>

		</section>

		<section class="section hero is-small is-black">
			<div class="hero-body"></div>
			<div class="container">
				<h1 class="title">
					So what are you waiting for? Try Mr.Fox in your server today.
				</h1>
				<div align="center">
					<nuxt-link class="button is-link" to="/servers">Get Started</nuxt-link>
				</div>
			</div>

		</section>

	</body>
</template>

<script>
export default {
	auth: false,
	asyncData({ app }) {
		app.$axios.onRequest(console.log);
		if (process.server) return console.log(`Discord User is:\n ${app.$auth.user}`);
	},
	head() {
		return {
			bodyAttrs: { class: 'has-navbar-fixed-top'},
			title: 'Mr.Fox Bot - About',
			meta: [
				{ hid: 'description', name: 'description', content: 'Meet the people behind Mr.Fox Bot, and learn more about Fox.' }
			]
		}
	}
}
</script>
