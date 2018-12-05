import { GuildAuditLogs, MessageEmbed, Role, TextChannel } from "discord.js";
import { Event, FoxClient } from "../util";
import { FoxGuild } from "../util/extensions";

export default class extends Event {
  public constructor(client: FoxClient) {
    super(client, {
      name: "roleUpdate",
      description: "Emitted when a role is updated."
    });
  }

  public async run(oRole: Role, nRole: Role): Promise<void> {
    const guild: FoxGuild = oRole.guild as FoxGuild;
    const enabled: boolean = guild.config.serverLogging;
    const log: TextChannel = guild.config.serverlogChannel;
    if (!enabled || !log || !guild.channels.get(log.id)) {
      return;
    }
    if (guild.config.enabledEvents.indexOf(this.name) < 0) {
      return;
    }
    const audit: GuildAuditLogs = await guild.fetchAuditLogs();
    const embed: MessageEmbed = new MessageEmbed()
      .setAuthor("Role Updated", guild.client.user.displayAvatarURL({}))
      .setTimestamp()
      .setThumbnail(audit.entries.first().executor.displayAvatarURL())
      .setFooter(guild.client.user.username)
      .addField("Old Role", oRole, true)
      .addField("New Role", nRole, true)
      .addField("Updated By", audit.entries.first().executor.tag, true);
    const channel: TextChannel = guild.channels.get(log.id) as TextChannel;
    if (channel) {
      channel.send(embed);
    }
  }
}
