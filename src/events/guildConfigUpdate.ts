import { Event, FoxClient } from "../util";
import { FoxGuild } from "../util/extensions";

export default class extends Event {

    public constructor(client: FoxClient) {
        super(client, {
            name: "guildConfigUpdate",
            description: "Fired when a guild setting has been updated.",
        });
    }

    public async run(guild: FoxGuild, option: any): Promise<Event> {
        await guild.config._loadSettings();
        console.log(`Saved settings for ${guild.name}`);
        if (option) { console.log(option); }

        return this;
    }

}
