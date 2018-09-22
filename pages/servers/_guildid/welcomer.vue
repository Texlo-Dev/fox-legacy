<template>
    <section class="section">
			<div class="container">
				<nav class="level is-mobile">
					<div class="level-left">
						<h1 class="title has-text-white has-text-left">&nbsp;Welcomer</h1>
					</div>
					<div class="level-left">
						<a class="button is-danger" @click="confirmPkg('Welcomer')">Disable</a>
					</div>
				</nav>
				<div class="is-divider"></div>
			</div>
			<div v-if="!loading && config" class="container">
				<h1 class="title has-text-white has-text-left">Package Settings</h1>
				<div class="columns">
					<div class="column is-half">
						<div class="box">
							<div class="content">
								<h3 class="has-text-white has-text-left">
									Welcome Message
									<span v-if="config.welcomeEnabled">
										<b-switch size='is-small' ref="welcomeEnabled-switch" :disabled="isLoading" @click.native="settingUpdate('welcomeEnabled', false)" value="true"
											type="is-success">
										</b-switch>
									</span>
									<span v-else>
										<b-switch size='is-small' ref="welcomeEnabled-switch" :disabled="isLoading" @click.native="settingUpdate('welcomeEnabled', true)" value="false"
											type="is-success">
										</b-switch>
									</span>
								</h3>
								<section v-if="config.welcomeEnabled">
									<b-field>
										<b-input type="textarea" v-model="config.welcomeMsg" maxlength="1980"></b-input>
									</b-field>
									<p><code class="inlinecode has-text-grey has-background-black">{user}</code>= user name. <code class="has-background-black has-text-grey inlinecode">{server}</code>= server name. <code class="has-background-black has-text-grey inlinecode">{position}</code>= server join position.</p>
									<button @click="settingUpdate('welcomeMsg', config.welcomeMsg, { bool: false })" class="button is-success">Save</button>
								</section>
								<section v-else>
									<p>Send a friendly message to a member when they join your server.</p>
								</section>

							</div>
						</div>
						<div class="box">
							<div class="content">
								<h3 class="has-text-white has-text-left">
									Goodbye Message
									<span v-if="config.goodbyeEnabled">
										<b-switch size='is-small' ref="goodbyeEnabled-switch" :disabled="isLoading" @click.native="settingUpdate('goodbyeEnabled', false)" value="true"
											type="is-success">
										</b-switch>
									</span>
									<span v-else>
										<b-switch size='is-small' ref="goodbyeEnabled-switch" :disabled="isLoading" @click.native="settingUpdate('goodbyeEnabled', true)" value="false"
											type="is-success">
										</b-switch>
									</span>
								</h3>
								<section v-if="config.goodbyeEnabled">
									<b-field>
										<b-input type="textarea" v-model="config.goodbyeMsg" maxlength="1980"></b-input>
									</b-field>
									<p><code class="inlinecode has-text-grey has-background-black">{user}</code>= user name. </p>
									<button @click="settingUpdate('goodbyeMsg', config.goodbyeMsg, { bool: false })" class="button is-success">Save</button>
								</section>
								<section v-else>
									<p>Notify with a message when a user has left the server.</p>
								</section>

							</div>
						</div>
					</div>
					<div class="column is-half">
						<div class="box">
							<div class="content">
								<h3 class="has-text-white has-text-left">
									Welcome Message Location
								</h3>
								<section>
									<b-dropdown>
										<button class="button is-grey" slot="trigger">
											<template v-if="config.welcomeLocation">
												<span>{{ config.welcomeLocation.name ? config.welcomeLocation.name : config.welcomeLocation }}</span>
											</template>
											<template v-else>
												<span>None</span>
											</template>
											<font-awesome-icon pull="right" icon="angle-down" />
										</button>
										<b-dropdown-item @click="dropdownSave('welcomeLocation', 'Welcome Channel', 'DM')">DM</b-dropdown-item>
										<b-dropdown-item  v-for="channel of channels" :value="channel.name" @click="dropdownSave('welcomeLocation', 'Welcome Channel', channel)" :key="channel.name">{{ channel.name }}</b-dropdown-item>
									</b-dropdown>
								</section>
								<br>
								<p>Note: DM may not always work as a user can choose to disable their DMs.</p>
							</div>
						</div>
						<div class="box">
							<div class="content">
								<h3 class="has-text-white has-text-left">
									Goodbye Message Location
								</h3>
								<section>
									<b-dropdown>
										<button class="button is-grey" slot="trigger">
											<template v-if="config.goodbyeChannel">
												<span>#{{ config.goodbyeChannel.name }}</span>
											</template>
											<template v-else>
												<span>None</span>
											</template>
											<font-awesome-icon pull="right" icon="angle-down" />
										</button>
										<b-dropdown-item  v-for="channel of channels" :value="channel.name" @click="dropdownSave('goodbyeChannel', 'Goodbye Channel', channel)" :key="channel.name">{{ channel.name }}</b-dropdown-item>
									</b-dropdown>
								</section>
								<br>
							</div>
						</div>

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
			title: 'Mr.Fox Bot - Welcomer',	
		}
	},
    async fetch({ store, app, params: { guildid } }) {
		if (store.state.cachedGuild) return;
        const token = app.$auth.getToken('discord');
		const { data: guild } = app.$axios.get(`/api/guilds/${guildid}`, { headers: { Authorization: secret.encrypt(app.$auth.user.id) } });
       
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
            isLoading: false,
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
                    if (key === "welcomeLocation") this.config.welcomeLocation = typeof key === String ? item : this.channels.find(c => c.name === item.name).name;
                });
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
            this.isLoading = true;
            if (!data) return;

            try {
                await API.toggleCommand(data, this.$route.params.guildid, bool, this.$auth.user.id);
                this.commands = await API.pkgCommands("Welcomer", this.$route.params.guildid, this.$auth.user.id);
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
        }
    }
}
</script>
