<template>
    <section class="section">
        <div class="container">
         <nav class="level is-mobile">
            <div class="level-left">
               <h1 style="font-size: 25px" class="title has-text-white has-text-left">Custom Commands</h1>
            </div>
            <div class="level-right">
               <a class="button is-danger" @click="confirmPkg('Custom Commands')"><p class="has-text-weight-bold">Disable</p></a>
            </div>
         </nav>
         <div class="is-divider"></div>
      </div>
      <div class="container" style="position: relative">
            <nav class="level">
                <div class="level-left">
                    <div class="level-item">
                        <h1 class="title has-text-left has-text-white">Commands</h1>
                    </div>
                    <div class="level-item">
                        <button class="button is-grey-darker is-rounded" @click="toggleAdd = true">
                            New Command <font-awesome-icon size="0.8x" pull="right" icon="plus"/>
                        </button>
                    </div>
                </div>
            </nav>
            <div v-if="!commands.length" class="box">
                <div class="content">
                    <p>You don't have any custom commands. Click the "New Command" Button to create a command.</p>
                </div>
            </div>
            <div v-else v-for="command of commands" :key="command.name" class="box">
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

        <b-modal :active.sync="toggleAdd" has-modal-card>
            <div class="modal-card">
                <header class="modal-card-head">
                    <p class="modal-card-title">Add Command</p>
                </header>
                <section class="modal-card-body">
                    <b-field custom-class="has-text-white" label="Command Name">
                        <b-input v-model="custCommand.name"></b-input>
                    </b-field>
                    <b-field custom-class="has-text-white" label="Command Description">
                        <b-input v-model="custCommand.description" maxlength="50"></b-input>

                    </b-field>
                    <b-field custom-class="has-text-white" label="Command Response">
                        <b-input v-model="custCommand.template" type="textarea" maxlength="2000"></b-input>
                    </b-field>
                    <b-field custom-class="has-text-white" label="Command Cooldown (In Seconds)">
                        <b-input type="number" min="1"></b-input>
                    </b-field>
                    <b-field custom-class="has-text-white" label="Command Required Permissions (Optional)">
                            <vs-select vs-multiple v-model="custCommand.requiredPerms">
                                <div :key="category" v-for="(key, category) in permissions">
                                     <vs-select-group :title="category">
                                        <vs-select-item :key="perm.name" :vs-value="perm.name" :vs-text="perm.name" v-for="perm of permissions[category]"/>
                                    </vs-select-group>
                                </div>     
                            </vs-select>
					</b-field>
                    <div class="field">
                        <b-switch type="is-primary" v-model="custCommand.deleteCmmand">
                            <p class="has-text-white has-text-weight-bold">Delete Command after execution?</p>
                        </b-switch>
                    </div>
                    <div class="field">
                        <b-switch type="is-primary" v-model="custCommand.dmCommand">
                            <p class="has-text-white has-text-weight-bold">DM Command?</p>
                        </b-switch>
                    </div>
                </section>
                <footer class="modal-card-foot">
                        <button class="button" type="button" @click="toggleAdd= false">Close</button>
                        <button class="button is-primary" type="button" @click="saveCommand(custCommand)">Add</button>
                    </footer>
            </div>
        </b-modal>
    </section>
</template>

<script>
import API from '~/API';
import secret from '~/secrets';
export default {
    head: () => ({
        title: 'Mr.Fox Bot - Custom Commands'
    }),
    async fetch({ store, app, params: { guildid } }) {
		if (store.state.cachedGuild) return;
        const token = app.$auth.getToken('discord');
        const { data: guild } = await app.$axios.get(`/api/guilds/${guildid}`, { headers: { Authorization: secret.encrypt(app.$auth.user.id) } });
       
		store.commit('cacheGuild', guild);
		store.commit('toggleDash', true);
    },
    async asyncData({ app, route, params: { guildid }}) {
        const { data: permissions } = await app.$axios.get(`/api/permissions`);
        const { data: commands } = await app.$axios.get(`/api/guilds/${guildid}/customcommands `, { headers: { Authorization: secret.encrypt(app.$auth.user.id) } });
		const { data: config } =  await app.$axios.get(`/api/guilds/${guildid}/config`, { headers: { Authorization: secret.encrypt(app.$auth.user.id) } });
        return {
            commands,
            config,
            permissions
        }
    },
    data: () => ({
        commands: null,
        config: null,
        permissions: null,
        toggleAdd: false,
        custCommand: {
            name: null,
            description: null,
            deleteCommand: false,
            dmCommand: false,
            requiredPerms: [],
            template: null
        }
    }),
    methods: {
        async saveCommand(command) {
            for (const key in command) {
                if (key !== 'requiredPerms' && key !== 'template' && command[key] == null) return this.$snackbar.open({
                    message: `Missing Parameter: ${key}.`,
                    type: 'is-warning',
                    actionText: 'Retry',
                    indefinite: true,
                    position: 'is-top'
                }) 
                else if (key === 'template' && !command[key]) {
                    
                }
            }
            try {
                ({ data: this.commands } = await this.$axios.post(`/api/guilds/${this.route.params.guildid}/customcommands`, command, {
                    headers: {
                        Authorization: secret.encrypt(this.$auth.user.id)
                    }
                }));
            } catch (error) {
                this.$dialog.alert({
                    title: "Error",
                    message: `There was an error performing this action. "${error.message}"`,
                    type: "is-danger"
                });

            }

        }

    }

}
</script>

