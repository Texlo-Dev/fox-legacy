import { MessageEmbed } from 'discord.js';
import { Command } from '../../util';

export default class FoxCommand extends Command {

    constructor(client) {
        super(client, {
            name: 'prefix',
            description: 'Shows/sets the command prefix.',
            usage: '[prefix]'
        });
    }

    hasPermission(message) {
        if (message.client.isOwner(message.author.id)) return true;
        else if (message.guild.perms.check('core.manageserver')) return true;
        else if (message.guild.ownerID === message.author.id) return true;
        return false;
    }

    async run(message, args, prefix) {
        if (!args[0] && !message.guild) {
            const embed = new MessageEmbed()
                .setAuthor('Prefix', this.client.user.displayAvatarURL())
                .setColor(this.client.brandColor)
                .setTimestamp()
                .setFooter(this.client.user.username)
                .setDescription(`My current global prefix \`${prefix.replace("f\)", "f)")}\`. To use commands in a guild channel, just run \`${prefix}command\`.`); // eslint-disable-line
            message.send({ embed });
        } else if (!args[0]) {
            const embed = new MessageEmbed()
                .setAuthor('Prefix', this.client.user.displayAvatarURL())
                .setColor(this.client.brandColor)
                .setTimestamp()
                .setFooter(this.client.user.username)
                .setDescription(`My current prefix for this server is \`${prefix}\`. To use commands, just run \`${prefix}command\`.`);
            message.send({ embed });
        } else {
            if (!message.guild) return message.reply('You may only change the guild prefix in a guild channel.');
            const setPrefix = await message.guild.config.set('prefix', args[0]);
            const embed = new MessageEmbed()
                .setAuthor('Change Prefix', this.client.user.displayAvatarURL())
                .setColor(this.client.brandColor)
                .setTimestamp()
                .setFooter(this.client.user.username)
                .setDescription(`Successfully set the new prefix as \`${args[0]}\` <:check:314349398811475968>`);
            message.send({ embed });
        }
    }

}

