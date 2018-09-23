<template>
    <section class="section">
			<div class="container">
				<nav class="level is-mobile">
					<div class="level-left">
						<h1 class="title has-text-white has-text-left">&nbsp;Tags</h1>
					</div>
					<div class="level-left">
						<a class="button is-danger" @click="confirmPkg('Tags')">Disable</a>
					</div>
				</nav>
				<div class="is-divider"></div>
			</div>
			<div class="container">
				<div class="columns">
					<div class="column is-one-third">
						<div class="box">
							<div class="content">
								<h1 class="title has-text-white has-text-left">Add Tag</h1>
								<b-field label="Tag Name" custom-class="has-text-white">
									<b-input v-model="currentag.name" maxlength=15></b-input>
								</b-field>
								<b-field label="Tag Content" custom-class="has-text-white">
									<b-input v-model="currentag.content" type="textarea" maxlength=1980></b-input>
								</b-field>
								<button @click="addTag(currentag)" class="button is-success">Add</button>
							</div>
						</div>
					</div>
					<div class="is-divider-vertical"></div>
					<div class="column is-half">
						<div class="box">
							<div class="content">
								<h1 class="title has-text-white has-text-left">Tag List</h1>
								<b-taglist>
									<b-tag  v-for="tag of tags" v-if="tags.length" :key="tag"
										type="is-grey"
										closable
										@close="confirmDelete(tag)"
									>
										{{ tag }}
									</b-tag>
								</b-taglist>
							</div>
						</div>
						<div class="box">
							<div class="content">
								<h1 class="has-text-white has-text-left">Tag Settings</h1>
								<div class="field">
									<b-checkbox @click.native="settingUpdate('tacMode', !config.tacMode)" type="is-grey" v-model="config.tacMode">
										<p>Use tag as command</p>
									</b-checkbox>
								</div>
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

export default {
    head() {
		return {
			title: 'Mr.Fox Bot - Tags',	
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
        const { data: tags } =  await app.$axios.get(`/api/guilds/${guildid}/tags`, { headers: { Authorization: secret.encrypt(app.$auth.user.id) } });
		roles.forEach(r => r.color = `#${r.color.toString(16).padStart(6, "0")}`);
        return {
            commands,
            config,
            channels, 
            roles,
            tags
        }

    },
    data() {
        return {
            commands: null,
            config: null,
            tags: null,
            currentag: {
                name: null,
                content: null
            }

        };
    },
    methods: {
        async confirmDelete(tag) {
            this.$dialog.confirm({
                title: "Delete tag",
                message: `Are you sure that you'd like to remove the tag "${tag}"?`,
                cancelText: "Cancel",
                confirmText: "Delete",
                type: "is-success",
                onConfirm: async () => {
                    try {
                        await this.addTag(this.tags);
                        this.tags.splice(this.tags.indexOf(tag), 1);
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
        async resetChanges() {
            this.tags = await API.guildTags(this.$route.params.guildID, this.$auth.user.id);
        },
        async addTag(tag) {
            if (tag instanceof Array) {
                try {
                    this.tags = await API.addTag(this.$route.params.guildid, "None", "", this.$auth.user.id, tag);
                    this.$toast.open({
                        message: `Successfully edited tags.`,
                        type: "is-success",
                        duration: 3800
                    });
                } catch (error) {
                    this.$toast.open({
                        message: `Unable to edit tags. ${error}`,
                        type: "is-danger",
                        duration: 4000
                    });
                }
            } else {
                try {
                    this.tags = await API.addTag(this.$route.params.guildid, tag.name, tag.content, this.$auth.user.id);
                    this.$toast.open({
                        message: `Successfully added the tag ${tag.name}`,
                        type: "is-success",
                        duration: 3800
                    });
                    this.currentag.name = null;
                    this.currentag.content = null;
                } catch (error) {
                    this.$toast.open({
                        message: `Unable to add this tag: ${error}`,
                        type: "is-danger",
                        duration: 4000
                    });
                }
            }
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
                this.commands = await API.pkgCommands("Tags", this.$route.params.guildid, this.$auth.user.id);
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
