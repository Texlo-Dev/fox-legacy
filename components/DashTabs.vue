<template>
  <div class="hero" style="background-color: #2b2f33">
    <br class="is-hidden-touch" >
    <br >

    <div class="hero-head">
      <div class="container">
        <nav class="level">
          <div class="level-item has-text-centered">
            <figure class="image is-48x48">
              <img
                v-if="$store.state.cachedGuild.icon"
                :src="
                  `https://cdn.discordapp.com/icons/${
                    $store.state.cachedGuild.id
                  }/${$store.state.cachedGuild.icon}.jpg?size=128`
                "
                class="is-rounded"
              >
              <div v-if="!$store.state.cachedGuild.icon" class="guildicon">
                {{ getInitials($store.state.cachedGuild.name) }}
              </div>
              <br >
            </figure>
            <h1
              class="subtitle has-text-light has-text-weight-bold has-text-left"
            >
              &nbsp; {{ $store.state.cachedGuild.name }}
            </h1>
          </div>
          <br >
          <div class="level-item has-text-centered">
            <b-field>
              <b-radio-button size="is-small">
                <nuxt-link
                  :to="`/servers/${this.$route.params.guildid}`"
                  :class="{ 'is-outlined': selected === 1 }"
                  class="is-primary"
                ><p class="has-text-weight-bold">Packages</p></nuxt-link
                >
              </b-radio-button>
              <b-radio-button type="is-link" size="is-small">
                <nuxt-link
                  :to="`/servers/${this.$route.params.guildid}/permissions`"
                  :class="{ 'is-outlined': selected === 0 }"
                  class="is-primary"
                ><p class="has-text-weight-bold">Permissions</p></nuxt-link
                >
              </b-radio-button>
              <b-radio-button type="is-success" size="is-small">
                <nuxt-link to="/servers" class="is-success"
                ><p class="has-text-weight-bold">Change Server</p></nuxt-link
                >
              </b-radio-button>
            </b-field>
          </div>
        </nav>
      </div>
      <br >
    </div>
  </div>
</template>

<style>
.guildicon {
  border-radius: 128px;
  background-color: #2f3136;
  width: 48px;
  height: 48px;
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  font-family: "Raleway";
  font-size: small;
}

.tabs li.is-active a {
  border-width: 3px;
}

.tabs li a {
  border-width: 3px;
}

.tabs span {
  font-family: "Poppins";
}

.label {
  font-family: "Poppins";
}

#tabss {
  height: 115px;
}
</style>

<script>
export default {
  name: "DashTabs",
  computed: {
    selected() {
      if (this.$route.name === "servers-guildid-permissions") return 1;
      else return 0;
    }
  },
  methods: {
    getInitials(word) {
      return Array.prototype.map
        .call(word.split(" "), x => x.substring(0, 1).toUpperCase())
        .join("");
    },
    redirect(value) {
      if (value === 0) {
        return this.$router.push({
          path: `/servers/${this.$route.params.guildid}`
        });
      } else if (value === 1) {
        return this.$router.push({
          path: `/servers/${this.$route.params.guildid}/permissions`
        });
      }
    }
  }
};
</script>
