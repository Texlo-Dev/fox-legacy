import { Command, FoxClient, FoxMessage, FoxUser } from "../../util";
export default class FoxCommand extends Command {

    public constructor(client: FoxClient) {
        super(client, {
            name: "addpatreon",
            guildOnly: true,
            description: "Adds a patreon to the database.",
            usage: "<tier> <user>",
            requiredPerms: ["Server Staff"]
        });
    }

    public hasPermission(message: FoxMessage) {
        return message.client.isDev(message.author.id);
    }

    public async run(message: FoxMessage, args: string[]) {
        const tier: string = args[0];
        if (!tier) return message.send("Please specify a tier.");
        const possibleTiers: object = { bronze: 1, silver: 2, gold: 3 };
        if (!possibleTiers[tier]) return message.send("Invalid patreon tier.");
        const user = await this.user(args.slice(1).join(" "), message) as FoxUser;
        if (!user) return message.send("Invalid user.");
        user.addPatreon(possibleTiers[tier])
            .then(() => message.send(`Successfully added ${user.tag} as a **${this.client.capitalizeStr(tier)}** tier.`))
            .catch(err => message.send(`There was an error adding this tier. ${err.message}`));
    }

}
