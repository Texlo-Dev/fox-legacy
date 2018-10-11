<template>
   <section class="section">
      <div class="container">
         <nav class="level is-mobile">
            <div class="level-left">
               <h1 class="title has-text-white has-text-left">&nbsp;Giveaways</h1>
            </div>
            <div class="level-left">
               <a class="button is-danger" @click="confirmPkg('Giveaways')">Disable</a>
            </div>
         </nav>
         <div class="is-divider"></div>
      </div>
      <div class="container">
         <div class="columns">
            <div class="column is-multiline">
               <div class="box">
                  <nav class="level">
                        <div class="level-left">
                            <div class="level-item">
                                <h1 class="title has-text-left has-text-white">Recent Giveaways</h1>
                            </div>
                            <div class="level-item">
                                <button class="button is-grey is-rounded" @click="toggleAdd = true">
                                    Add Giveaway <font-awesome-icon size="0.8x" pull="right" icon="plus"/>
                                </button>
                            </div>
                        </div>
                  </nav>
                  <div v-if="giveaways.length" class="columns is-multiline">
                     <div v-for="gw of giveaways" :key="gw.name" class="column is-one-third">
                        <div class="box" style="background-color: #34383c">
                           <div class="content">
                              <span>
                                 <p class="subtitle has-text-white">
                                    {{ gw.name }}
                                    <b-tag v-if="gw.paused" class="is-warning">Paused</b-tag>
                                    <b-tag v-else-if="gw.running" class="is-success">Running</b-tag>
                                    <b-tag v-else-if="!gw.running" class="is-pink">Ended</b-tag>
                                    &nbsp;<button v-if="!gw.running" class="button is-link is-small" @click="gwAction(gw, 'reroll')">
                                        Reroll <font-awesome-icon size="0.8x" pull="right" icon="redo"/>
                                    </button>
                                    <button v-if="!gw.running" @click="gwAction(gw, 'delete')" class="button is-small is-danger">
                                        Delete <font-awesome-icon size="0.8x" pull="right" icon="trash-alt"/>
                                    </button>
                                    <button v-if="gw.running && !gw.paused" class="button is-warning is-small" @click="gwAction(gw, 'pause')">
                                        Pause <font-awesome-icon size="0.8x" pull="right" icon="pause"/>
                                    </button>
                                    <button v-if="gw.paused" class="button is-primary is-small" @click="gwAction(gw, 'resume')">
                                        Resume <font-awesome-icon size="0.8x" pull="right" icon="play"/>
                                    </button>
                                    <button v-if="gw.running" class="button is-danger is-small" @click="gwAction(gw, 'end')">
                                        End <font-awesome-icon size="0.8x" pull="right" icon="ban"/>
                                    </button>
                                 </p>
                              </span>
                              <br>
                              <span v-if="!gw.paused && gw.running">
                              - Ends: {{ [gw.timeRemaining, 'milliseconds'] | duration('humanize', true) }}
                              <br>
                              - Max Winners: {{ gw.maxWinners }}
                              <br>
                              - Channel: <a target="_blank" id="channel" :href="`https://discordapp.com/channels/${$route.params.guildid}/${gw.channel.id}`">#{{ gw.channel.name }}</a>
                              </span>
                              <span v-else-if="gw.paused"> 
                                - Channel: <a target="_blank" id="channel" :href="`https://discordapp.com/channels/${$route.params.guildid}/${gw.channel.id}`">#{{ gw.channel.name }}</a>
                              </span>
                              <span v-else>
                              - Ended: {{ new Date(gw.endDate) | moment('MM/DD/YY [at] h:mm A') }}
                              <br>
                               - Channel: <a target="_blank" id="channel" :href="`https://discordapp.com/channels/${$route.params.guildid}/${gw.channel.id}`">#{{ gw.channel.name }}</a>
                              <br>
                              - Winners: {{ gw.winners.map(w => `${w.username}#${w.discriminator}`).join(', ') || 'None' }}
                              </span>
                           </div>
                        </div>
                     </div>
                  </div>
                  <div v-else>
                     <p>No giveaways found. Click the "Add Giveaway" button to start a giveaway.</p>
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
               <p class="modal-card-title">New Giveaway</p>
            </header>
            <section class="modal-card-body">
               <b-field label="Giveaway name" custom-class="has-text-white">
                  <b-input maxlength="20" v-model="gw.name"></b-input>
               </b-field>
               <b-field label="Duration" custom-class="has-text-white">
                  <b-input maxlength="4" v-model="gw.time"></b-input>
               </b-field>
               <b-field label="Maximum # of Winners" custom-class="has-text-white">
                  <b-input type="number" min=1 max=10 v-model="gw.maxWinners"></b-input>
               </b-field>
               <b-field label="Select Channel" custom-class="has-text-white">
                  <vs-select class="selectExample" label="Figuras" v-model="gw.channel">
                     <vs-select-item :key="channel.id" :vs-value="channel" :vs-text="channel.name" v-for="channel of channels" />
                  </vs-select>
               </b-field>
               <b-field label="Select Emoji" custom-class="has-text-white">
                  <vs-select class="selectExample" label="Figuras" v-model="gw.emoji">
                     <vs-select-item :key="emoji.id" :vs-value="emoji" :vs-text="emoji.name" v-for="emoji of emojis" />
                  </vs-select>
               </b-field>
            </section>
            <footer class="modal-card-foot">
               <button class="button" type="button" @click="toggleAdd= false">Close</button>
               <button class="button is-primary" type="button" @click="saveGw(gw)">Add</button>
            </footer>
         </div>
      </b-modal>
   </section>
</template>

<script>
import secret from '~/secrets';
import API from '~/API';
export default {
    head() {
		return {
			title: 'Mr.Fox Bot - Giveaways',	
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
		const { data: config } =  await app.$axios.get(`/api/guilds/${guildid}/config`, { headers: { Authorization: secret.encrypt(app.$auth.user.id) } })
        const { data: channels } =  await app.$axios.get(`/api/guilds/${guildid}/channels`, { headers: { Authorization: secret.encrypt(app.$auth.user.id) } });
        const { data: giveaways } = await app.$axios.get(`/api/guilds/${guildid}/giveaways`, { headers: { Authorization: secret.encrypt(app.$auth.user.id) } });
        const { data: emojis } =  await app.$axios.get(`/api/guilds/${guildid}/emojis`);
        return {
            commands,
            config,
            channels, 
            giveaways, 
            emojis
        }

    },
    data() {
        return {
            commands: null,
            currentPage: 1,
            config: null,
            channels: null,
            emojis: null,
            toggleAdd: false,
            gw: {
                name: null,
                time: null,
                channel: null,
                maxWinners: null,
                emoji: null
            },
            giveaways: null
        }
    },
    methods: {
        async gwAction(gw, action) {
            this.$dialog.confirm({
                title: `${action.replace(/\w\S*/g, txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase())} Giveaway`,
                message: `Are you sure that you'd like to ${action} this giveaway?`,
                cancelText: "No",
                confirmText: "Yes",
                type: action === 'delete' || action === 'end' ? 'is-danger' : 'is-primary',
                onConfirm: async () => {
                    this.$nuxt.$loading.start();
                    try {
                        if (action !== 'delete') {
                            ({ data: this.giveaways } = await this.$axios.patch(`/api/guilds/${this.$route.params.guildid}/giveaways/${gw.name}`, { 
                                action
                            }, { progress: false, headers: { Authorization: secret.encrypt(this.$auth.user.id) } }));
                        } else {
                            ({ data: this.giveaways } = await this.$axios.delete(`/api/guilds/${this.$route.params.guildid}/giveaways/${gw.name}`, { 
                                headers: { Authorization: secret.encrypt(this.$auth.user.id) }
                            }));
                            this.$toast.open({
                                message: 'Successfully deleted giveaway.',
                                type: 'is-primary'
                            });
                        }
                    } catch (error) {
                        this.$nuxt.$loading.fail();
                        this.$dialog.alert({
                            title: "Error",
                            message: `There was an error performing this action. "${error.message}"`,
                            type: "is-danger"
                        });
                    } finally { this.$nuxt.$loading.finish() }
                }
            })

        },
        async saveGw(gw) {
            for (const item in gw) {
                if (!gw[item]) return this.$snackbar.open({
                    indefinite: true,
                    message: `Missing option: ${item}`,
                    type: 'is-warning',
                    position: 'is-top',
                    actionText: 'Ok',
                })
            }
            if (!this.spanMs(gw.time)) return this.$snackbar.open({
                    indefinite: true,
                    message: `Invalid time format. Format is number + span. Ex: 40m or 5w`,
                    type: 'is-warning',
                    position: 'is-top',
                    actionText: 'Ok',
                })
            try {
                this.$nuxt.$loading.start();
                ({ data: this.giveaways } = await this.$axios.post(`/api/guilds/${this.$route.params.guildid}/giveaways`, {
                    name: gw.name,
                    time: gw.time,
                    channel: gw.channel,
                    maxWinners: parseInt(gw.maxWinners),
                    reactionEmote: gw.emoji
                }, {
                    progress: false,
                    headers: { Authorization: secret.encrypt(this.$auth.user.id) }
                }));
                this.toggleAdd = false;
                for (const item in gw) { gw[item] = null };
                this.$toast.open({
                    message: 'Successfully started giveaway.',
                    type: 'is-primary'
                });
            } catch (error) {
                this.$nuxt.$loading.fail();
                this.$dialog.alert({
                    title: "Error",
                    message: `There was an error starting this giveaway. "${error.message}"`,
                    type: "is-danger"
                });
            } finally { this.$nuxt.$loading.finish() }      
        },
        async toggleCommand(data, bool) {
            if (!data) return;

            try {
                await API.toggleCommand(data, this.$route.params.guildid, bool, this.$auth.user.id);
                this.commands = await API.pkgCommands("Giveaways", this.$route.params.guildid, this.$auth.user.id);
            } catch (error) {
                this.$toast.open({
                    message: `Unable to edit this command: API_ERROR`,
                    type: "is-danger"
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
        },
        spanMs(span) {
            if (typeof span !== 'string') return null;
            let total = 0;
            const amounts = span.split(/[a-z]/); amounts.splice(-1);
            const units = span.split(/\d+/); units.shift();
            for (let i = 0; i < units.length; i++) {
                amounts[i] = parseFloat(amounts[i]);
                let mult = 0;
                switch (units[i]) {
                    case 'w' :
                        mult = 604800000; break;
                    case 'd':
                        mult = 86400000; break;
                    case 'h':
                        mult = 3600000; break;
                    case 'm':
                        mult = 60000; break;
                    case 's':
                        mult = 1000; break;
                    default:
                        mult = null; break;
                }
            total += mult * amounts[i];
        }
        return total;
    } 
    }

}
</script>

<style>
    .selectExample .input-select {
        color: #242424;
    }
</style>
