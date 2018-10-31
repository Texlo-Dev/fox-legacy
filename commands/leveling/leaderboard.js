/* eslint-disable no-constant-condition*/
import { MessageEmbed } from 'discord.js';
import { Command } from '../../util';
export default class FoxCommand extends Command {

    constructor(client) {
        super(client, {
            name: 'leaderboard',
            description: 'Shows the server rankings for leveling.',
            aliases: ['leader-board', 'ranking', 'lb'],
            requiredPerms: ['`leveling.use`'],
            guildOnly: true
        });
    }

    hasPermission(message) {
        return message.guild.perms.check('leveling.use', message);
    }

    async run(message, args, prefix) {
        const data = await this.client.mongo.leveling.sort({ level: 'desc', totalXP: 'desc' }).find({ guildID: message.guild.id });
        const mapped = data.filter(d => d.get('level')).map(c => c.get());
        let page = parseInt(args[0]);
        if (!page) page = 1;
        const paginated = this.client.paginate(mapped, page, 10);
        let rank = 10 * (paginated.page - 1);
        const num = paginated.items.map(async mem => {
            const check = await this.client.users.fetch(mem.userID).catch(() => null);
            return `**${++rank}.** Level ${mem.level} (${parseInt(mem.xp).toLocaleString()}) - ${check ? check.tag : 'Deleted user'}\n`;
        });
        const str = `${(await Promise.all(num)).join(' ')}\n${paginated.maxPage > 1 ? `To see a specific page, just run ${prefix}leaderboard [pagenumber].` : ''}`;
        const embed = new MessageEmbed()
            .setColor(this.client.brandColor)
            .setTimestamp()
            .setAuthor(`Leaderboard (pg. ${paginated.page})`, this.client.user.displayAvatarURL())
            .setFooter(this.client.user.username)
            .setDescription(str);
        message.send({ embed });
    }

}

