<template>
  <section class="section">
    <div class="container">
      <nav class="level is-mobile">
        <div class="level-left">
          <h1 class="title has-text-white has-text-left">&nbsp;Economy</h1>
        </div>
        <div class="level-left">
          <a class="button is-danger" @click="confirmPkg('Economy')"
          ><p class="has-text-weight-bold">Disable</p></a
          >
        </div>
      </nav>
      <div class="is-divider" />
    </div>
    <div class="container">
      <h1 class="title has-text-white has-text-left">Settings</h1>
      <div class="columns">
        <div class="column is-one-third">
          <div class="box">
            <div class="content">
              <h3 class="has-text-white has-text-left">Shop Name:</h3>
              <div v-if="!prompts.includes('shopName')">
                <p class="subtitle has-text-white">{{ banking.shopName }}</p>
                <button
                  class="button is-small is-primary"
                  @click="prompts.push('shopName')"
                >
                  Change
                </button>
              </div>
              <div v-else>
                <form id="sname" @submit.prevent="vername">
                  <b-field
                    :type="{ 'is-danger': errors.has('Shop Name') }"
                    :message="errors.first('Shop Name')"
                  >
                    <b-input
                      v-validate="'required|max:30'"
                      id="grey"
                      v-model="banking.shopName"
                      name="Shop Name"
                    />
                    <p class="control">
                      <button
                        class="button is-primary"
                        type="submit"
                        form="sname"
                      >
                        Save
                      </button>
                    </p>
                  </b-field>
                </form>
              </div>
            </div>
          </div>
        </div>
        <div class="column is-one-third">
          <div class="box">
            <div class="content">
              <h3 class="has-text-white has-text-left">Shop Currency:</h3>
              <div v-if="!prompts.includes('currency')">
                <p class="subtitle has-text-white">{{ banking.currency }}</p>
                <button
                  class="button is-small is-primary"
                  @click="prompts.push('currency')"
                >
                  Change
                </button>
              </div>
              <div v-else>
                <form id="crcy" @submit.prevent="vercurrency">
                  <b-field
                    :type="{ 'is-danger': errors.has('Currency') }"
                    :message="errors.first('Currency')"
                  >
                    <b-input
                      v-validate="'required|max:4'"
                      id="grey"
                      v-model="banking.currency"
                      name="Currency"
                    />
                    <p class="control">
                      <button
                        class="button is-primary"
                        type="submit"
                        form="crcy"
                      >
                        Save
                      </button>
                    </p>
                  </b-field>
                </form>
              </div>
            </div>
          </div>
        </div>
        <div class="column is-one-third">
          <div class="box">
            <div class="content">
              <h3 class="has-text-white">
                Exempted Channels <br ><br >
                <b-field custom-class="has-text-white">
                  <b-taginput
                    v-model="banking.excludedChannels"
                    :allow-new="false"
                    :data="filteredChannels"
                    ellipsis
                    rounded
                    autocomplete
                    type="is-grey"
                    field="name"
                    placeholder="Add a Channel"
                    custom-class="has-text-white"
                    @typing="getChannelNames"
                  />
                  <p class="control">
                    <button
                      class="button is-primary"
                      @click="
                        bankingUpdate(
                          'excludedChannels',
                          banking.excludedChannels,
                          { bool: false }
                        )
                      "
                    >
                      Save
                    </button>
                  </p>
                </b-field>
              </h3>
              <h3 class="has-text-white">
                Exempted Roles <br ><br >
                <b-field custom-class="has-text-white">
                  <b-taginput
                    v-model="banking.excludedRoles"
                    :allow-new="false"
                    :data="filteredRoles"
                    ellipsis
                    rounded
                    autocomplete
                    type="is-grey"
                    field="name"
                    placeholder="Add a Role"
                    custom-class="has-text-white"
                    @typing="getRoleNames"
                  />
                  <p class="control">
                    <button
                      class="button is-primary"
                      @click="
                        bankingUpdate('excludedRoles', banking.excludedRoles, {
                          bool: false
                        })
                      "
                    >
                      Save
                    </button>
                  </p>
                </b-field>
              </h3>
            </div>
          </div>
        </div>
      </div>
      <div class="is-divider" />
    </div>
    <div class="container">
      <div class="box">
        <div class="content">
          <nav class="level">
            <div class="level-left">
              <div class="level-item">
                <h1 class="title has-text-white has-text-left">Shop Items</h1>
              </div>
              <div class="level-item">
                <button
                  class="button is-grey is-rounded"
                  @click="toggleAdd = true"
                >
                  Add Item
                  <font-awesome-icon size="0.8x" pull="right" icon="plus" />
                </button>
              </div>
            </div>
          </nav>
          <div v-if="banking.shopItems.length" class="columns is-multiline">
            <div
              v-for="item of banking.shopItems"
              :key="item.name"
              class="column is-one-quarter"
            >
              <div class="box" style="background-color: #34383c">
                <div class="content">
                  <span>
                    <p class="subtitle has-text-white">
                      {{ item.name }} &nbsp;<button
                        class="button is-small is-success"
                        @click="editItem(item)"
                      >
                        Edit
                        <font-awesome-icon
                          size="0.8x"
                          pull="right"
                          icon="cogs"
                        />
                      </button>
                      <button
                        class="button is-small is-danger"
                        @click="shopAction('remove', item)"
                      >
                        Delete
                        <font-awesome-icon
                          size="0.8x"
                          pull="right"
                          icon="trash-alt"
                        />
                      </button>
                    </p>
                    <p>
                      - Price:
                      {{ banking.currency + item.price.toLocaleString() }}
                    </p>
                    <p>
                      - Role Reward:
                      {{ item.role ? `@${item.role.name}` : "None" }}
                    </p>
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div v-else>
            <p>
              No Shop items found. Click the "Add Item" button to get started
            </p>
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
    <b-modal :active.sync="toggleAdd" has-modal-card>
      <div class="modal-card">
        <header class="modal-card-head">
          <p class="modal-card-title">New Shop Item</p>
        </header>
        <section class="modal-card-body">
          <form id="shopitem" @submit.prevent="verifyForm">
            <b-field
              :type="{ 'is-danger': errors.has('Name') }"
              :message="errors.first('Name')"
              custom-class="has-text-white"
              label="Item Name"
            >
              <b-input
                v-validate="'required'"
                v-model="currItem.name"
                name="Name"
              />
            </b-field>
            <b-field
              :type="{ 'is-danger': errors.has('Price') }"
              :message="errors.first('Price')"
              custom-class="has-text-white"
              label="Price"
            >
              <b-input
                v-validate="'required'"
                v-model.number="currItem.price"
                type="number"
                name="Price"
              />
            </b-field>
            <b-field custom-class="has-text-white" label="Role Reward">
              <b-select
                id="modalselect"
                v-model="currItem.role"
                name="role"
                placeholder="None"
              >
                <option :value="null">None</option>
                <option v-for="role of roles" :value="role" :key="role.id">
                  {{ role.name }}
                </option>
              </b-select>
            </b-field>
            <b-field>
              <b-switch v-model.number="currItem.limitPurchases">
                <p class="has-text-white has-text-weight-bold">
                  Limit Purchases?
                </p>
              </b-switch>
            </b-field>
            <b-field
              v-show="currItem.limitPurchases"
              custom-class="has-text-white"
              label="Maximun # of Purchases allowed"
            >
              <b-input v-model.number="currItem.maxPurchases" type="number" />
            </b-field>
            <b-field
              custom-class="has-text-white"
              label="Value (if custom item)"
            >
              <b-input v-model="currItem.value" type="textarea" />
            </b-field>
            <p>
              Note: Whatever you type here will be sent to the member's DMs
              after they buy the item.
            </p>
          </form>
        </section>
        <footer class="modal-card-foot">
          <button
            class="button is-danger is-outlined"
            @click="toggleAdd = false"
          >
            Cancel
          </button>
          <button class="button is-primary" type="submit" form="shopitem">
            Add
          </button>
        </footer>
      </div>
    </b-modal>
  </section>
</template>

<script>
import API from "~/API.js";
import secret from "~/secrets.js";
import ShopItem from "~/components/ShopItem";

export default {
  head() {
    return {
      title: "Mr.Fox Bot - Economy"
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
    const [commands, config, banking, channels, roles] = await Promise.all([
      (await app.$axios.get(`/api/commands/${page}?guildID=${guildid} `, {
        headers: { Authorization: secret.encrypt(app.$auth.user.id) }
      })).data,
      (await app.$axios.get(`/api/guilds/${guildid}/config`, {
        headers: { Authorization: secret.encrypt(app.$auth.user.id) }
      })).data,
      (await app.$axios.get(`/api/guilds/${guildid}/banking`, {
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
      banking,
      channels,
      roles
    };
  },
  data() {
    return {
      commands: null,
      config: null,
      prompts: [],
      channels: null,
      roles: null,
      toggleAdd: false,
      filteredRoles: this.roles,
      filteredChannels: this.channels,
      currItem: {
        name: "",
        price: "",
        role: null,
        value: null,
        maxPurchases: 1,
        limitPurchases: false,
        buyers: []
      },
      bwModalActive: false,
      massModalActive: false,
      originalState: true
    };
  },
  methods: {
    editItem(item) {
      this.$modal.open({
        parent: this,
        component: ShopItem,
        hasModalCard: true,
        props: {
          item,
          shopItems: this.banking.shopItems,
          roles: this.roles
        },
        events: {
          itemedit: this.itemEdited
        }
      });
    },
    getChannelNames(channel) {
      this.filteredChannels = this.channels.filter(
        option =>
          `${option.name.toLowerCase()}`.indexOf(channel.toLowerCase()) >= 0
      );
    },
    async vername() {
      const result = await this.$validator.validate("Shop Name");
      result
        ? this.bankingUpdate("shopName", this.banking.shopName)
        : this.$toast.open("Incorrect Parameters.");
    },
    async vercurrency() {
      const result = await this.$validator.validate("Currency");
      result
        ? this.bankingUpdate("currency", this.banking.currency)
        : this.$toast.open("Incorrect Parameters.");
    },
    async verifyForm() {
      const result = await this.$validator.validateAll();
      result
        ? this.shopAction("add", this.currItem, "shopItems")
        : this.$toast.open("Invalid Parameters.");
    },
    itemEdited(banking) {
      this.banking = banking;
    },
    async shopAction(action, item, key) {
      if (action === "add") this.banking.shopItems.push(item);
      try {
        if (action === "add") {
          ({ data: this.banking } = await this.$axios.patch(
            `/api/guilds/${this.$route.params.guildid}/banking`,
            {
              key,
              value: this.banking.shopItems
            },
            {
              headers: {
                Authorization: secret.encrypt(this.$auth.user.id)
              }
            }
          ));
        } else {
          this.$dialog.confirm({
            title: "Delete Shop Item",
            message: `Are you sure that you would like to delete the shop item "${
              item.name
            }"?`,
            confirmText: "Delete",
            type: "is-danger",
            onConfirm: async () => {
              this.banking.shopItems.splice(
                this.banking.shopItems.indexOf(item),
                1
              );
              ({ data: this.banking } = await this.$axios.patch(
                `/api/guilds/${this.$route.params.guildid}/banking`,
                {
                  key: "shopItems",
                  value: this.banking.shopItems
                },
                {
                  headers: {
                    Authorization: secret.encrypt(this.$auth.user.id)
                  }
                }
              ));
            }
          });
        }
        this.toggleAdd = false;
      } catch (error) {
        action === "remove" && !this.banking.shopItems.find(i => i === item)
          ? this.banking.shopItems.push(item)
          : this.banking.shopItems.splice(
              this.banking.shopItems.indexOf(item),
              1
            );
        this.$dialog.alert({
          title: "Error",
          message: `Error Code ${error.response.status}: ${
            error.response.data.error
          }`,
          type: "is-danger"
        });
      }
    },
    getRoleNames(channel) {
      this.filteredRoles = this.roles.filter(
        option =>
          `${option.name.toLowerCase()}`.indexOf(channel.toLowerCase()) >= 0
      );
    },
    async bankingUpdate(key, value, options = {}) {
      try {
        this.banking = await API.bankingUpdate(
          key,
          value,
          this.$route.params.guildid,
          this.$auth.user.id,
          options
        );
        this.prompts.splice(this.prompts.indexOf(key), 1);
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
