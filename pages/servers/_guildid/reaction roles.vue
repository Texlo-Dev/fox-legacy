<template>
    <section class="section">
        <div class="container">
				<nav class="level is-mobile">
					<div class="level-left">
						<h1 class="title has-text-white has-text-left">&nbsp;Reaction Roles</h1>
					</div>
					<div class="level-left">
						<a class="button is-danger" @click="confirmPkg('Reaction Roles')"><p class="has-text-weight-bold">Disable</p></a>
					</div>
				</nav>
				<div class="is-divider"></div>
			</div>
        <div class="container">
            <div class="columns">
                <div class="column is-one-half is-multiline">
                    <div class="box is-small">
                        <div class="content">
                            <nav class="level">
                                    <div class="level-left">
                                        <div class="level-item">
                                            <h1 class="title has-text-left has-text-white">Current Reaction Roles</h1>
                                        </div>
                                        <div class="level-item">
                                            <button class="button is-grey is-rounded" @click="toggleAdd = true">
                                                Add Role <font-awesome-icon size="0.8x" pull="right" icon="plus"/>
                                            </button>
                                        </div>
                                    </div>
                                </nav>
                            <div v-if="config.reactionRoles.length" class="columns is-multiline">
                               <div v-if="config.reactionRoles" :key="role.id" v-for="role of config.reactionRoles" class="column is-one-quarter">
                                <div class="box" style="background-color: #34383c">
                                <div class="content">
                                    <p class="subtitle has-text-white">Message: {{ role.alias }}</p>
                                    <span>Emoji: {{ role.emoji.name }} </span><span><img align="center" :src="role.emoji.url" height="25" width="25"></span>
                                    <br>
                                    Role: @{{ role.name }}
                                    <br>
                                    Message ID: {{ role.messageID }}
                                </div>
                                <button class="button is-danger" @click="deleteRole(role)">Delete</button>
                               </div>
                                    
                            </div> 
                            </div>
                            <div v-else>
                                <p>No Reaction Roles found. Click the "Add Role" button to get started.</p>
                            </div>
                        </div>

                    </div>

                </div>
            </div>

        </div>
        <b-modal :active.sync="toggleAdd" has-modal-card>
         <div class="modal-card">
            <header class="modal-card-head">
               <p class="modal-card-title">New Reaction Role</p>
            </header>
            <section class="modal-card-body">
                <form id="reactroles" @submit.prevent="validateForm">
                    <b-field label="Message Name" :type="{ 'is-danger': errors.has('Message Name') }" :message="errors.first('Message Name')" custom-class="has-text-white">
                        <b-input name="Message Name" v-validate="'required|max:15'" v-model="roleData.alias"></b-input>
                    </b-field>
                    <b-field label="Base Message ID" :type="{ 'is-danger': errors.has('Message ID') }" :message="errors.first('Message ID')" custom-class="has-text-white">
                        <b-input name="Message ID" v-validate="'required|max:21'" v-model="roleData.messageID"></b-input>
                    </b-field>
                    <b-field :type="{ 'is-danger': errors.has('role') }" :message="errors.first('role')" label="Select Role" custom-class="has-text-white">
                    <b-select id="modalselect" name="role" v-validate="'required'" v-model="roleData.role" placeholder="None">
                        <option
                        v-for="role of roles"
                        :value="role"
                        :key="role.id">
                        {{ role.name }}
                        </option>
                    </b-select>
                    </b-field>
                    <b-field :type="{ 'is-danger': errors.has('emoji') }" :message="errors.first('emoji')" label="Select Emoji" custom-class="has-text-white">
                    <b-select id="modalselect" name="emoji" v-validate="'required'" v-model="roleData.emoji" placeholder="None">
                        <option
                        v-for="emoji of emojis"
                        :value="emoji"
                        :key="emoji.id">
                        {{ emoji.name }}
                        </option>
                    </b-select>
                    </b-field>
                </form>
            </section>
            <footer class="modal-card-foot">
               <button class="button is-danger is-outlined" type="button" @click="toggleAdd = false">Close</button>
               <button class="button is-primary" type="submit" form="reactroles">Add</button>
            </footer>
         </div>
      </b-modal>
    </section>
</template>


<script>
import secret from '~/secrets';
import API from '~/API'
export default {
    async fetch({ store, app, params: { guildid } }) {
		if (store.state.cachedGuild) return;
        const token = app.$auth.getToken('discord');
        const { data: guild } = await app.$axios.get(`/api/guilds/${guildid}`, { headers: { Authorization: secret.encrypt(app.$auth.user.id) } });
       
		store.commit('cacheGuild', guild);
		store.commit('toggleDash', true);
    },
    async asyncData({ app, route, params: { guildid } }) {
        const page = route.path.split(guildid + '/')[1].replace(/\w\S*/g, txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
        const [commands, config, roles, emojis] = await Promise.all([
			(await app.$axios.get(`/api/commands/${page}?guildID=${guildid} `, { headers: { Authorization: secret.encrypt(app.$auth.user.id) } })).data,
            (await app.$axios.get(`/api/guilds/${guildid}/config`, { headers: { Authorization: secret.encrypt(app.$auth.user.id) } })).data,
            (await app.$axios.get(`/api/guilds/${guildid}/roles`, { headers: { Authorization: secret.encrypt(app.$auth.user.id)} })).data,
            (await app.$axios.get(`/api/guilds/${guildid}/emojis`)).data
		]);
        return {
            commands,
            config,
            roles,
            emojis
        }
    },
    data() {
        return {
            commands: null,
            config: null,
            channels: null,
            roles: null,
            filteredRoles: this.roles,
            toggleAdd: false,
            originalState: true,
            roleData: {
                role: null,
                alias: null,
                emoji: null,
                messageID: null
            }

        };
    },
    methods: {
        async validateForm() {
            const result = await this.$validator.validateAll();
            result ? this.toggleRole(this.roleData) : this.$toast.open('Incorrect parameters.');  
        },
        async deleteRole(role) {
            this.$dialog.confirm({
                title: 'Delete Reaction Role',
                message: `Are you sure that you'd like to delete the reaction role "${role.name}"?`,
                cancelText: "Cancel",
                confirmText: "Delete",
                type: "is-danger",
                onConfirm: async () => {
                    this.config.reactionRoles.splice(this.config.reactionRoles.indexOf(role), 1);
                    this.settingArrayUpdate({ reactionRoles: this.config.reactionRoles });
                }

            })
        },
        async toggleRole(data) {
            const { role } = data;
            role.messageID = data.messageID;
            role.emoji = data.emoji;
            role.alias = data.alias;
            const reactionRoles = this.config.reactionRoles;
            try {
                reactionRoles.push(role);
                await this.settingArrayUpdate({ reactionRoles });
                for (const key in this.roleData) { this.roleData[key] = null; };

            } catch (error) {
                reactionRoles.splice(reactionRoles.indexOf(role), 1);
                
            }

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

