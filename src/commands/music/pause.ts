import { GuildMember, VoiceChannel } from "discord.js";
import { Command, FoxClient, Queue } from "../../util";
import { FoxMessage } from "../../util/extensions";
export default class FoxCommand extends Command {

    public static hasPermission(message: FoxMessage): boolean {
        return message.guild.perms.check("music.listen", message);
    }

    public static async run(message: FoxMessage): Promise<any> {
        const member: GuildMember = await message.guild.members.fetch(message.author);
        const voiceChannel: VoiceChannel = member.voice.channel;
        if (!message.guild.me.voice.channel) {
            return message.error(" I must be in a voice channel first.");
        }
        if (!voiceChannel || voiceChannel.id !== message.guild.voiceConnection.channel.id) {
            return message.error("You must be in a voicechannel to pause music.");
        }
        const serverQueue: Queue = message.guild.queue;
        if (!serverQueue) { return message.error(" Please start playing a song in order to pause it."); }

        return serverQueue.pause();
    }

    public constructor(client: FoxClient) {
        super(client, {
            name: "pause",
            description: "Pauses the currently playing song.",
            guildOnly: true,
            requiredPerms: ["`music.listen`"],
        });
    }

}
