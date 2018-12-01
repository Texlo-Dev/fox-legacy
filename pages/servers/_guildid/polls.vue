<template>
  <section class="section">
    <div class="container">
      <nav class="level is-mobile">
        <div class="level-left">
          <h1 class="title has-text-white has-text-left">&nbsp;Polls</h1>
        </div>
        <div class="level-left">
          <a class="button is-danger" @click="confirmPkg('Polls')"><p class="has-text-weight-bold">Disable</p></a>
        </div>
      </nav>
      <div class="is-divider"/>
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
                          &nbsp;<button v-if="!poll.open" class="button is-small is-danger" @click="pollAction(poll, 'delete')">
                            Delete <font-awesome-icon size="0.8x" pull="right" icon="trash-alt"/>
                          </button>
                          <button v-else class="button is-small is-pink" @click="pollAction(poll, 'close')">
                            Stop <font-awesome-icon size="0.8x" pull="right" icon="stop"/>
                          </button>
                        </p>
                        <span>
                          - Type: {{ poll.type === 'simple' ? 'Simple': 'Open-Ended' }}
                          <br>
                          - Channel: <a id="channel" :href="`https://discordapp.com/channels/${$route.params.guildid}/${poll.channel.id}`" target="_blank">#{{ poll.channel.name }}</a>
                        </span>
                        <pie-chart v-if="!poll.open && showChart" :data="createChart(poll)" />

                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div v-else>
                <p>No Polls found. Click the "Add Poll" button to get started.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="is-divider"/>
    </div>
    <div class="container" style="position: relative">
      <h1 class="title has-text-white has-text-left">Commands</h1>
      <div v-for="command of commands" :key="command.name" class="box">
        <div class="content">
          <h1 class="has-text-white has-text-left">
            {{ command.name }}
            <b-switch :ref="`${command.name}-switch`" :value="command.enabled" size="is-medium" type="is-primary" @input="toggleCommand(command.name, !command.enabled)"/>
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
          <form id="polls" @submit.prevent="validateForm">
            <b-field :type="{ 'is-danger': errors.has('poll name') }" :message="errors.first('poll name')" label="Poll Name" custom-class="has-text-white">
              <b-input v-validate="'required|max:20'" v-model="plData.name" name="poll name"/>
            </b-field>
            <b-field :type="{ 'is-danger': errors.has('question') }" :message="errors.first('question')" label="Question" custom-class="has-text-white">
              <b-input v-validate="'required|max:75'" v-model="plData.question" name="giveaway name"/>
            </b-field>
            <b-field :type="{ 'is-danger': errors.has('channel') }" :message="errors.first('channel')" label="Select Channel" custom-class="has-text-white">
              <b-select v-validate="'required'" v-model="plData.channel" name="channel" placeholder="None">
                <option
                  v-for="channel of channels"
                  :value="channel"
                  :key="channel.id">
                  #{{ channel.name }}
                </option>
              </b-select>
            </b-field>
            <b-field :type="{ 'is-danger': errors.has('type') }" :message="errors.first('type')" label="Select Type" custom-class="has-text-white">
              <b-select v-validate="'required'" v-model="plData.type" name="type" placeholder="None">
                <option value="simple">Simple</option>
                <option value="open">Open-Ended</option>
              </b-select>
            </b-field>
            <b-field v-if="plData.type === 'open'">
              <b-taginput
                v-model="plData.responses"
                ellipsis
                rounded
                size="is-small"
                maxtags="4"
                maxlength="35"
                placeholder="Add Response"
                custom-class="has-text-white"/>
            </b-field>
          </form>
        </section>
        <footer class="modal-card-foot">
          <button class="button is-danger is-outlined" type="button" @click="toggleAdd = false">Close</button>
          <button class="button is-primary" type="submit" form="polls">Add</button>
        </footer>
      </div>
    </b-modal>
  </section>
    
</template>

<script>
import secret from "~/secrets";
export default {
  async fetch({ store, app, params: { guildid } }) {
    if (store.state.cachedGuild) return;
    const { data: guild } = await app.$axios.get(`/api/guilds/${guildid}`, {
      headers: { Authorization: secret.encrypt(app.$auth.user.id) }
    });

    store.commit("cacheGuild", guild);
    store.commit("toggleDash", true);
  },
  async asyncData({ app, route, params: { guildid } }) {
    const page = route.path
      .split(guildid + "/")[1]
      .replace(
        /\w\S*/g,
        txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
      );
    const [commands, config, channels, polls] = await Promise.all([
      (await app.$axios.get(`/api/commands/${page}?guildID=${guildid} `, {
        headers: { Authorization: secret.encrypt(app.$auth.user.id) }
      })).data,
      (await app.$axios.get(`/api/guilds/${guildid}/config`, {
        headers: { Authorization: secret.encrypt(app.$auth.user.id) }
      })).data,
      (await app.$axios.get(`/api/guilds/${guildid}/channels`, {
        headers: { Authorization: secret.encrypt(app.$auth.user.id) }
      })).data,
      (await app.$axios.get(`/api/guilds/${guildid}/polls`, {
        headers: { Authorization: secret.encrypt(app.$auth.user.id) }
      })).data
    ]);
    return {
      commands,
      config,
      channels,
      polls
    };
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
      currentResp: "",
      responses: []
    },
    showChart: false,
    commands: null
  }),
  mounted() {
    this.showChart = true;
  },
  methods: {
    async validateForm() {
      const result = await this.$validator.validateAll();
      result
        ? this.savePoll(this.plData)
        : this.$toast.open("Incorrect parameters.");
    },
    async pollAction(poll, action) {
      this.$dialog.confirm({
        title: `${action.replace(
          /\w\S*/g,
          txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
        )} Poll`,
        message: `Are you sure that you'd like to ${action} this poll?`,
        cancelText: "No",
        confirmText: "Yes",
        type:
          action === "delete" || action === "end" ? "is-danger" : "is-primary",
        onConfirm: async () => {
          this.$nuxt.$loading.start();
          try {
            if (action !== "delete") {
              ({ data: this.polls } = await this.$axios.patch(
                `/api/guilds/${this.$route.params.guildid}/polls/${poll.name}`,
                {
                  action
                },
                {
                  progress: false,
                  headers: { Authorization: secret.encrypt(this.$auth.user.id) }
                }
              ));
            } else {
              ({ data: this.polls } = await this.$axios.delete(
                `/api/guilds/${this.$route.params.guildid}/polls/${poll.name}`,
                {
                  headers: { Authorization: secret.encrypt(this.$auth.user.id) }
                }
              ));
              this.$toast.open({
                message: "Successfully deleted poll.",
                type: "is-primary"
              });
            }
          } catch (error) {
            this.$nuxt.$loading.fail();
            this.$dialog.alert({
              title: "Error",
              message: `There was an error performing this action. "${
                error.message
              }"`,
              type: "is-danger"
            });
          } finally {
            this.$nuxt.$loading.finish();
          }
        }
      });
    },
    async savePoll(poll) {
      if (poll.name.includes("?") || poll.name.includes("%"))
        return this.$dialog.alert({
          title: "Prohibited Characters",
          message: "Prohibited character detected in poll name."
        });
      this.$nuxt.$loading.start();
      try {
        if (!poll.responses.length && poll.type === "simple")
          poll.responses = ["Yes ✅", "No ❌", "Maybe 🤷"];
        else if (poll.responses.length < 2 && poll.type === "open")
          return this.$dialog.alert({
            title: "No responses specified",
            type: "is-danger",
            message: "You must specfify at least 2 responses."
          });
        ({ data: this.polls } = await this.$axios.post(
          `/api/guilds/${this.$route.params.guildid}/polls`,
          {
            name: poll.name.trim(),
            type: poll.type,
            question: poll.question,
            possibleAnswers: poll.responses,
            channel: poll.channel
          },
          {
            progress: false,
            headers: { Authorization: secret.encrypt(this.$auth.user.id) }
          }
        ));
        for (const key of Object.keys(this.plData)) {
          if (key === "responses") this.plData[key] = [];
          else this.plData[key] = null;
        }
        this.toggleAdd = false;
      } catch (error) {
        this.$nuxt.$loading.fail;
        this.$dialog.alert({
          title: "Error",
          message: `Error Code ${error.response.status}: ${
            error.response.data.error
          }`,
          type: "is-danger"
        });
      } finally {
        this.$nuxt.$loading.finish();
      }
    },
    saveResp(resp) {
      this.plData.responses.push(resp);
      (this.plData.currentResp = ""), (this.respAdd = false);
    },
    createChart(poll) {
      const chartData = {
        labels: [],
        datasets: [
          {
            data: []
          }
        ]
      };
      for (const resp of poll.responses) {
        chartData.labels.push(resp.name);
        chartData.datasets[0].backgroundColor = [
          "#3fb97c",
          "#c34e4e",
          "#f37934",
          "#7289da",
          "#c653ff"
        ];
        chartData.datasets[0].data.push(resp.count);
      }

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
      this.$axios
        .patch(
          `/api/guilds/${this.$route.params.guildid}/packages`,
          {
            pkg,
            guildID: this.$route.params.guildid,
            enabled: option
          },
          { headers: { Authorization: secret.encrypt(this.$auth.user.id) } }
        )
        .then(() => {
          this.$router.push({ path: `/servers/${this.$route.params.guildid}` });
        })
        .catch(error => {
          this.$dialog.alert({
            title: "Error",
            message: `Error Code ${error.response.status}: ${
              error.response.data.error
            }`,
            type: "is-danger"
          });
        });
    }
  }
};
</script>

<style>
.select select {
  background-color: #2b2f33;
}

.select.is-empty select {
  color: #eff;
}

select {
  font-family: "Poppins";
}
.select select option {
  color: #747f8d;
}
</style>
