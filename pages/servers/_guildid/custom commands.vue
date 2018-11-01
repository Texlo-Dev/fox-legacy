<template>
  <section class="section">
    <div class="container">
      <nav class="level is-mobile">
        <div class="level-left">
          <h1 style="font-size: 20px" class="title has-text-white has-text-left">Custom Commands</h1>
        </div>
        <div class="level-right">
          <a class="button is-danger" @click="confirmPkg('Custom Commands')"><p class="has-text-weight-bold">Disable</p></a>
        </div>
      </nav>
      <div class="is-divider"/>
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
      <div v-for="command of commands" v-else :key="command.name" class="box">
        <div class="content">
          <nav class="level">
            <div class="level-left">
              <div class="level-item">
                <h1 class="has-text-white has-text-left">
                  {{ command.name }}
                  <b-switch :ref="`${command.name}-switch`" :value="command.enabled" size="is-small" type="is-primary"
                            @input="toggleCommand(command.name, !command.enabled)"/>
            
                </h1>
              </div>
              <div class="level-item">
                <button class="button is-primary is-outlined" @cmdedit="cmdEdited" @click="editCommand(command)">Edit<font-awesome-icon icon="cogs" size="s" pull="right"/></button>
              </div>
              <div class="level-item">
                <button class="button is-danger is-outlined" @click="confirmDelete(command.name)">Delete<font-awesome-icon icon="trash-alt" size="s" pull="right"/></button>
              </div>
            </div>

          </nav>
          <p>{{ command.description }}</p>
        </div>
      </div>

    </div>


    <b-modal :active.sync="toggleAdd" has-modal-card>
      <div class="modal-card">
        <header class="modal-card-head">
          <p class="modal-card-title">New Command</p>
        </header>
        <section class="modal-card-body">
          <form id="custcmd" @submit.prevent="validateForm">
            <b-field :type="{ 'is-danger': errors.has('command name') }" :message="errors.first('command name')" custom-class="has-text-white" label="Command Name">
              <b-input v-validate="'required|max:12'" v-model="custCommand.name" name="command name"/>
            </b-field>
            <b-field :type="{ 'is-danger': errors.has('description') }" :message="errors.first('description')" custom-class="has-text-white" label="Command Description">
              <b-input v-validate="'required|max:40'" v-model="custCommand.description" name="description"/>
            </b-field>
            <b-field :type="{ 'is-danger': errors.has('response') }" :message="errors.first('response')" custom-class="has-text-white" label="Command Response">
              <b-input v-validate="'required|max:2000'" v-model="custCommand.template" name="response" type="textarea"/>
            </b-field>
            <b-field custom-class="has-text-white" label="Command Cooldown (Seconds)">
              <b-input v-model.number="custCommand.cooldown" type="number"/>
            </b-field>
            <b-field custom-class="has-text-white" label="Command Required Permission (Optional)">
              <b-select v-model="custCommand.requiredPerms">
                <optgroup v-for="(key, category) in permissions" :key="category" :label="category">
                  <option v-for="perm of permissions[category]" :key="perm.name" :value="perm.name">{{ perm.name }}</option>
                </optgroup>
              </b-select>
            </b-field>
            <b-field>
              <b-switch v-model="custCommand.deleteCmmand" type="is-primary">
                <p class="has-text-white has-text-weight-bold">Delete Command after execution?</p>
              </b-switch>
            </b-field>
            <b-field>
              <b-switch v-model="custCommand.dmCommand" type="is-primary">
                <p class="has-text-white has-text-weight-bold">DM Command?</p>
              </b-switch>
            </b-field>
          </form>
        </section>
        <footer class="modal-card-foot">
          <button class="button" type="button" @click="toggleAdd = false">Close</button>
          <button class="button is-primary" type="submit" form="custcmd">Add</button>
        </footer>
      </div>
    </b-modal>
  </section>
</template>

<script>
import editCommand from "~/components/editCommand";
import secret from "~/secrets";
export default {
  head: () => ({
    title: "Mr.Fox Bot - Custom Commands"
  }),
  components: {
    editCommand
  },
  async fetch({ store, app, params: { guildid } }) {
    if (store.state.cachedGuild) return;
    const { data: guild } = await app.$axios.get(`/api/guilds/${guildid}`, {
      headers: { Authorization: secret.encrypt(app.$auth.user.id) }
    });

    store.commit("cacheGuild", guild);
    store.commit("toggleDash", true);
  },
  async asyncData({ app, params: { guildid } }) {
    const { data: permissions } = await app.$axios.get(`/api/permissions`);
    const { data: commands } = await app.$axios.get(
      `/api/guilds/${guildid}/customcommands `,
      { headers: { Authorization: secret.encrypt(app.$auth.user.id) } }
    );
    const { data: config } = await app.$axios.get(
      `/api/guilds/${guildid}/config`,
      { headers: { Authorization: secret.encrypt(app.$auth.user.id) } }
    );
    return {
      commands,
      config,
      permissions
    };
  },
  data: () => ({
    commands: null,
    config: null,
    permissions: null,
    toggleAdd: false,
    toggleEdit: false,
    custCommand: {
      name: null,
      description: null,
      deleteCommand: false,
      dmCommand: false,
      cooldown: 0,
      requiredPerms: null,
      template: ""
    }
  }),
  events: {
    cmdedit(command) {
      this.commands = command;
    }
  },
  methods: {
    editCommand(command) {
      this.$modal.open({
        parent: this,
        component: editCommand,
        hasModalCard: true,
        props: {
          command,
          permissions: this.permissions
        },
        events: {
          cmdedit: this.cmdEdited
        }
      });
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
    confirmDelete(command) {
      this.$dialog.confirm({
        title: "Delete Command",
        message: `Are you sure that you want to delete the command ${command}?`,
        type: "is-danger",
        confirmText: "Delete",
        cancelText: "Cancel",
        onConfirm: async () => {
          try {
            ({ data: this.commands } = await this.$axios.delete(
              `/api/guilds/${
                this.$route.params.guildid
              }/customcommands/${command}`,
              {
                headers: {
                  Authorization: secret.encrypt(this.$auth.user.id)
                }
              }
            ));
          } catch (error) {
            this.$dialog.alert({
              message: `There was an error while deleting this command. "${
                error.message
              }"`,
              type: "is-danger"
            });
          }
        }
      });
    },
    cmdEdited(cmds) {
      this.commands = cmds;
    },
    async validateForm() {
      const result = await this.$validator.validateAll();
      result
        ? this.saveCommand(this.custCommand)
        : this.$toast.open("Incorrect Parameters.");
    },
    async saveCommand(command) {
      try {
        ({ data: this.commands } = await this.$axios.post(
          `/api/guilds/${this.$route.params.guildid}/customcommands`,
          command,
          {
            headers: {
              Authorization: secret.encrypt(this.$auth.user.id)
            }
          }
        ));
        for (const val in this.custCommand) {
          if (val === "requiredPerms") this.custCommand[val] = [];
          else if (val === "cooldown") this.custCommand[val] = 0;
          else if (val === "template") this.custCommand[val] = "";
          else if (val === "deleteCommand" || val === "dmCommand")
            this.custCommand[val];
          else this.custCommand[val] = null;
        }
        this.toggleAdd = false;
      } catch (error) {
        this.$dialog.alert({
          title: "Error",
          message: `There was an error performing this action. "${
            error.message
          }"`,
          type: "is-danger"
        });
      }
    },
    async toggleCommand(data, bool) {
      if (!data) return;
      try {
        ({ data: this.commands } = await this.$axios.patch(
          `/api/guilds/${this.$route.params.guildid}/customcommands/${data}`,
          {
            enabled: bool
          },
          { headers: { Authorization: secret.encrypt(this.$auth.user.id) } }
        ));
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
.select select option {
  color: #747f8d;
}
</style>
