<template>
    <section class="section">
        <div class="container">
            <nav class="level is-mobile">
                <div class="level-left">
                    <h1 class="title has-text-white has-text-left">&nbsp;Welcomer</h1>
                </div>
                <div class="level-left">
                    <a class="button is-danger" @click="confirmPkg('Welcomer')"><p class="has-text-weight-bold">Disable</p></a>
                </div>
            </nav>
            <div class="is-divider"></div>
        </div>
        <div v-if="!loading && config" class="container">
            <h1 class="title has-text-white has-text-left">Package Settings</h1>
            <div class="columns">
                <div class="column is-one-third">
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
											<button class="button is-primary" @click="settingArrayUpdate({ autoRoles: config.autoRoles })">Save</button>
										</p>
									</b-field>
								</h3>
                            <p>Role(s) that will be given to all members upon joining your server.</p>
                        </div>
                    </div>
                </div>
                <div class="column is-one-third">
                    <div class="box">
                        <div class="content">
                            <h3 class="has-text-white has-text-left">
									Welcome Messaging
									<span v-if="config.welcomeEnabled">
										<b-switch size='is-small' ref="welcomeEnabled-switch" :disabled="isLoading" @click.native="settingUpdate('welcomeEnabled', false)" value="true"
											type="is-primary">
										</b-switch>
										<button class="button is-rounded is-small is-grey" @click="toggleAdd = true">
											Manage <font-awesome-icon size="0.8x" pull="right" icon="wrench"/>
										</button>
									</span>
									<span v-else>
										<b-switch size='is-small' ref="welcomeEnabled-switch" :disabled="isLoading" @click.native="settingUpdate('welcomeEnabled', true)" value="false"
											type="is-primary">
										</b-switch>
									</span>
								</h3>
								<p>Send a friendly message to a member when they join your server.</p>

                        </div>
                    </div>

                </div>
                <div class="column is-one-third">
                    <div class="box">
                        <div class="content">
                            <h3 class="has-text-white has-text-left">
									Goodbye Messaging
									<span v-if="config.goodbyeEnabled">
										<b-switch size='is-small' ref="goodbyeEnabled-switch" :disabled="isLoading" @click.native="settingUpdate('goodbyeEnabled', false)" value="true"
											type="is-primary">
										</b-switch>
										<button class="button is-rounded is-small is-grey" @click="toggleGoodbye = true">
											Manage <font-awesome-icon size="0.8x" pull="right" icon="wrench"/>
										</button>
									</span>
									<span v-else>
										<b-switch size='is-small' ref="goodbyeEnabled-switch" :disabled="isLoading" @click.native="settingUpdate('goodbyeEnabled', true)" value="false"
											type="is-primary">
										</b-switch>
									</span>
								</h3>
								<p>Notify with a message when a user has left the server.</p>
                        </div>
                    </div>
                </div>
            </div>

        </div>
        <b-modal :active.sync="toggleGoodbye" has-modal-card>
            <div class="modal-card">
                <header class="modal-card-head">
                    <p class="modal-card-title">Goodbye Messaging</p>
                </header>
                <section class="modal-card-body">
                    <form id="goodbye" @submit.prevent="validateGoodbye">
                        <b-field :type="{ 'is-danger': errors.has('Message') }" :message="errors.first('Message')" label="Message" custom-class="has-text-white">
                            <b-input name="Message" v-validate="'required|max:1980'" type="textarea" v-model="config.goodbyeMsg" expanded></b-input>
                        </b-field>
                        <p><code id="vars" class="inlinecode has-text-grey">{user}</code>= User Name. <code id="vars" class="inlinecode has-text-grey">{server}</code>= Server name. <code id="vars" class="inlinecode has-text-grey">{position}</code>= Join position.</p>
                        <br>
                        <b-field :type="{ 'is-danger': errors.has('Location') }" :message="errors.first('Location')" label="Goodbye Channel" custom-class="has-text-white">
                            <b-select id="modalselect" name="Location" v-validate="'required'" v-model="config.goodbyeChannel" placeholder="None">
                            <option
                            v-for="channel of channels"
                            :value="channel"
                            :key="channel.id">
                            #{{ channel.name }}
                            </option>
                        </b-select>
                        </b-field>
                        <b-field>
                            <b-switch @click.native="settingUpdate('goodbyeEmbed', !config.goodbyeEmbed, { hideToast: true, keepModal: true })" type="is-primary" v-model="config.goodbyeEmbed">
                                <p class="has-text-white has-text-weight-bold">Embed Message</p>
                            </b-switch>
                        </b-field>
                    </form>	
                </section>
				<footer class="modal-card-foot">
					<button class="button is-danger is-outlined" @click="toggleGoodbye = false">Close</button>
                    <button class="button is-primary" form="goodbye" type="submit">Save</button>
				</footer>
            </div>

        </b-modal>
		<b-modal :active.sync="toggleAdd" has-modal-card>
            <div class="modal-card">
                <header class="modal-card-head">
                    <p class="modal-card-title">Welcome Messaging&nbsp;&nbsp;</p>
                </header>
                <section class="modal-card-body">
                    <form id="welcome" @submit.prevent="validateWelcome">
                        <b-field :type="{ 'is-danger': errors.has('Message') }" :message="errors.first('Message')" label="Message" custom-class="has-text-white">
                            <b-input name="Message" v-validate="'required|max:1980'" type="textarea" v-model="config.welcomeMsg" expanded></b-input>
                        </b-field>
                        <p><code id="vars" class="inlinecode has-text-grey">{user}</code>= User Name. <code id="vars" class="inlinecode has-text-grey">{server}</code>= Server name. <code id="vars" class="inlinecode has-text-grey">{position}</code>= Join position.</p>
                        <br>
                        <b-field :type="{ 'is-danger': errors.has('Location') }" :message="errors.first('Location')" label="Welcome Location" custom-class="has-text-white">
                            <b-select id="modalselect" name="Location" v-validate="'required'" v-model="config.welcomeLocation" placeholder="None">
                            <option value="DM">DM Member</option>
                            <option
                            v-for="channel of channels"
                            :value="channel"
                            :key="channel.id">
                            #{{ channel.name }}
                            </option>
                        </b-select>
                        </b-field>
                        <b-field>
                            <b-switch type="is-primary" @click.native="settingUpdate('welcomerEmbed', !config.welcomerEmbed, { hideToast: true, keepModal: true })" v-model="config.welcomerEmbed">
                                <p class="has-text-white has-text-weight-bold">Embed Message</p>
                            </b-switch>
                        </b-field>
                    </form>	
                </section>
				<footer class="modal-card-foot">
					<button class="button is-danger is-outlined" @click="toggleAdd = false">Close</button>
                    <button class="button is-primary" form="welcome" type="submit">Save</button>
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
			title: 'Mr.Fox Bot - Welcomer',	
		}
	},
    async fetch({ store, app, params: { guildid } }) {
		if (store.state.cachedGuild) return;
        const token = app.$auth.getToken('discord');
        const { data: guild } = await app.$axios.get(`/api/guilds/${guildid}`, { headers: { Authorization: secret.encrypt(app.$auth.user.id)} })
       
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
			toggleAdd: false,
            roles: null,
            isLoading: false,
			filteredRoles: this.roles,
			toggleGoodbye: false,
            bwModalActive: false,
            massModalActive: false,
            originalState: true

        };
    },
    methods: {
        async validateWelcome() {
            const result = await this.$validator.validateAll();
            if (result) return await this.settingArrayUpdate({welcomeMsg: this.config.welcomeMsg, welcomeLocation: this.config.welcomeLocation });
            /* if (result) {
                await this.settingUpdate('welcomeMsg', this.config.welcomeMsg);
                await this.settingUpdate('welcomeLocation', this.config.welcomeLocation);
            }*/
        },
        async validateGoodbye() {
            const result = await this.$validator.validateAll();
            if (result) return await this.settingArrayUpdate({goodbyeMsg: this.config.goodbyeMsg, goodbyeChannel: this.config.goodbyeChannel });
            /* if (result) {
                await this.settingUpdate('goodbyeMsg', this.config.goodbyeMsg);
                await this.settingUpdate('goodbyeChannel', this.config.goodbyeChannel);
            } */
        },
        dropdownSave(key, meta, item) {
            return this.settingUpdate(key, item, { meta });
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

<style>
#vars {
	background-color: #34383c;
}

.select.is-empty select {
color: #eff;
        
}

select {
font-family: 'Poppins';
}
.select select option { color: #747f8d };
</style>



