import { Collection } from "discord.js";
import { FoxClient, Command } from "..";

class CommandStore extends Collection {
    public aliases: Collection;
    public cooldowns: Collection;

    public constructor(client: FoxClient) {
        super();

        Object.defineProperty(this, "client", { value: client });
        this.aliases = new Collection();
        this.cooldowns = new Collection();
    }

    public static get [Symbol.species]() {
        return Collection;
    }

    public get(name: string): Command {
        return super.get(name) || this.aliases.get(name);
    }

    public has(name: string): boolean {
        return super.has(name) || this.aliases.has(name);
    }

    public set(command: Command): Command {
        super.set(command.name, command);
        if (command.aliases && command.aliases.length) for (const alias of command.aliases) this.aliases.set(alias, command);
        return command;
    }

    public delete(name: string): boolean {
        const command: Command = this.get(name);
        if (!command) return false;
        super.delete(command.name);
        if (command.aliases && command.aliases.length) for (const alias of command.aliases) this.aliases.delete(alias);
        return true;
    }

    public clear() {
        super.clear();
        this.aliases.clear();
    }

}

export default CommandStore;
