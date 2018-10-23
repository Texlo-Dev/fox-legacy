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
											<p class="subtitle title has-text-white has-text-left">Location:</p>
											<div v-if="!prompts.includes('leveloc')">
                                                <a v-if="leveling.messageLocation.name" id="channel" :href="`https://discordapp.com/channels/${$route.params.guildid}/${leveling.messageLocation.id}`">#{{ leveling.messageLocation.name }}
                                                </a>
                                                <p v-else class="subtitle has-text-white">Direct Message</p>
                                                &nbsp;<button @click="prompts.push('leveloc')" class="button is-small is-primary">Change</button>
                                            </div>
                                            <div v-else>
                                                <b-field custom-class="has-text-white">
                                                    <b-select v-model="leveling.messageLocation" placeholder="Select a location">
													<option value="DM">Direct Message</option>
                                                    <option
                                                    v-for="channel of channels"
                                                    :value="channel"
                                                    :key="channel.id">
                                                    #{{ channel.name }}
                                                    </option>
                                                    </b-select>
                                                     <p class="control">
                                                        <button @click="dropdownSave('messageLocation', 'Level Message location', leveling.messageLocation)" class="button is-primary">Save</button>
                                                    </p>
                                                </b-field>
                                            </div>
										</section>
										<section>
											<br>
											<p class="subtitle title has-text-white has-text-left">Message:</p>
											<div v-if="!prompts.includes('levelmsg')">
                                                <p class="subtitle has-text-white" style="font-size: 15px">{{ config.levelMsg }}</p>
                                                &nbsp;<button @click="prompts.push('levelmsg')" class="button is-small is-primary">Change</button>
                                            </div>
                                            <div v-else>
                                                <b-field>
													<b-input type="textarea" v-model="config.levelMsg" maxlength="1980" expanded></b-input>
													<p class="control">
														<button @click="settingUpdate('levelMsg', config.levelMsg, { bool: false, hideToast: true })" class="button is-primary">Save</button>
													</p>
												</b-field>
												<p style="font-size: 15px" class="subtitle has-text-white"><code id="vars" class="inlinecode has-text-white ">{user}</code>= User name. <code id="vars" class="has-text-white inlinecode">{level}</code>= User's new level.</p>
                                            </div>
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
					<form id="promo" @submit.prevent="validatePromo">
						<b-field :type="{ 'is-danger': errors.has('role') }" :message="errors.first('role')" label="Select Role" custom-class="has-text-white">
                    	<b-select name="role" v-validate="'required'" v-model="roleData.role" placeholder="None">
                        	<option
                        	v-for="role of roles"
                        	:value="role"
                        	:key="role.id">
                        	{{ role.name }}
                        	</option>
                    	</b-select>
                    	</b-field>
						<b-field :type="{ 'is-danger': errors.has('Rank') }" custom-class="has-text-white" label="Promotion Level">
							<b-input name="Rank" v-validate="'required'" v-model.number="roleData.rank"></b-input>
						</b-field>
					</form>
				</section>
				<footer class="modal-card-foot">
					<button class="button is-danger is-outlined" type="button" @click="promoModal = false">Close</button>
					<button class="button is-primary" type="submit" form="promo">Save</button>
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
        const [commands, config, channels, roles, leveling] = await Promise.all([
			(await app.$axios.get(`/api/commands/${page}?guildID=${guildid} `, { headers: { Authorization: secret.encrypt(app.$auth.user.id) } })).data,
            (await app.$axios.get(`/api/guilds/${guildid}/config`, { headers: { Authorization: secret.encrypt(app.$auth.user.id) } })).data,
            (await app.$axios.get(`/api/guilds/${guildid}/channels`, { headers: { Authorization: secret.encrypt(app.$auth.user.id)} })).data,
			(await app.$axios.get(`/api/guilds/${guildid}/roles`, { headers: { Authorization: secret.encrypt(app.$auth.user.id) } })).data,
			(await app.$axios.get(`/api/guilds/${guildid}/leveling`, { headers: { Authorization: secret.encrypt(app.$auth.user.id) } })).data,
		]);
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
			prompts: [],
			roles: null,
			roleData: {
				role: null,
				rank: null
			},
			filteredChannels: this.channels,
            filteredRoles: this.roles,
            promoModal: false

        };
    },
    methods: {
		async validatePromo() {
			const result = await this.$validator.validateAll();
			result ? this.addPromoRole(this.roleData.role, this.roleData.rank) : alert('Incorrect Parameters.');
		},
		dropdownSave(key, meta, item, bool) {
			return this.levelingUpdate(key, item, { meta, bool }).then(this.prompts = []);
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
			this.leveling.promoRoles.push(role);
			role.rank = rank;
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
				this
            } catch (error) {
                this.$snackbar.alert({
					title: 'Error',
                    message: `Unable to edit this setting. ${error}`,
                    type: "is-danger"
                });
                this.$refs[`${key}-switch`][0].newValue = !value;
            } 
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
                    const settingUpd = await API.settingArrayUpdate(key, obj[key], this.$route.params.guildid, this.$auth.user.id, { array: true });
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

<style>
#vars {
	background-color: #2b2f33;
}
</style>
<style>
.select select {
background-color: #2b2f33;
}

.select.is-empty select {
color: #eff;
        
}

select {
font-family: 'Poppins';
}
</style>

