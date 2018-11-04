import { Event, FoxClient } from "../util";
import { MessageReaction } from "discord.js";
import { FoxUser, FoxGuild } from "../util/extensions";
export default class extends Event {

    public constructor(client: FoxClient) {
        super(client, {
            name: "messageReactionRemove",
            description: "Fires when a reaction is removed from a message."
        });
    }

    public async run(reaction: MessageReaction, user: FoxUser) {
        const message = reaction.message;
        const guild = message.guild as FoxGuild;
        const member = await message.guild.members.fetch(user.id);
        const config = guild.config;
        if (!member || !config) return;
        const enabled = guild.packages.get("Reaction Roles").enabled;
        const reactionRoles = config.reactionRoles;
        if (!reactionRoles || !enabled) return;
        const role = reactionRoles.filter(r => r.messageID === message.id).find(r => r.emoji.id === reaction.emoji.id);
        if (message.guild.roles.has(role.id)) member.roles.remove(role.id);
    }

}
