<template>
    <section class="section">
        <div class="container">
				<nav class="level is-mobile">
					<div class="level-left">
						<h1 class="title has-text-white has-text-left">&nbsp;Economy</h1>
					</div>
					<div class="level-left">
						<a class="button is-danger" @click="confirmPkg('Economy')"><p class="has-text-weight-bold">Disable</p></a>
					</div>
				</nav>
				<div class="is-divider"></div>
			</div>
			<div v-if="!loading" class="container" style="position: relative">
				<h1 class="title has-text-white has-text-left">Commands</h1>
				<div v-for="command of commands" class="box">
					<div class="content">
						<h1 class="has-text-white has-text-left">
							{{ command.name }}
							<b-switch size='is-medium' :ref="`${command.name}-switch`" :disabled="isLoading" @input="toggleCommand(command.name, !command.enabled)" :value="command.enabled"
								type="is-primary">
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
			title: 'Mr.Fox Bot - Economy',	
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
        const [commands, config, channels, roles] = await Promise.all([
			(await app.$axios.get(`/api/commands/${page}?guildID=${guildid} `, { headers: { Authorization: secret.encrypt(app.$auth.user.id) } })).data,
            (await app.$axios.get(`/api/guilds/${guildid}/config`, { headers: { Authorization: secret.encrypt(app.$auth.user.id) } })).data,
            (await app.$axios.get(`/api/guilds/${guildid}/channels`, { headers: { Authorization: secret.encrypt(app.$auth.user.id)} })).data,
            (await app.$axios.get(`/api/guilds/${guildid}/roles`, { headers: { Authorization: secret.encrypt(app.$auth.user.id) } })).data
		]);
        return {
            commands,
            config,
            channels,
            roles
        }
    },
    data() {
        return {
            commands: null,
            config: null,
            channels: null,
            roles: null,
            filteredRoles: this.roles,
            bwModalActive: false,
            massModalActive: false,
            originalState: true

        };
    },
    methods: {
        getRoleNames(channel) {
            this.filteredRoles = this.roles.filter(option => `${option.name.toLowerCase()}`.indexOf(channel.toLowerCase()) >= 0);
        },
        async settingUpdate(key, value, options = {}) {
            try {
                this.config = await API.settingUpdate(key, value, this.$route.params.guildid, this.$auth.user.id, options);
                this.$snackbar.open({
                    message: value instanceof Object ? `Saved ${options.meta} as ${value.name}` : `Toggled ${key} to ${typeof value === "boolean" ? value ? "On" : "Off" : value}`,
                    type: "is-primary",
                    position: 'is-bottom-left',
                    actionText: null,
                    duration: 3500
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
                    const settingUpd = await API.setingArrayUpdate(key, obj[key], this.$route.params.guildid, this.$auth.user.id, { array: true });
                }
                this.$snackbar.open({
                    message: `Successfully saved settings.`,
                    type: "is-primary",
                    position: 'is-bottom-left',
                    actionText: null,
                    duration: 3500
                });
                this.config = await API.guildConfig(this.$route.params.guildid, this.$auth.user.id);
                this.modalActive = false;
            } catch (error) {
                this.$snackbar.open({
                    message: `Unable to edit these settings: ${error.message}`,
                    type: "is-danger"
                });
            }
        },
        async toggleCommand(data, bool) {
            if (!data) return;

            try {
                await API.toggleCommand(data, this.$route.params.guildid, bool, this.$auth.user.id);
                this.commands = await API.pkgCommands(this.$route.path.split(this.$route.params.guildid + '/')[1].replace(/\w\S*/g, txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()), this.$route.params.guildid, this.$auth.user.id);
                this.$snackbar.open({
                    message: `Togged ${data} to ${bool ? 'On' : 'Off'}`,
                    type: "is-primary",
                    position: 'is-bottom-left',
                    actionText: null,
                    duration: 3500
                });
            } catch (error) {
                this.$snackbar.open({
                    message: `Unable to edit this command: ${error.message}`,
                    type: "is-danger",
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
