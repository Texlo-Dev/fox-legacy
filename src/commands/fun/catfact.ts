import { Command, FoxClient } from "../../util";
import { FoxMessage } from "../../util/extensions";
export default class FoxCommand extends Command {

    public static hasPermission(message: FoxMessage): boolean {
        return message.guild.perms.check("fun.use", message);
    }

    public constructor(client: FoxClient) {
        super(client, {
            name: "catfact",
            description: "Displays a random catfact.",
            aliases: ["catfacts"],
            enabled: true,
        });
    }

    public async run(message: FoxMessage): Promise<FoxMessage> {
        const { fact }: any = await FoxClient.http("GET", {
            url: "http://catfact.ninja/fact"
        });

        return message.send({
            embed: {
                description: `:cat: ${fact}`, author: {
                    icon_url: this.client.user.displayAvatarURL(),
                    name: "Cat Fact"
                },
                color: this.client.brandColor,
                timestamp: Date.now(),
                footer: this.client.user.username
            }
        });
    }

}
