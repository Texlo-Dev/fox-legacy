import { Command } from "../../util";
export default class FoxCommand extends Command {

    public constructor(client) {
        super(client, {
            name: "addperm",
            description: "Adds a permission to the database.",
            usage: "<name> <category> <description>",
            guildOnly: true,
            requiredPerms: ["Bot Owner"]
        });
    }

    public hasPermission(message) {
        return this.client.isOwner(message.author.id);
    }

    public async run(message, args) {
        const name = args[0];
        const category = args[1];
        const description = args.slice(2).join(" ");
        if (!name) return message.error("Please specify the permission name.");
        if (!category) return message.send("Please specify the permisison category.");
        if (!description) return message.send("Please specify the description.");
        const entry = new this.client.mongo.permissions({
            name,
            description,
            category,
            members: [],
            allowed: [],
            denied: []
        });

        await entry.save();
        return message.send(`Successfully added permission ${name}.`);
    }

}