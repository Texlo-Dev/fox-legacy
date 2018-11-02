import { readdir as Folders } from "fs-nextra";
import { FoxClient, Command, Event } from "..";

export const loadCommands = async (client: FoxClient) => {
    try {
        const folders: string[] = await Folders(`${process.cwd()}/commands/`);
        for (const folder of folders) {
            console.log(`[Mr.Fox] Initialized ${client.capitalizeStr(folder)} Package.`);
            const files: string[] = await Folders(`${process.cwd()}/commands/${folder}/`);
            for (const file of files) {
                if (!file.endsWith(".js")) continue;
                const cmd: any = await import(`${process.cwd()}/commands/${folder}/${file}`);
                // const cmd = require(`${process.cwd()}/commands/${folder}/${file}`);
                const command: Command = new cmd.default(client);
                command.category = client.capitalizeStr(folder);
                await client.commands.set(command);
                if (client.packages.indexOf(command.category) > -1) continue;
                client.packages.push(command.category);
            }
        }
    } catch (e) {
        throw e;
    }
};

export const loadEvents = async (client: FoxClient) => {
    const eventsFolder: string[] = await Folders("./events");
    for (const eventFile of eventsFolder) {
        const evt: any = await import(`${process.cwd()}/events/${eventFile.split(".")[0]}`);
        const event: Event = new evt.default(client);
        client.events.set(event.name, event);
        if (!event.enabled) return;
        client.on(event.name, (...args) => event.run(...args));
    }
};
