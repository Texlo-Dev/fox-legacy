import { Command } from "../../util";
export default class FoxCommand extends Command {

    public constructor(client) {
        super(client, {
            name: "skip",
            description: "Skips to the next song in the queue.",
            guildOnly: true,
            requiredPerms: ["`music.listen`"],
        });
    }

    public hasPermission(message) {
        return message.guild.perms.check("music.listen", message);
    }

    public async run(message) {
        const member = await message.guild.members.fetch(message.author);
        const serverQueue = message.guild.queue;
        if (!serverQueue) { return message.error(" Sorry, but there was nothing playing for me to skip."); }
        return serverQueue.skip(member);
    }

}
