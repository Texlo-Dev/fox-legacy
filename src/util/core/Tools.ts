// tslint:disable-next-line:file-name-casing
import { GuildMember, Role } from "discord.js";
import { FoxClient } from "..";
import { FoxGuild } from "../extensions";
import { ModActions } from "../Mongo";

export const checkUnmute: (client: FoxClient) => Promise<boolean> = async (client): Promise<boolean> => {
    const check: ModActions = await client.mongo.modactions.findOne({
         isMute: true, hasLeft: false, shard: client.shard.id });
    if (!check) { return false; }
    const guild: FoxGuild = client.guilds.get(check.get("guildID")) as FoxGuild;
    if (check.get("time") <= Date.now() && guild) {
        const member: GuildMember = await guild.members.fetch(check.get("userID"))
        .catch(() => undefined);
        if (!member) {
            check.set({ hasLeft: true });
            await check.save();

            return true;
        }
        const muteRole: any = guild.config.muteRole;
        if (muteRole) { member.roles.remove(muteRole.id); }
        check.set({ isMute: false });
        await check.save();
    } else { return false; }
};

export const checkIfMute: (member: GuildMember) => Promise<boolean> = async (member: GuildMember): Promise<boolean> => {
    const guild: FoxGuild = member.guild as FoxGuild;
    if (!guild.config) { return; }
    const check: ModActions = await guild.client.mongo.modactions.findOne({
        isMute: true,
        hasLeft: true,
        userID: member.id,
        guildID: member.guild.id
    });
    if (check) {
        const muteRole: Role = member.guild.roles.get(guild.config.muteRole.id);
        if (muteRole) { member.roles.add(muteRole)
            .catch(() => 0);
        }
    } else { return false; }
};
