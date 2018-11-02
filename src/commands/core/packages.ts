import { MessageEmbed } from "discord.js";
import { stripIndents } from "common-tags";
import { Command } from "../../util";

export default class FoxCommand extends Command {

    public constructor(client) {
        super(client, {
            name: "packages",
            description: "Shows all available packages.",
            requiredPerms: ["Guild Owner"],
            guildOnly: true
        });
    }

    public hasPermission(message) {
        return message.guild.owner === message.member || this.client.isOwner(message.author.id);
    }

    public async run(message) {
        const embed = new MessageEmbed()
            .setAuthor("Command Packages", this.client.user.displayAvatarURL())
            .setTimestamp()
            .setFooter(this.client.user.username)
            .setColor(this.client.brandColor)
            .setDescription(stripIndents`
                ${message.guild.packages.map(p => `**${p.name}** (${p.enabled ? "Enabled" : "Disabled"}) - ${p.description}`).join("\n\n")}

                To enable a package, run \`${await message.guild.config.prefix}enablepkg[packagename]\`. Ex: f)enablepkg music
                To disable a package, run \`${await message.guild.config.prefix}disablepkg [packagename]\`. Ex: f)disablepkg music
            `);
        message.send({ embed });
        message.guild.packages.forEach(p => p._setEnabled());
    }

}
