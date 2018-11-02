import { MessageEmbed } from "discord.js";
import { Command } from "../../util";
export default class FoxCommand extends Command {

    public constructor(client) {
        super(client, {
            name: "donate",
            description: `Shows info on how to donate to support the development of Mr.Fox.`,
            aliases: ["patreon"]
        });
    }

    public run(message) {
        const embed = new MessageEmbed()
            .setAuthor("Donate", this.client.user.displayAvatarURL())
            .setColor(this.client.brandColor)
            .setThumbnail(this.client.user.displayAvatarURL())
            .setDescription(`Want to contribute to the success of ${this.client.user.username}? Become a patreon today, and receive some pretty cool rewards! All funds received will go towards improved 24/7 hosting, advertising, and website design.`)
            .addField("Official Patreon site", "[Click Here](https://www.patreon.com/user?u=7413177)")
            .setTimestamp()
            .setFooter(this.client.user.username);
        message.send({ embed });
    }

}
