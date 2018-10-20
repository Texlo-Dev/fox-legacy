<template>
<section class="section">
			<div v-if="!loading" class="container">
				<nav class="level is-mobile">
					<div class="level-left">
						<h1 class="title has-text-white has-text-left">&nbsp;Leveling</h1>
					</div>
					<div class="level-left">
						<a class="button is-danger" @click="confirmPkg('Leveling')"><p class="has-text-weight-bold">Disable</p></a>
					</div>
				</nav>
				<div class="is-divider"></div>
			</div>
			<div v-if="!loading && config" class="container">
				<h1 class="title has-text-white has-text-left">Package Settings</h1>
				<div class="columns">
					<div class="column is-4">
						<div class="box">
							<div class="content">
								<h3 class="has-text-white has-text-left">
									Level-Up Messaging
									<span v-if="config.levelMessaging">
										<b-switch size='is-small' ref="levelMessaging-switch" :disabled="isLoading" @click.native="settingUpdate('levelMessaging', false)" value="true"
											type="is-primary">
										</b-switch>
										<section>
											<br>
											<p class="subtitle title has-text-white has-text-left">Location</p>
											<b-dropdown>
												<button class="button is-grey" slot="trigger">
													<template v-if="leveling.messageLocation">
														<span>{{ leveling.messageLocation.name ? '#' + leveling.messageLocation.name : leveling.messageLocation }}</span>
													</template>
													<template v-else>
														<span>None</span>
													</template>
													<font-awesome-icon size="1x" pull="right" icon="angle-down" />
												</button>
												<b-dropdown-item @click="dropdownSave('messageLocation', 'Level Message location', 'DM')">DM</b-dropdown-item>
												<b-dropdown-item @click="dropdownSave('messageLocation', 'Level Message location', 'Current Channel')">Current Channel</b-dropdown-item>
												<b-dropdown-item  v-if="channels" v-for="channel of channels" :value="channel.name" @click="dropdownSave('messageLocation', 'Level Message Location', channel, false)" :key="channel.name">{{ channel.name }}</b-dropdown-item>
											</b-dropdown>
										</section>
										<section>
											<br>
											<p class="subtitle title has-text-white has-text-left">Message</p>
											<b-field>
												<b-input type="textarea" v-model="config.levelMsg" maxlength="1980" expanded></b-input>
												<p class="control">
													<button @click="settingUpdate('levelMsg', config.levelMsg, { bool: false })" class="button is-primary">Save</button>
												</p>
											</b-field>
											<p style="font-size: 15px" class="subtitle has-text-white"><code id="vars" class="inlinecode has-text-white ">{user}</code>= User name. <code id="vars" class="has-text-white inlinecode">{level}</code>= User's new level.</p>
										</section>
									</span>
									<span v-else>
										<b-switch size='is-small' ref="levelMessaging-switch" :disabled="isLoading" @click.native="settingUpdate('levelMessaging', true)" value="false"
											type="is-primary">
										</b-switch>
									</span>
								</h3>
								<p v-if="!config.levelMessaging">Send a message to a member when they level up.</p>
							</div>
						</div>
					</div>
					<div class="column is-4">
						<div class="box">
							<div class="content">
								<h3 class="has-text-white">
									Level Up Roles 
									<button class="button is-rounded is-small is-grey" @click="promoModal = true">
										Add Role <font-awesome-icon size="0.8x" pull="right" icon="plus"/>
									</button>
									<br><br>
									<b-taglist>
										<b-tag v-if="leveling.promoRoles.length" v-for="role of leveling.promoRoles" :key="role"
											type="is-grey"
											closable
											@close="confirmDelete(role)"
										>
											@{{ role.name }} - Rank {{ role.rank }}
										</b-tag>
									</b-taglist>
									<section v-if="leveling.promoRoles.length">
										<p class="has-text-white subtitle">When a user unlocks a role:</p>
										<b-checkbox size="is-medium" required @click.native="levelingUpdate('stackRoles', true)" v-model="leveling.stackRoles">
											Stack Roles
										</b-checkbox>
										<br><br>
										<b-checkbox size="is-medium" required :true-value="false" @click.native="levelingUpdate('stackRoles', false)" v-model="leveling.stackRoles">
											Remove Previous Role
										</b-checkbox>
									</section>
								</h3>
								<p v-if="!leveling.promoRoles.length">No Roles added. Click the "Add Role" button to add a role.</p>

							</div>
						</div>
					</div>
					<div class="column is-4">
						<div class="box">
							<div class="content">
								<h3 class="has-text-white">
									Exempted Channels
									<br><br>
									<b-field custom-class="has-text-white">
										<b-taginput
											v-model="leveling.excludedChannels"
											ellipsis
											rounded
											autocomplete
											:allow-new="false"
											:data="filteredChannels"
											@typing="getChannelNames"
											type="is-grey"
											field="name"
											placeholder="Add a Channel"
											custom-class="has-text-white">
										</b-taginput>
										<p class="control">
											<button class="button is-primary" @click="levelingUpdate('excludedChannels', leveling.excludedChannels, { bool: false })">Save</button>
										</p>
									</b-field>
								</h3>
								<h3 class="has-text-white">
									Exempted Roles
									<br><br>
									<b-field custom-class="has-text-white">
										<b-taginput
											v-model="leveling.excludedRoles"
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
											<button class="button is-primary" @click="levelingUpdate('excludedRoles', leveling.excludedRoles, { bool: false })">Save</button>
										</p>
									</b-field>
								</h3>
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
								type="is-primary">
							</b-switch>
						</h1>

						<p>{{ command.description }}</p>
					</div>
				</div>

			</div>

            <b-modal v-if="roles" :active.sync="promoModal" size="is-large" has-modal-card>
			<div class="modal-card" style="width: auto">
				<header class="modal-card-head">
					<p class="modal-card-title">Add Promotion Role</p>
				</header>
				<section class="modal-card-body">
					<b-field custom-class="has-text-white" label="Select Role">
						<b-dropdown>
							<button class="button is-grey-darker" slot="trigger">
								<template v-if="selectedRole">
									<span>{{ selectedRole.name }}</span>
								</template>
								<template v-else>
									<span>None</span>
								</template>
								<font-awesome-icon size="1x" pull="right" icon="angle-down" />
							</button>
							<b-dropdown-item @click="selectedRole = role" v-for="role of roles" :value="role.name" :key="role.name">{{ role.name }}</b-dropdown-item>
						</b-dropdown>

					</b-field>
					<b-field custom-class="has-text-white" label="Promotion Level">
						<b-input type="number" min=1 v-model="selectedRank"></b-input>
					</b-field>
				</section>
				<footer class="modal-card-foot">
					<button class="button is-danger is-outlined" type="button" @click="promoModal = false">Close</button>
					<button v-if="selectedRole" class="button is-primary" type="button" @click="addPromoRole(selectedRole, selectedRank)">Save</button>
				</footer>
			</div>

		</b-modal>

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
			title: 'Mr.Fox Bot - Leveling',	
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
		const { data: leveling } =  await app.$axios.get(`/api/guilds/${guildid}/leveling`, { headers: { Authorization: secret.encrypt(app.$auth.user.id) } });
		roles.forEach(r => r.color = `#${r.color.toString(16).padStart(6, "0")}`);
        return {
            commands,
            config,
            channels, 
			roles,
			leveling
        }

    },
    data() {
        return {
            commands: null,
            config: null,
            channels: null,
            leveling: null,
			roles: null,
			filteredChannels: this.channels,
            filteredRoles: this.roles,
            promoModal: false,
            selectedRole: null,

        };
    },
    methods: {
		dropdownSave(key, meta, item, bool) {
			return this.levelingUpdate(key, item, { meta, bool })
		},
        async confirmDelete(role) {
            this.$dialog.confirm({
                title: "Delete Promotion Role",
                message: `Are you sure that you'd like to remove the role "${role.name}"?`,
                cancelText: "Cancel",
                confirmText: "Delete",
                type: "is-primary",
                onConfirm: async () => {
                    try {
						this.leveling.promoRoles.splice(this.leveling.promoRoles.indexOf(role, 1));
                        await this.levelingUpdate("promoRoles", this.leveling.promoRoles, { bool: false });
                    } catch (error) {
                        this.$toast.open({
                            message: `Error deleting rank. ${error}`,
                            type: "is-danger",
                            duration: 3000
                        });
                    }
                }

            });
        },
        async addPromoRole(role, rank) {
            if (!rank) {
                return this.$toast.open({
                    message: `Missing parameter "rank".`,
                    type: "is-danger",
                    duration: 3000
                });
            }
            role.rank = parseInt(rank);
            this.leveling.promoRoles.push(role);
			await this.levelingUpdate('promoRoles', this.leveling.promoRoles);
            this.promoModal = false;
        },
        getChannelNames(channel) {
            this.filteredChannels = this.channels.filter(option => `${option.name.toLowerCase()}`.indexOf(channel.toLowerCase()) >= 0);
        },
        getRoleNames(channel) {
            this.filteredRoles = this.roles.filter(option => `${option.name.toLowerCase()}`.indexOf(channel.toLowerCase()) >= 0);
        },
        async levelingUpdate(key, value, options) {
            try {
                this.leveling = await API.levelingUpdate(key, value, this.$route.params.guildid, this.$auth.user.id, options);
            } catch (error) {
                this.$dialog.alert({
					title: 'Error',
                    message: `Unable to edit this setting. ${error}`,
                    type: "is-danger"
                });
                this.$refs[`${key}-switch`][0].newValue = !value;
            } 
        },
        async settingUpdate(key, value, options) {
            try {
                this.config = await API.settingUpdate(key, value, this.$route.params.guildid, this.$auth.user.id, options);
                this.$toast.open({
                    message: `Toggled ${key} to ${typeof value === "boolean" ? value ? "On" : "Off" : value}`,
                    type: "is-primary",
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
                    this.config = await API.settingArrayUpdate(key, obj[key], this.$route.params.guildid, this.$auth.user.id, { array: true });
                }
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
                this.commands = await API.pkgCommands("Leveling", this.$route.params.guildid, this.$auth.user.id);
            } catch (error) {
                this.$toast.open({
                    message: `Unable to edit this command: ${error}`,
                    type: "is-danger"
                });
                this.$refs[`${data}-switch`][0].newValue = !bool;
                this.isLoading = false;
            } finally {
                this.isLoading = false;
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

<style>
#vars {
	background-color: #2b2f33;
}
</style>
