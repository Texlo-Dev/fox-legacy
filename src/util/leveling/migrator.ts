import { FoxMessage } from "../extensions";
import { FoxBank, FoxLeveling } from "../Mongo";

export default async (message: FoxMessage): Promise<void> => {
    const entry: FoxBank = await message.client.mongo.banking.findOne({
        guildID: message.guild.id,
        userID: message.author.id
    });
    if (!entry) return;
    const oldlevel: number = entry.get("level"),
        oldxp: number = entry.get("XP"),
        oldNextLevel: number = entry.get("toNextLevel"),
        oldtotal: number = entry.get("totalXP");
    if (!oldlevel || !oldxp || !oldNextLevel || !oldtotal) return;

    const memberdata: FoxLeveling = await message.client.mongo.leveling.findOne({ guildID: message.guild.id, userID: message.author.id });
    if (memberdata && !memberdata.get("v2")) {
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
        const newMember: FoxLeveling = new message.client.mongo.leveling({
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
