<template>
<section class="section">
		<div class="container">
			<h1 class="title has-text-white has-text-left">
				Server Permissions (BETA)
			</h1>
			<div class="is-divider"></div>
		</div>
		<div class="container">
			<h3 class="has-text-white title">Set Permission</h3>
			<div class="columns is-centered is-multiline">
				<div class="column is-half">
					<section>
						<p class="subtitle has-text-white">Select Permission(s)</p>
						<b-field>
							<vs-select vs-multiple class="selectExample" label="Figuras" v-model="selected.names">
								<vs-select-item :key="perm" :vs-value="perm" :vs-text="perm" v-for="perm of permissions" />
							</vs-select>
						</b-field>
					</section>
					<br>

					<section>
						<p class="subtitle has-text-white">Select Scope</p>
						<b-field>
							<vs-select class="selectExample" label="Figuras" v-model="selected.scope">
								<vs-select-item vs-value="role" vs-text="Role" />
								<vs-select-item vs-value="channelrole" vs-text="Role (Channel Exclusive)" />
								<vs-select-item vs-value="everyone" vs-text="Everyone" />
							</vs-select>
						</b-field>
					</section>
					<br v-if="selected.scope === 'role' || selected.scope === 'channelrole'">
					<section v-if="selected.scope === 'role' || selected.scope === 'channelrole'">
						<p class="subtitle has-text-white">Select Role</p>
						<b-field>
							<vs-select class="selectExample" label="Figuras" v-model="selected.target">
								<vs-select-item :key="role" :vs-value="role.id" :vs-text="role.name" v-for="role of roles" />
							</vs-select>

						</b-field>
					</section>
					<br v-if="selected.scope === 'channelrole'">
					<section v-if="selected.scope === 'channelrole'">
						<p class="subtitle has-text-white">Select Channel</p>
						<b-field>
							<vs-select class="selectExample" label="Figuras" v-model="selected.channel">
								<vs-select-item :key="channel" :vs-value="channel.id" :vs-text="channel.name" v-for="channel of channels" />
							</vs-select>

						</b-field>

					</section>
					<br>
					<section>
						<p class="subtitle has-text-white">Value</p>
						<b-field>
							<vs-select class="selectExample" label="Figuras" v-model="selected.value">
								<vs-select-item :vs-value="true" vs-text="Allow" />
								<vs-select-item :vs-value="false" vs-text="Deny" />
							</vs-select>
						</b-field>

					</section>
					<br>
					<button v-if="selected.names.length && selected.scope && selected.value !== null" class="button is-success has-text-centered" @click="setPerm(selected)">Set Permission</button>
				</div>
				<div class="column is-half">
					<p>Refer to the documentation for detailed information on each permission.</p>
					<p>As of now, assigning permissions to users is only available by running the setperm command in-server.</p>

				</div>

			</div>
		</div>
	</section>
    
</template>

<script>
import API from "~/API.js";
import secret from '~/secrets';
import { mapGetters } from "vuex";
export default {
    name: "FoxPermissions",
    head() {
		return {
			title: 'Mr.Fox Bot - Server Permissions',	
		}
    },
    async fetch({ store, app, params: { guildid } }) {
		if (store.state.cachedGuild) return;
        const token = app.$auth.getToken('discord');
        const { data: guild } = await app.$axios.get(`/api/guilds/${guildid}`, { headers: { Authorization: secret.encrypt(app.$auth.user.id) } });
       
		store.commit('cacheGuild', guild);
		store.commit('toggleDash', true);
    },
    async asyncData({ app, params: { guildid }, route }) {
        const page = route.path.split(guildid + '/')[1].replace(/\w\S*/g, txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
        let { data: permissions } = await app.$axios.get(`/api/permissions`);
        const array = [];
        for (const key of Object.keys(permissions)) {
            for (const perm of permissions[key]) {
                array.push(perm.name);
            }
        }
        permissions = array.sort();
		const { data: channels } =  await app.$axios.get(`/api/guilds/${guildid}/channels`, { headers: { Authorization: secret.encrypt(app.$auth.user.id) } });
        const { data: roles } =  await app.$axios.get(`/api/guilds/${guildid}/roles`, { headers: { Authorization: secret.encrypt(app.$auth.user.id) } });
        return {
            permissions, 
            roles, 
            channels
        }

    },
    data() {
        return {
            loading: false,
            permissions: null,
            roles: null,
            channels: null,
            selected: {
                names: [],
                scope: null,
                value: null,
                target: null,
                channel: null
            },
            commands: null
        };
    },
    methods: {
        async setPerm(data) {
            data.guildID = this.$route.params.guildid;
            if (!this.selected.scope === "everyone" && !data.target) {
                return this.$snackbar.open({
                    message: "Please specify a target.",
                    type: "is-danger",
                    position: "is-top",
                    indefinite: true
                });
            }
            if (this.selected.scope === "everyone") data.target = data.guildid;
            if (this.selected.scope === "channelrole" && !this.selected.channel) {
                return this.$snackbar.open({
                    message: "Please specify channel for scope.",
                    type: "is-danger",
                    position: "is-top",
                    indefinite: true
                });
            }
            data.target = data.channel ? data.channel + data.target : data.target;

            try {
                for (const name of data.names) {
                    data.name = name;
                    await API.setPermission(data, this.$auth.user.id);
                }
                this.$toast.open({
                    message: `Successfully added permission.`,
                    type: "is-success",
                    duration: 3800
                });
                this.selected.channel = null;
            } catch (error) {
                this.$dialog.alert({
                    title: "Error",
                    message: `There was an error adding this permission."${error.message}"`,
                    type: "is-danger"
                });
            }
        }
    }
};
</script>
