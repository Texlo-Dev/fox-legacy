import { GuildAuditLogs, MessageEmbed, Role, TextChannel } from "discord.js";
import { Event, FoxClient } from "../util";
import { FoxGuild } from "../util/extensions";

export default class extends Event {
  public constructor(client: FoxClient) {
    super(client, {
      name: "roleCreate",
      description: "Emitted when a role is created."
    });
  }

  public async run(role: Role): Promise<void> {
    const guild: FoxGuild = role.guild as FoxGuild;
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
      .setAuthor("Role Created", guild.client.user.displayAvatarURL({}))
      .setTimestamp()
      .setThumbnail(audit.entries.first().executor.displayAvatarURL())
      .setFooter(guild.client.user.username)
      .setColor(this.client.brandColor)
      .addField("Role", role, true)
      .addField("Creator", audit.entries.first().executor.tag, true);
    const channel: TextChannel = guild.channels.get(log.id) as TextChannel;
    if (channel) {
      channel.send(embed);
    }
  }
}
