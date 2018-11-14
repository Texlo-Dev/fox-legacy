import { Message, MessageEmbed } from "discord.js";
import { Command, FoxClient } from "../../util";
import { FoxMessage } from "../../util/extensions";

export default class FoxCommand extends Command {

    public static hasPermission(message: FoxMessage): boolean {
        if (FoxClient.isOwner(message.author.id)) {
            return true;
        } else if (message.guild.perms.check("core.manageserver", message)) {
            return true;
        } else if (message.guild.ownerID === message.author.id) {
            return true;
        }

        return false;
    }

    public constructor(client: FoxClient) {
        super(client, {
            name: "prefix",
            description: "Shows/sets the command prefix.",
            usage: "[prefix]",
        });
    }

    public async run(message: FoxMessage, args: string[], prefix: string): Promise<Message | Message[] | void> {
        if (!args[0] && !message.guild) {
            const embed: MessageEmbed = new MessageEmbed()
                .setAuthor("Prefix", this.client.user.displayAvatarURL())
                .setColor(this.client.brandColor)
                .setTimestamp()
                .setFooter(this.client.user.username)
                .setDescription(`My current global prefix \`${prefix.replace("f\)", "f)")}\`. To use commands in a guild channel, just run \`${prefix}command\`.`); // tslint:disable-line
            message.send({ embed });
        } else if (!args[0]) {
            const embed: MessageEmbed = new MessageEmbed()
                .setAuthor("Prefix", this.client.user.displayAvatarURL())
                .setColor(this.client.brandColor)
                .setTimestamp()
                .setFooter(this.client.user.username)
                .setDescription(`My current prefix for this server is \`${prefix}\`. To use commands, just run \`${prefix}command\`.`); // tslint:disable-line
            message.send({ embed });
        } else {
            if (!message.guild) { return message.reply("You may only change the guild prefix in a guild channel."); }
            await message.guild.config.set("prefix", args[0]);
            const embed: MessageEmbed = new MessageEmbed()
                .setAuthor("Change Prefix", this.client.user.displayAvatarURL())
                .setColor(this.client.brandColor)
                .setTimestamp()
                .setFooter(this.client.user.username)
                .setDescription(`Successfully set the new prefix as \`${args[0]}\` <:check:314349398811475968>`);
            message.send({ embed });
        }
    }

}
