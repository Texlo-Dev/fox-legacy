import { MessageEmbed } from "discord.js";
import { Command } from "../../util";

export default class FoxCommand extends Command {

    public constructor(client) {
        super(client, {
            name: "loginclude",
            description: "Removes server logging exclusion from a given channel.",
            usage: "[channel]",
            guildOnly: true,
            requiredPerms: ["`core.manageserver`"]
        });
    }

    public hasPermission(message) {
        return message.guild.perms.check("core.manageserver");
    }

    public async run(message, args) {
        const id = args.join(" ") || message.channel.id;
        const channel = await this.channel(id, message);
        if (!channel) return message.error(`This is not a valid channel.`);
        const channels = message.guild.config.logExcluded;
        channels.splice(channels.indexOf(JSON.parse(JSON.stringify(channel))), 1);
        message.guild.config.setArray("logExcluded", channels, true);
        const embed = new MessageEmbed()
            .setAuthor("Log Include", this.client.user.displayAvatarURL())
            .setColor(this.client.brandColor)
            .setTimestamp()
            .setFooter(this.client.user.username)
            .setDescription(`Successfully removed log exclusion in ${channel} <:check:314349398811475968>`);
        message.send({ embed });
    }

}
