import { GuildMember, Role, TextChannel } from "discord.js";
import { Event, FoxClient } from "../util";
import { FoxGuild, FoxUser } from "../util/extensions";

export default class extends Event {

    public constructor(client: FoxClient) {
        super(client, {
            name: "typingStart",
            description: "Fired when a user starts typing in a channel.",
        });
    }

    public async run(channel: TextChannel, user: FoxUser): Promise<void> {
        const guild: FoxGuild = channel.guild as FoxGuild;
        if (!guild) { return; }
        const member: GuildMember = await guild.members.fetch(user.id);
        const client: FoxClient = channel.client as FoxClient;
        await guild.config._loadSettings();
        guild.packages.forEach(p => p._setEnabled());
        const ownerRole: Role = guild.roles.find(role => role.name === "Server Owner");
        if (ownerRole) {
            if (client.user.id === "334841053276405760") { return; }
            const ownerCheck: boolean = await client.shard.broadcastEval(`this.guilds.some(g => g.ownerID === '${user.id}')`);
            if (ownerCheck.some(bool => bool === true)) {
                if (!member.roles.has(ownerRole.id)) {
                    member.roles.add(ownerRole);
                }
            } else if (member.roles.has(ownerRole.id)) {
                member.roles.remove(ownerRole);
            }
        }
    }

}
