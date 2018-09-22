<template>
<section class="section">
			<div class="container">
				<nav class="level is-mobile">
					<div class="level-left">
						<h1 class="title has-text-white has-text-left">&nbsp;Moderation</h1>
					</div>
					<div class="level-left">
						<a class="button is-danger" @click="confirmPkg('Moderation')">Disable</a>
					</div>
				</nav>
				<div class="is-divider"></div>
			</div>
			<div class="container" v-if="!loading && config">
				<h1 class="title has-text-white has-text-left">Package Settings</h1>
				<div class="columns is-multiline">
					<div class="column is-half">
						<div class="box">
							<div class="content">
								<h3 class="has-text-white has-text-left">
									Moderation Logging
									<span v-if="config.modLogging">
										<b-switch size='is-small' ref="modLogging-switch" :disabled="isLoading" @click.native="settingUpdate('modLogging', false)" value="true"
											type="is-success">
										</b-switch>
										<section>
											<br>
											<b-dropdown>
												<button class="button is-grey" slot="trigger">
													<template v-if="config.modlogChannel">
														<span>{{ config.modlogChannel.name }}</span>
													</template>
													<template v-else>
														<span>None</span>
													</template>
													<font-awesome-icon size="1x" pull="right" icon="angle-down" />
												</button>
												<b-dropdown-item  v-for="channel of channels" :value="channel.name" @click="dropdownSave('modlogChannel', 'Mod-log', channel)" :key="channel.name">{{ channel.name }}</b-dropdown-item>
											</b-dropdown>
										</section>
									</span>

									<span v-else>
										<b-switch size='is-small' ref="modLogging-switch" :disabled="isLoading" @click.native="settingUpdate('modLogging', true)" value="false"
											type="is-success">
										</b-switch>
									</span>
								</h3>
								<p>Log all moderation actions to a designated server channel.</p>
							</div>
						</div>
					</div>
					<div class="column is-half">
						<div class="box">
							<div class="content">
								<h3 class="has-text-white has-text-left">
									Muted Role
									<br><br>
									<section>
										<b-dropdown>
											<button class="button is-grey" slot="trigger">
												<template v-if="config.muteRole">
													<span>{{ config.muteRole.name }}</span>
												</template>
												<template v-else>
													<span>None</span>
												</template>
												<font-awesome-icon size="1x" pull="right" icon="angle-down" />
											</button>
											<b-dropdown-item  v-for="role of roles" :value="role.name" @click="dropdownSave('muteRole', 'Muted Role', role)" :key="role.name">{{ role.name }}</b-dropdown-item>
										</b-dropdown>
									</section>

								</h3>
								<p>Note: Mr.Fox will attempt to update the chat permissions for the specified role.</p>
							</div>
						</div>
					</div>
					<div class="column is-half">
						<div class="box">
							<div class="content">
								<h3 class="has-text-white has-text-left">
									Server Event Logging
									<span v-if="config.serverLogging">
										<b-switch size='is-small' ref="serverLogging-switch" :disabled="isLoading" @click.native="settingUpdate('serverLogging', false)" value="true"
											type="is-success">
										</b-switch>
										<section>
											<br>
											<b-dropdown>
												<button class="button is-grey" slot="trigger">
													<template v-if="config.serverlogChannel">
														{{ config.serverlogChannel.name }}

													</template>
													<template v-else>
														<span>None</span>
													</template>
													<font-awesome-icon size="1x" pull="right" icon="angle-down" />
												</button>
												<b-dropdown-item  v-for="channel of channels" :value="channel.name" @click="dropdownSave('serverlogChannel', 'Server-Log', channel)" :key="channel.name">{{ channel.name }}</b-dropdown-item>
											</b-dropdown>
										</section>
										<section>
											<br>
											<p class="subtitle has-text-white">Ignored Channels</p>
											<b-field custom-class="has-text-white">
												<b-taginput
													v-model="config.logExcluded"
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
												<button @click="settingArrayUpdate({ logExcluded: config.logExcluded })" class="button is-success">Save</button>
											</b-field>
										</section>
									</span>
									<span v-else>
										<b-switch size='is-small' ref="serverLogging-switch" :disabled="isLoading" @click.native="settingUpdate('serverLogging', true)" value="false"
											type="is-success">
										</b-switch>
									</span>
								</h3>
								<p>Log important server events to a designated server channel.</p>
							</div>
						</div>
						<div class="box">
							<div class="content">
								<h3 class="has-text-white has-text-left">
									Settings
								</h3>
								<div class="field">
									<b-checkbox @click.native="settingUpdate('delModCmds', !config.delModCmds)" type="is-grey" v-model="config.delModCmds">
										<p>Delete Mod command after execution</p>
									</b-checkbox>
								</div>
								<div class="field">
									<b-checkbox @click.native="settingUpdate('msgAfterMod', !config.msgAfterMod)" type="is-grey" v-model="config.msgAfterMod">
										<p>Message target after kick/ban/warn</p>
									</b-checkbox>
								</div>

							</div>
						</div>
					</div>
					<div class="column is-half">
						<div class="box">
							<div class="content">
								<h3 class="has-text-white has-text-left">
									Warning Points
								</h3>
								<p class="subtitle has-text-white">Automatic kick threshold</p>
								<b-field>
									<b-input v-model="config.kickPoints" type="number" min=10 max=100000></b-input>
									<button @click="settingUpdate('kickPoints', config.kickPoints)" class="button is-success">Update</button>
								</b-field>
								<br>
								<p class='subtitle has-text-white'>Automatic ban threshold</p>
								<b-field>
									<b-input v-model="config.banPoints" type="number" min=10 max=100000></b-input>
									<button @click="settingUpdate('banPoints', config.banPoints)" class="button is-success">Update</button>
								</b-field>
							</div>
						</div>
					</div>
				</div>

				<div class="is-divider"></div>
			</div>
			<div v-if="!loading" class="container" style="position: relative">
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
			title: 'Mr.Fox Bot - Moderation',	
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
		const { data: channels } =  await app.$axios.get(`/api/guilds/${guildid}/channels`, { headers: { Authorization: secret.encrypt(app.$auth.user.id) } });
		const { data: roles } =  await app.$axios.get(`/api/guilds/${guildid}/roles`, { headers: { Authorization: secret.encrypt(app.$auth.user.id) } });
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
            commands: null,
            config: null,
            channels: null,
            roles: null,
            filteredChannels: this.channels,
            filteredRoles: this.roles,
            bwModalActive: false,
            massModalActive: false,
            originalState: true

        };
    },
    methods: {
        dropdownSave(key, meta, item) {
            return this.settingUpdate(key, item, { meta })
                .then(() => {
                    if (key === "modlogChannel") this.config.modlogChannel = this.channels.find(c => c.name === item.name);
                    if (key === "muteRole") this.config.muteRole = this.roles.find(c => c.name === item.name);
                    if (key === "serverlogChannel") this.config.serverlogChannel = this.channels.find(c => c.name === item.name);
                });
        },
        getChannelNames(channel) {
            this.filteredChannels = this.channels.filter(option => `${option.name.toLowerCase()}`.indexOf(channel.toLowerCase()) >= 0);
        },
        getRoleNames(channel) {
            this.filteredRoles = this.roles.filter(option => `${option.name.toLowerCase()}`.indexOf(channel.toLowerCase()) >= 0);
        },
        async settingUpdate(key, value, options) {
            try {
                await API.settingUpdate(key, value, this.$route.params.guildid, this.$auth.user.id, options);
                this.config = await API.guildConfig(this.$route.params.guildid, this.$auth.user.id);
                this.$toast.open({
                    message: value instanceof Object ? `Saved ${options.meta} as ${value.name}` : `Toggled ${key} to ${typeof value === "boolean" ? value ? "On" : "Off" : value}`,
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
                this.commands = await API.pkgCommands("Moderation", this.$route.params.guildid, this.$auth.user.id);
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
            } 
        }
    }
}
</script>
