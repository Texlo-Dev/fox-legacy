import moment, { duration } from 'moment';
import { Command } from '../../util';
export default class FoxCommand extends Command {

    constructor(client) {
        super(client, {
            name: 'gwlist',
            description: 'Lists all current giveaways in the server.',
            requiredPerms: ['`giveaway.eligible`']
        });
    }

    hasPermission(message) {
        return message.guild.perms.check('giveaway.eligible', message);
    }

    async run(message, args) {
        let page = parseInt(args[0]);
        if (!page) page = 1;
        if (!message.guild.giveaways.size) return message.error(' No giveaway history.');
        const paginated = this.client.paginate(message.guild.giveaways.array(), page, 5);
        const embed = new (require('discord.js')).MessageEmbed()
            .setColor(this.client.brandColor)
            .setAuthor(`Server Giveaways, Pg. ${paginated.page}`, this.client.user.displayAvatarURL())
            .setFooter(this.client.user.username)
            .setTimestamp();
        for (const gw of paginated.items) {
            embed.addField(gw.name, `- Status: **${gw.running && !gw.paused ? 'Running <:checkmark:495362807731060757>' : gw.paused ? 'Paused :pause_button:' : 'Ended <:nicexmark:495362785010647041>'}**\n${gw.running && !gw.paused ? `- Ends In: ${duration(gw.timeRemaining, 'milliseconds').format(`d [days], h [hours], m [minutes], s [seconds]`)}` : gw.paused ? ''.trim() : `- Ended At: ${moment(new Date(gw.endDate)).format('MM/DD/YY [at] h:mm A')}\n- Winners: ${gw.winners.length ? gw.winners.map(w => this.client.users.get(w)).join(', ') : 'None'}`}\n`);
        }
        embed.setDescription(`${paginated.maxPage > 1 ? `\nType \`${message.guild.config.prefix}gwlist [pagenumber]\` to see a specific page.` : ''.trim()}`);
        message.send({ embed });
    }

}

