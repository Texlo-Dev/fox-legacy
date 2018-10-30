const FoxPermission = require('./FoxPermission');
class FoxPermissions {

    constructor(member) {
        this.client = member.client;
        this.guild = member.guild;
        this.member = member;
    }

    collection(message) {
        return this.guild.owner.id === message.member.id ? this.guild.permissions : this.guild.permissions.filter(perm => message.member.roles.some(role => perm.allowed.indexOf(role.id) > -1) || perm.members.indexOf(message.member.guild.id + message.member.id) > -1 || perm.members.includes(message.channel.id + message.member.id) || message.member.roles.some(role => perm.members.includes(message.channel.id + role.id)));
    }

    async refresh() {
        const permfind = await this.client.mongo.permissions.find();
        let perms = permfind.map(perm => perm.get());
        perms = perms.sort((p, c) => p.category > c.category ? 1 : p.name > c.name && p.category === c.category ? 1 : -1);
        await this.guild.permissions.clear();
        for (const perm of perms) {
            const foxperm = new FoxPermission(this.client, perm);
            this.guild.permissions.set(foxperm.name, foxperm);
        }
    }

    has(message, permission) {
        const perm = this.guild.permissions.get(permission);
        if (!perm) return null;
        else if (this.guild.ownerID === this.member.id) return true;
        else if (perm.denied.indexOf(this.guild.id + this.member.id) > -1 || perm.denied.indexOf(message.channel.id + this.member.id) > -1 || this.member.roles.some(role => perm.denied.indexOf(role.id) > -1) || this.member.roles.some(role => perm.denied.indexOf(message.channel.id + role.id) > -1) || perm.denied.indexOf(this.guild.id) > -1) return false;
        else if (perm.allowed.indexOf(this.guild.id + this.member.id) > -1 || perm.allowed.indexOf(message.channel.id + this.member.id) > -1 || this.member.roles.some(role => perm.allowed.indexOf(role.id) > -1 || this.member.roles.some(role => perm.allowed.indexOf(message.channel.id + role.id) > -1) || perm.allowed.indexOf(this.guild.id) > -1)) return true;
        else return null;
    }

    /* fetchChannels(array) {
        for (const users of array) {
            if (user.tag)
        }
    }*/


    async allow(permission, id, message) {
        const perm = await this.client.mongo.permissions.findOne({ name: permission });
        if (!perm && message) return message.error(' Sorry, but this permission doesn\'t exist.');
        const arr = perm.get('allowed');
        if (arr.indexOf(id) > -1) return false;
        const denied = perm.get('denied');
        if (denied.indexOf(id) > -1) denied.splice(denied.indexOf(id), 1);
        arr.push(id);
        perm.set({ allowed: arr, denied });
        await perm.save();
        await this.refresh();
        return true;
    }

    async deny(permission, id, message) {
        const perm = await this.client.mongo.permissions.findOne({ name: permission });
        if (!perm && message) return message.error(' Sorry, but this permission doesn\'t exist.');
        const arr = perm.get('denied');
        if (arr.indexOf(id) > -1) return false;
        const allowed = perm.get('allowed');
        if (allowed.indexOf(id) > -1) allowed.splice(allowed.indexOf(id), 1);
        arr.push(id);
        perm.set({ denied: arr, allowed });
        await perm.save();
        await this.refresh();
        return true;
    }

    async allowBulk(category, id, message, info) {
        const perms = message.guild.permissions.filter(perm => perm.category.match(new RegExp(`${category}`, 'i'))).map(p => p.name);
        for (const p of perms) {
            const perm = await this.client.mongo.permissions.findOne({ name: p });
            if (!perm) continue;
            const arr = perm.get('allowed');
            if (arr.indexOf(id) > -1) continue;
            const denied = perm.get('denied');
            if (denied.indexOf(id) > -1) denied.splice(denied.indexOf(id), 1);
            arr.push(id);
            perm.set({ allowed: arr, denied });
            await perm.save();
        }
        await this.refresh();
        if (info.name === 'user') return message.FoxEmbed({ header: 'Set Permission' }, `${this.client.capitalizeStr(category)} permissions for the user ${info.user} are now set to **true**.`);
        else if (info.name === 'role') return message.FoxEmbed({ header: 'Set Permission' }, `${this.client.capitalizeStr(category)} permissions for the role ${info.role} are now set to **true**.`);
        else if (info.name === 'channeluser') return message.FoxEmbed({ header: 'Set Permission' }, `${this.client.capitalizeStr(category)} permissions for the user ${info.user} in the channel ${info.channel} are now set to **true**.`);
        else if (info.name === 'channelrole') return message.FoxEmbed({ header: 'Set Permission' }, `${this.client.capitalizeStr(category)} permissions for the role ${info.role} in the channel ${info.channel} are now set to **true**.`);
        else if (info.name === 'everyone') return message.FoxEmbed({ header: 'Set Permission' }, `${this.client.capitalizeStr(category)} permissions for everyone are now set to **true**.`);
    }

    async denyBulk(category, id, message, info) {
        const perms = message.guild.permissions.filter(perm => perm.category.match(new RegExp(`${category}`, 'i'))).map(p => p.name);
        for (const p of perms) {
            const perm = await this.client.mongo.permissions.findOne({ name: p });
            if (!perm) continue;
            const arr = perm.get('denied');
            if (arr.indexOf(id) > -1) continue;
            const allowed = perm.get('allowed');
            if (allowed.indexOf(id) > -1) allowed.splice(allowed.indexOf(id), 1);
            arr.push(id);
            perm.set({ denied: arr, allowed });
            await perm.save();
        }
        await this.refresh();
        if (info.name === 'user') return message.FoxEmbed({ header: 'Set Permission' }, `${this.client.capitalizeStr(category)} permissions for the user ${info.user} are now set to **false**.`);
        else if (info.name === 'role') return message.FoxEmbed({ header: 'Set Permission' }, `${this.client.capitalizeStr(category)} permissions for the role ${info.role} are now set to **false**.`);
        else if (info.name === 'channeluser') return message.FoxEmbed({ header: 'Set Permission' }, `${this.client.capitalizeStr(category)} permissions for the user ${info.user} in the channel ${info.channel} are now set to **false**.`);
        else if (info.name === 'channelrole') return message.FoxEmbed({ header: 'Set Permission' }, `${this.client.capitalizeStr(category)} permissions for the role ${info.role} in the channel ${info.channel} are now set to **false**.`);
        else if (info.name === 'everyone') return message.FoxEmbed({ header: 'Set Permission' }, `${this.client.capitalizeStr(category)} permissions for everyone are now set to **false**.`);
    }


}

module.exports = FoxPermissions;
