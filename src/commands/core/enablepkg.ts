import { MessageEmbed } from "discord.js";
import { Command, FoxClient } from "../../util";
import { FoxMessage } from "../../util/extensions";
export default class FoxCommand extends Command {

    public constructor(client: FoxClient) {
        super(client, {
            name: "enablepkg",
            description: "Enable a certain command package.",
            usage: "<packagename>",
            requiredPerms: ["Guild Owner"],
            guildOnly: true,
        });
    }

    public hasPermission(message: FoxMessage): boolean {
        return message.guild.owner === message.member || this.client.isOwner(message.author.id);
    }

    public async run(message: FoxMessage, args: string[]): Promise<void> {
        const pkg: string = args.join(" ");
        if (!pkg) return message.send("x: Please specify a package to enable.");
        if (!message.guild.packages.has(this.client.capitalizeStr(pkg)))
            return message.error("This isn't a valid package.");
        message.guild.packages.get(this.client.capitalizeStr(pkg))
            .enable();
        const embed: MessageEmbed = new MessageEmbed()
            .setAuthor("Enable Package", this.client.user.displayAvatarURL())
            .setTimestamp()
            .setFooter(this.client.user.username)
            .setColor(this.client.brandColor)
            .setDescription(`
                <:check:314349398811475968> Successfully enabled the **${this.client.capitalizeStr(pkg)}** package.
            `);
        message.send({ embed });
    }

}
