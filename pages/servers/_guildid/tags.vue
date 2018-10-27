<template>
  <section class="section">
    <div class="container">
      <nav class="level is-mobile">
        <div class="level-left">
          <h1 class="title has-text-white has-text-left">&nbsp;Tags</h1>
        </div>
        <div class="level-left">
          <a class="button is-danger" @click="confirmPkg('Tags')"><p class="has-text-weight-bold">Disable</p></a>
        </div>
      </nav>
      <div class="is-divider"/>
    </div>
    <div class="container">
      <div class="columns">
        <div class="column">
          <div class="box">
            <div class="content">
              <nav class="level">
                <div class="level-left">
                  <div class="level-item">
                    <h1 class="title has-text-left has-text-white">Tag List</h1>
                  </div>
                  <div class="level-item">
                    <button class="button is-grey is-rounded" @click="toggleAdd = true">
                      Add Tag <font-awesome-icon size="0.8x" pull="right" icon="plus"/>
                    </button>
                  </div>
                </div>
              </nav>
              <b-taglist v-if="tags.length">
                <b-tag v-for="tag of tags" v-if="tags.length" :key="tag"
                       type="is-grey"
                       closable
                       @close="confirmDelete(tag)"
                >
                  {{ tag }}
                </b-tag>
              </b-taglist>
              <p v-else>No tags added. To add a tag, click the "Add Tag" button.</p>
            </div>
          </div>
          <div class="box">
            <div class="content">
              <h1 class="has-text-white has-text-left">Tag Settings</h1>
              <div class="field">
                <b-checkbox v-model="config.tacMode" type="is-primary" @click.native="settingUpdate('tacMode', !config.tacMode)">
                  <p>Use tag as command</p>
                </b-checkbox>
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
            <b-switch :ref="`${command.name}-switch`" :value="command.enabled" size="is-medium" type="is-primary"
                      @input="toggleCommand(command.name, !command.enabled)"/>
          </h1>

          <p>{{ command.description }}</p>
        </div>
      </div>

    </div>
    <b-modal :active.sync="toggleAdd" has-modal-card>
      <div class="modal-card">
        <header class="modal-card-head">
          <p class="modal-card-title">New Tag</p>
        </header>
        <section class="modal-card-body">
          <form id="tag" @submit.prevent="validateForm">
            <b-field :type="{ 'is-danger': errors.has('Tag Name') }" :message="errors.first('Tag Name')" label="Tag Name" custom-class="has-text-white">
              <b-input v-validate="'required|max:20'" v-model="currentag.name" name="Tag Name"/>
            </b-field>
            <b-field :type="{ 'is-danger': errors.has('Tag Content') }" :message="errors.first('Tag Content')" label="Tag Content" custom-class="has-text-white">
              <b-input v-validate="'required|max:1980'" v-model="currentag.content" type="textarea" name="Tag Content"/>
            </b-field>
          </form>
        </section>
        <footer class="modal-card-foot">
          <button class="button is-danger is-outlined" type="button" @click="toggleAdd = false">Close</button>
          <button class="button is-primary" type="submit" form="tag">Add</button>
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
      title: "Mr.Fox Bot - Tags"
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
    const [commands, config, tags] = await Promise.all([
      (await app.$axios.get(`/api/commands/${page}?guildID=${guildid} `, {
        headers: { Authorization: secret.encrypt(app.$auth.user.id) }
      })).data,
      (await app.$axios.get(`/api/guilds/${guildid}/config`, {
        headers: { Authorization: secret.encrypt(app.$auth.user.id) }
      })).data,
      (await app.$axios.get(`/api/guilds/${guildid}/tags`, {
        headers: { Authorization: secret.encrypt(app.$auth.user.id) }
      })).data
    ]);
    return {
      commands,
      config,
      tags
    };
  },
  data() {
    return {
      commands: null,
      config: null,
      tags: null,
      toggleAdd: false,
      currentag: {
        name: null,
        content: null
      }
    };
  },
  methods: {
    async validateForm() {
      const result = await this.$validator.validateAll();
      result
        ? this.addTag(this.currentag)
        : this.$toast.open("Incorrect parameters.");
    },
    async confirmDelete(tag) {
      this.$dialog.confirm({
        title: "Delete Tag",
        message: `Are you sure that you'd like to remove the tag "${tag}"?`,
        cancelText: "Cancel",
        confirmText: "Delete",
        type: "is-primary",
        onConfirm: async () => {
          this.$nuxt.$loading.start();
          try {
            ({ data: this.tags } = await this.$axios.delete(
              `/api/guilds/${this.$route.params.guildid}/tags/${tag}`,
              {
                headers: { Authorization: secret.encrypt(this.$auth.user.id) }
              }
            ));
          } catch (error) {
            this.$nuxt.$loading.fail();
            this.$toast.open({
              message: `Error deleting tag. ${error}`,
              type: "is-danger",
              duration: 3000
            });
          } finally {
            this.$nuxt.$loading.finish();
          }
        }
      });
    },
    async resetChanges() {
      this.tags = await API.guildTags(
        this.$route.params.guildID,
        this.$auth.user.id
      );
    },
    async addTag(tag) {
      try {
        ({ data: this.tags } = await this.$axios.post(
          `/api/guilds/${this.$route.params.guildid}/tags`,
          {
            tagName: tag.name,
            tagContent: tag.content
          },
          { headers: { Authorization: secret.encrypt(this.$auth.user.id) } }
        ));
        this.toggleAdd = false;
        this.currentag.name = null;
        this.currentag.content = null;
      } catch (error) {
        this.$toast.open({
          message: `Unable to add this tag: ${error}`,
          type: "is-danger",
          duration: 4000
        });
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
    }
  }
};
</script>
