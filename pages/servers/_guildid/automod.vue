<template>
    <section class="section">
        <div v-if="!loading" class="container">
				<nav class="level is-mobile">
					<div class="level-left">
						<h1 class="title has-text-white has-text-left">&nbsp;Automod</h1>
					</div>
					<div class="level-left">
						<a class="button is-danger" @click="confirmPkg('Automod')">Disable</a>
					</div>
				</nav>
				<div class="is-divider"></div>
			</div>
			<div class="container" v-if="!loading && config" style ="position:relative">
				<h1 class="title has-text-white has-text-left">Package Settings</h1>
				<div class="columns is-multiline">
					<div class="column is-half">
						<div class="box">
							<div class="content">
								<h3 class="has-text-white has-text-left">
									Spam Protection (BETA)
									<b-switch size='is-small' ref="spamProtected-switch" @input="settingUpdate('spamProtected', !config.spamProtected)" :disabled="isLoading" :value="config.spamProtected"
										type="is-success">
									</b-switch>
								</h3>
								<p>Helps protects against server members sending text at a very fast rate.</p>

							</div>
						</div>
					</div>
					<div class="column is-half">
						<div class="box">
							<div class="content">
								<h3 class="has-text-white has-text-left">
									Invite Protection
									<b-switch size='is-small' ref="invProtected-switch" @input="settingUpdate('invProtected', !config.invProtected)" :disabled="isLoading" :value="config.invProtected"
										type="is-success">
									</b-switch>
								</h3>
								<p>Prevents unauthorized users from sending Discord invites from other servers.</p>

							</div>
						</div>
					</div>
					<div class="column is-half">
						<div class="box">
							<div class="content">
								<h3 class="has-text-white has-text-left">
									Bad Words
									<span v-if="config.bwProtected">
										<b-switch size='is-small' ref="bwProtected-switch" :disabled="isLoading" @click.native="settingUpdate('bwProtected', false)" value="true"
											type="is-success">
										</b-switch>
										<button class="button is-rounded is-small is-grey" @click="bwModalActive = true">
											Settings
										</button>
									</span>
									<span v-else>
										<b-switch size='is-small' ref="bwProtected-switch" :disabled="isLoading" @click.native="settingUpdate('bwProtected', true)" value="false"
											type="is-success">
										</b-switch>
									</span>
								</h3>
								<p>Blacklist specific words and phrases in your server channels.</p>

							</div>
						</div>
					</div>
					<div class="column is-half">
						<div class="box">
							<div class="content">
								<h3 class="has-text-white has-text-left">
									Mass Mentioning
									<span v-if="config.massProtected">
										<b-switch size='is-small' ref="massProtected-switch" :disabled="isLoading" @click.native="settingUpdate('massProtected', false)" value="true"
											type="is-success">
										</b-switch>
										<button class="button is-rounded is-small is-grey" @click="massModalActive = true">
											Settings
										</button>
									</span>
									<span v-else>
										<b-switch size='is-small' ref="massProtected-switch" :disabled="isLoading" @click.native="settingUpdate('massProtected', true)" value="false"
											type="is-success">
										</b-switch>
									</span>
								</h3>
								<p>Mitigates excessive mentioning made by users.</p>
							</div>
						</div>
					</div>


				</div>
				<div class="is-divider"></div>
			</div>
			<div class="container" v-if="!loading" style="position: relative">
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
			<b-modal v-if="config && channels" :active.sync="bwModalActive" size="is-large" has-modal-card>
				<div class="modal-card" style="width: auto">
					<header class="modal-card-head">
						<p class="modal-card-title">Bad Words</p>
					</header>
					<section class="modal-card-body">
						<b-field custom-class="has-text-white" label="Word List">
							<b-taginput
								v-model="config.badWords"
								ellipsis
								attached
								:before-adding="(tag) => !config.badWords.includes(tag)"
								type="is-grey"
								placeholder="Add a Word"
								custom-class="has-text-white">
							</b-taginput>
						</b-field>
						<b-field custom-class="has-text-white" label="Exempted Channels">
							<b-taginput
								v-model="config.allowedBwChannels"
								ellipsis
								attached
								:data="filteredChannels"
								field="name"
								autocomplete
								:allow-new="false"
								type="is-grey"
								placeholder="Add Channel"
								@typing="getChannelNames"
								custom-class="has-text-white">
								<template slot="empty">
									No Channels
								</template>
							</b-taginput>
						</b-field>
					</section>
					<footer class="modal-card-foot">
						<button class="button" type="button" @click="bwModalActive = false">Close</button>
						<button class="button is-success" type="button" @click="settingArrayUpdate({ badWords: config.badWords, allowedBwChannels: config.allowedBwChannels })">Save</button>
					</footer>
				</div>

			</b-modal>
			<b-modal v-if="config && channels" :active.sync="massModalActive" size="is-large" has-modal-card>
				<div class="modal-card" style="width: auto">
					<header class="modal-card-head">
						<p class="modal-card-title">Mass Mentioning</p>
					</header>
					<section class="modal-card-body">
						<b-field custom-class="has-text-white" label="Mention Threshold (per-message)">
							<b-input v-model="config.mentionLimit" type="number" min=10 max=100000></b-input>
						</b-field>
						<h3 class="has-text-white">If a user exceeds the above limit, they will automatically be given the server muted role.</h3>
						<br>
						<b-field custom-class="has-text-white" label="Exempted Channels">
							<b-taginput
								v-model="config.allowedMentionChannels"
								ellipsis
								attached
								:data="filteredChannels"
								field="name"
								autocomplete
								:allow-new="false"
								type="is-grey"
								placeholder="Add Channel"
								@typing="getChannelNames"
								custom-class="has-text-white">
								<template slot="empty">
									No Channels
								</template>
							</b-taginput>
						</b-field>
					</section>
					<footer class="modal-card-foot">
						<button class="button" type="button" @click="massModalActive = false">Close</button>
						<button class="button is-success" type="button" @click="settingArrayUpdate({ mentionLimit: parseFloat(config.mentionLimit), allowedMentionChannels: config.allowedMentionChannels })">Save</button>
					</footer>
				</div>

			</b-modal>

    </section>
</template>

<style>
.modal-card { overflow: visible; } .modal-card-body { overflow: visible; }
</style>


<script>
import API from "~/API.js";
import secret from '~/secrets.js';
import { mapGetters } from "vuex";
import axios from "axios";

export default {
	head() {
		return {
			title: 'Mr.Fox Bot - Automod',	
		}
	},
	async fetch({ store, app, params }) {
		if (store.state.cachedGuild) return;
        const token = app.$auth.getToken('discord');
        const { data: guilds } = await app.$app.$axios.get(`/api/userGuilds`, { headers: { Authorization: secret.encrypt(token.split('Bearer')[1].trim())} })
        const thisguild = guilds.filter(g => g.id === params.guildid)[0];
		store.commit('cacheGuild', thisguild);
		store.commit('toggleDash', true);
    },
    async asyncData({ app, route, params }) {
		const page = route.path.split(params.guildid + '/')[1].replace(/\w\S*/g, txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
		const { data: commands } = await app.$axios.get(`/api/commands/${page}?guildID=${params.guildid} `, { headers: { Authorization: secret.encrypt(app.$auth.user.id) } });
		const { data: config } =  await app.$axios.get(`/api/guildConfig/${params.guildid}`, { headers: { Authorization: secret.encrypt(app.$auth.user.id) } })
		const { data: channels } =  await app.$axios.get(`/api/channels`, { params: { guildID: params.guildid } });
		const { data: roles } =  await app.$axios.get(`/api/roles`, { params: { guildID: params.guildid } });
		roles.forEach(r => r.color = `#${r.color.toString(16).padStart(6, "0")}`);
        return {
            commands,
            config,
            channels, 
            roles
        }

    },
    data() {
        return {
            loading: false,
            commands: null,
            config: null,
            roles: null,
            channels: null,
            filteredChannels: this.channels,
            bwModalActive: false,
            massModalActive: false,
            originalState: true

        };
    },
    methods: {
        getChannelNames(channel) {
            this.filteredChannels = this.channels.filter(option => `${option.name}`.indexOf(channel.toLowerCase()) >= 0);
        },
        async settingUpdate(key, value, options) {
            this.isLoading = true;
            try {
                await API.settingUpdate(key, value, this.$route.params.guildid, this.$auth.user.id, options);
                this.config = await API.guildConfig(this.$route.params.guildid, this.$auth.user.id);
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
            } finally {
                this.isLoading = false;
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
            this.isLoading = true;
            if (!data) return;

            try {
                await API.toggleCommand(data, this.$route.params.guildid, bool, this.$auth.user.id);
                this.commands = await API.pkgCommands("Automod", this.$route.params.guildid, this.$auth.user.id);
                this.$toast.open({
                    message: `Toggled ${data} to ${bool ? "On" : "Off"}`,
                    type: "is-success"
                });
            } catch (error) {
                this.$toast.open({
                    message: `Unable to edit this command: API_ERROR`,
                    type: "is-danger"
                });
                this.$refs[`${data}-switch`][0].newValue = !bool;
                this.isLoading = false;
            } finally {
                this.isLoading = false;
            }
        },
        /*async getCommands() {
            this.loading = true;
            this.$vs.loading({
                type: "sound",
                background: "#34383c",
                color: "#ee0a55",
                container: "#loader"
            });
            try {
                this.commands = (await app.$axios.get(`/api/api/commands/Automod?guildID=${this.$route.params.guildid}`, { headers: { Authorization: app.$auth.user.id } })).data;
                this.config = await API.guildConfig(this.$route.params.guildid, app.$auth.user.id);
                this.channels = await API.channels(this.$route.params.guildid);
                this.roles = await API.roles(this.$route.params.guildid);
                this.roles.forEach(r => r.color = `#${r.color.toString(16).padStart(6, "0")}`);
            } catch (error) {
                await this.$vs.loading.close("#loader > .vs-con-loading__container");
                this.$dialog.alert({
                    message: `Unable to edit this package: ${error}`,
                    type: "is-danger",
                    onConfirm: () => {
                        this.loading = false;
                        this.$router.push({ name: "dashboard", params: this.$route.params.guildid });
                    }
                });
            } finally {
                this.$vs.loading.close("#loader > .con-vs-loading");
                this.loading = false;
                this.loaded = true;
            }
        },*/
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
        async togglePackage(pkg, option) {
            try {
                await API.pkgUpdate(pkg, this.$route.params.guildid, option, this.$auth.user.id);
                this.$router.push({ name: `dashboard`, params: { guildID: this.$route.params.guildid } });
                await this.$toast.open({
                    message: `Successfuly disabled the ${pkg} package.`,
                    type: "is-success",
                    duration: 4000
                });
                this.$router.push({ name: `dashboard`, params: { guildID: this.$route.params.guildid } });
            } catch (error) {
                this.$dialog.alert({
                    title: "Error",
                    message: `There was an error disabling this package.\n"${error.message}"`,
                    type: "is-danger",
                    hasIcon: true,
                    icon: "times-circle",
                    iconPack: "fa"
                });
            }
        }
    },
    /*mounted() {
        if (!this.isDash) this.$store.commit("toggleDash", true);
        this.getCommands();
        // return this.$store.commit("toggleLoading");
    }*/

};
</script>
