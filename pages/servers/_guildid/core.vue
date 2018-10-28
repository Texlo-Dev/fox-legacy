<template>
  <section class="section">
    <div class="container">
      <nav class="level is-mobile">
        <div class="level-left">
          <h1 class="title has-text-white has-text-left">&nbsp;Core</h1>
        </div>
      </nav>
      <div class="is-divider"/>
    </div>
    <div class="container" style ="position:relative">
      <h1 class="title has-text-white has-text-left">Settings</h1>
      <div class="columns is-multiline">
        <div class="column is-narrow">
          <div class="box">
            <div class="content">
              <h3 class="has-text-white has-text-left">
                Prefix
                <br><br>
                <b-field>
                  <b-input id="grey" v-model="config.prefix" maxlength="10"/>
                  <p class="control">
                    <button class="button is-primary" @click="setPrefix(config.prefix)">Save</button>
                  </p>
                </b-field>
              </h3>
              <p>What all commands are prefixed (begin) with.</p>
            </div>
          </div>
        </div>
        <div class="column is-narrow">
          <div class="box">
            <div class="content">
              <h3 class="has-text-white has-text-left">Bot Language</h3>
              <b-field>
                <b-select id="grey" v-model="config.language">
                  <option v-for="lang of languages" :key="lang" :value="lang">{{ lang }}</option>
                </b-select>
                <p class="control">
                  <button class="button is-primary" @click="settingUpdate('language', config.language)">Save</button>
                </p>
              </b-field>
              <p>The primary language for all of Mr.Fox's commands.</p>
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
            <b-switch :ref="`${command.name}-switch`" :value="command.enabled" size="is-medium" type="is-primary"
                      @input="toggleCommand(command.name, !command.enabled)"/>
          </h1>

          <p>{{ command.description }}</p>
        </div>
      </div>

    </div>
  </section>
</template>

<script>
import API from "~/API.js";
import secret from "~/secrets.js";

export default {
  head() {
    return {
      title: "Mr.Fox Bot - Core"
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
    const [commands, config, roles, languages] = await Promise.all([
      (await app.$axios.get(`/api/commands/${page}?guildID=${guildid} `, {
        headers: { Authorization: secret.encrypt(app.$auth.user.id) }
      })).data,
      (await app.$axios.get(`/api/guilds/${guildid}/config`, {
        headers: { Authorization: secret.encrypt(app.$auth.user.id) }
      })).data,
      (await app.$axios.get(`/api/guilds/${guildid}/roles`, {
        headers: { Authorization: secret.encrypt(app.$auth.user.id) }
      })).data,
      (await app.$axios.get(`/api/languages`)).data
    ]);
    return {
      commands,
      config,
      roles,
      languages
    };
  },
  data() {
    return {
      commands: null,
      config: null,
      roles: null,
      filteredRoles: this.roles,
      bwModalActive: false,
      massModalActive: false,
      originalState: true
    };
  },
  methods: {
    getRoleNames(channel) {
      this.filteredRoles = this.roles.filter(
        option =>
          `${option.name.toLowerCase()}`.indexOf(channel.toLowerCase()) >= 0
      );
    },
    setPrefix(val) {
      return this.settingUpdate("prefix", val, { bool: false });
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
    }
  }
};
</script>

<style>
select {
  font-family: "Poppins";
}
.select select option {
  color: #747f8d;
}
#grey {
  background-color: #34383c;
}
.select.is-empty select {
  color: #eff;
}
</style>
