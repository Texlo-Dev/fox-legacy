<template>
	<div>
		
		<section class="section">
			<div class="container">
				<h1 class="title has-text-white">
					Commands
				</h1>
				<br>
				<p class="has-text-centered">
					indicates required arguments.
				</p>
				<p class="has-text-centered">
					[] indicates optional arguments.
				</p>
				<p class="has-text-centered">
					| separates multiple possible arguments.
				</p>
			</div>
		</section>

		<section class="section">

			<div class="container">
				<h1 v-for="(cmd, category) in commands" class="subtitle has-text-white">
					{{ category }}
					<br><br>
					<div class="columns is-multiline ">
						<div v-for="cmd of commands[category]" class="column is-one-third">
							<div class="box">
								<div class="content">
									<h4 class="subtitle has-text-grey">
										{{ cmd.name }}
									</h4>
									<p class="has-text-left">{{ cmd.description }}</p>
									<p class="has-text-left">Usage: <strong class="has-text-white has-text-left">{{ `${cmd.name} ${cmd.usage ? cmd.usage : ''}` }}</strong></p>
									<p class="has-text-left">Required Permission(s): {{ cmd.reqPermString != false ? cmd.reqPermString.join(', ') : 'None' }}</p>
								</div>
							</div>
						</div>
					</div>
				</h1>
			</div>

		</section>

	</div>

</template>

<script>
import API from "../API.js";
export default {
    auth: false,
    head() {
		return {
			title: 'Mr.Fox Bot - Commands',
			meta: [
				{ hid: 'description', name: 'description', content: `A full list of Mr.Fox Bot's commands, their usage, and required permissions.`}
			]
		}
	},
    name: "Commands",
    data() {
        return {
            commands: null
        };
    },
    async asyncData({ params, app }) {
        const { data: commands } = await app.$axios.get('/api/commands');
        return {
            commands
        }
    },
    /*methods: {
        async getCommands() {
            this.loading = true;
            this.$vs.loading({
                type: "sound",
                background: "#34383c",
                color: "#ee0a55",
                container: "#loader"
            });

            try {
                this.commands = await API.commands();
            } catch (error) {
                await this.$vs.loading.close("#loader > .con-vs-loading");
                this.$dialog.alert({
                    message: `Unable to edit this package: ${error}`,
                    type: "is-danger",
                    onConfirm: () => {
                        this.loading = false;
                        this.$router.push({ path: "/" });
                    }
                });
            } finally {
                this.loading = false;
                this.loaded = true;
            }
        }
    },
    async mounted() {
        const cmds = this.getCommands();
    }*/
};
</script>

<style>
.vs-label {
	font-size: large
}
</style>
