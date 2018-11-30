<template>
  <section class="hero is-black">
    <div class="hero-footer">
      <nav class="navbar is-spaced has-background-black is-transparent is-black is-fixed-top">
        <div class="container">
          <div class="navbar-brand">
            <nuxt-link class="navbar-item" to="/">
              <img id="foxlogo" :src="require('../assets/FoxLogov2.png')">
              <h1 class="title">Fox</h1>&nbsp;
            </nuxt-link>
            <div :class="{ 'is-active': showNav }" class="navbar-burger burger" @click="showNav = !showNav">
              <span/>
              <span/>
              <span/>
            </div>
          </div>
          <div :class="{ 'is-active': showNav }" class="navbar-menu">
            <div class="navbar-start" @click="showNav = !showNav">
              <nuxt-link class="navbar-item has-text-weight-bold" to="/about">
                <h1 class="subtitle has-text-left">About</h1>
              </nuxt-link>
              <a href="https://docs.mrfoxbot.xyz" target="_blank" class="navbar-item has-text-weight-bold">
                <h1 class="subtitle has-text-left">Documentation</h1>
              </a>
              <nuxt-link class="navbar-item has-text-weight-bold" to="/commands">
                <h1 class="subtitle has-text-left">Commands</h1>
              </nuxt-link>
              <!--<div class="navbar-item has-dropdown is-hoverable has-text-weight-semi-bold">
                <a class="navbar-link">
                  <h1 class="subtitle has-text-left">Documentation</h1>
                </a>
                <div class="navbar-dropdown is-boxed">
                  <router-link class="navbar-item" to="/getstarted">
                    <p class="has-text-primary">Getting Started</p>
                  </router-link>
                  <nuxt-link class="navbar-item" to="/commands">
                    <p class="has-text-primary">Commands</p>
                  </nuxt-link>
                  <nuxt-link class="navbar-item" to="/permissions">
                    <p class="has-text-primary">Permissions</p>
                  </nuxt-link>
                </div>
              </div>-->
              <a class="navbar-item has-text-weight-semi-bold" href="https://discord.gg/3R4Em2w">
                <h2 class="subtitle">Support</h2>
              </a>
            </div>
            <div class="navbar-end">
              <div class="navbar-item">
                <a href="https://patreon.com/foxdevteam" target="_blank" class="button patreon is-small is-danger">
                  <font-awesome-icon :icon="['fab', 'patreon']" size="1x" />
                  &nbsp;
                  Donate to Fox
                </a>
              </div>
              <div v-if="$auth.loggedIn" id="userbutton" class="navbar-item">
                <img :src="getAvatar" height="30" width="30" style="border-radius: 50px">&nbsp;&nbsp;
                <b-dropdown v-if="$auth.loggedIn" position="is-bottom-left">
                  <p slot="trigger" class="subtitle has-text-weight-semi-bold">
                    {{ $auth.user.username }}
                    &nbsp;<font-awesome-icon size="1x" icon="angle-down" />
                  </p>
                  <b-dropdown-item has-link @click="showNav = !showNav">
                    <nuxt-link to="/servers">
                      <p class="has-text-primary has-text-right">
                        <font-awesome-icon size="1x" icon="server" />
                        Servers
                      </p>
                    </nuxt-link>
                  </b-dropdown-item>
                  <b-dropdown-item has-link>
                    <nuxt-link to="/embed">
                      <p class="has-text-success has-text-right">
                        Embed Generator
                        <font-awesome-icon size="1x" icon="cogs" />
                      </p>
                    </nuxt-link>
                  </b-dropdown-item>
                  <b-dropdown-item @click="logout()">
                    <p class="has-text-danger has-text-right">
                      <font-awesome-icon size="1x" icon="sign-out-alt" />
                      Log Out
                    </p>
                  </b-dropdown-item>
                </b-dropdown>
              </div>
              <div v-else class="navbar-item">
                <button v-if="!$auth.loggedIn" class="button is-rounded is-black is-inverted is-outlined" @click="$auth.loginWith('discord')">
                  <font-awesome-icon :icon="['fab', 'discord']" size="s" pull="left"/>
                  <p>Login</p>
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </div>
  </section>
</template>

<script>
export default {
  data: () => ({ showNav: false }),
  computed: {
    getAvatar() {
      const auth = this.$auth;
      if (auth.user.avatar)
        return `https://cdn.discordapp.com/avatars/${auth.user.id}/${
          auth.user.avatar
        }.${auth.user.avatar.startsWith("a_") ? "gif" : "png"}?size=128`;
      else
        return `https://discordapp.com/assets/dd4dbc0016779df1378e7812eabaa04d.png`;
    }
  },
  methods: {
    logout() {
      this.$auth.logout().then((this.showNav = false));
    }
  }
};
</script>

<style>
#userbutton {
  cursor: pointer;
}

.patreonbutton {
  background-color: #f96854;
}
</style>
