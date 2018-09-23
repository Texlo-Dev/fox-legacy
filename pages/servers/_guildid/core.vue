<template>
    <section class="section">
			<div class="container">
				<nav class="level is-mobile">
					<div class="level-left">
						<h1 class="title has-text-white has-text-left">&nbsp;Core</h1>
					</div>
				</nav>
				<div class="is-divider"></div>
			</div>
			<div class="container" style ="position:relative">
				<h1 class="title has-text-white has-text-left">Package Settings</h1>
				<div class="columns is-multiline">
					<div class="column is-narrow">
						<div class="box">
							<div class="content">
								<h3 class="has-text-white has-text-left">
									Prefix
									<br><br>
									<b-field>
										<b-input v-model="config.prefix" maxlength=10>
										</b-input>
										<p class="control">
											<button @click="setPrefix(config.prefix)" class="button is-success">Save</button>
										</p>
									</b-field>
								</h3>
								<p>What all commands are prefixed (begin) with.</p>
							</div>
						</div>
					</div>
					<div class="column is-half">
						<div class="box">
							<div class="content">
								<h3 class="has-text-white has-text-left">
									Automatic Roles
									<br><br>
									<b-field custom-class="has-text-white">
										<b-taginput
											v-model="config.autoRoles"
											ellipsis
											rounded
											autocomplete
											:allow-new="false"
											:data="filteredRoles"
											@typing="getRoleNames"
											type="is-grey"
											field="name"
											placeholder="Add a Role"
											custom-class="has-text-white">
										</b-taginput>
										<p class="control">
											<button class="button is-success" @click="settingArrayUpdate({ autoRoles: config.autoRoles })">Save</button>
										</p>
									</b-field>
								</h3>
								<p>Role(s) that will be given to all members upon joining your server.</p>
							</div>
						</div>
					</div>
				</div>
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
			title: 'Mr.Fox Bot - Core',	
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
        setPrefix(val) {
            return this.settingUpdate("prefix", val, { bool: false });
        },
        async settingUpdate(key, value, options) {
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
                this.commands = await API.pkgCommands("Core", this.$route.params.guildid, this.$auth.user.id);
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
