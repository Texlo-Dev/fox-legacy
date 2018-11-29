<template>
  <div>
    <br>
    <section class="section">
      <div class="container">
        <h1 class="title has-text-white has-text-left">
          Embed Generator
        </h1>
        <div class="is-divider" />
      </div>
      <div class="container">
        <form id="embed" @submit.prevent="verifyForm">
          <div class="columns">
            <div class="column is-half">
              <b-field :type="{ 'is-danger': errors.has('Mode') }" :message="errors.first('Mode')" custom-class="has-text-white" label="Embed Mode">
                <b-select v-validate="'required'" v-model="mode" name="Mode" placeholder="Select Mode">
                  <option value="webhook">Webhook</option>
                  <option value="native">Via Mr.Fox</option>
                </b-select>
              </b-field>
              <div v-if="mode === 'webhook'">
                <b-field :type="{ 'is-danger': errors.has('Webhook URL') }" :message="errors.first('Webhook URL')" label="Webhook URL" custom-class="has-text-white">
                  <b-input v-validate="'required'" v-model="embed.whurl" name="Webhook URL" placeholder="https://discordapp.com/api/webhooks/webhookid/exampletoken"/>
                </b-field>
                <br>
              </div>
              <div v-else-if="mode === 'native'">
                <b-field :type="{ 'is-danger': errors.has('Server') }" :message="errors.first('Server')" label="Choose Server" custom-class="has-text-white">
                  <b-select 
                    v-validate="'required'" 
                    id="modalselect"
                    v-model="guild"
                    name="Server"  
                    placeholder="None"  
                    @input="fetchChannels(guild)"
                  >
                    <option
                      v-for="guild of guilds"
                      :value="guild.id"
                      :key="guild.id"
                    >
                      {{ guild.name }}
                    </option>
                  </b-select>
                </b-field>
                <b-field :type="{ 'is-danger': errors.has('Channel') }" :message="errors.first('Channel')" label="Channel" custom-class="has-text-white">
                  <b-select v-validate="'required'" id="modalselect" v-model="embed.channel" name="Channel" placeholder="None">
                    <option
                      v-for="channel of channels"
                      :value="channel.id"
                      :key="channel.id">
                      #{{ channel.name }}
                    </option>
                  </b-select>
                </b-field>
                <br>
              </div>
              <b-field :type="{ 'is-danger': errors.has('Title') }" :message="errors.first('Title')" label="Embed Core" custom-class="has-text-white">
                <b-input v-validate="'max:256'" v-model="embed.title" name="Title" placeholder="Title"/>
              </b-field>
              <b-field :type="{ 'is-danger': errors.has('Description') }" :message="errors.first('Description')">
                <b-input v-validate="'max:2048'" v-model="embed.description" name="Description" type="textarea" placeholder="Description" />
              </b-field>
              <b-field label="Color" custom-class="has-text-white">
                <b-input v-model="embed.color" :value="embed.color" type="color" />
              </b-field>
              <b-field :type="{ 'is-danger': errors.has('Author Name') }" :message="errors.first('Author Name')" label="Author" custom-class="has-text-white">
                <b-input v-validate="'max:256'" v-model="embed.author.name" name="Author Name" placeholder="Author Name"/>
              </b-field>
              <b-field>
                <b-input v-model="embed.author.icon_url" placeholder="Icon URL" />
              </b-field>
              <b-field>
                <b-input v-model="embed.author.url" placeholder="URL" />
              </b-field>
              <b-field label="Images" custom-class="has-text-white">
                <b-input v-model="embed.image.url" placeholder="Image URL"/>
              </b-field>
              <b-field>
                <b-input v-model="embed.thumbnail.url" placeholder="Thumbnail URL"/>
              </b-field>
              <b-field label="Fields" custom-class="has-text-white" />
              <b-field :type="{ 'is-danger': errors.has('Field Entry') }" :message="errors.first('Field Entry')" custom-class="has-text-white">
                <b-input v-validate="'max:256'" v-model="currfield.name" name="Field Entry" placeholder="Name"/>
                <b-input v-validate="'max:1024'" v-model="currfield.value" name="Field Entry" placeholder="Value"/>
                &nbsp;&nbsp;
                <b-checkbox v-model="currfield.inline" custom-class="has-text-white">
                  Inline Field
                </b-checkbox>
                <p class="control">
                  <button class="button is-black" type="button" @click="addfield()">Add Field</button>
                </p>
              </b-field>
              <b-field v-for="field of embed.fields" :key="field.name" :type="{ 'is-danger': errors.has('Field Entry') }" :message="errors.first('Field Entry')">
                <b-input v-validate="'max:256'" v-model="field.name" name="Field Entry"/>
                <b-input v-validate="'max:1024'" v-model="field.value" name="Field Entry"/>
                &nbsp;
                <b-checkbox v-model="field.inline">
                  Inline
                </b-checkbox>
              </b-field>
              <b-field :type="{ 'is-danger': errors.has('Footer Text') }" :message="errors.first('Footer Text')" label="Footer" custom-class="has-text-white">
                <b-input v-validate="'max:2048'" v-model="embed.footer.text" name="Footer Text" placeholder="Text"/>
              </b-field>
              <b-field>
                <b-input v-model="embed.footer.icon_url" placeholder="Icon URL"/>
              </b-field>
            </div>
            <div class="column is-half">
              <div class="box">
                <div class="content">
                  <h3 class="title has-text-white has-text-left">
                    In JSON format
                  </h3>
                  <b-field :type="{'is-danger': err.get('json')}" :message="err.get('json')">
                    <b-input v-model="jsonembed" type="textarea" />
                  </b-field>
                </div>
              </div>
            </div>
          </div>
          <button class="button is-success" type="submit" form="embed">Create</button>
        </form>
      </div>
    </section>
  </div>
    
</template>

<script>
import secret from "~/secrets.js";
import { Chrome } from "vue-color";

export default {
  components: {
    Chrome
  },
  head() {
    return {
      title: "Mr.Fox Bot - Embed Generator",
      meta: [
        {
          hid: "description",
          name: "description",
          content: "Generate a cool embed to use with either Discord we"
        }
      ]
    };
  },
  async asyncData({ app }) {
    const token = app.$auth.getToken("discord");
    const { data: guilds } = await app.$axios.get(`/api/guilds`, {
      headers: {
        Authorization: secret.encrypt(token.split("Bearer")[1].trim())
      }
    });
    return {
      guilds
    };
  },
  data() {
    return {
      mode: null,
      err: new Map(),
      toggleColor: false,
      prompts: [],
      currfield: {
        name: null,
        value: null,
        inline: false
      },
      embed: {
        color: "#eff",
        footer: {},
        fields: [],
        author: {},
        image: {},
        thumbnail: {}
      },
      guild: null,
      channels: null
    };
  },
  computed: {
    jsonembed: {
      get() {
        return JSON.stringify(this.embed);
      },
      set(embed) {
        try {
          this.embed = JSON.parse(embed);
          this.err.delete("json");
        } catch (error) {
          this.err.set("json", error.message);
        }
      }
    }
  },
  methods: {
    changeColor(color) {
      this.embed.color = color.hex;
    },
    async addfield() {
      if (this.embed.fields.length > 25)
        return this.$snackbar.open({
          message: "Maximum field count is 25.",
          type: "is-danger"
        });
      const fld = { ...this.currfield };
      await this.embed.fields.push(fld);
      this.currfield.name = null;
      this.currfield.value = null;
    },
    async fetchChannels(guild) {
      return ({ data: this.channels } = await this.$axios.get(
        `/api/guilds/${guild}/channels`,
        {
          headers: { Authorization: secret.encrypt(this.$auth.user.id) }
        }
      ));
    },
    async verifyForm() {
      const result = await this.$validator.validateAll();
      return result ? this.sendEmbed(this.embed) : undefined;
    },
    async sendEmbed(embed) {
      try {
        await this.$axios.post(`/api/embed`, embed, {
          headers: { Authorization: secret.encrypt(this.$auth.user.id) }
        });
        this.$snackbar.open({
          message: `Embed successfully sent.`,
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
      }
    }
  }
};
</script>

<style>
.select.is-empty select {
  color: #eff;
}
.check {
  background-color: #242424;
}
.b-checkbox.checkbox .control-label {
  color: #eff;
  font-family: "Poppins";
}
</style>
