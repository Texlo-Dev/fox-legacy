import crypto from 'crypto';
const secrets = require('./secrets');
const API_URL = process.env.APIURL;


export default class API {

    static encrypt(data, secret) {
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv('aes-256-cbc', secret, iv);
        return `${cipher.update(JSON.stringify(data), 'utf8', 'base64') + cipher.final('base64')}.${iv.toString('base64')}`;
    }
    

    static callback(code) {
        return API._request("oauth/callback", { query: { code } });
    }


    static oauth(code) {
        return API._request("oauth", { query: { code } });
    }


    static user(token) {
        return API._request("users/@me", { headers: { Authorization: API.encrypt(token, process.env.CLIENTSECRET) } });
    }

    static channels(guildID) {
        return API._request("channels", { query: { guildID } });
    }

    static roles(guildID) {
        return API._request("roles", { query: { guildID } });
    }

    static commands() {
        return API._request("commands");
    }

    static settingUpdate(key, value, guildID, token, options = { bool: true }) {
        return API._request("settingUpdate", { method: "POST", data: { key, value, guildID, bool: options.bool }, headers: { Authorization: API.encrypt(token, process.env.CLIENTSECRET) } });
    }

    static setPermission(data, token) {
        return API._request("setPermission", { method: "POST", data, headers: { Authorization: API.encrypt(token, process.env.CLIENTSECRET) } });
    }

    static settingArrayUpdate(key, value, guildID, token, options = { array: false }) {
        return API._request("settingArrayUpdate", { method: "POST", data: { key, value, guildID, array: options.array }, headers: { Authorization: API.encrypt(token, process.env.CLIENTSECRET) } });
    }

    static pkgCommands(pkg, guildID, token) {
        return API._request(`commands/${pkg}`, { query: { guildID }, headers: { Authorization: API.encrypt(token, process.env.CLIENTSECRET) } });
    }

    static pkgUpdate(pkg, guildID, enabled, token) {
        return API._request(`pkgUpdate`, { method: "POST", data: { guildID, pkg, enabled }, headers: { Authorization: API.encrypt(token, process.env.CLIENTSECRET) } });
    }

    static userGuilds(token) {
        return API._request("userGuilds", { headers: { Authorization: API.encrypt(token, process.env.CLIENTSECRET) } });
    }

    static guildPackages(id, token) {
        return API._request(`getPackages/${id}`, { headers: { Authorization: API.encrypt(token, process.env.CLIENTSECRET) } });
    }

    static guildConfig(id, token) {
        return API._request(`guildConfig/${id}`, { headers: { Authorization: API.encrypt(token, process.env.CLIENTSECRET) } });
    }

    static guildLeveling(id, token) {
        return API._request(`guildLeveling/${id}`, { headers: { Authorization: API.encrypt(token, process.env.CLIENTSECRET) } });
    }

    static levelingUpdate(key, value, guildID, token) {
        return API._request(`levelingUpdate`, { method: "POST", data: { key, value, guildID }, headers: { Authorization: API.encrypt(token, process.env.CLIENTSECRET) } });
    }

    static bankingUpdate(key, value, guildID, token, options = { bool: true }) {
        return API._request(`bankingUpdate`, { method: "POST", data: { key, value, guildID, bool: options.bool }, headers: { Authorization: API.encrypt(token, process.env.CLIENTSECRET) } });
    }

    static guildBanking(id, token) {
        return API._request(`guildBanking/${id}`, { headers: { Authorization: API.encrypt(token, process.env.CLIENTSECRET) } });
    }

    static addTag(guildID, tagName, tagContent, token, array = null) {
        return API._request(`addTag`, { method: "POST", data: { guildID, tagName, tagContent, array }, headers: { Authorization: API.encrypt(token, process.env.CLIENTSECRET) } });
    }

    static guildTags(guildID, token) {
        return API._request(`guildTags`, { query: { guildID }, headers: { Authorization: API.encrypt(token, process.env.CLIENTSECRET) } });
    }

    static permission() {
        return API._request("permissions");
    }

    static toggleCommand(command, guildID, bool, token) {
        return API._request("command/toggleCommand", { method: "POST", data: { guildID, command, bool }, headers: { Authorization: API.encrypt(token, process.env.CLIENTSECRET) } });
    }

    static _request(endpoint, options = {}) {
        if (process.client) {
            return window.$nuxt.$axios.request({
                url: `/api/${endpoint}`,
                method: options.method || "get",
                headers: options.headers || {},
                data: options.data || null,
                params: options.query || {}
            }).then(res => res.data);
        }

    }

}

