import { Command, FoxClient } from "../../util";
import { FoxMessage } from "../../util/extensions";
export default class FoxCommand extends Command {

    public static hasPermission(message: FoxMessage): boolean {
        return message.guild.perms.check("music.dj", message);
    }

    public constructor(client: FoxClient) {
        super(client, {
            name: "fskip",
            description: "Forces the skipping of a song.",
            requiredPerms: ["`music.dj`"],
            guildOnly: true,
        });
    }

    public async run(message: FoxMessage): Promise<FoxMessage> {
        const serverQueue = message.guild.queue;
        if (!serverQueue || !message.guild.voiceConnection) {
            return message.reply("No songs are in the queue. Welp.");
        }
        if (!message.member.voice.channel || message.member.voice.channel.id !== message.guild.voiceConnection.channel.id) { return message.reply("Eh, you need to be in the bot's voiceChannel to use this command."); }
        message.guild.voiceConnection.dispatcher.end();

        return message.send("Force skip successful.");
    }

}
