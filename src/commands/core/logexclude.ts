import { MessageEmbed } from "discord.js";
import { Command } from "../../util";

export default class FoxCommand extends Command {

    public constructor(client) {
        super(client, {
            name: "logexclude",
            description: "Excludes a specific channel from server logging.",
            usage: "[channel]",
            guildOnly: true,
            requiredPerms: ["`core.manageperm`"]
        });
    }

    public hasPermission(message) {
        return message.guild.perms.check("core.manageserver", message);
    }

    public async run(message, args) {
        const id = args.join(" ") || message.channel.id;
        const channel = await this.channel(id, message);
        if (!channel) return message.error(`This is not a valid channel.`);
        const channels = message.guild.config.logExcluded;
        channels.push(JSON.parse(JSON.stringify(channel)));
        message.guild.config.setArray("logExcluded", channels, true);
        const embed = new MessageEmbed()
            .setAuthor("Log Exclude", this.client.user.displayAvatarURL())
            .setColor(this.client.brandColor)
            .setTimestamp()
            .setFooter(this.client.user.username)
            .setDescription(`Successfully excluded server logging in ${channel} <:check:314349398811475968>`);
        message.send({ embed });
    }

}
