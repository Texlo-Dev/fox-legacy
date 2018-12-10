import { readdir as Folders } from "fs-nextra"; // tslint:disable-line
import { Command, Event, FoxClient } from "..";

export const loadCommands: (client: FoxClient) => void = async (
  client: FoxClient
): Promise<void> => {
  try {
    const folders: string[] = await Folders(`${process.cwd()}/build/commands/`);
    for (const folder of folders) {
      const files: string[] = await Folders(
        `${process.cwd()}/build/commands/${folder}/`
      );
      for (const file of files) {
        if (!file.endsWith(".js") || file.startsWith("pkg")) {
          continue;
        }
        const cmd: any = await import(`${process.cwd()}/build/commands/${folder}/${file}`);
        const command: Command = new cmd.default(client);
        command.category = folder.capitalize();
        await client.commands.set(command);
        if (client.packages.indexOf(command.category) > -1) {
          continue;
        }
        client.packages.push(command.category);
      }
    }
    console.log("[Mr.Fox] Initialized all packages.");
  } catch (e) {
    throw e;
  }
};

export const loadEvents: (client: FoxClient) => void = async (
  client: FoxClient
): Promise<void> => {
  const eventsFolder: string[] = await Folders(`${process.cwd()}/build/events`);
  for (const eventFile of eventsFolder) {
    const evt: any = await import(`${process.cwd()}/build/events/${
      eventFile.split(".")[0]
    }`);
    const event: Event = new evt.default(client);
    client.events.set(event.name, event);
    if (!event.enabled) {
      return;
    }
    client.on(event.name, (...args) => event.run(...args));
  }
};
