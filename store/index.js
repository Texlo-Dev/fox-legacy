import Vuex from 'vuex';
import crypto from 'crypto';

const createStore = () => {
    return new Vuex.Store({
        state: {
            token: null,
            isDash: false,
            cachedGuild: null,
            loading: false,
            encryptedID: null,
            dashLoaded: false
        },
        mutations: {
            dashLoading(state, bool) {
                state.dashLoaded = bool;
            },
            toggleDash(state, bool) {
                state.isDash = bool;
            },
            cacheGuild(state, guild) {
                state.cachedGuild = guild;
            },
            cacheToken(state, token) {
                state.token = token;
            },
        },
        getters: {
            loading: state => state.loading,
            isDash: state => state.isDash,
            token: state => state.token,
            cachedGuild: state => state.cachedGuild,
            dashLoaded: state => state.dashLoaded,
            id: state => state.user ? state.user.id : null,
            encryptedID: state => state.encryptedID,
            tag: state => state.user ? state.user.tag : null,
            username: state => state.user ? state.user.id : null,
            avatarURL: state => state.user ? state.user.avatarURL : null,
            user: state => state.user

        },
        actions: {
            init: ({ commit }) => commit('encryptID'),
            getGuilds: async ({ commit }) => {




            }
            /*login: ({ dispatch }, code) => dispatch("initToken", code).then(() => dispatch("fetchUser")),
            initToken: ({ dispatch, commit }, code) => {
                if (code) {
                    return dispatch("fetchToken", code);
                } else {
                    const token = localStorage.getItem("token");
                    if (token) return commit("setToken", token);
                }
                return commit("clearUser");
            },
            fetchToken: async ({ commit }, code) => {
                const data = await API.oauth(code);
                localStorage.setItem("token", data.token);
                return commit("setToken", data.token);
            },
            fetchUser: async ({ state, commit }) => {
                if (state.token) {
                    const user = await API.user(state.token);
                    return commit("setUser", user);
                }
            },
            logout: ({ commit }) => commit("clearUser")*/

        }
    })

}

export default createStore;