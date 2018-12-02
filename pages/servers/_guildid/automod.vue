<template>
  <section class="section">
    <div class="container">
      <nav class="level is-mobile">
        <div class="level-left">
          <h1 class="title has-text-white has-text-left">&nbsp;Automod</h1>
        </div>
        <div class="level-left">
          <a class="button is-danger" @click="confirmPkg('Automod')"
          ><p class="has-text-weight-bold">Disable</p></a
          >
        </div>
      </nav>
      <div class="is-divider" />
    </div>
    <div v-if="!loading && config" class="container" style="position:relative">
      <h1 class="title has-text-white has-text-left">Package Settings</h1>
      <div class="columns is-multiline">
        <div class="column is-half">
          <div class="box">
            <div class="content">
              <h3 class="has-text-white has-text-left">
                Spam Protection
                <button class="button is-pink is-small is-rounded">
                  Deprecated
                </button>
                <b-switch
                  ref="spamProtected-switch"
                  :value="config.spamProtected"
                  size="is-small"
                  type="is-primary"
                  @input="settingUpdate('spamProtected', !config.spamProtected)"
                />
              </h3>
              <p>
                Helps protects against server members sending text at a very
                fast rate.
              </p>
            </div>
          </div>
        </div>
        <div class="column is-half">
          <div class="box">
            <div class="content">
              <h3 class="has-text-white has-text-left">
                Invite Protection
                <b-switch
                  ref="invProtected-switch"
                  :value="config.invProtected"
                  size="is-small"
                  type="is-primary"
                  @input="settingUpdate('invProtected', !config.invProtected)"
                />
              </h3>
              <p>
                Prevents unauthorized users from sending Discord invites from
                other servers.
              </p>
            </div>
          </div>
        </div>
        <div class="column is-half">
          <div class="box">
            <div class="content">
              <h3 class="has-text-white has-text-left">
                Bad Words
                <span v-if="config.bwProtected">
                  <b-switch
                    ref="bwProtected-switch"
                    size="is-small"
                    value="true"
                    type="is-primary"
                    @click.native="settingUpdate('bwProtected', false)"
                  />
                  <button
                    class="button is-rounded is-small is-grey"
                    @click="bwModalActive = true"
                  >
                    Manage<font-awesome-icon
                      size="1x"
                      pull="right"
                      icon="wrench"
                    />
                  </button>
                </span>
                <span v-else>
                  <b-switch
                    ref="bwProtected-switch"
                    size="is-small"
                    value="false"
                    type="is-primary"
                    @click.native="settingUpdate('bwProtected', true)"
                  />
                </span>
              </h3>
              <p>
                Blacklist specific words and phrases in your server channels.
              </p>
            </div>
          </div>
        </div>
        <div class="column is-half">
          <div class="box">
            <div class="content">
              <h3 class="has-text-white has-text-left">
                Mass Mentioning
                <span v-if="config.massProtected">
                  <b-switch
                    ref="massProtected-switch"
                    size="is-small"
                    value="true"
                    type="is-primary"
                    @click.native="settingUpdate('massProtected', false)"
                  />
                  <button
                    class="button is-rounded is-small is-grey"
                    @click="massModalActive = true"
                  >
                    Manage
                    <font-awesome-icon size="0.8x" pull="right" icon="wrench" />
                  </button>
                </span>
                <span v-else>
                  <b-switch
                    ref="massProtected-switch"
                    size="is-small"
                    value="false"
                    type="is-primary"
                    @click.native="settingUpdate('massProtected', true)"
                  />
                </span>
              </h3>
              <p>Mitigates excessive mentioning made by users.</p>
            </div>
          </div>
        </div>
      </div>
      <div class="is-divider" />
    </div>
    <div class="container" style="position: relative">
      <h1 class="title has-text-white has-text-left">Commands</h1>
      <div v-for="command of commands" :key="command.name" class="box">
        <div class="content">
          <h1 class="has-text-white has-text-left">
            {{ command.name }}
            <b-switch
              :ref="`${command.name}-switch`"
              :value="command.enabled"
              size="is-medium"
              type="is-primary"
              @input="toggleCommand(command.name, !command.enabled)"
            />
          </h1>

          <p>{{ command.description }}</p>
        </div>
      </div>
    </div>
    <b-modal
      v-if="config && channels"
      :active.sync="bwModalActive"
      size="is-large"
      has-modal-card
    >
      <div class="modal-card" style="width: auto">
        <header class="modal-card-head">
          <p class="modal-card-title">Bad Words</p>
        </header>
        <section class="modal-card-body">
          <b-field custom-class="has-text-white" label="Word List">
            <b-taginput
              v-model="config.badWords"
              :before-adding="tag => !config.badWords.includes(tag)"
              ellipsis
              attached
              type="is-grey"
              placeholder="Add a Word"
              custom-class="has-text-white"
            />
          </b-field>
          <b-field custom-class="has-text-white" label="Exempted Channels">
            <b-taginput
              v-model="config.allowedBwChannels"
              :data="filteredChannels"
              :allow-new="false"
              ellipsis
              attached
              field="name"
              autocomplete
              type="is-grey"
              placeholder="Add Channel"
              custom-class="has-text-white"
              @typing="getChannelNames"
            >
              <template slot="empty">
                No Channels
              </template>
            </b-taginput>
          </b-field>
        </section>
        <footer class="modal-card-foot">
          <button
            class="button is-danger is-outlined"
            type="button"
            @click="bwModalActive = false"
          >
            Close
          </button>
          <button
            class="button is-primary"
            type="button"
            @click="
              settingArrayUpdate({
                badWords: config.badWords,
                allowedBwChannels: config.allowedBwChannels
              })
            "
          >
            Save
          </button>
        </footer>
      </div>
    </b-modal>
    <b-modal
      v-if="config && channels"
      :active.sync="massModalActive"
      size="is-large"
      has-modal-card
    >
      <div class="modal-card" style="width: auto">
        <header class="modal-card-head">
          <p class="modal-card-title">Mass Mentioning</p>
        </header>
        <section class="modal-card-body">
          <form id="massform" @submit.prevent="validateForm">
            <b-field
              :type="{ 'is-danger': errors.has('mentionlimit') }"
              :message="errors.first('mentionlimit')"
              custom-class="has-text-white"
              label="Mention Threshold (per-message)"
            >
              <b-input
                v-validate="'required|integer|between:1,10'"
                v-model="config.mentionLimit"
                name="mentionlimit"
                type="number"
              />
            </b-field>
            <h3 class="has-text-white">
              If a user exceeds the above limit, they will automatically be
              given the server muted role.
            </h3>
            <br >
            <b-field custom-class="has-text-white" label="Exempted Channels">
              <b-taginput
                v-model="config.allowedMentionChannels"
                :data="filteredChannels"
                :allow-new="false"
                ellipsis
                attached
                field="name"
                autocomplete
                type="is-grey"
                placeholder="Add Channel"
                custom-class="has-text-white"
                @typing="getChannelNames"
              >
                <template slot="empty">
                  No Channels
                </template>
              </b-taginput>
            </b-field>
          </form>
        </section>
        <footer class="modal-card-foot">
          <button
            class="button is-danger is-outlined"
            type="button"
            @click="massModalActive = false"
          >
            Close
          </button>
          <button class="button is-primary" form="massform" type="submit">
            Save
          </button>
        </footer>
      </div>
    </b-modal>
  </section>
</template>

<style>
.modal-card {
  overflow: visible;
}
.modal-card-body {
  overflow: visible;
}
</style>

<script>
import API from "~/API.js";
import secret from "~/secrets.js";

export default {
  head() {
    return {
      title: "Mr.Fox Bot - Automod"
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
    const [commands, config, channels] = await Promise.all([
      (await app.$axios.get(`/api/commands/${page}?guildID=${guildid} `, {
        headers: { Authorization: secret.encrypt(app.$auth.user.id) }
      })).data,
      (await app.$axios.get(`/api/guilds/${guildid}/config`, {
        headers: { Authorization: secret.encrypt(app.$auth.user.id) }
      })).data,
      (await app.$axios.get(`/api/guilds/${guildid}/channels`, {
        headers: { Authorization: secret.encrypt(app.$auth.user.id) }
      })).data
    ]);
    return {
      commands,
      config,
      channels
    };
  },
  data() {
    return {
      loading: false,
      commands: null,
      config: null,
      roles: null,
      channels: null,
      filteredChannels: this.channels,
      bwModalActive: false,
      massModalActive: false,
      originalState: true
    };
  },
  methods: {
    async validateForm() {
      const result = await this.$validator.validateAll();
      result
        ? this.settingArrayUpdate({
            mentionLimit: parseFloat(this.config.mentionLimit),
            allowedMentionChannels: this.config.allowedMentionChannels
          })
        : this.$toast.open("Incorrect parameters.");
    },
    getChannelNames(channel) {
      this.filteredChannels = this.channels.filter(
        option => `${option.name}`.indexOf(channel.toLowerCase()) >= 0
      );
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
        this.$dialog.alert({
          title: "Error",
          message: `Error Code ${error.response.status}: ${
            error.response.data.error
          }`,
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
        this.$dialog.alert({
          title: "Error",
          message: `Error Code ${error.response.status}: ${
            error.response.data.error
          }`,
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
        this.$dialog.alert({
          title: "Error",
          message: `Error Code ${error.response.status}: ${
            error.response.data.error
          }`,
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
