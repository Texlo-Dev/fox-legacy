<template>
    <section class="section">
        <div class="container">
            <h1 class="title has-text-white has-text-left">
				Server Permissions
			</h1>
            <div class="is-divider"></div>
        </div>
        <div class="container">
            <div class="columns is-multiline">
                <div class="column is-3">
                    <div class="box">
                        <h3 class="subtitle has-text-centered has-text-white">
                            Roles/Members
                            <button class="button is-small is-grey-darker is-rounded" @click="selectMenu = true" ><font-awesome-icon size="0.8x" icon="plus"/></button>
                        </h3>
                        <b-select class="has-text-centered" @input="createOverwrite(selectedRole)" v-model="selectedRole" v-if="selectMenu" placeholder="None">
                        <option
                        v-for="role of roles"
                        :value="role"
                        @input="createOverwrite(role)"
                        :key="role.id">
                        {{ role.name }}
                        </option>
                        </b-select>
                        <br v-if="selectMenu">
                        <aside class="menu">
                            <ul class="menu-list">
                                <li class="has-text-centered" :key="ow.id" v-for="ow of overwrites">
                                    <a @click="pointTarget(ow)" :class="{ 'is-active': activeTarget.id === ow.identifier.id }">
                                        <p class="has-text-white">{{ ow.identifier.name || ow.identifier.tag }}</p>
                                     </a>
                                </li>
                            </ul>
                        </aside>
                    </div>
                </div>
                <div class="column is-9">
                    <div class="box">
                        <div class="block">
                            <b-radio v-model="activeCat" v-for="(cmd, category) of permissions" :key="category" :native-value="category">
                                {{ category }}
                            </b-radio>
                        </div>
                        <div class="is-divider"></div>
                        <div class="content">
                            <h3 class="title has-text-white">{{ activeCat }} Permissions</h3>
                            <div v-for="perm of permissions[activeCat]" :key="perm.name">
                                <nav class="level is-mobile">
                                    <div class="level-left">
                                        <div class="level-item">
                                            <p class="subtitle has-text-white">
                                                {{ capitalize(perm.name.split('.')[1]) }}
                                            </p>
                                        </div>
                                        <div class="level-item">
                                            <div class="group">
                                                <button class="perm deny selected" v-if="activeOW.find(a => a.permission === perm.name) && activeOW.find(a => a.permission === perm.name).status === 'denied'">
                                                    <img src="https://discordapp.com/assets/46eac82bb5b3ccd5049e8b3a96910327.svg">
                                                </button>
                                                <button @click="savePerm(perm.name, 'denied')" v-else class="perm deny">
                                                    <img src="https://discordapp.com/assets/132b1ce1c085ff84256f3b16943bc782.svg">
                                                </button>
                                                <button class="perm pass selected" v-if="!activeOW.find(a => a.permission === perm.name) || activeOW.find(a => a.permission === perm.name).status === 'neutral'">
                                                    <img src="https://discordapp.com/assets/f081fef9b7d9610309e65b5282bd0ca9.svg">
                                                </button>
                                                <button @click="savePerm(perm.name, 'neutral')" v-else class="perm pass">
                                                    <img src="https://discordapp.com/assets/bbc9e257da833d4b7d22c82a1de8a0a0.svg">
                                                </button>
                                                <button class="perm allow selected" v-if="activeOW.find(a => a.permission === perm.name) && activeOW.find(a => a.permission === perm.name).status === 'allowed'">
                                                    <img src="https://discordapp.com/assets/7b5b950896ff4214b058f76ba0e84a7b.svg">
                                                </button>
                                                <button @click="savePerm(perm.name, 'allowed')" v-else class="perm allow">
                                                    <img src="https://discordapp.com/assets/ffeba954d48c1ac993679084cee38746.svg">
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </nav>
                                <p>{{ perm.description }}</p>
                                <br>
                            </div>
                            <button v-show="activeTarget.id !== $route.params.guildid" @click="permDelete(activeTarget)" class="button is-danger is-outlined">Remove {{ activeTarget.name || activeTarget.tag }}</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
</template>

<script>
import API from "~/API.js";
import secret from '~/secrets';
import { mapGetters } from "vuex";
export default {
    name: "FoxPermissions",
    head() {
		return {
			title: 'Mr.Fox Bot - Server Permissions',	
		}
    },
    async fetch({ store, app, params: { guildid } }) {
		if (store.state.cachedGuild) return;
        const token = app.$auth.getToken('discord');
        const { data: guild } = await app.$axios.get(`/api/guilds/${guildid}`, { headers: { Authorization: secret.encrypt(app.$auth.user.id) } });
       
		store.commit('cacheGuild', guild);
		store.commit('toggleDash', true);
    },
    async asyncData({ app, params: { guildid }, route }) {
        const page = route.path.split(guildid + '/')[1].replace(/\w\S*/g, txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
        const [permissions, channels, roles, overwrites] = await Promise.all([
			(await app.$axios.get(`/api/permissions`)).data,
		    (await app.$axios.get(`/api/guilds/${guildid}/channels`, { headers: { Authorization: secret.encrypt(app.$auth.user.id) } })).data,
            (await app.$axios.get(`/api/guilds/${guildid}/roles?all=true`, { headers: { Authorization: secret.encrypt(app.$auth.user.id) } })).data,
            (await app.$axios.get(`/api/permissions/${guildid}`, { headers: { Authorization: secret.encrypt(app.$auth.user.id) } })).data
		]);
        return {
            permissions, 
            roles, 
            channels,
            overwrites
        }
    },
    data() {
        return {
            loading: false,
            permissions: null,
            overwrites: null,
            roles: null,
            activeOW: [],
            selectedRole: null,
            activeTarget: null,
            activeCat: 'Automod',
            selectMenu: false,
            channels: null,
            selected: {
                names: [],
                scope: null,
                value: null,
                target: null,
                channel: null
            },
            commands: null
        };
    },
    created() {
        this.pointTarget(this.overwrites[0]);
    },
    methods: {
        capitalize(string) {
            return string.replace(/\w\S*/g, txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
        },
        pointTarget(ow) {
            this.activeTarget = ow.identifier;
            this.activeOW = ow.overwrites;
        },
        async permDelete(target) {
            this.$dialog.confirm({
                title: 'Delete Overwrites',
                message: `Are you sure that you would like to delete ALL permission overwrites for ${target.name || target.tag}?`,
                cancelText: 'No',
                confirmText: 'Delete',
                type: 'is-danger',
                onConfirm: async () => {
                    try {
                        ({ data: this.overwrites} = await this.$axios.delete(`/api/permissions/${this.$route.params.guildid}/${target.id}`, {
                            headers: { Authorization: secret.encrypt(this.$auth.user.id)}
                        }));
                        this.pointTarget(this.overwrites[this.overwrites.length - 1]);
                    } catch (error) {
                        this.$dialog.alert({
                            title: 'Error',
                            message: `There was an error deleting this message. ${error.message}`,
                            type: 'is-danger'
                        })
                    }
                }
            })
        },
        async createOverwrite(target) {
            try {
                ({ data: this.overwrites } = await this.$axios.patch(`/api/permissions/${this.$route.params.guildid}`, {
                    perm: 'automod.freespeech',
                    status: 'neutral',
                    target
                }, { progress: false, headers: { Authorization: secret.encrypt(this.$auth.user.id) } }));
                this.pointTarget(this.overwrites.find(o => o.identifier.id === target.id))
                this.selectMenu = false;
            } catch (error) {
                 this.$dialog.alert({
                    title: "Error",
                    message: `There was an error adding this overwrite. "${error.message}"`,
                    type: "is-danger"
                });
            }
        },
        async savePerm(name, status) {
            const ow = this.activeOW.find(o => o.permission === name);
            try {
                ({ data: this.overwrites } = await this.$axios.patch(`/api/permissions/${this.$route.params.guildid}`, {
                    perm: name,
                    target: this.activeTarget,
                    status
                }, { progress: false, headers: { Authorization: secret.encrypt(this.$auth.user.id) } }));
            } catch (error) {
                ({ data: this.overwrites } = await this.$axios.get(`/api/permissions/${this.$route.params.guildid}`, { 
                    progress: false, headers: { Authorization: secret.encrypt(this.$auth.user.id) } }));
                this.$dialog.alert({
                    title: "Error",
                    message: `There was an error setting this permission. "${error.message}"`,
                    type: "is-danger"
                });
            } finally { this.pointTarget(this.overwrites.find(o => o.identifier.id === this.activeTarget.id)); }
        }
    }
};
</script>

<style>
.select select {
background-color: #34383c;
}

.select.is-empty select {
color: #eff;
        
}

select {
font-family: 'Poppins';
}

.b-radio.radio .control-label:hover {
    color: #f37934;
    
}
.message-body {
    background-color: #242424
}
.group {
  display: flex;
}

.group:first-child {
  border-left-width: 1px;
  border-radius: 3px 0 0 3px;
}

.perm {
  cursor: pointer;
  outline: none;
  border-color: #18191c;
  height: 28px;
  width: 36px;
  background: transparent;
  border-style: solid;
  border-width: 1px 1px 1px 0;
  cursor: pointer;
  overflow: hidden;
  padding: 0;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.perm.deny {
  border-left-width: 1px;
  border-radius: 3px 0 0 3px;
}

.perm.deny.selected {
    background: url(https://discordapp.com/assets/bbc9e257da833d4b7d22c82a1de8a0a0.svg)

}

.perm.deny .perm.allow {
  border-width: 1px;
}

.perm.pass {
  border-left-width: 0;
  border-right-width: 0;
}

.perm.pass.selected {
  background: #747f8d;
}

.perm.allow.selected {
  background: #43b581;
  border-color: #43b581;
}

.perm.deny.selected {
  border-color: #f04747;
  background: #f04747;
}

.perm.allow {
  border-radius: 0 3px 3px 0;
}
</style>
