<template>
  <section class="section">
    <div class="container">
      <nav class="level is-mobile">
        <div class="level-left">
          <h1 class="title has-text-white has-text-left">&nbsp;Giveaways</h1>
        </div>
        <div class="level-left">
          <a class="button is-danger" @click="confirmPkg('Giveaways')"><p class="has-text-weight-bold">Disable</p></a>
        </div>
      </nav>
      <div class="is-divider"/>
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
                  <br>
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
                        <button v-if="!gw.running" class="button is-small is-danger" @click="gwAction(gw, 'delete')">
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

                    <span v-if="!gw.paused && gw.running">
                      - Time Remaining: {{ gw.timeRemaining }}
                      <br>
                      - Max Winners: {{ gw.maxWinners }}
                      <br>
                      - Channel: <a id="channel" :href="`https://discordapp.com/channels/${$route.params.guildid}/${gw.channel.id}`" target="_blank">#{{ gw.channel.name }}</a>
                    </span>
                    <span v-else-if="gw.paused"> 
                      <br>
                      - Channel: <a id="channel" :href="`https://discordapp.com/channels/${$route.params.guildid}/${gw.channel.id}`" target="_blank">#{{ gw.channel.name }}</a>
                    </span>
                    <span v-else>
                      - Channel: <a id="channel" :href="`https://discordapp.com/channels/${$route.params.guildid}/${gw.channel.id}`" target="_blank">#{{ gw.channel.name }}</a>
                      <br>
                      - Ended: {{ gw.endDate }}
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
      <div class="is-divider"/>
    </div>
    <div class="container" style="position: relative">
      <h1 class="title has-text-white has-text-left">Commands</h1>
      <div v-for="command of commands" :key="command.name" class="box">
        <div class="content">
          <h1 class="has-text-white has-text-left">
            {{ command.name }}
            <b-switch :ref="`${command.name}-switch`" :disabled="isLoading" :value="command.enabled" size="is-medium" type="is-primary"
                      @input="toggleCommand(command.name, !command.enabled)"/>
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
          <form id="gw" @submit.prevent="validateForm">
            <b-field :type="{ 'is-danger': errors.has('giveaway name') }" :message="errors.first('giveaway name')" label="Giveaway name" custom-class="has-text-white">
              <b-input v-validate="'required|max:20'" v-model="gw.name" name="giveaway name"/>
            </b-field>
            <b-field :type="{ 'is-danger': errors.has('duration') }" :message="errors.first('duration')" label="Duration" custom-class="has-text-white">
              <b-input v-validate="'required|max:4'" v-model="gw.time" name="duration"/>
            </b-field>
            <b-field :type="{ 'is-danger': errors.has('max winners') }" :message="errors.first('max winners')" label="Maximum # of Winners" custom-class="has-text-white">
              <b-input v-validate="'required|integer|between:1,10'" v-model="gw.maxWinners" type="number" name="max winners"/>
            </b-field>
            <b-field :type="{ 'is-danger': errors.has('channel') }" :message="errors.first('channel')" label="Select Channel" custom-class="has-text-white">
              <b-select v-validate="'required'" v-model="gw.channel" name="channel" placeholder="None">
                <option
                  v-for="channel of channels"
                  :value="channel"
                  :key="channel.id">
                  #{{ channel.name }}
                </option>
              </b-select>
            </b-field>
            <b-field :type="{ 'is-danger': errors.has('emoji') }" :message="errors.first('emoji')" label="Select Emoji" custom-class="has-text-white">
              <b-select v-validate="'required'" v-model="gw.emoji" name="emoji" placeholder="None">
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
          <button class="button is-danger is-outlined" type="button" @click="toggleAdd= false">Close</button>
          <button class="button is-primary" type="submit" form="gw">Add</button>
        </footer>
      </div>
    </b-modal>
  </section>
</template>

<script>
import secret from "~/secrets";
import API from "~/API";
export default {
  head() {
    return {
      title: "Mr.Fox Bot - Giveaways"
    };
  },
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
    const [commands, config, channels, giveaways, emojis] = await Promise.all([
      (await app.$axios.get(`/api/commands/${page}?guildID=${guildid} `, {
        headers: { Authorization: secret.encrypt(app.$auth.user.id) }
      })).data,
      (await app.$axios.get(`/api/guilds/${guildid}/config`, {
        headers: { Authorization: secret.encrypt(app.$auth.user.id) }
      })).data,
      (await app.$axios.get(`/api/guilds/${guildid}/channels`, {
        headers: { Authorization: secret.encrypt(app.$auth.user.id) }
      })).data,
      (await app.$axios.get(`/api/guilds/${guildid}/giveaways`, {
        headers: { Authorization: secret.encrypt(app.$auth.user.id) }
      })).data,
      (await app.$axios.get(`/api/guilds/${guildid}/emojis`)).data
    ]);
    return {
      commands,
      config,
      channels,
      giveaways,
      emojis
    };
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
    };
  },
  methods: {
    async validateForm() {
      const result = await this.$validator.validateAll();
      result ? this.saveGw(this.gw) : this.$toast.open("Incorrect parameters.");
    },
    async gwAction(gw, action) {
      this.$dialog.confirm({
        title: `${action.replace(
          /\w\S*/g,
          txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
        )} Giveaway`,
        message: `Are you sure that you'd like to ${action} this giveaway?`,
        cancelText: "No",
        confirmText: "Yes",
        type:
          action === "delete" || action === "end" ? "is-danger" : "is-primary",
        onConfirm: async () => {
          this.$nuxt.$loading.start();
          try {
            if (action !== "delete") {
              ({ data: this.giveaways } = await this.$axios.patch(
                `/api/guilds/${this.$route.params.guildid}/giveaways/${
                  gw.name
                }`,
                {
                  action
                },
                {
                  progress: false,
                  headers: { Authorization: secret.encrypt(this.$auth.user.id) }
                }
              ));
            } else {
              ({ data: this.giveaways } = await this.$axios.delete(
                `/api/guilds/${this.$route.params.guildid}/giveaways/${
                  gw.name
                }`,
                {
                  headers: { Authorization: secret.encrypt(this.$auth.user.id) }
                }
              ));
              this.$toast.open({
                message: "Successfully deleted giveaway.",
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
    async saveGw(gw) {
      if (!this.spanMs(gw.time))
        return this.$snackbar.open({
          indefinite: true,
          message: `Invalid time format. Format is number + span. Ex: 40m or 5w`,
          type: "is-warning",
          position: "is-top",
          actionText: "Ok"
        });
      try {
        this.$nuxt.$loading.start();
        ({ data: this.giveaways } = await this.$axios.post(
          `/api/guilds/${this.$route.params.guildid}/giveaways`,
          {
            name: gw.name,
            time: gw.time,
            channel: gw.channel,
            maxWinners: parseInt(gw.maxWinners),
            reactionEmote: gw.emoji
          },
          {
            progress: false,
            headers: { Authorization: secret.encrypt(this.$auth.user.id) }
          }
        ));
        this.toggleAdd = false;
        for (const item in gw) {
          gw[item] = null;
        }
        this.$toast.open({
          message: "Successfully started giveaway.",
          type: "is-primary"
        });
      } catch (error) {
        this.$nuxt.$loading.fail();
        this.$dialog.alert({
          title: "Error",
          message: `There was an error starting this giveaway. "${
            error.message
          }"`,
          type: "is-danger"
        });
      } finally {
        this.$nuxt.$loading.finish();
      }
    },
    async settingUpdate(key, value, options = {}) {
      try {
        this.config = await API.settingUpdate(
          key,
          value,
          this.$route.params.guildid,
          this.$auth.user.id,
          options
        );
        this.$snackbar.open({
          message:
            value instanceof Object
              ? `Saved ${options.meta} as ${value.name}`
              : `Toggled ${key} to ${
                  typeof value === "boolean" ? (value ? "On" : "Off") : value
                }`,
          type: "is-primary",
          position: "is-bottom-left",
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
          this.config = await API.settingArrayUpdate(
            key,
            obj[key],
            this.$route.params.guildid,
            this.$auth.user.id,
            { array: true }
          );
        }
        this.$snackbar.open({
          message: `Successfully saved settings.`,
          type: "is-primary",
          position: "is-bottom-left",
          actionText: null,
          duration: 3500
        });
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
        await API.toggleCommand(
          data,
          this.$route.params.guildid,
          bool,
          this.$auth.user.id
        );
        this.commands = await API.pkgCommands(
          this.$route.path
            .split(this.$route.params.guildid + "/")[1]
            .replace(
              /\w\S*/g,
              txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
            ),
          this.$route.params.guildid,
          this.$auth.user.id
        );
        this.$snackbar.open({
          message: `Togged ${data} to ${bool ? "On" : "Off"}`,
          type: "is-primary",
          position: "is-bottom-left",
          actionText: null,
          duration: 3500
        });
      } catch (error) {
        this.$snackbar.open({
          message: `Unable to edit this command: ${error.message}`,
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
            message: `There was an error disabling this package.\n"${
              error.message
            }"`,
            type: "is-danger",
            hasIcon: true,
            icon: "times-circle",
            iconPack: "fa"
          });
        });
    },
    spanMs(span) {
      if (typeof span !== "string") return null;
      let total = 0;
      const amounts = span.split(/[a-z]/);
      amounts.splice(-1);
      const units = span.split(/\d+/);
      units.shift();
      for (let i = 0; i < units.length; i++) {
        amounts[i] = parseFloat(amounts[i]);
        let mult = 0;
        switch (units[i]) {
          case "w":
            mult = 604800000;
            break;
          case "d":
            mult = 86400000;
            break;
          case "h":
            mult = 3600000;
            break;
          case "m":
            mult = 60000;
            break;
          case "s":
            mult = 1000;
            break;
          default:
            mult = null;
            break;
        }
        total += mult * amounts[i];
      }
      return total;
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
