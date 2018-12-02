<template>
  <section class="section">
    <div class="container">
      <nav class="level is-mobile">
        <div class="level-left">
          <h1 class="title has-text-white has-text-left">&nbsp;Tickets</h1>
        </div>
        <div class="level-left">
          <a class="button is-danger" @click="confirmPkg('Tickets')">
            <p class="has-text-weight-bold">Disable</p>
          </a>
        </div>
      </nav>
      <div class="is-divider"/>
    </div>
    <div class="container">
      <h1 class="title has-text-white has-text-left">Settings</h1>
      <div class="columns">
        <div class="column is-3">
          <div class="box">
            <div class="content">
              <h3 class="title has-text-white has-text-left">Tickets Category</h3>
              <div v-if="!prompts.includes('category')">
                <p class="subtitle has-text-white">
                  {{ tickets.category ? tickets.category.name : "None" }}
                  <button
                    class="button is-small is-primary"
                    @click="prompts.push('category')"
                  >Change</button>
                </p>
              </div>
              <div v-else>
                <b-field custom-class="has-text-white">
                  <b-select v-model="tickets.category" placeholder="Select a category">
                    <option
                      v-for="category of categories"
                      :value="category"
                      :key="category.id"
                    >{{ category.name }}</option>
                  </b-select>
                  <p class="control">
                    <button
                      class="button is-primary"
                      @click="
                        dropdownSave('category', 'category', tickets.category)
                      "
                    >Save</button>
                  </p>
                </b-field>
              </div>
            </div>
          </div>
        </div>
        <div class="column is-3">
          <div class="box">
            <div class="content">
              <h3 class="title has-text-white has-text-left">Ticket Logging Channel</h3>
              <div v-if="!prompts.includes('logchannel')">
                <a
                  v-if="tickets.logchannel"
                  id="channel"
                  :href="
                    `https://discordapp.com/channels/${$route.params.guildid}/${
                      tickets.logchannel.id
                    }`
                  "
                  target="_blank"
                >#{{ tickets.logchannel.name }}</a>
                <p v-else class="subtitle has-text-white">No Channel</p>&nbsp;
                <button
                  class="button is-small is-primary"
                  @click="prompts.push('logchannel')"
                >Change</button>
              </div>
              <div v-else>
                <b-field custom-class="has-text-white">
                  <b-select v-model="tickets.logchannel" placeholder="Select a channel">
                    <option
                      v-for="channel of channels"
                      :value="channel"
                      :key="channel.id"
                    >{{ channel.name }}</option>
                  </b-select>
                  <p class="control">
                    <button
                      class="button is-primary"
                      @click="
                        dropdownSave(
                          'logchannel',
                          'Log Channel',
                          tickets.logchannel
                        )
                      "
                    >Save</button>
                  </p>
                </b-field>
              </div>
            </div>
          </div>
        </div>
        <div class="column is-3">
          <div class="box">
            <div class="content">
              <h3 class="title has-text-white has-text-left">New Ticket Message</h3>
              <div v-if="!prompts.includes('message')">
                <p class="subtitle has-text-white">
                  {{ tickets.message || "None" }}
                  <button
                    class="button is-small is-primary"
                    @click="prompts.push('message')"
                  >Change</button>
                </p>
              </div>
              <div v-else>
                <b-field>
                  <b-input v-model="tickets.message" type="textarea" maxlength="1500" expanded/>
                  <p class="control">
                    <button
                      class="button is-primary"
                      @click="
                        settingUpdate('message', tickets.message, {
                          bool: false,
                          hideToast: true
                        })
                      "
                    >Save</button>
                  </p>
                </b-field>
              </div>
            </div>
          </div>
        </div>
        <div class="column is-3">
          <div class="box">
            <div class="field">
              <b-checkbox
                v-model="tickets.pingagents"
                @click.native="settingUpdate('pingagents', !tickets.pingagents)"
              >Ping support agents on ticket create</b-checkbox>
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
  </section>
</template>

<script>
import secret from "~/secrets.js";
import API from "~/API";
export default {
  head() {
    return {
      title: "Mr.Fox Bot - Tickets"
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
    const [commands, config, categories, channels, tickets] = await Promise.all(
      [
        (await app.$axios.get(`/api/commands/${page}?guildID=${guildid}`, {
          headers: { Authorization: secret.encrypt(app.$auth.user.id) }
        })).data,
        (await app.$axios.get(`/api/guilds/${guildid}/config`, {
          headers: { Authorization: secret.encrypt(app.$auth.user.id) }
        })).data,
        (await app.$axios.get(`/api/guilds/${guildid}/channels?category=true`, {
          headers: { Authorization: secret.encrypt(app.$auth.user.id) }
        })).data,
        (await app.$axios.get(`/api/guilds/${guildid}/channels`, {
          headers: { Authorization: secret.encrypt(app.$auth.user.id) }
        })).data,
        (await app.$axios.get(`/api/guilds/${guildid}/tickets`, {
          headers: { Authorization: secret.encrypt(app.$auth.user.id) }
        })).data
      ]
    );

    return {
      commands,
      config,
      categories,
      channels,
      tickets
    };
  },
  data() {
    return {
      prompts: []
    };
  },
  methods: {
    dropdownSave(key, meta, item) {
      return this.settingUpdate(key, item, { meta }).then(
        () => (this.prompts = [])
      );
    },
    async settingUpdate(key, value, options = {}) {
      try {
        ({ data: this.tickets } = await this.$axios.patch(
          `/api/guilds/${this.$route.params.guildid}/tickets`,
          {
            key,
            value,
            bool: options.bool
          },
          {
            headers: {
              Authorization: secret.encrypt(this.$auth.user.id)
            }
          }
        ));
        this.prompts = [];
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
        this.$snackbar.open({
          message: `Unable to edit this setting: ${error}`,
          type: "is-danger"
        });
        this.$refs[`${key}-switch`][0].newValue = !value;
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
          type: "is-danger",
          hasIcon: true,
          icon: "times-circle",
          iconPack: "fa"
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
            type: "is-danger",
            hasIcon: true,
            icon: "times-circle",
            iconPack: "fa"
          });
        });
    }
  }
};
</script>

<style></style>
