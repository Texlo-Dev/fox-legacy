import { GuildMember, MessageReaction } from "discord.js";
import { Config, Event, FoxClient } from "../util";
import { FoxGuild, FoxMessage, FoxUser } from "../util/extensions";
export default class extends Event {

    public constructor(client: FoxClient) {
        super(client, {
            name: "messageReactionRemove",
            description: "Fires when a reaction is removed from a message.",
        });
    }

    public async run(reaction: MessageReaction, user: FoxUser): Promise<Event> {
        const message: FoxMessage = reaction.message as FoxMessage;
        const guild: FoxGuild = message.guild as FoxGuild;
        const member: GuildMember = await message.guild.members.fetch(user.id);
        const config: Config = guild.config;
        if (!member || !config) { return; }
        const enabled: boolean = guild.packages.get("Reaction Roles").enabled;
        const reactionRoles: any[] = config.reactionRoles;
        if (!reactionRoles || !enabled) { return; }
        const role: any = reactionRoles
            .filter(r => r.messageID === message.id)
            .find(r => r.emoji.id === reaction.emoji.id);
        if (message.guild.roles.has(role.id)) { member.roles.remove(role.id); }
    }

}
