import { Command } from "../../util";
export default class FoxCommand extends Command {

    public constructor(client) {
        super(client, {
            name: "fskip",
            description: "Forces the skipping of a song.",
            requiredPerms: ["`music.dj`"],
            guildOnly: true,
        });
    }

    public hasPermission(message) {
        return message.guild.perms.check("music.dj", message);
    }

    public async run(message) {
        const serverQueue = message.guild.queue;
        if (!serverQueue || !message.guild.voiceConnection) { return message.reply("No songs are in the queue. Welp."); }
        if (!message.member.voice.channel || message.member.voice.channel.id !== message.guild.voiceConnection.channel.id) { return message.reply("Eh, you need to be in the bot's voiceChannel to use this command."); }
        message.guild.voiceConnection.dispatcher.end();
        message.reply("Force skip successful.");
    }

}
