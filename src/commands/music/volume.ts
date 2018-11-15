const volumes: object = {
    1: "0.1",
    2: "0.2",
    3: "0.3",
    4: "0.4",
    5: "0.5",
    6: "0.6",
    7: "0.7",
    8: "0.8",
    9: "0.9",
    10: "1",
};

import { GuildMember, VoiceChannel } from "discord.js";
import { Command, FoxClient, Queue } from "../../util";
import { FoxMessage } from "../../util/extensions";
export default class FoxCommand extends Command {

    public static hasPermission(message: FoxMessage): boolean {
        return message.guild.perms.check("music.dj", message);
    }

    public static async run(message: FoxMessage, args: string[]): Promise<FoxMessage> {
        const member: GuildMember = await message.guild.members.fetch(message.author);
        const amount: number = parseFloat(args[0]);
        if (!amount) {
            return message.send(`The current volume for music is **${message.guild.voiceConnection ? message.guild.voiceConnection.dispatcher.volume * 10 : 10}0 %**.`); // tslint:disable-line
        }
        if (amount < 1 || amount > 10) {
            return message.error(" The supported volume range is 1-10, please try again.");
        }
        const voiceChannel: VoiceChannel = member.voice.channel;
        if (!voiceChannel || voiceChannel.id !== message.guild.voiceConnection.channel.id) {
            return message.error("You must be in a voicechannel to change the volume of a current song.");
        }
        const serverQueue: Queue = message.guild.queue;
        if (!serverQueue) { return message.error(" Nothing is playing, so I shouldn't change the volume."); }
        message.guild.voiceConnection.dispatcher.setVolume(`${volumes[amount]}`);

        return message.send(`Successfully set the volume to **${amount}0%** <:check:314349398811475968>`);
    }

    public constructor(client: FoxClient) {
        super(client, {
            name: "volume",
            description: "Changes the volume of the currently playing song.",
            guildOnly: true,
            aliases: ["vol", "vvol"],
            usage: "<number>",
            extendedUsage: { number: client.args.number },
            requiredPerms: ["music.dj"],
        });
    }

}
