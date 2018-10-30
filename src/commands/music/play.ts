import { Command } from "../../util";
export default class FoxCommand extends Command {

    public constructor(client) {
        super(client, {
            name: "play",
            description: "Plays some music from youtube.",
            usage: "[songname|link]",
            guildOnly: true,
            aliases: ["yt"],
            requiredPerms: ["`music.listen`"]
        });
    }

    public hasPermission(message) {
        return message.guild.perms.check("music.listen", message);
    }

    public async run(message, args) {
        const search = args.join(" ");
        if (!search) return message.error("Please specify a song to play.");
        const member = await message.guild.members.fetch(message.author);
        const music = this.client.music;
        const voiceChannel = member.voice.channel;
        if (!voiceChannel) return message.error("Sorry, but you are not in a voice channel.");
        const permissions = member.voice.channel.permissionsFor(message.guild.me);
        if (!permissions.has("CONNECT")) return message.error("Sorry, but I do not have permissions to connect to this voice channel.");
        if (!permissions.has("SPEAK")) return message.error("Sorry, but I do not have permissions to speak in this voice channel.");

        return music.getID(search.replace(/<(.+)>/g, "$1"), message, member);
    }

}
