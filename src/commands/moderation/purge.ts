import { Collection, Snowflake, Message } from "discord.js";
import { Command, FoxClient } from "../../util";
import { FoxMessage } from "../../util/extensions";
export default class FoxCommand extends Command {

    public static hasPermission(message: FoxMessage): boolean {
        return message.guild.perms.check("mod.purge", message);
    }

    public static async run(message: FoxMessage, args: string): Promise<FoxMessage | any> {
        const amount: number = parseFloat(args[0]);
        if (!amount) { return message.error(" Please specify a valid integer."); }
        if (amount < 2) { return message.send("I cannot purge less than 2 messages due to a limitation in Discord."); }
        if (amount > 100) {
            return message.send("I cannot purge more than 100 messages due to a limitation in Discord.");
        }
        const messages: Collection<Snowflake, Message> = await message.channel.bulkDelete(
            amount,
            true
        )
        .catch(() => undefined);
        message.delete()
        .catch(() => 0);
        if (!messages) {
            return message.error("Failed to purge messages. Please make sure you are using this command with messages that are less than 2 weeks old."); // tslint:disable-line
        }

        return message.success(`Purged ${messages.size} messages from this channel. <:check:314349398811475968>`)
        .then(m => m.delete({ timeout: 3000 }));
    }

    public constructor(client: FoxClient) {
        super(client, {
            name: "purge",
            description: "Deletes a certain amount of messages from a channel.",
            usage: "<amount>",
            extendedUsage: { amount: client.args.number },
            guildOnly: true,
            requiredPerms: ["`mod.purge`"],
        });
    }

}
