import { Command, FoxClient } from "../../util";
import { FoxMessage } from "../../util/extensions";
export default class FoxCommand extends Command {

    public static hasPermission(message: FoxMessage): boolean {
        return message.guild.perms.check("mod.silencer", message);
    }

    // tslint:disable:no-magic-numbers no-parameter-reassignment
    public static async run(message: FoxMessage, [time]: any): Promise<FoxMessage> {
        if (time === "disable" || time === "false") { time = 0; } else {
            time = FoxClient.spanMs(time) / 1000;
            if (!time) { return message.error("You must tell me the time (from 1 second to 2 minutes)"); }
            if (time < 1 || time > 120) { return message.error("Invalid time! Time goes from 1 second to 2 minutes!"); }
        }

        message.channel.setRateLimitPerUser(time)
        .then(() => message.success(`I have ${time === 0 ? "disabled" : "set"} the slowmode for this channel.`))
        .catch(err => message.error(`There was an error while performing this operation. ${err}`));
    }

    public constructor(client: FoxClient) {
        super(client, {
            name: "slowmode",
            description: "Activates slowmode for a channel.",
            usage: "<time | disable>",
            guildOnly: true,
            extendedUsage: {
                time: client.args.duration,
            },
            requiredPerms: ["`mod.silencer`"],
        });
    }

}
