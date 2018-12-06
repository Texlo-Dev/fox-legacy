import { GuildMember, MessageEmbed, TextChannel } from "discord.js";
import { Event, FoxClient } from "../util";
import { FoxGuild } from "../util/extensions";
export default class extends Event {
  public constructor(client: FoxClient) {
    super(client, {
      name: "guildMemberUpdate",
      description: "Fires when a guilMember's details have changed."
    });
  }

  public async run(oMem: GuildMember, newMem: GuildMember): Promise<void> {
    const embed: MessageEmbed = new MessageEmbed()
      .setAuthor("Member Updated", newMem.client.user.displayAvatarURL())
      .setThumbnail(newMem.user.avatarURL())
      .addField("Member", `${newMem.user.tag}`, true)
      .addField("Nickname", newMem.nickname ? newMem.nickname : "None", true)
      .addField(
        "Roles",
        newMem.roles
          .filter(f => f.id !== newMem.guild.id)
          .map(r => r.name)
          .join(", ") || "None"
      )
      .setTimestamp()
      .setColor(0x96d036)
      .setFooter(`Member ID: ${member.id} • ${member.client.user.username}`);
    const guild: FoxGuild = oMem.guild as FoxGuild;
    const modlog: TextChannel = guild.config.serverlogChannel;
    if (!modlog) {
      return;
    }
    const enabled: boolean = guild.config.serverLogging;
    if (!enabled) {
      return;
    }
    if (guild.config.enabledEvents.indexOf(this.name) < 0) {
      return;
    }
    const serverlog: TextChannel = oMem.guild.channels.get(
      modlog.id
    ) as TextChannel;
    if (!serverlog) {
      return;
    }
    serverlog.send({ embed });
  }
}
