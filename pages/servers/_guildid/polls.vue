<template>
<section class="section">
    <div class="container">
        <nav class="level is-mobile">
			<div class="level-left">
				<h1 class="title has-text-white has-text-left">&nbsp;Polls</h1>
			</div>
		    <div class="level-left">
				<a class="button is-danger" @click="confirmPkg('Polls')">Disable</a>
			</div>
		</nav>
		<div class="is-divider"></div>
    </div>
    <div class="container">
        <div class="columns">
            <div class="column is-multiline">
                <div class="box">
                    <div class="content">
                        <nav class="level">
                            <div class="level-left">
                                <div class="level-item">
                                    <h1 class="title has-text-left has-text-white">Current Polls</h1>
                                </div>
                                <div class="level-item">
                                    <button class="button is-grey is-rounded" @click="toggleAdd = true">
                                        Add Poll <font-awesome-icon size="0.8x" pull="right" icon="plus"/>
                                    </button>
                                </div>
                            </div>
                        </nav>
                        <div v-if="polls.length" class="columns is-multiline">
                            <div v-for="poll of polls" :key="poll.name" class="column is-one-quarter">
                                <div class="box" style="background-color: #34383c">
                                    <div class="content">
                                        <span>
                                            <p class="subtitle has-text-white">
                                                {{ poll.question }}
                                                <br><br>
                                                <b-tag v-if="poll.open" class="is-success">Open</b-tag>
                                                <b-tag v-else class="is-pink">Closed</b-tag>
                                                &nbsp;<button v-if="!poll.open" @click="pollAction(poll, 'delete')" class="button is-small is-danger">
                                                    Delete <font-awesome-icon size="0.8x" pull="right" icon="trash-alt"/>
                                                </button>
                                                <button v-else @click="pollAction(poll, 'close')" class="button is-small is-pink">
                                                    Stop <font-awesome-icon size="0.8x" pull="right" icon="stop"/>
                                                </button>
                                            </p>
                                            <span>
                                                - Type: {{ poll.type === 'simple' ? 'Simple': 'Open-Ended' }}
                                                <br>
                                                - Channel: <a target="_blank" id="channel" :href="`https://discordapp.com/channels/${$route.params.guildid}/${poll.channel.id}`">#{{ poll.channel.name }}</a>
                                            </span>
                                            <pie-chart v-if="!poll.open && showChart" :data="createChart(poll)" ></pie-chart>

                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div v-else>
                            <p>No Polls found. Click the "Add Polls" button to get started.</p>
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
						<b-switch size='is-medium' :ref="`${command.name}-switch`" :disabled="isLoading" @input="toggleCommand(command.name, !command.enabled)" :value="command.enabled" type="is-success">
						</b-switch>
					</h1>

					<p>{{ command.description }}</p>
				</div>
			</div>
    </div>
    <b-modal :active.sync="toggleAdd" has-modal-card>
         <div class="modal-card">
            <header class="modal-card-head">
               <p class="modal-card-title">New Poll</p>
            </header>
            <section class="modal-card-body">
               <b-field label="Poll Name" custom-class="has-text-white">
                  <b-input maxlength="20" v-model="plData.name"></b-input>
               </b-field>
               <b-field label="Question" custom-class="has-text-white">
                  <b-input maxlength="75" v-model="plData.question"></b-input>
               </b-field>
               <b-field label="Select Channel" custom-class="has-text-white">
                  <vs-select class="selectExample" label="Figuras" v-model="plData.channel">
                     <vs-select-item :key="channel.id" :vs-value="channel" :vs-text="channel.name" v-for="channel of channels" />
                  </vs-select>
               </b-field>
               <b-field label="Choose Type" custom-class="has-text-white">
                  <vs-select class="selectExample" label="Figuras" v-model="plData.type">
                      <vs-select-item vs-value="simple" vs-text="Simple" />
                     <vs-select-item vs-value="open" vs-text="Open-Ended" />
                  </vs-select>
               </b-field>
               <b-field v-if="plData.type === 'open'">
                   <button class="button is-small is-rounded is-black" @click="respAdd = true">
                        Add Response <font-awesome-icon size="0.8x" pull="right" icon="plus"/>
                    </button>
                    <b-taginput v-if="respAdd"
						v-model="plData.responses"
						ellipsis
						rounded
                        size="is-small"
                        maxtags="4"
                        maxlength="35"
						placeholder="Add Response"
						custom-class="has-text-white">
					</b-taginput>
               </b-field>
            </section>
            <footer class="modal-card-foot">
               <button class="button" type="button" @click="toggleAdd = false">Close</button>
               <button class="button is-success" type="button" @click="savePoll(plData)">Add</button>
            </footer>
         </div>
      </b-modal>
</section>
    
</template>

<script>
import secret from '~/secrets';
import API from '~/API';
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
        const { data: channels } =  await app.$axios.get(`/api/guilds/${guildid}/channels`, { headers: { Authorization: secret.encrypt(app.$auth.user.id) } });
        const { data: polls } = await app.$axios.get(`/api/guilds/${guildid}/polls`, { headers: { Authorization: secret.encrypt(app.$auth.user.id) } });
        return {
            commands, 
            config, 
            polls,
            channels
        }

    },

    data: () => ({
        channels: null,
        config: null,
        polls: null,
        toggleAdd: false,
        respAdd: false,
        plData: {
            name: null,
            type: null,
            question: null,
            channel: null,
            currentResp: '',
            responses: []
        },
        showChart: false,
        commands: null
    }),
    mounted() {
        this.showChart = true;
    },
    methods: {
        async pollAction(poll, action) {
            this.$dialog.confirm({
                title: `${action.replace(/\w\S*/g, txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase())} Poll`,
                message: `Are you sure that you'd like to ${action} this poll?`,
                cancelText: "No",
                confirmText: "Yes",
                type: action === 'delete' || action === 'end' ? 'is-danger' : 'is-success',
                onConfirm: async () => {
                    this.$nuxt.$loading.start();
                    try {
                        if (action !== 'delete') {
                            ({ data: this.polls } = await this.$axios.patch(`/api/guilds/${this.$route.params.guildid}/polls/${poll.name}`, { 
                                action
                            }, { progress: false, headers: { Authorization: secret.encrypt(this.$auth.user.id) } }));
                        } else {
                            ({ data: this.polls } = await this.$axios.delete(`/api/guilds/${this.$route.params.guildid}/polls/${poll.name}`, { 
                                headers: { Authorization: secret.encrypt(this.$auth.user.id) }
                            }));
                            this.$toast.open({
                                message: 'Successfully deleted poll.',
                                type: 'is-success'
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
        async savePoll(poll) {
            if (poll.name.includes('?') || poll.name.includes('%')) return this.$dialog.alert({
                title: "Prohibited Characters",
                description: 'Prohibited character detected in poll name.'
            });
            this.$nuxt.$loading.start();
            try {
                if (!poll.responses.length) poll.responses = ['Yes <:checkmark:495362807731060757>', 'No <:nicexmark:495362785010647041>', 'Maybe 🤷'];
                ({ data: this.polls } = await this.$axios.post(`/api/guilds/${this.$route.params.guildid}/polls`, {
                    name: poll.name.trim(),
                    type: poll.type,
                    question: poll.question,
                    possibleAnswers: poll.responses,
                    channel: poll.channel
                }, { progress: false, headers: { Authorization: secret.encrypt(this.$auth.user.id) } }));
                for (const key of Object.keys(this.plData)) { 
                    if (key === 'responses') this.plData[key] = [];
                    else this.plData[key] = null 
                };
                this.toggleAdd = false;
            } catch (error) {
                this.$nuxt.$loading.fail;
                this.$dialog.alert({
                    title: "Error",
                    message: `There was an error adding this poll.\n"${error.message}"`,
                    type: "is-danger",
                    hasIcon: true,
                    icon: "times-circle",
                    iconPack: "fa"
                });
            } finally { this.$nuxt.$loading.finish() }

        },
        saveResp(resp) {
            this.plData.responses.push(resp);
            this.plData.currentResp = '',
            this.respAdd = false;
        },
        createChart(poll) {
            const chartData = {
                labels: [],
                datasets: [{ 
                    data: []
                }]
            }
            for (const resp of poll.responses) {
                chartData.labels.push(resp.name.split(' ')[0]);
                chartData.datasets[0].backgroundColor = ['#3fb97c','#c34e4e', '#f37934'];
                chartData.datasets[0].data.push(resp.count);
            };

            return chartData;
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

</style>
