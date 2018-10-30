export const checkUnmute = async (client) => {
    const check = await client.mongo.modactions.findOne({ isMute: true, hasLeft: false, shard: client.shard.id });
    if (!check) return false;
    const guild = client.guilds.get(check.get('guildID'));
    if (check.get('time') <= Date.now() && guild) {
        const member = guild.member(check.get('userID'));
        if (!member) {
            check.set({ hasLeft: true });
            return await check.save();
        }
        const muteRole = guild.config.muteRole;
        if (muteRole) guild.member(check.get('userID')).roles.remove(muteRole.id);
        check.set({ isMute: false });
        await check.save();
    } else { return false; }
};

export const checkIfMute = async (member) => {
    if (!member.guild.config) return;
    const check = await member.client.mongo.modactions.findOne({ isMute: true, hasLeft: true, userID: member.id, guildID: member.guild.id });
    if (check) {
        const muteRole = member.guild.roles.get(member.guild.config.muteRole.id);
        if (muteRole) member.roles.add(muteRole).catch(() => 0);
    } else { return false; }
};

