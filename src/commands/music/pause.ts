import { Command } from '../../util';
export default class FoxCommand extends Command {

    constructor(client) {
        super(client, {
            name: 'pause',
            description: 'Pauses the currently playing song.',
            guildOnly: true,
            requiredPerms: ['`music.listen`']
        });
    }

    hasPermission(message) {
        return message.guild.perms.check('music.listen', message);
    }

    async run(message) {
        const member = await message.guild.members.fetch(message.author);
        const voiceChannel = member.voice.channel;
        if (!message.guild.me.voice.channel) return message.error(' I must be in a voice channel first.');
        if (!voiceChannel || voiceChannel.id !== message.guild.voiceConnection.channel.id) return message.reply('You must be in a voicechannel to pause music.');
        const serverQueue = message.guild.queue;
        if (!serverQueue) return message.error(' Please start playing a song in order to pause it.');
        return serverQueue.pause();
    }

}
