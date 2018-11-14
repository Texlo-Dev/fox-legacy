import { MessageEmbed } from "discord.js";
import { Command, FoxClient } from "../../util";
import { FoxMessage } from "../../util/extensions";
import { FoxBank } from "../../util/Mongo";

export default class FoxCommand extends Command {

    public static hasPermission(message: FoxMessage): boolean {
        return message.guild.perms.check("economy.banking", message);
    }

    public constructor(client: FoxClient) {
        super(client, {
            name: "bank",
            description: "Shows the current bank values.",
            aliases: ["currentvalue"],
            requiredPerms: ["`economy.banking`"],
        });
    }

    public async run(message: FoxMessage): Promise<FoxMessage> {
        const value: FoxBank = await this.client.mongo.banking.findOne({
            guildID: message.guild.id,
            userID: message.author.id
        });
        if (!value) {
            return message.error(
                "You do not have a bank account set up. Start chatting in an enabled channel to set up an account."
            );
        }
        const embed: MessageEmbed = new MessageEmbed()
            .setTitle("Your Bank Account")
            .setColor(this.client.brandColor)
            .setTimestamp()
            .setAuthor(message.author.username, message.author.displayAvatarURL())
            .setFooter(this.client.user.username)
            .setDescription(`${message.guild.banking.currency}${value.get("money").toLocaleString()}\n\nFoxville National Bank #${this.client.shard.id + 1}: ${this.client.guilds.size} servers and ${this.client.guilds.reduce((a, b) => a + b.memberCount, 0).toLocaleString()} registered patrons.`); // tslint:disable-line

        return message.send({ embed });
    }

}
