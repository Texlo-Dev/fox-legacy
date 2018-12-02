<template>
  <form id="edititem" @submit.prevent="validateItem">
    <div class="modal-card">
      <header class="modal-card-head">
        <p class="modal-card-title">Edit Shop Item</p>
      </header>
      <section class="modal-card-body">
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
            <p class="has-text-white has-text-weight-bold">Limit Purchases?</p>
          </b-switch>
        </b-field>
        <b-field
          v-show="currItem.limitPurchases"
          custom-class="has-text-white"
          label="Maximun # of Purchases allowed"
        >
          <b-input v-model.number="currItem.maxPurchases" type="number" />
        </b-field>
        <b-field custom-class="has-text-white" label="Value (if custom item)">
          <b-input v-model="currItem.value" type="textarea" />
        </b-field>
      </section>
      <footer class="modal-card-foot">
        <button class="button is-danger is-outlined" @click="$parent.close()">
          Cancel
        </button>
        <button class="button is-primary" type="submit" form="edititem">
          Edit
        </button>
      </footer>
    </div>
  </form>
</template>

<script>
import secret from "~/secrets";
export default {
  props: {
    item: {
      type: Object,
      required: true
    },
    shopItems: {
      type: Array,
      required: true
    },
    roles: {
      type: Array,
      required: true
    }
  },
  data() {
    return {
      currItem: null
    };
  },
  created() {
    this.currItem = { ...this.item };
    this.items = [...this.shopItems];
  },
  methods: {
    async validateItem() {
      const result = await this.$validator.validateAll();
      result
        ? this.editItem(this.currItem)
        : this.$toast.open("Invalid Parameters.");
    },
    async editItem() {
      try {
        this.items.splice(this.items.indexOf(this.item), 1);
        this.items.push(this.currItem);
        const { data: banking } = await this.$axios.patch(
          `/api/guilds/${this.$route.params.guildid}/banking`,
          {
            key: "shopItems",
            value: this.items
          },
          {
            headers: {
              Authorization: secret.encrypt(this.$auth.user.id)
            }
          }
        );
        this.$parent.close();
        this.currItem = null;
        this.items = null;
        this.$emit("itemedit", banking);
      } catch (error) {
        this.$dialog.alert({
          message: `Failed to edit this item. ${error.message}`,
          type: "is-danger"
        });
      }
    }
  }
};
</script>

<style></style>
