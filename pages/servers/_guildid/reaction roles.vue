<template>
    <section class="section">
        <div class="container">
				<nav class="level is-mobile">
					<div class="level-left">
						<h1 class="title has-text-white has-text-left">&nbsp;Reaction Roles</h1>
					</div>
					<div class="level-left">
						<a class="button is-danger" @click="confirmPkg('Reaction Roles')">Disable</a>
					</div>
				</nav>
				<div class="is-divider"></div>
			</div>
        <div class="container">
            <div class="columns">
                <div class="column is-one-third">
                    <div class="box">
                        <div class="content">
                            <h1 class="title has-text-white has-text-left">
                                Add Reaction Role
                            </h1>
                            <p class="has-text-white">
                                Message Name
                            </p>
                            <b-field>
                                <b-input maxlength="20" v-model="roleData.alias"></b-input>
                            </b-field>
                            <p class="has-text-white">
                                Base Message ID (Right click message > Copy ID)
                            </p>
                            <b-field>
                                <b-input maxlength="19" v-model="roleData.messageID"></b-input>
                            </b-field>
                            <p class="has-text-white">
                                Select Role
                            </p>
                            <b-field>
							<vs-select class="selectExample" label="Figuras" v-model="roleData.role">
								<vs-select-item :key="role.id" :vs-value="role" :vs-text="role.name" v-for="role of roles" />
							</vs-select>
						    </b-field>
                            <p class="has-text-white">
                                Select Emoji
                            </p>
                            <b-field>
							<vs-select class="selectExample" label="Figuras" v-model="roleData.emoji">
								<vs-select-item :key="emoji.id" :vs-value="emoji" :vs-text="emoji.name" v-for="emoji of emojis" />
							</vs-select>
						    </b-field>
                            <p class="control">
                                <button class="button is-success" @click="toggleRole(roleData)">Save</button>
                            </p>

                        </div>
                    </div>

                </div>
                <div class="column is-two-thirds is-multiline">
                    <div class="box is-small">
                        <div class="content">
                            <h1 class="title has-text-white has-text-left">
                                Current Reaction Roles
                            </h1>
                            <div class="columns is-multiline">
                               <div v-if="config.reactionRoles" :key="role.id" v-for="role of config.reactionRoles" class="column is-half">
                                <div class="box" style="background-color: #34383c">
                                <div class="content">
                                    <p class="subtitle has-text-white">Message Name: {{ role.alias }}</p>
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
                            <p v-if="!config.reactionRoles.length" class='has-text-white'>
                                No Reaction Roles currently added.
                            </p>
                        </div>

                    </div>

                </div>
            </div>

        </div>
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
		const { data: commands } = await app.$axios.get(`/api/commands/${page}?guildID=${guildid} `, { headers: { Authorization: secret.encrypt(app.$auth.user.id) } });
		const { data: config } =  await app.$axios.get(`/api/guilds/${guildid}/config`, { headers: { Authorization: secret.encrypt(app.$auth.user.id) } });
        const { data: roles } =  await app.$axios.get(`/api/guilds/${guildid}/roles`, { headers: { Authorization: secret.encrypt(app.$auth.user.id) } });
        const { data: emojis } = await app.$axios.get(`/api/guilds/${guildid}/emojis`);
		roles.forEach(r => r.color = `#${r.color.toString(16).padStart(6, "0")}`);
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
            bwModalActive: false,
            massModalActive: false,
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
                    this.config = await API.guildConfig(this.$route.params.guildid, this.$auth.user.id);
                    this.config[key] = obj[key];
                }
                this.$toast.open({
                    message: `Successfully saved settings.`,
                    type: "is-success"
                });
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
                this.commands = await API.pkgCommands("Reaction Roles", this.$route.params.guildid, this.$auth.user.id);
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
    .selectExample .input-select {
        color: #242424;
    }
</style>
