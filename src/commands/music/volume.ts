const volumes = {
    1: '0.1',
    2: '0.2',
    3: '0.3',
    4: '0.4',
    5: '0.5',
    6: '0.6',
    7: '0.7',
    8: '0.8',
    9: '0.9',
    10: '1'
};

import { Command } from '../../util';
export default class FoxCommand extends Command {

    constructor(client) {
        super(client, {
            name: 'volume',
            description: 'Changes the volume of the currently playing song.',
            guildOnly: true,
            aliases: ['vol', 'vvol'],
            usage: '<number>',
            extendedUsage: { number: client.args.number },
            requiredPerms: ['music.dj']
        });
    }

    hasPermission(message) {
        return message.guild.perms.check('music.dj', message);
    }

    async run(message, args) {
        const member = await message.guild.members.fetch(message.author);
        const amount = parseInt(args[0]);
        if (!amount) return message.send(`The current volume for music is **${message.guild.voiceConnection ? message.guild.voiceConnection.dispatcher.volume * 10 : 10}0 %**.`);
        if (amount < 1 || amount > 10) return message.error(' The supported volume range is 1-10, please try again.');
        const voiceChannel = member.voice.channel;
        if (!voiceChannel || voiceChannel.id !== message.guild.voiceConnection.channel.id) return message.reply('You must be in a voicechannel to change the volume of a current song.');
        const serverQueue = message.guild.queue;
        if (!serverQueue) return message.error(` Nothing is playing, so I shouldn't change the volume.`);
        message.guild.voiceConnection.dispatcher.setVolume(`${volumes[amount]}`);
        return message.send(`Successfully set the volume to **${amount}0%** <:check:314349398811475968>`);
    }

}
