import { Command, FoxClient } from "../../util";
import { FoxMessage } from "../../util/extensions";
import { TextChannel, MessageEmbed } from "discord.js";
import { ModActions } from "../../util/Mongo";
export default class FoxCommand extends Command {

    public static hasPermission(message: FoxMessage): boolean {
        return message.guild.perms.check("mod.banhammer", message)
        || message.guild.perms.check("mod.kickboot", message)
        || message.guild.perms.check("mod.silencer", message);
    }

    public constructor(client: FoxClient) {
        super(client, {
            name: "reason",
            description: "Adds a reason to a moderation case.",
            usage: "<casenumber> <newreason>",
            extendedUsage: {
                casenumber: client.args.number,
                newreason: client.args.reason,
            },
            guildOnly: true,
            requiredPerms: ["`mod.banhammer`", "`mod.kickboot`", "`mod.silencer`"],
        });
    }

    public async run(message: FoxMessage, args: string[]): Promise<FoxMessage> {
        const modlog: TextChannel = message.guild.config.modlogChannel;
        if (!modlog) { return message.error("Sorry, no mod-log channel is set up."); }
        const channel: TextChannel = message.guild.channels.get(modlog.id) as TextChannel;
        if (!channel) { return message.error("Sorry, the current mod-log channel does no longer exist."); }
        const caseNum: number = parseFloat(args[0]);
        if (!caseNum) { return message.send("Please specify a case number."); }
        const modCase: ModActions = await this.client.mongo.modactions.findOne({
            caseNum,
            guildID: message.guild.id
        });
        if (!modCase) { return message.error("Sorry, that was an invalid case number."); }
        if (modCase.get("modID") !== message.author.id) { return message.error("This case isn't yours!"); }
        const newReason: string = args.slice(1)
            .join(" ");
        if (!newReason) { return message.error("Please provide a new reason for the case."); }
        const mID: string = modCase.get("embedID");
        if (!mID) { return message.error("It looks like this case does not have a mod-log entry."); }

        const m: FoxMessage = await channel.messages.fetch(mID) as FoxMessage;
        if (!m) { return message.error("It looks like the mod-log entry is no longer in the channel."); }
        const embed: MessageEmbed = m.embeds[0];
        embed.description = embed.description.replace(modCase.get("reasonFor"), newReason);
        m.edit({ embed });
        modCase.set({ reasonFor: newReason });
        await modCase.save();
        message.delete()
        .catch(() => 0);

        return message.success(`Successfully edited the reason for Case#${caseNum}. \`${newReason}\``);
    }

}
