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
        var mapped = data.filter(l => l.get('level')).map(c => `${c.get('userID')} ${c.get('level')} ${c.get('xp')}`).join(' ');
        var numArr = [];
        const mappedArr = mapped.split(' ');
        var arr = [];
        var xp = [];
        var levels = [];
        for (var u = 0; u < mappedArr.length; u += 3) {
            arr.push(mappedArr[u]);
        }
        for (var l = 0; l < arr.length; l++) {
            numArr.push(l);
        }
        for (var c = 1; c < mappedArr.length; c += 3) {
            levels.push(mappedArr[c]);
        }
        for (var m = 2; m < mappedArr.length; m += 3) {
            xp.push(mappedArr[m]);
        }
        let page = parseInt(args[0]);
        if (!page) page = 1;
        const paginated = this.client.paginate(numArr, page, 10);
        let rank = 10 * (paginated.page - 1);
        const num = await paginated.items.map(async a => `**${++rank}.** Level ${levels[a]} (${parseInt(xp[a]).toLocaleString()}) - ${(await this.client.users.fetch(arr[a])).tag}\n`);
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

