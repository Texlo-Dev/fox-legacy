import { MessageEmbed, TextChannel } from "discord.js";
import { Command, FoxClient } from "../../util";
import { FoxMessage } from "../../util/extensions";

export default class FoxCommand extends Command {

    public static hasPermission(message: FoxMessage): boolean {
        return message.guild.perms.check("core.manageserver", message);
    }

    public constructor(client: FoxClient) {
        super(client, {
            name: "logexclude",
            description: "Excludes a specific channel from server logging.",
            usage: "[channel]",
            guildOnly: true,
            requiredPerms: ["`core.manageperm`"],
        });
    }

    public async run(message: FoxMessage, args: string[]): Promise<void> {
        const id: string = args.join(" ") || message.channel.id;
        const channel: TextChannel = await this.channel(id, message) as TextChannel;
        if (!channel) { return message.error("This is not a valid channel."); }
        const channels: any[] = message.guild.config.logExcluded;
        channels.push(JSON.parse(JSON.stringify(channel)));
        message.guild.config.setArray("logExcluded", channels, true);
        const embed: MessageEmbed = new MessageEmbed()
            .setAuthor("Log Exclude", this.client.user.displayAvatarURL())
            .setColor(this.client.brandColor)
            .setTimestamp()
            .setFooter(this.client.user.username)
            .setDescription(`Successfully excluded server logging in ${channel} <:check:314349398811475968>`);
        message.send({ embed });
    }

}
