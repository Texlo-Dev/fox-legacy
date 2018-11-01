import { FoxGuild, CustOptions } from "../types";

export default class CustomCommand {
    public name: string;
    public guildID: string;
    public enabled: boolean;
    public category: string;
    public cooldown: number;
    public description: string;
    public dmCommand: boolean;
    public deleteCommand: boolean;
    public requiredPerms: string;
    public usage: string;
    public template: string;
    public args: any;

    public constructor(guild: FoxGuild, data: CustOptions) {
        Object.defineProperty(this, "guild", { value: guild, writable: false });
        this.name = data.name;
        this.guildID = data.guildID;
        this.enabled = data.enabled;
        this.category = data.category;
        this.cooldown = data.cooldown;
        this.description = data.description || "A Custom Command.";
        this.dmCommand = data.dmCommand;
        this.deleteCommand = data.deleteCommand;
        this.requiredPerms = data.requiredPerms;
        this.usage = data.usage || "None";
        this.template = data.template || "Beep.";
        this.args = data.args || {};

    }

    public async edit(data) {
        const command = await this.guild.client.mongo.customcommands.findOne({ guildID: this.guild.id, name: this.name });
        if (!command) throw new Error("Command not found in database.");
        for (const key in data) {
            if (!this.hasOwnProperty(key)) throw new Error(`Invalid Key: ${key}.`);
            command.set({ [key]: data[key] });
        }
        await command.save();
        await this.guild.commands.reloadAll();
        return this.guild.commands.array();
    }

    public hasPermission(message) {
        return message.guild.perms.check(this.requiredPerms, message);
    }

    public async execute(message) {
        let template = this.template;
        for await (const variable of Object.keys(this.guild.commands.variables)) {
            const regex = new RegExp(`{${variable}}`, "gi");
            if (!regex.test(template)) continue;
            template = template.replace(regex, this.guild.commands.variables[variable](message));
        }
        const regex = new RegExp(`{(.*?)}`, "gm");
        template = await this.parseActions(message, template, regex, 1);
        if (this.deleteCommand) message.delete();
        return this.dmCommand ? await message.author.send(template) : message.channel.send(template);
    }

    public async parseActions(message, str, regex, index) {
        index || (index = 1);
        const matches = [];
        let match;
        while (match = regex.exec(str)) {
            matches.push(match[index]);
        }
        try {
            for await (const m of matches) {
                const array = m.split(":");
                const [action, value] = array;
                await this.guild.commands.actions[action](message, value);
            }
            return str.replace(regex, "".trim());
        } catch (error) {
            return message.send(`There was an error while executing this command. ${error.message}`);
        }
    }
}
