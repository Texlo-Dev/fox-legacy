import { MessageEmbed } from "discord.js";
import dateFormat from "dateformat";
import { Command } from "../../util";
const status = {
    online: "Online <:online:313956277808005120>",
    idle: "Idle <:away:313956277220802560>",
    dnd: "Do Not Disturb <:dnd:313956276893646850>",
    offline: "Offline <:offline:313956277237710868>"
};

export default class FoxCommand extends Command {

    public constructor(client) {
        super(client, {
            name: "userinfo",
            description: "Gets info about you or a mentioned user.",
            usage: "[user]",
            guildOnly: true
        });
    }

    public async run(message, args) {
        const user = args.join(" ") || message.author.id;
        const member = await this.member(user, message);
        if (!member) return message.error("No user detected.");
        let roles = member.roles.array().filter(r => r.id !== message.guild.id).sort((a, b) => a.comparePositionTo(b)).reverse().map(role => role.toString());
        if (roles.length < 1) roles = ["None"];
        const millisCreated = new Date().getTime() - member.user.createdAt.getTime();
        const daysCreated = millisCreated / 1000 / 60 / 60 / 24;
        const millisJoined = new Date().getTime() - member.joinedAt.getTime();
        const daysJoined = millisJoined / 1000 / 60 / 60 / 24;

        const embed = new MessageEmbed()
            .setColor(this.client.brandColor)
            .setTimestamp()
            .setAuthor("User Info", this.client.user.displayAvatarURL())
            .setThumbnail(`${member.user.displayAvatarURL()}`)
            .addField("User:", `${member.user.tag}`, true)
            .addField("Playing:", member.user.presence.activity ? member.user.presence.activity.name : "Not in-game", true)
            .addField("Status:", `${status[member.user.presence.status]}`, true)
            .addField("Days since joining:", `${daysJoined.toFixed(0)}`, true)
            .addField("Join Date:", `${dateFormat(member.joinedAt)}`, true)
            .addField("Days Since Creation:", `${daysCreated.toFixed(0)}`, true)
            .addField("Account Created:", `${dateFormat(member.user.createdAt)}`)
            .addField("Roles", `${roles.join(", ")}`, true)
            .setFooter(`${member.user.id}`);
        message.send({ embed }).catch(console.error);
    }

}
