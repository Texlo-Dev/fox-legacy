import { GuildMember, MessageReaction } from "discord.js";
import { Config, Event, FoxClient } from "../util";
import { FoxGuild, FoxMessage, FoxUser } from "../util/extensions";
export default class extends Event {

    public constructor(client: FoxClient) {
        super(client, {
            name: "messageReactionAdd",
            description: "Emitted whenever a reaction is removed from a message.",
        });
    }

    public async run(reaction: MessageReaction, user: FoxUser): Promise<Event> {
        const message: FoxMessage = reaction.message as FoxMessage;
        const guild: FoxGuild = message.guild as FoxGuild;
        const member: GuildMember = await message.guild.members.fetch(user.id);
        const config: Config = guild.config;
        if (!member || !config) { return; }
        const reactionRoles: any[] = config.reactionRoles;
        const enabled: boolean = guild.packages.get("Reaction Roles").enabled;
        if (!reactionRoles || !enabled) { return; }
        const role: any = reactionRoles
            .filter(r => r.messageID === message.id)
            .find(r => r.emoji.id === reaction.emoji.id);
        if (role && message.guild.roles.has(role.id)) {
            if (config.reactRoleLimit) await Promise.all(
                reactionRoles.map(async rl => message.member.roles.remove(rl.id)
            ));
            await member.roles.add(role.id);
        }

        return this;
    }

}
