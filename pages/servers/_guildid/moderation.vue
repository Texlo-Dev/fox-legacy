<template>
    <section class="section">
        <div class="container">
            <nav class="level is-mobile">
                <div class="level-left">
                    <h1 class="title has-text-white has-text-left">&nbsp;Moderation</h1>
                </div>
                <div class="level-left">
                    <a class="button is-danger" @click="confirmPkg('Moderation')"><p class="has-text-weight-bold">Disable</p></a>
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
											type="is-primary">
										</b-switch>
										<section>
											<br>
                                            <div v-if="!prompts.includes('modlog')">
                                                <a v-if="config.modlogChannel" id="channel" :href="`https://discordapp.com/channels/${$route.params.guildid}/${config.modlogChannel.id}`">#{{ config.modlogChannel.name }}
                                                </a>
                                                <p v-else class="subtitle has-text-white">No Channel</p>
                                                &nbsp;<button @click="prompts.push('modlog')" class="button is-small is-primary">Change</button>
                                            </div>
                                            <div v-else>
                                                <b-field custom-class="has-text-white">
                                                    <b-select v-model="config.modlogChannel" placeholder="Select a channel">
                                                    <option
                                                    v-for="channel of channels"
                                                    :value="channel"
                                                    :key="channel.id">
                                                    #{{ channel.name }}
                                                    </option>
                                                    </b-select>
                                                     <p class="control">
                                                        <button @click="dropdownSave('modlogChannel', 'Mod-log', config.modlogChannel)" class="button is-primary">Save</button>
                                                    </p>
                                                </b-field>
                                            </div>
											<!--<b-dropdown>
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
											</b-dropdown>-->
										</section>
									</span>

									<span v-else>
										<b-switch size='is-small' ref="modLogging-switch" :disabled="isLoading" @click.native="settingUpdate('modLogging', true)" value="false"
											type="is-primary">
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
                                <div v-if="!prompts.includes('mute')">
                                    <a v-if="config.muteRole" id="channel">@{{ config.muteRole.name }}
                                    </a>
                                    <p v-else class="subtitle has-text-white">No Role</p>
                                    &nbsp;<button @click="prompts.push('mute')" class="button is-small is-primary">Change</button>
                                 </div>
                                <div v-else>
                                    <b-field custom-class="has-text-white">
                                        <b-select v-model="config.muteRole" placeholder="Select a channel">
                                            <option
                                            v-for="role of roles"
                                            :value="role"
                                            :key="role.id">
                                            @{{ role.name }}
                                            </option>
                                        </b-select>
                                        <p class="control">
                                            <button @click="dropdownSave('muteRole', 'Muted Role', config.muteRole)" class="button is-primary">Save</button>
                                        </p>
                                    </b-field>
                                </div>
								</h3>
                            <p>Note: Mr.Fox will attempt to update the chat permissions for the specified role.</p>
                        </div>
                    </div>
                </div>
                <div class="column is-half">
                    <div class="box">
                        <div class="content">
                            <h3 class="has-text-white has-text-left">
									Server Logging
									<span v-if="config.serverLogging">
										<b-switch size='is-small' ref="serverLogging-switch" :disabled="isLoading" @click.native="settingUpdate('serverLogging', false)" value="true"
											type="is-primary">
										</b-switch>
										<button @click="modalActive = true" class="button is-small is-grey is-rounded">
											Manage <font-awesome-icon size="0.8x" pull="right" icon="wrench"/>
										</button>	
									</span>
									<span v-else>
										<b-switch size='is-small' ref="serverLogging-switch" :disabled="isLoading" @click.native="settingUpdate('serverLogging', true)" value="false"
											type="is-primary">
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
                                <button @click="settingUpdate('kickPoints', config.kickPoints)" class="button is-primary">Update</button>
                            </b-field>
                            <br>
                            <p class='subtitle has-text-white'>Automatic ban threshold</p>
                            <b-field>
                                <b-input v-model="config.banPoints" type="number" min=10 max=100000></b-input>
                                <button @click="settingUpdate('banPoints', config.banPoints)" class="button is-primary">Update</button>
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
								type="is-primary">
							</b-switch>
						</h1>

                    <p>{{ command.description }}</p>
                </div>
            </div>

        </div>
        <b-modal :active.sync="modalActive" size="is-large" has-modal-card>
            <div class="modal-card">
                <header class="modal-card-head">
                    <p class="modal-card-title">Server Logging</p>
                </header>
                <section class="modal-card-body">
                    <form id="serverlog" @submit.prevent="logValidate">
                        <b-field :type="{ 'is-danger': errors.has('channel') }" :message="errors.first('channel')" label="Select Channel" custom-class="has-text-white">
                            <b-select id="modalselect" name="channel" v-model="config.serverlogChannel">
                            <option
                            v-for="channel of channels"
                            :value="channel"
                            :key="channel.id">
                            #{{ channel.name }}
                            </option>
                            </b-select>
                        </b-field>
                    <b-field label="Event List" custom-class="has-text-white">
                        <section id="checkbox" class="has-text-centered has-background-black">

                            <div class="box">
                                <div class="content">
                                    <b-checkbox v-model="config.enabledEvents" native-value="channelCreate">
                                        <p>Channel Created</p>
                                    </b-checkbox>
                                    <b-checkbox v-model="config.enabledEvents" native-value="channelDelete">
                                        <p>Channel Deleted</p>
                                    </b-checkbox>
                                    <b-checkbox v-model="config.enabledEvents" native-value="channelUpdate">
                                        <p>Channel Updated</p>
                                    </b-checkbox>
                                    <b-checkbox v-model="config.enabledEvents" native-value="emojiCreate">
                                        <p>Emoji Created</p>
                                    </b-checkbox>
                                    <b-checkbox v-model="config.enabledEvents" native-value="emojiDelete">
                                        <p>Emoji Deleted</p>
                                    </b-checkbox>
                                    <b-checkbox v-model="config.enabledEvents" native-value="roleCreate">
                                        <p>Role Created</p>
                                    </b-checkbox>
                                    <b-checkbox v-model="config.enabledEvents" native-value="roleDelete">
                                        <p>Role Deleted</p>
                                    </b-checkbox>
                                    <b-checkbox v-model="config.enabledEvents" native-value="roleUpdate">
                                        <p>Role Updated</p>
                                    </b-checkbox>
                                    <b-checkbox v-model="config.enabledEvents" native-value="guildMemberAdd">
                                        <p>Member Join</p>
                                    </b-checkbox>
                                    <b-checkbox v-model="config.enabledEvents" native-value="guildMemberRemove">
                                        <p>Member Leave</p>
                                    </b-checkbox>
                                    <b-checkbox v-model="config.enabledEvents" native-value="guildMemberUpdate">
                                        <p>Member Detail Change</p>
                                    </b-checkbox>
                                    <b-checkbox v-model="config.enabledEvents" native-value="messageDelete">
                                        <p>Message Deleted</p>
                                    </b-checkbox>
                                    <b-checkbox v-model="config.enabledEvents" native-value="messageUpdate">
                                        <p>Message Updated</p>
                                    </b-checkbox>
                                    <b-checkbox v-model="config.enabledEvents" native-value="voiceStateUpdate">
                                        <p>Member Voice State Change</p>
                                    </b-checkbox>
                                </div>
                            </div>

                        </section>

                    </b-field>
                    <b-field custom-class="has-text-white" label="Ignored Channels">
                        <b-taginput v-model="config.logExcluded" ellipsis attached :data="filteredChannels" field="name" autocomplete :allow-new="false" type="is-grey" placeholder="Add Channel" @typing="getChannelNames" custom-class="has-text-white">
                            <template slot="empty">
                                No Channels
                            </template>
                        </b-taginput>
                    </b-field>
                    </form>

                </section>
                <footer class="modal-card-foot">
                    <button class="button is-danger is-outlined" type="button" @click="modalActive = false">Close</button>
                    <button class="button is-primary" type="submit" form="serverlog">Save</button>
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
            prompts: [],
            roles: null,
            filteredChannels: this.channels,
			filteredRoles: this.roles,
			modalActive: false,
            originalState: true

        };
    },
    methods: {
        async logValidate() {
            const result = await this.$validator.validateAll();
            if (result) {
                // await this.settingUpdate('serverlogChannel', this.config.serverlogChannel, { hideToast: true, dropHide: true });
                await this.settingArrayUpdate({ enabledEvents: this.config.enabledEvents, logExcluded: this.config.logExcluded, serverlogChannel: this.config.serverlogChannel });
            }
            this.$toast.open('Incorrect parameters.');   
        },
        dropdownSave(key, meta, item) {
            return this.settingUpdate(key, item, { meta })
                .then(() => {
                    this.prompts = [];
                });
        },
        getChannelNames(channel) {
            this.filteredChannels = this.channels.filter(option => `${option.name.toLowerCase()}`.indexOf(channel.toLowerCase()) >= 0);
        },
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
                this.$snackbar.open({
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
.modal-card-body .has-background-black {
    border-radius: 5px
    
}
</style>

<style>
.select select {
background-color: #34383c;
color: #eff;
}


.select.is-empty select {
color: #eff;
        
}

select {
font-family: 'Poppins';
}
.select select option { color: #747f8d }
</style>

