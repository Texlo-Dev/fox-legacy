import CustomCommand from './CustomCommand';
import { Collection } from 'discord.js';
export default class CustomCommands extends Collection {

    constructor(guild) {
        super();
        this.guild = guild;
        this.actions = {
            async addRole(message, role) {
                if (role.match(/^(\\d{17,19})$/)) await message.member.roles.add(role);
                else if (message.guild.roles.some(r => r.name === role)) await message.member.roles.add(message.guild.roles.find(r => r.name === role));
            },
            async removeRole(message, role) {
                if (role.match(/^(\\d{17,19})$/)) message.member.roles.remove(role);
                else if (message.guild.roles.some(r => r.name === role)) await message.member.roles.remove(message.guild.roles.find(r => r.name === role));
            },
            async setNickname (message, nickname) {
                const member = await message.guild.members.fetch(message.author);
                if (member) await member.setNickname(nickname);
            },
            async createChannel(message, channel) {
                await message.guild.channels.create({
                    name: channel,
                    type: 'text'
                });
            }
        };

        this.variables = {
            member: message => message.author,
            'member.name': message => message.member.displayName,
            'member.tag': message => message.author.tag,
            'member.avatar': message => message.author.displayAvatarURL({ format: 'png' }),
            'member.id': message => message.member.id,
            server: message => message.guild.name,
            'server.id': message => message.guild.id,
            'server.icon': message => message.guild.iconURL || 'Blank.',
            channel: message => message.channel,
            'channel.id': message => message.channel.id,
            message: message => message.content
        };
    }

    async reloadAll() {
        const commands = await this.guild.client.mongo.customcommands.find({ guildID: this.guild.id });
        if (!commands) return;
        const mapped = commands.map(c => c.get());
        if (!mapped.length) return;
        await super.sweep(c => c);
        for await (const cmd of mapped) {
            const command = new CustomCommand(this.guild, cmd);
            super.set(command.name, command);
        }
        return true;
    }

    async add(data) {
        const obj = {
            guildID: this.guild.id,
            name: data.name,
            category: 'Custom Commands',
            cooldown: data.cooldown || 0,
            description: data.description || 'None',
            dmCommand: data.dmCommand,
            deleteCommand: data.deleteCommand,
            enabled: true,
            usage: data.usage,
            aliases: [],
            requiredPerms: data.requiredPerms || [],
            template: data.template
        };

        const entry = new this.guild.client.mongo.customcommands(obj);
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

    async remove(command) {
        if (!super.has(command)) throw new Error('Command does not exist in server.');
        const entry = await this.guild.client.mongo.customcommands.findOne({ guildID: this.guild.id, name: command });
        if (!entry) throw new Error('Could not resolve command in database.');
        await entry.remove();
        await super.delete(command);
        return new Promise(res => setTimeout(() => res(super.array()), 30));
    }

};
