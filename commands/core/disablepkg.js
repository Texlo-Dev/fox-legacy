import { MessageEmbed } from 'discord.js';
import { Command } from '../../util';
export default class FoxCommand extends Command {

    constructor(client) {
        super(client, {
            name: 'disablepkg',
            description: 'Disables a certain command package.',
            usage: ['<packagename>'],
            requiredPerms: ['Guild Owner'],
            guildOnly: true
        });
    }

    hasPermission(message) {
        return message.guild.owner === message.member || this.client.isOwner(message.author.id);
    }

    async run(message, args) {
        const pkg = args.join(' ');
        if (!pkg) return message.send('x: Please specify a package to disable.');
        if (!message.guild.packages.has(this.client.capitalizeStr(pkg))) return message.error(`This isn't a valid package.`);
        message.guild.packages.get(this.client.capitalizeStr(pkg)).disable();
        const embed = new MessageEmbed()
            .setAuthor('Disable Package', this.client.user.displayAvatarURL())
            .setTimestamp()
            .setFooter(this.client.user.username)
            .setColor(this.client.brandColor)
            .setDescription(`<:check:314349398811475968> Successfully disabled the **${this.client.capitalizeStr(pkg)}** package.`);
        message.send({ embed });
    }

}

