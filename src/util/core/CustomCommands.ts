import CustomCommand from "./CustomCommand";
import { Collection, User, Channel } from "discord.js";
import { FoxGuild, FoxMessage } from "../extensions";
export default class CustomCommands extends Collection<any, any> {
    public readonly guild: FoxGuild;
    public readonly actions: any;
    public readonly variables: any;

    public constructor(guild: FoxGuild) {
        super();
        this.guild = guild;
        this.actions = {
            async addRole(message: FoxMessage, role: any): Promise<void> {
                if (role.match(/^(\\d{17,19})$/)) await message.member.roles.add(role);
                else if (message.guild.roles.some(r => r.name === role)) await message.member.roles.add(message.guild.roles.find(r => r.name === role));
            },
            async removeRole(message: FoxMessage, role: any): Promise<void> {
                if (role.match(/^(\\d{17,19})$/)) message.member.roles.remove(role);
                else if (message.guild.roles.some(r => r.name === role)) await message.member.roles.remove(message.guild.roles.find(r => r.name === role));
            },
            async setNickname (message: FoxMessage, nickname: string): Promise<void> {
                const member = await message.guild.members.fetch(message.author);
                if (member) await member.setNickname(nickname);
            },
            async createChannel(message: FoxMessage, channel: string): Promise<void> {
                await message.guild.channels.create(channel, {
                    type: "text"
                });
            }
        };

        this.variables = {
            member: (message: FoxMessage): User => message.author,
            "member.name": (message: FoxMessage): string => message.member.displayName,
            "member.tag": (message: FoxMessage): string => message.author.tag,
            "member.avatar": (message: FoxMessage): string => message.author.displayAvatarURL({ format: "png" }),
            "member.id": (message: FoxMessage): string => message.member.id,
            server: (message: FoxMessage): string => message.guild.name,
            "server.id": (message: FoxMessage): string => message.guild.id,
            "server.icon": (message: FoxMessage): string => message.guild.iconURL() || "Blank.",
            channel: (message: FoxMessage): Channel => message.channel,
            "channel.id": (message: FoxMessage): string => message.channel.id,
            message: (message: FoxMessage): string => message.content
        };
    }

    public async reloadAll(): Promise<boolean> {
        const commands: any[] = await this.guild.client.mongo.customcommands.find({ guildID: this.guild.id });
        if (!commands) return;
        const mapped = commands.map(c => c.get());
        if (!mapped.length) return;
        await super.sweep((c: CustomCommand) => c);
        for await (const cmd of mapped) {
            const command = new CustomCommand(this.guild, cmd);
            super.set(command.name, command);
        }
        return true;
    }

    public async add(data: any): Promise<Object> {
        const obj = {
            guildID: this.guild.id,
            name: data.name,
            category: "Custom Commands",
            cooldown: data.cooldown || 0,
            description: data.description || "None",
            dmCommand: data.dmCommand,
            deleteCommand: data.deleteCommand,
            enabled: true,
            usage: data.usage,
            aliases: [],
            requiredPerms: data.requiredPerms || [],
            template: data.template
        };

        const entry: any = new this.guild.client.mongo.customcommands(obj);
        try {
            await entry.save();
            const command = new CustomCommand(this.guild, obj);
            super.set(command.name, command);
            return new Promise(res => {
                setTimeout(() => {
                    res(super.array());
                }, 30);
            });
        } catch (error) {
            throw error;
        }
    }

    public async remove(command: string): Promise<Object> {
        if (!super.has(command)) throw new Error("Command does not exist in server.");
        const entry = await this.guild.client.mongo.customcommands.findOne({ guildID: this.guild.id, name: command });
        if (!entry) throw new Error("Could not resolve command in database.");
        await entry.remove();
        await super.delete(command);
        return new Promise(res => setTimeout(() => res(super.array()), 30));
    }

}
