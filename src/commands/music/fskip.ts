import { Command, FoxClient, Queue } from "../../util";
import { FoxMessage } from "../../util/extensions";
export default class FoxCommand extends Command {

    public static hasPermission(message: FoxMessage): boolean {
        return message.guild.perms.check("music.dj", message);
    }

    public static async run(message: FoxMessage): Promise<FoxMessage> {
        const serverQueue: Queue = message.guild.queue;
        if (!serverQueue || !message.guild.voiceConnection) {
            return message.error("No songs are in the queue. Welp.");
        }
        if (!message.member.voice.channel || message.member.voice.channel.id !== message.guild.voiceConnection.channel.id) { // tslint:disable-line
            return message.error("You need to be in the bot's voice channel to use this command.");
        }
        message.guild.voiceConnection.dispatcher.end();

        return message.send("Force skip successful.");
    }

    public constructor(client: FoxClient) {
        super(client, {
            name: "fskip",
            description: "Forces the skipping of a song.",
            requiredPerms: ["`music.dj`"],
            guildOnly: true,
        });
    }

}
