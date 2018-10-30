import { Command } from '../../util';
export default class FoxCommand extends Command {

    constructor(client) {
        super(client, {
            name: 'resume',
            description: 'Resumes the currently playing song.',
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
        if (!voiceChannel || voiceChannel.id !== message.guild.voiceConnection.channel.id) return message.reply('You must be in a voicechannel to resume a song.');
        const serverQueue = message.guild.queue;
        if (!serverQueue) return message.error(` Nothing is playing, silly!`);
        return serverQueue.resume();
    }

}
