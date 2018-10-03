<template>
<section class="section">
			<div class="container">
				<nav class="level is-mobile">
					<div class="level-left">
						<h1 class="title has-text-white has-text-left">&nbsp;Music</h1>
					</div>
					<div class="level-left">
						<a class="button is-danger" @click="confirmPkg('Music')">Disable</a>
					</div>
				</nav>
				<div class="is-divider"></div>
			</div>
			<div class="container" style="position: relative">
				<h1 class="title has-text-white has-text-left">Commands</h1>
				<div v-for="command of commands" class="box">
					<div class="content">
						<h1 class="has-text-white has-text-left">
							{{ command.name }}
							<b-switch size='is-medium' :ref="`${command.name}-switch`" :disabled="isLoading" @input="toggleCommand(command.name, !command.enabled)" :value="command.enabled"
								type="is-success">
							</b-switch>
						</h1>

						<p>{{ command.description }}</p>
					</div>
				</div>

			</div>

		</section>
    
</template>

<script>
import API from "~/API.js";
import secret from '~/secrets.js';
import { mapGetters } from "vuex";
import axios from "axios";

export default {
    head() {
		return {
			title: 'Mr.Fox Bot - Music',	
		}
	},
    async fetch({ store, app, params: { guildid } }) {
		if (store.state.cachedGuild) return;
        const token = app.$auth.getToken('discord');
        const { data: guild } = await app.$axios.get(`/api/guilds/${guildid}`, { headers: { Authorization: secret.encrypt(app.$auth.user.id) } });
       
		store.commit('cacheGuild', guild);
		store.commit('toggleDash', true);
    },
    async asyncData({ app, route, params: { guildid } }) {
		const page = route.path.split(guildid + '/')[1].replace(/\w\S*/g, txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
		const { data: commands } = await app.$axios.get(`/api/commands/${page}?guildID=${guildid} `, { headers: { Authorization: secret.encrypt(app.$auth.user.id) } });
		const { data: config } =  await app.$axios.get(`/api/guilds/${guildid}/config`, { headers: { Authorization: secret.encrypt(app.$auth.user.id) } });
		/* nconst { data: channels } =  await app.$axios.get(`/api/guilds/${guildid}/channels`, { headers: { Authorization: secret.encrypt(app.$auth.user.id) } });
		const { data: roles } =  await app.$axios.get(`/api/guilds/${guildid}/roles`, { headers: { Authorization: secret.encrypt(app.$auth.user.id) } });
		roles.forEach(r => r.color = `#${r.color.toString(16).padStart(6, "0")}`);*/
        return {
            commands,
            config,
        }

    },
    data() {
        return {
            commands: null,
            config: null,
        };
    },
    methods: {
        async settingUpdate(key, value, options) {
            try {
                this.config = await API.settingUpdate(key, value, this.$route.params.guildid, this.$auth.user.id, options);
                this.$toast.open({
                    message: `Toggled ${key} to ${typeof value === "boolean" ? value ? "On" : "Off" : value}`,
                    type: "is-success",
                    duration: 3800
                });
            } catch (error) {
                this.$toast.open({
                    message: `Unable to edit this setting: ${error}`,
                    type: "is-danger"
                });
                this.$refs[`${key}-switch`][0].newValue = !value;
            } 
        },
        async settingArrayUpdate(obj) {
            try {
                for (const key of Object.keys(obj)) {
                    const settingUpd = await API.settingArrayUpdate(key, obj[key], this.$route.params.guildid, this.$auth.user.id, { array: true });
                    this.config[key] = obj[key];
                }
                this.$toast.open({
                    message: `Successfully saved settings.`,
                    type: "is-success"
                });
                this.config = await API.guildConfig(this.$route.params.guildid, this.$auth.user.id);
                this.bwModalActive = false;
                this.massModalActive = false;
            } catch (error) {
                this.$toast.open({
                    message: `Unable to edit these settings: ${error}`,
                    type: "is-danger",
                    duration: 4000
                });
            }
        },
        async toggleCommand(data, bool) {
            if (!data) return;

            try {
                await API.toggleCommand(data, this.$route.params.guildid, bool, this.$auth.user.id);
                this.commands = await API.pkgCommands("Music", this.$route.params.guildid, this.$auth.user.id);
            } catch (error) {
                this.$toast.open({
                    message: `Unable to edit this command: API_ERROR`,
                    type: "is-danger"
                });
                this.$refs[`${data}-switch`][0].newValue = !bool;
            } 
        },
        confirmPkg(pkg) {
            this.$dialog.confirm({
                title: "Disable Package",
                message: `Are you sure that you want to disable the package ${pkg}?`,
                cancelText: "Cancel",
                confirmText: "Disable",
                type: "is-danger",
                onConfirm: () => this.togglePackage(pkg, false)
            });
        },
        togglePackage(pkg, option) {
            this.$axios.patch(`/api/guilds/${this.$route.params.guildid}/packages`, {
                pkg,
                guildID: this.$route.params.guildid,
                enabled: option
            },
            { headers: { Authorization: secret.encrypt(this.$auth.user.id) } }).then(() => {
                this.$router.push({ path: `/servers/${this.$route.params.guildid}` });
            }).catch(error => {
                this.$dialog.alert({
                    title: "Error",
                    message: `There was an error disabling this package.\n"${error.message}"`,
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
