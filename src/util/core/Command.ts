const userRegex: RegExp = new RegExp(/^(?:<@!?)?([0-9]+)>?$/);
const memberRegex: RegExp = new RegExp(/^(?:<@!?)?([0-9]+)>?$/);
const channelRegex: RegExp = new RegExp(/^(?:<#)?([0-9]+)>?$/);
const roleRegex: RegExp = new RegExp(/^(?:<@&)?([0-9]+)>?$/);
const regexs = {
    userOrMember: new RegExp("^(?:<@!?)?(\\d{17,19})>?$"),
    channel: new RegExp("^(?:<#)?(\\d{17,19})>?$"),
    role: new RegExp("^(?:<@&)?(\\d{17,19})>?$"),
    snowflake: new RegExp("^(\\d{17,19})$")
};
import { User, GuildMember, Message, Channel, Role } from "discord.js";
import { FoxClient } from "..";
import { FoxUser, FoxMessage } from "../extensions";
import { CommandInfo } from "../../types";
class Command {
    public client: FoxClient;
    public name: string;
    public description: string;
    public aliases?: string[];
    public usage?: string;
    public cooldown?: number;
    public extendedUsage?: any;
    public requiredPerms?: string[];
    public reqPermString?: string[];
    public patreonTier?: number;
    public guildOnly?: boolean;
    public enabled?: boolean;
    public category?: any;
    public executor?: User;
    public run: (message: FoxMessage, args: string[], prefix: string) => {};

    public constructor(client: FoxClient, info: CommandInfo) {
        Object.defineProperty(this, "client", { value: client });
        this.name = info.name;
        this.description = info.description;
        this.aliases = info.aliases || [];
        this.usage = info.usage;
        this.cooldown = info.cooldown || 0;
        this.extendedUsage = info.extendedUsage || null;
        this.requiredPerms = info.requiredPerms || [];
        this.reqPermString = info.requiredPerms ? info.requiredPerms.length ? info.requiredPerms.join(", ").replace(/`/g, "").trim().split(",") : [] : [];
        this.guildOnly = info.guildOnly || false;
        this.patreonTier = info.patreonTier || 0;
        this.enabled = info.enabled || true;
        this.category = null;
    }

    public hasPermission(message: FoxMessage): boolean { // eslint-disable-line
        return true;
    }

    public reload(): Promise<Command> {
        return new Promise((resolve, reject) => {
            try {
                delete require.cache[require.resolve(`../../commands/${this.category.toLowerCase()}/${this.name}.js`)];
                const cmd = require(`../../commands/${this.category.toLowerCase()}/${this.name}.js`);
                const clas = new cmd(this.client);
                this.client.commands.delete(this.name);
                clas.category = this.category;
                this.client.commands.set(clas);
                resolve(this);
            } catch (e) {
                reject(e);
            }
        });
    }

    public async user(user: any, msg: FoxMessage): Promise<boolean | User>{
        if (!user) return false;
        if (user instanceof User) return user;
        if (user instanceof GuildMember) return user.user;
        if (user instanceof Message) return user.author;
        const matches = userRegex.exec(user);
        if (matches) {
            if (typeof user === "string" && regexs.userOrMember.test(user)) {
                return await this.client.users.fetch(matches[1]).catch(() => null);
            }
            return false;
        }
        const search = user.toLowerCase();
        const users = msg.client.users.filter(userFilterInexact(search)).array();
        if (users.length === 1) return users[0];
        const exactUsers = users.filter(userFilterExact(search));
        if (exactUsers.length === 1) return exactUsers[0];
        if (exactUsers.length > 15) return false;
        return false;
    }

    public _registerExecutor(message: FoxMessage) {
        this.executor = message.author;
    }

    public async member(member: any, msg: FoxMessage): Promise<boolean | GuildMember> {
        if (!member) return false;
        if (member instanceof GuildMember) return msg.guild.members.fetch(member);
        if (member instanceof User) return msg.guild.members.fetch(member);
        const matches = memberRegex.exec(member);
        if (matches) {
            if (typeof member === "string" && regexs.userOrMember.test(member)) {
                const user = await this.client.users.fetch(regexs.userOrMember.exec(member)[1]).catch(() => null);
                if (user) return msg.guild.members.fetch(user).catch(() => null);
            }
            return false;
        }
        const search = member.toLowerCase();
        const members = msg.guild.members.filter(memberFilterInexact(search)).array();
        if (members.length === 1) return members[0];
        const exactMembers = members.filter(memberFilterExact(search));
        if (exactMembers.length === 1) return exactMembers[0];
        if (exactMembers.length > 15) return false;
        return false;
    }

    public async channel(channel: any, msg: FoxMessage): Promise<Channel | boolean> {
        if (!channel) return false;
        if (channel instanceof Channel) return channel;
        const matches = channelRegex.exec(channel);
        if (matches) {
            if (typeof channel === "string" && regexs.channel.test(channel)) return msg.client.channels.get(regexs.channel.exec(channel)[1]);
            return false;
        }
        const search = channel.toLowerCase();
        const channels = msg.guild.channels.filter(channelFilterInexact(search)).array();
        if (channels.length === 1) return channels[0];
        const exactChannels = channels.filter(channelFilterExact(search));
        if (exactChannels.length === 1) return exactChannels[0];
        if (exactChannels.length > 15) return false;
        return false;
    }

    public async role(role: any, msg: FoxMessage): Promise<Role | boolean> {
        if (!role) return false;
        const matches = roleRegex.exec(role);
        if (role instanceof Role) return role;
        if (matches) {
            if (typeof role === "string" && regexs.role.test(role)) return msg.guild.roles.get(regexs.role.exec(role)[1]);
            return false;
        }
        const search = role.toLowerCase();
        const roles = msg.guild.roles.filter(roleFilterInexact(search)).array();
        if (roles.length === 1) return roles[0];
        const exactRoles = roles.filter(roleFilterExact(search));
        if (exactRoles.length === 1) return exactRoles[0];
        if (exactRoles.length > 15) return false;
        return false;
    }

    public boolean(bool: any): boolean {
        if (!bool) return null;
        if (bool instanceof Boolean) return bool as boolean;
        if (["true", "+", "t", "yes", "y", "off"].includes(String(bool).toLowerCase())) return true;
        if (["0", "false", "-", "f", "no", "n", "on"].includes(String(bool).toLowerCase())) return false;
        return null;
    }

}

export default Command;

function userFilterExact(search: string) {
    return (user: FoxUser) => user.username.toLowerCase() === search ||
  `${user.username.toLowerCase()}#${user.discriminator}` === search;
}

function userFilterInexact(search: string) {
    return (user: FoxUser) => user.username.toLowerCase().includes(search) ||
  `${user.username.toLowerCase()}#${user.discriminator}`.includes(search);
}

function memberFilterExact(search: string) {
    return (mem: GuildMember) => mem.user.username.toLowerCase() === search ||
  (mem.nickname && mem.nickname.toLowerCase() === search) ||
  `${mem.user.username.toLowerCase()}#${mem.user.discriminator}` === search;
}

function memberFilterInexact(search: string) {
    return (mem: GuildMember) => mem.user.username.toLowerCase().includes(search) ||
  (mem.nickname && mem.nickname.toLowerCase().includes(search)) ||
  `${mem.user.username.toLowerCase()}#${mem.user.discriminator}`.includes(search);
}

function channelFilterExact(search: any) {
    return (channel: any) => channel.name.toLowerCase() === search;
}

function channelFilterInexact(search: Channel) {
    return (channel: any) => channel.name.toLowerCase().includes(search);
}

function roleFilterExact(search: string) {
    return (role: Role) => role.name.toLowerCase() === search;
}

function roleFilterInexact(search: string) {
    return (role: Role) => role.name.toLowerCase().includes(search);
}
