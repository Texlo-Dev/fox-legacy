<template>
  <section class="section">
    <div class="container">
      <nav class="level is-mobile">
        <div class="level-left">
          <h1 class="title has-text-white has-text-left">&nbsp;Moderation</h1>
        </div>
        <div class="level-left">
          <a class="button is-danger" @click="confirmPkg('Moderation')"><p class="has-text-weight-bold">Disable</p></a>
        </div>
      </nav>
      <div class="is-divider"/>
    </div>
    <div v-if="!loading && config" class="container">
      <h1 class="title has-text-white has-text-left">Package Settings</h1>
      <div class="columns is-multiline">
        <div class="column is-half">
          <div class="box">
            <div class="content">
              <h3 class="has-text-white has-text-left">
                Moderation Logging
                <span v-if="config.modLogging">
                  <b-switch ref="modLogging-switch" size="is-small" value="true" type="is-primary"
                            @click.native="settingUpdate('modLogging', false)"/>
                  <section>
                    <br>
                    <div v-if="!prompts.includes('modlog')">
                      <a v-if="config.modlogChannel" id="channel" :href="`https://discordapp.com/channels/${$route.params.guildid}/${config.modlogChannel.id}`">#{{ config.modlogChannel.name }}
                      </a>
                      <p v-else class="subtitle has-text-white">No Channel</p>
                      &nbsp;<button class="button is-small is-primary" @click="prompts.push('modlog')">Change</button>
                    </div>
                    <div v-else>
                      <b-field custom-class="has-text-white">
                        <b-select v-model="config.modlogChannel" placeholder="Select a channel">
                          <option
                            v-for="channel of channels"
                            :value="channel"
                            :key="channel.id">
                            #{{ channel.name }}
                          </option>
                        </b-select>
                        <p class="control">
                          <button class="button is-primary" @click="dropdownSave('modlogChannel', 'Mod-log', config.modlogChannel)">Save</button>
                        </p>
                      </b-field>
                    </div>
                    <!--<b-dropdown>
												<button class="button is-grey" slot="trigger">
													<template v-if="config.modlogChannel">
														<span>{{ config.modlogChannel.name }}</span>
													</template>
													<template v-else>
														<span>None</span>
													</template>
													<font-awesome-icon size="1x" pull="right" icon="angle-down" />
												</button>
												<b-dropdown-item  v-for="channel of channels" :value="channel.name" @click="dropdownSave('modlogChannel', 'Mod-log', channel)" :key="channel.name">{{ channel.name }}</b-dropdown-item>
											</b-dropdown>-->
                  </section>
                </span>

                <span v-else>
                  <b-switch ref="modLogging-switch" size="is-small" value="false" type="is-primary"
                            @click.native="settingUpdate('modLogging', true)"/>
                </span>
              </h3>
              <p>Log all moderation actions to a designated server channel.</p>
            </div>
          </div>
        </div>
        <div class="column is-half">
          <div class="box">
            <div class="content">
              <h3 class="has-text-white has-text-left">
                Muted Role
                <br><br>
                <div v-if="!prompts.includes('mute')">
                  <a v-if="config.muteRole" id="channel">@{{ config.muteRole.name }}
                  </a>
                  <p v-else class="subtitle has-text-white">No Role</p>
                  &nbsp;<button class="button is-small is-primary" @click="prompts.push('mute')">Change</button>
                </div>
                <div v-else>
                  <b-field custom-class="has-text-white">
                    <b-select v-model="config.muteRole" placeholder="Select a channel">
                      <option
                        v-for="role of roles"
                        :value="role"
                        :key="role.id">
                        @{{ role.name }}
                      </option>
                    </b-select>
                    <p class="control">
                      <button class="button is-primary" @click="dropdownSave('muteRole', 'Muted Role', config.muteRole)">Save</button>
                    </p>
                  </b-field>
                </div>
              </h3>
              <p>Note: Mr.Fox will attempt to update the chat permissions for the specified role.</p>
            </div>
          </div>
        </div>
        <div class="column is-half">
          <div class="box">
            <div class="content">
              <h3 class="has-text-white has-text-left">
                Server Logging
                <span v-if="config.serverLogging">
                  <b-switch ref="serverLogging-switch" size="is-small" value="true" type="is-primary"
                            @click.native="settingUpdate('serverLogging', false)"/>
                  <button class="button is-small is-grey is-rounded" @click="modalActive = true">
                    Manage <font-awesome-icon size="0.8x" pull="right" icon="wrench"/>
                  </button>	
                </span>
                <span v-else>
                  <b-switch ref="serverLogging-switch" size="is-small" value="false" type="is-primary"
                            @click.native="settingUpdate('serverLogging', true)"/>
                </span>
              </h3>
              <p>Log important server events to a designated server channel.</p>
            </div>
          </div>
          <div class="box">
            <div class="content">
              <h3 class="has-text-white has-text-left">
                Settings
              </h3>
              <div class="field">
                <b-checkbox v-model="config.delModCmds" type="is-grey" @click.native="settingUpdate('delModCmds', !config.delModCmds)">
                  <p>Delete Mod command after execution</p>
                </b-checkbox>
              </div>
              <div class="field">
                <b-checkbox v-model="config.msgAfterMod" type="is-grey" @click.native="settingUpdate('msgAfterMod', !config.msgAfterMod)">
                  <p>Message target after kick/ban/warn</p>
                </b-checkbox>
              </div>

            </div>
          </div>
        </div>
        <div class="column is-half">
          <div class="box">
            <div class="content">
              <h3 class="has-text-white has-text-left">
                Warning Points
              </h3>
              <p class="subtitle has-text-white">Automatic kick threshold</p>
              <b-field>
                <b-input id="grey" v-model="config.kickPoints" type="number" min="10" max="100000"/>
                <button class="button is-primary" @click="settingUpdate('kickPoints', config.kickPoints)">Update</button>
              </b-field>
              <br>
              <p class="subtitle has-text-white">Automatic ban threshold</p>
              <b-field>
                <b-input id="grey" v-model="config.banPoints" type="number" min="10" max="100000"/>
                <button class="button is-primary" @click="settingUpdate('banPoints', config.banPoints)">Update</button>
              </b-field>
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
    <b-modal :active.sync="modalActive" size="is-large" has-modal-card>
      <div class="modal-card">
        <header class="modal-card-head">
          <p class="modal-card-title">Server Logging</p>
        </header>
        <section class="modal-card-body">
          <form id="serverlog" @submit.prevent="logValidate">
            <b-field :type="{ 'is-danger': errors.has('channel') }" :message="errors.first('channel')" label="Select Channel" custom-class="has-text-white">
              <b-select id="modalselect" v-model="config.serverlogChannel" name="channel">
                <option
                  v-for="channel of channels"
                  :value="channel"
                  :key="channel.id">
                  #{{ channel.name }}
                </option>
              </b-select>
            </b-field>
            <b-field label="Event List" custom-class="has-text-white">
              <section id="checkbox" class="has-text-centered has-background-black">

                <div class="box">
                  <div class="content">
                    <b-checkbox v-model="config.enabledEvents" native-value="channelCreate">
                      <p>Channel Created</p>
                    </b-checkbox>
                    <b-checkbox v-model="config.enabledEvents" native-value="channelDelete">
                      <p>Channel Deleted</p>
                    </b-checkbox>
                    <b-checkbox v-model="config.enabledEvents" native-value="channelUpdate">
                      <p>Channel Updated</p>
                    </b-checkbox>
                    <b-checkbox v-model="config.enabledEvents" native-value="emojiCreate">
                      <p>Emoji Created</p>
                    </b-checkbox>
                    <b-checkbox v-model="config.enabledEvents" native-value="emojiDelete">
                      <p>Emoji Deleted</p>
                    </b-checkbox>
                    <b-checkbox v-model="config.enabledEvents" native-value="roleCreate">
                      <p>Role Created</p>
                    </b-checkbox>
                    <b-checkbox v-model="config.enabledEvents" native-value="roleDelete">
                      <p>Role Deleted</p>
                    </b-checkbox>
                    <b-checkbox v-model="config.enabledEvents" native-value="roleUpdate">
                      <p>Role Updated</p>
                    </b-checkbox>
                    <b-checkbox v-model="config.enabledEvents" native-value="guildMemberAdd">
                      <p>Member Join</p>
                    </b-checkbox>
                    <b-checkbox v-model="config.enabledEvents" native-value="guildMemberRemove">
                      <p>Member Leave</p>
                    </b-checkbox>
                    <b-checkbox v-model="config.enabledEvents" native-value="guildMemberUpdate">
                      <p>Member Detail Change</p>
                    </b-checkbox>
                    <b-checkbox v-model="config.enabledEvents" native-value="messageDelete">
                      <p>Message Deleted</p>
                    </b-checkbox>
                    <b-checkbox v-model="config.enabledEvents" native-value="messageUpdate">
                      <p>Message Updated</p>
                    </b-checkbox>
                    <b-checkbox v-model="config.enabledEvents" native-value="voiceStateUpdate">
                      <p>Member Voice State Change</p>
                    </b-checkbox>
                  </div>
                </div>

              </section>

            </b-field>
            <b-field custom-class="has-text-white" label="Ignored Channels">
              <b-taginput v-model="config.logExcluded" :data="filteredChannels" :allow-new="false" ellipsis attached field="name" autocomplete type="is-grey" placeholder="Add Channel" custom-class="has-text-white" @typing="getChannelNames">
                <template slot="empty">
                  No Channels
                </template>
              </b-taginput>
            </b-field>
          </form>

        </section>
        <footer class="modal-card-foot">
          <button class="button is-danger is-outlined" type="button" @click="modalActive = false">Close</button>
          <button class="button is-primary" type="submit" form="serverlog">Save</button>
        </footer>
      </div>
    </b-modal>

  </section>

</template>
<script>
import API from "~/API.js";
import secret from "~/secrets.js";

export default {
  head() {
    return {
      title: "Mr.Fox Bot - Moderation"
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
    const [commands, config, channels, roles] = await Promise.all([
      (await app.$axios.get(`/api/commands/${page}?guildID=${guildid} `, {
        headers: { Authorization: secret.encrypt(app.$auth.user.id) }
      })).data,
      (await app.$axios.get(`/api/guilds/${guildid}/config`, {
        headers: { Authorization: secret.encrypt(app.$auth.user.id) }
      })).data,
      (await app.$axios.get(`/api/guilds/${guildid}/channels`, {
        headers: { Authorization: secret.encrypt(app.$auth.user.id) }
      })).data,
      (await app.$axios.get(`/api/guilds/${guildid}/roles`, {
        headers: { Authorization: secret.encrypt(app.$auth.user.id) }
      })).data
    ]);
    return {
      commands,
      config,
      channels,
      roles
    };
  },
  data() {
    return {
      commands: null,
      config: null,
      channels: null,
      prompts: [],
      roles: null,
      filteredChannels: this.channels,
      filteredRoles: this.roles,
      modalActive: false,
      originalState: true
    };
  },
  methods: {
    async logValidate() {
      const result = await this.$validator.validateAll();
      if (result) {
        await this.settingArrayUpdate({
          enabledEvents: this.config.enabledEvents,
          logExcluded: this.config.logExcluded,
          serverlogChannel: this.config.serverlogChannel
        });
      }
      this.$toast.open("Incorrect parameters.");
    },
    dropdownSave(key, meta, item) {
      return this.settingUpdate(key, item, { meta }).then(() => {
        this.prompts = [];
      });
    },
    getChannelNames(channel) {
      this.filteredChannels = this.channels.filter(
        option =>
          `${option.name.toLowerCase()}`.indexOf(channel.toLowerCase()) >= 0
      );
    },
    getRoleNames(channel) {
      this.filteredRoles = this.roles.filter(
        option =>
          `${option.name.toLowerCase()}`.indexOf(channel.toLowerCase()) >= 0
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
        this.$snackbar.open({
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
    }
  }
};
</script>

<style>
.modal-card-body .has-background-black {
  border-radius: 5px;
}
</style>

<style>
.select select {
  background-color: #34383c;
  color: #eff;
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
#grey {
  background-color: #34383c;
}
</style>
