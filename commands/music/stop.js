import { Command } from '../../util';
export default class FoxCommand extends Command {

    constructor(client) {
        super(client, {
            name: 'stop',
            description: 'Stops all songs, and leaves the voicechannel.',
            aliases: ['stopplaying'],
            guildOnly: true,
            requiredPerms: ['`music.dj`']
        });
    }

    hasPermission(message) {
        return message.guild.perms.check('music.dj', message);
    }

    async run(message) {
        const member = await message.guild.members.fetch(message.author);
        if (!member.voice.channel) return message.error(' You are not currently in a voice channel.');
        const serverQueue = message.guild.queue;
        if (!serverQueue) return message.error(' There is nothing playing for me to stop.');
        await serverQueue.endAllSongs();
    }

}
