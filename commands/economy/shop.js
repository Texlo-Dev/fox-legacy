import { MessageEmbed as Embed } from 'discord.js';
import { Command } from '../../util';

export default class FoxCommand extends Command {

    constructor(client) {
        super(client, {
            name: 'shop',
            description: 'Shows all items in the server store.',
            requiredPerms: ['`economy.consumer`'],
            guildOnly: true
        });
    }

    hasPermission(message) {
        return message.guild.perms.check('economy.consumer', message);
    }

    async run(message, args) {
        let page = Number(args[0]);
        if (!page) page = 1;
        const paginated = this.client.paginate(message.guild.banking.shopItems.sort((a, b) => a.price > b.price), page, 10);
        let num = 10 * (paginated.page - 1);
        message.send(
            new Embed()
                .setColor(this.client.brandColor)
                .setAuthor(`Welcome to ${message.guild.banking.shopName}! Here are your available items for purchase.`, message.guild.iconURL())
                .setDescription(
                    `${paginated.items.map(i => `**${++num}:** ${i.name} -> ${message.guild.banking.currency}${i.price.toLocaleString()}`).join('\n') || 'No items! Go tell and administrator to add some.'}
                    ${paginated.maxPage > 1 ? `\nType \`${message.guild.config.prefix}shop [pagenumber]\` to see a specific page.` : ''.trim()}`
                )
                .setFooter(this.client.user.username)
                .setTimestamp()
        );
    }

}
