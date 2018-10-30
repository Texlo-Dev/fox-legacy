import { Event } from "../util";

export default class extends Event {

    public constructor(client) {
        super(client, {
            name: "guildConfigUpdate",
            description: "Fired when a guild setting has been updated."
        });
    }

    public async run(guild, option) {
        await guild.config._loadSettings();
        console.log(`Saved settings for ${guild.name}`);
        if (option) console.log(option);
    }

}
