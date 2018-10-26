<template>
  <form id="custcmd" @submit.prevent="validateCmd">
    <div class="modal-card">
      <header class="modal-card-head">
        <p class="modal-card-title">Edit Command</p>
      </header>
      <section class="modal-card-body">
        <b-field :type="{ 'is-danger': errors.has('command name') }" :message="errors.first('command name')" custom-class="has-text-white" label="Command Name">
          <b-input v-validate="'required|max:8'" v-model="cmd.name" name="command name"/>
        </b-field>
        <b-field :type="{ 'is-danger': errors.has('description') }" :message="errors.first('description')" custom-class="has-text-white" label="Command Description">
          <b-input v-validate="'required|max:40'" v-model="cmd.description" name="description"/>
        </b-field>
        <b-field :type="{ 'is-danger': errors.has('response') }" :message="errors.first('response')" custom-class="has-text-white" label="Command Response">
          <b-input v-validate="'required|max:2000'" v-model="cmd.template" name="response" type="textarea"/>
        </b-field>
        <b-field custom-class="has-text-white" label="Command Cooldown (Seconds)">
          <b-input v-model.number="cmd.cooldown" type="number"/>
        </b-field>
        <b-field custom-class="has-text-white" label="Command Required Permissions (Optional)">
          <b-select v-model="cmd.requiredPerms" multiple>
            <optgroup v-for="(key, category) in permissions" :key="category" :label="category">
              <option v-for="perm of permissions[category]" :key="perm.name" :value="perm.name">{{ perm.name }}</option>
            </optgroup>
          </b-select>
        </b-field>
        <b-field>
          <b-switch v-model="cmd.deleteCommand" type="is-primary">
            <p class="has-text-white has-text-weight-bold">Delete Command after execution?</p>
          </b-switch>
        </b-field>
        <b-field>
          <b-switch v-model="cmd.dmCommand" type="is-primary">
            <p class="has-text-white has-text-weight-bold">DM Command?</p>
          </b-switch>
        </b-field>
      </section>
      <footer class="modal-card-foot">
        <button class="button" type="button" @click="$parent.close()">Close</button>
        <button class="button is-primary" type="submit" form="custcmd">Edit</button>
      </footer>
    </div>
    
  </form>

    
</template>

<script>
import secret from "~/secrets";
export default {
  props: {
    command: {
      type: Object,
      required: true
    },
    permissions: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      cmd: null
    };
  },
  created() {
    this.cmd = { ...this.command };
  },
  methods: {
    async validateCmd() {
      const result = await this.$validator.validateAll();
      result
        ? this.editCommand(this.cmd)
        : this.$toast.open("Invalid Parameters.");
    },
    async editCommand() {
      try {
        const { data: commands } = await this.$axios.patch(
          `/api/guilds/${this.$route.params.guildid}/customcommands/${
            this.command.name
          }`,
          this.cmd,
          {
            headers: {
              Authorization: secret.encrypt(this.$auth.user.id)
            }
          }
        );
        this.$parent.close();
        this.cmd = null;
        this.$emit("cmdedit", commands);
      } catch (error) {
        console.error(error);
      }
    }
  }
};
</script>

<style>
</style>
