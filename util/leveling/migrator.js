export default async message => {
    const entry = await message.client.mongo.banking.findOne({
        guildID: message.guild.id,
        userID: message.author.id
    });
    if (!entry) return;
    const oldlevel = entry.get('level'),
        oldxp = entry.get('XP'),
        oldNextLevel = entry.get('toNextLevel'),
        oldtotal = entry.get('totalXP');
    if (!oldlevel || !oldxp || !oldNextLevel || !oldtotal) return;

    const memberdata = await message.client.mongo.leveling.findOne({ guildID: message.guild.id, userID: message.author.id });
    if (memberdata && !memberdata.get('v2')) {
        memberdata.set({
            guildID: message.guild.id,
            userID: message.author.id,
            level: oldlevel,
            xp: oldxp,
            tonextlevel: oldNextLevel,
            totalXP: oldtotal,
            v2: true
        });
        await memberdata.save();
    } else if (!memberdata) {
        const newMember = new message.client.mongo.leveling({
            guildID: message.guild.id,
            userID: message.author.id,
            level: oldlevel,
            xp: oldxp,
            tonextlevel: oldNextLevel,
            totalXP: oldtotal,
            v2: true
        });
        await newMember.save();
    }
};
