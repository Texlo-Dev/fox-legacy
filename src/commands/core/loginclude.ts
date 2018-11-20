import { MessageEmbed, TextChannel } from "discord.js";
import { Command, FoxClient } from "../../util";
import { FoxMessage } from "../../util/extensions";

export default class FoxCommand extends Command {

    public static hasPermission(message: FoxMessage): boolean {
        return message.guild.perms.check("core.manageserver", message);
    }

    public constructor(client: FoxClient) {
        super(client, {
            name: "loginclude",
            description: "Removes server logging exclusion from a given channel.",
            usage: "[channel]",
            guildOnly: true,
            requiredPerms: ["`core.manageserver`"],
        });
    }

    public async run(message: FoxMessage, args: string[]): Promise<FoxMessage> {
        const id: string = args.join(" ") || message.channel.id;
        const channel: TextChannel = await this.channel(id, message) as TextChannel;
        if (!channel) { return message.error("This is not a valid channel."); }
        const channels: any[] = message.guild.config.logExcluded;
        channels.splice(channels.indexOf(JSON.parse(JSON.stringify(channel))), 1);
        message.guild.config.setArray("logExcluded", channels, true);
        const embed: MessageEmbed = new MessageEmbed()
            .setAuthor("Log Include", this.client.user.displayAvatarURL())
            .setColor(this.client.brandColor)
            .setTimestamp()
            .setFooter(this.client.user.username)
            .setDescription(`Successfully removed log exclusion in ${channel} <:check:314349398811475968>`);

        return message.send({ embed });
    }

}
