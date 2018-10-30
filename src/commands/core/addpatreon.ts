import { Command } from "../../util";
export default class FoxCommand extends Command {

    public constructor(client) {
        super(client, {
            name: "addpatreon",
            description: "Adds a patreon to the database.",
            usage: "<tier> <user>",
            requiredPerms: ["Server Staff"]
        });
    }

    public hasPermission(message) {
        return message.client.isDev(message.author.id);
    }

    public async run(message, args) {
        const tier = args[0];
        if (!tier) return message.send("Please specify a tier.");
        const possibleTiers = { bronze: 1, silver: 2, gold: 3 };
        if (!possibleTiers[tier]) return message.send("Invalid patreon tier.");
        const user = await this.user(args.slice(1).join(" "), message);
        if (!user) return message.send("Invalid user.");
        user.addPatreon(possibleTiers[tier])
            .then(message.send(`Successfully added ${user.tag} as a **${this.client.capitalizeStr(tier)}** tier.`))
            .catch(err => message.send(`There was an error adding this tier. ${err.message}`));
    }

}
