import Vuex from "vuex";

const createStore = () => {
  return new Vuex.Store({
    state: {
      token: null,
      isDash: false,
      pwaStart: false,
      cachedGuild: null,
      loading: false,
      encryptedID: null,
      dashLoaded: false
    },
    mutations: {
      dashLoading(state, bool) {
        state.dashLoaded = bool;
      },
      isPWA(state, bool) {
        state.pwaStart = bool;
      },
      toggleDash(state, bool) {
        state.isDash = bool;
      },
      cacheGuild(state, guild) {
        state.cachedGuild = guild;
      },
      cacheToken(state, token) {
        state.token = token;
      }
    },
    getters: {
      loading: state => state.loading,
      isDash: state => state.isDash,
      token: state => state.token,
      cachedGuild: state => state.cachedGuild,
      dashLoaded: state => state.dashLoaded,
      id: state => (state.user ? state.user.id : null),
      encryptedID: state => state.encryptedID,
      tag: state => (state.user ? state.user.tag : null),
      username: state => (state.user ? state.user.id : null),
      avatarURL: state => (state.user ? state.user.avatarURL : null),
      user: state => state.user
    },
    actions: {
      init: ({ commit }) => commit("encryptID")
    }
  });
};

export default createStore;
