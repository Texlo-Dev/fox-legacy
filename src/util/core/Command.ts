//tslint:disable
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
import { Channel, GuildMember, Message, Role, User } from "discord.js";
import { FoxClient } from "..";
import { CommandInfo } from "../../types";
import { FoxMessage, FoxUser } from "../extensions";
class Command implements CommandInfo {
  public aliases?: string[];
  public category?: any;
  public client: FoxClient;
  public cooldown?: number;
  public description: string;
  public enabled?: boolean;
  public executor?: User;
  public extendedUsage?: any;
  public guildOnly?: boolean;
  public name: string;
  public patreonTier?: number;
  public reqPermString?: string[];
  public requiredPerms?: string[];
  public usage?: string;

  public constructor(client: FoxClient, info: CommandInfo) {
    Object.defineProperty(this, "client", { value: client });
    this.name = info.name;
    this.description = info.description;
    this.aliases = info.aliases || [];
    this.usage = info.usage;
    this.cooldown = info.cooldown || 0;
    this.extendedUsage = info.extendedUsage || null;
    this.requiredPerms = info.requiredPerms || [];
    this.reqPermString = info.requiredPerms
      ? info.requiredPerms.length
        ? info.requiredPerms
            .join(", ")
            .replace(/`/g, "")
            .trim()
            .split(",")
        : []
      : [];
    this.guildOnly = info.guildOnly || false;
    this.patreonTier = info.patreonTier || 0;
    this.enabled = info.enabled || true;
    this.category = null;
  }

  public _registerExecutor(message: FoxMessage) {
    this.executor = message.author;
  }

  public boolean(bool: any): boolean {
    if (!bool) {
      return null;
    }
    if (bool instanceof Boolean) {
      return bool as boolean;
    }
    if (
      ["true", "+", "t", "yes", "y", "off"].includes(String(bool).toLowerCase())
    ) {
      return true;
    }
    if (
      ["0", "false", "-", "f", "no", "n", "on"].includes(
        String(bool).toLowerCase()
      )
    ) {
      return false;
    }
    return null;
  }

  public async channel(channel: any, msg: FoxMessage): Promise<Channel> {
    if (!channel) {
      return null;
    }
    if (channel instanceof Channel) {
      return channel;
    }
    const matches = channelRegex.exec(channel);
    if (matches) {
      if (typeof channel === "string" && regexs.channel.test(channel)) {
        return msg.client.channels.get(regexs.channel.exec(channel)[1]);
      }
      return null;
    }
    const search = channel.toLowerCase();
    const channels = msg.guild.channels
      .filter(channelFilterInexact(search))
      .array();
    if (channels.length === 1) {
      return channels[0];
    }
    const exactChannels = channels.filter(channelFilterExact(search));
    if (exactChannels.length === 1) {
      return exactChannels[0];
    }
    if (exactChannels.length > 15) {
      return null;
    }
    return null;
  }

  public hasPermission(message: FoxMessage): boolean {
    return true;
  }

  public async member(member: any, msg: FoxMessage): Promise<GuildMember> {
    if (!member) {
      return null;
    }
    if (member instanceof GuildMember) {
      return msg.guild.members.fetch(member);
    }
    if (member instanceof User) {
      return msg.guild.members.fetch(member);
    }
    const matches = memberRegex.exec(member);
    if (matches) {
      if (typeof member === "string" && regexs.userOrMember.test(member)) {
        const user = await this.client.users
          .fetch(regexs.userOrMember.exec(member)[1])
          .catch(() => null);
        if (user) {
          return msg.guild.members.fetch(user).catch(() => null);
        }
      }
      return null;
    }
    const search = member.toLowerCase();
    const members = msg.guild.members
      .filter(memberFilterInexact(search))
      .array();
    if (members.length === 1) {
      return members[0];
    }
    const exactMembers = members.filter(memberFilterExact(search));
    if (exactMembers.length === 1) {
      return exactMembers[0];
    }
    if (exactMembers.length > 15) {
      return null;
    }
    return null;
  }

  public reload(): Promise<Command> {
    return new Promise((resolve, reject) => {
      try {
        delete require.cache[
          require.resolve(
            `../../commands/${this.category.toLowerCase()}/${this.name}.js`
          )
        ];
        const cmd = require(`../../commands/${this.category.toLowerCase()}/${
          this.name
        }.js`);
        const clas = new cmd.default(this.client);
        this.client.commands.delete(this.name);
        clas.category = this.category;
        this.client.commands.set(clas);
        resolve(this);
      } catch (e) {
        reject(e);
      }
    });
  }

  public static async role(role: any, msg: FoxMessage): Promise<Role> {
    if (!role) {
      return null;
    }
    const matches = roleRegex.exec(role);
    if (role instanceof Role) {
      return role;
    }
    if (matches) {
      if (typeof role === "string" && regexs.role.test(role)) {
        return msg.guild.roles.get(regexs.role.exec(role)[1]);
      }
      return null;
    }
    const search = role.toLowerCase();
    const roles = msg.guild.roles.filter(roleFilterInexact(search)).array();
    if (roles.length === 1) {
      return roles[0];
    }
    const exactRoles = roles.filter(roleFilterExact(search));
    if (exactRoles.length === 1) {
      return exactRoles[0];
    }
    if (exactRoles.length > 15) {
      return null;
    }
    return null;
  }

  public run(message: FoxMessage, args: string[], prefix: string): void {
    // in other classes.
  }

  public async user(user: any, msg: FoxMessage): Promise<User> {
    if (!user) {
      return null;
    }
    if (user instanceof User) {
      return user;
    }
    if (user instanceof GuildMember) {
      return user.user;
    }
    if (user instanceof Message) {
      return user.author;
    }
    const matches = userRegex.exec(user);
    if (matches) {
      if (typeof user === "string" && regexs.userOrMember.test(user)) {
        return this.client.users.fetch(matches[1]).catch(() => null);
      }
      return null;
    }
    const search = user.toLowerCase();
    const users = msg.client.users.filter(userFilterInexact(search)).array();
    if (users.length === 1) {
      return users[0];
    }
    const exactUsers = users.filter(userFilterExact(search));
    if (exactUsers.length === 1) {
      return exactUsers[0];
    }
    if (exactUsers.length > 15) {
      return null;
    }
    return null;
  }
}

export default Command;

function userFilterExact(search: string) {
  return (user: FoxUser) =>
    user.username.toLowerCase() === search ||
    `${user.username.toLowerCase()}#${user.discriminator}` === search;
}

function userFilterInexact(search: string) {
  return (user: FoxUser) =>
    user.username.toLowerCase().includes(search) ||
    `${user.username.toLowerCase()}#${user.discriminator}`.includes(search);
}

function memberFilterExact(search: string) {
  return (mem: GuildMember) =>
    mem.user.username.toLowerCase() === search ||
    (mem.nickname && mem.nickname.toLowerCase() === search) ||
    `${mem.user.username.toLowerCase()}#${mem.user.discriminator}` === search;
}

function memberFilterInexact(search: string) {
  return (mem: GuildMember) =>
    mem.user.username.toLowerCase().includes(search) ||
    (mem.nickname && mem.nickname.toLowerCase().includes(search)) ||
    `${mem.user.username.toLowerCase()}#${mem.user.discriminator}`.includes(
      search
    );
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
