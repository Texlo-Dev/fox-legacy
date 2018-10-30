import { MessageEmbed } from 'discord.js';
import { duration } from 'moment';
import 'moment-duration-format';
import { Command } from '../../util';

export default class FoxCommand extends Command {

    constructor(client) {
        super(client, {
            name: 'nowplaying',
            description: 'Displays info about the currently playing song.',
            guildOnly: true,
            aliases: ['np'],
            requiredPerms: ['`music.listen`']
        });
    }

    hasPermission(message) {
        return message.guild.perms.check('music.listen', message);
    }

    run(message) {
        const serverQueue = message.guild.queue;
        if (!serverQueue) return message.error(' Nothing is currently playing.');
        const np = serverQueue.songs[0];
        const songTime = duration(serverQueue.connection.dispatcher.streamTime, 'milliseconds').format('m:ss', { trim: false });
        const songDuration = duration(parseInt(np.length), 'seconds').format('m:ss', { trim: false });
        const dispatcherSeconds = serverQueue.connection.dispatcher.streamTime / 1000;
        const remaining = duration(np.length - dispatcherSeconds, 'seconds').format('m:ss', { trim: false });
        const embed = new MessageEmbed()
            .setThumbnail(np.thumbnail)
            .setAuthor(`Now Playing`, message.client.user.displayAvatarURL())
            .setDescription(`**${np.title}**\nAuthor: **${np.author}**\nProgress: **${songTime}/${songDuration} (About ${remaining} left)**`)
            .setColor(this.client.brandColor);
        message.send({ embed });
    }

}
