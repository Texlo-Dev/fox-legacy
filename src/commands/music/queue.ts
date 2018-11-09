import { MessageEmbed } from "discord.js";
import { duration } from "moment";
import { Command } from "../../util";

export default class FoxCommand extends Command {

    public constructor(client) {
        super(client, {
            name: "queue",
            description: "Shows all of the available songs in the queue.",
            guildOnly: true,
            usage: "[page]",
            requiredPerms: ["`music.listen`"],
        });
    }

    public hasPermission(message) {
        return message.guild.perms.check("music.listen", message);
    }

    public run(message, args, prefix) {
        let page = parseInt(args[0]);
        if (!page) { page = 1; }
        const serverQueue = message.guild.queue;
        if (!serverQueue) { return message.error(" It looks like there are no songs in the queue."); }
        const timeArr = serverQueue.songs.map(song => parseInt(song.length));
        const totalQueue = duration(timeArr.reduce((p, val) => p + val, 0) - (serverQueue.connection.dispatcher.streamTime / 1000), "seconds").format("m:ss", { trim: false });
        const remaining = duration(serverQueue.songs[0].length - (serverQueue.connection.dispatcher.streamTime / 1000), "seconds").format("m:ss", { trim: false });
        const paginated = this.client.paginate(serverQueue.songs, page, 10);
        let num = 10 * (paginated.page - 1);
        const embed = new MessageEmbed()
            .setColor(this.client.brandColor)
            .setAuthor("Music Queue", this.client.user.displayAvatarURL())
            .setDescription(`
**Current songs, page ${paginated.page}:**

${paginated.items.map(song => `**#${++num} -** [${song.title}](${song.url}) as requested by ${song.requestedBy.displayName} (${duration(parseInt(song.length), "seconds").format("m:ss", { trim: false })})`).join("\n")}

**Now Playing:** ${serverQueue.songs[0].title} (${remaining} left)
**Total Queue Time Remaining:** ${totalQueue}
${paginated.maxPage > 1 ? `\nType \`${prefix}queue [pagenumber]\` to see a specific page.` : "".trim()}`);

        message.send({ embed });
    }

}
