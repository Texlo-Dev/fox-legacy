import dateformat from "dateformat";
import { GuildMember, MessageEmbed, Role, TextChannel } from "discord.js";
import { Event, FoxClient } from "../util";
import { FoxGuild } from "../util/extensions";

export default class NewMember extends Event {
  public static async handleLevelRoles(member: GuildMember): Promise<void> {
    const guild: FoxGuild = member.guild as FoxGuild;
    const promoRoles: any[] = guild.leveling.promoRoles;
    const level: number = await guild.leveling.levelOf(member);
    const enabled: boolean = guild.packages.get("Leveling").enabled;
    if (!enabled || !promoRoles || !promoRoles.length || !level) {
      return;
    }
    const filtered: any[] = guild.leveling.stackRoles
      ? promoRoles.filter(p => p.rank <= level)
      : promoRoles.filter(p => p.rank === level);
    for (const role of filtered) {
      member.roles.add(role.id);
    }
  }

  private static async handleAutoRole(member: GuildMember): Promise<void> {
    const guild: FoxGuild = member.guild as FoxGuild;
    const autoroles: Role[] = guild.config.autoRoles;
    if (!autoroles || !autoroles.length) {
      return;
    }
    for (const autorole of autoroles) {
      const role: Role = member.guild.roles.get(autorole.id);
      if (!role) {
        continue;
      }
      member.roles.add(role);
    }
  }

  public constructor(client: FoxClient) {
    super(client, {
      name: "guildMemberAdd",
      description: "Fires whenever a member joins a server."
    });
  }

  public async handleLog(member: GuildMember): Promise<void> {
    const guild: FoxGuild = member.guild as FoxGuild;
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

    const embed: MessageEmbed = new MessageEmbed()
      .setAuthor("Member Joined", member.client.user.displayAvatarURL())
      .setThumbnail(member.user.displayAvatarURL())
      .addField("Member Name", `${member.user.tag} (${member.id})`)
      .addField("Account Created", dateformat(member.user.createdAt))
      .setTimestamp()
      .setColor(3534687)
      .setFooter(member.client.user.username);
    const serverlog: TextChannel = member.guild.channels.get(
      modlog.id
    ) as TextChannel;
    if (!serverlog) {
      return;
    }
    serverlog.send({ embed });
  }

  public async run(member: GuildMember): Promise<void> {
    const guild: FoxGuild = member.guild as FoxGuild;
    this.client.tools.checkIfMute(member);
    if (guild.id === "336211307541954560") {
      const ownerRole: Role = guild.roles.find(
        role => role.name === "Server Owner"
      );
      const ownerCheck: boolean[] = await this.client.shard.broadcastEval(
        `this.guilds.some(g => g.ownerID === '${member.id}')`
      ); // tslint:disable-line
      if (ownerCheck.some(bool => bool === true)) {
        member.roles.add(ownerRole);
      }
    }

    await this.welcomemsgHandle(member);
    NewMember.handleAutoRole(member);
    NewMember.handleLevelRoles(member);
    this.handleLog(member);
  }

  public async welcomemsgHandle(member: GuildMember): Promise<any> {
    const guild: FoxGuild = member.guild as FoxGuild;
    const welcomeEnabled: boolean = guild.config.welcomeEnabled;
    const welcomeMessage: string = guild.config.welcomeMsg;
    const canEmbed: boolean = guild.config.welcomerEmbed;
    const location: any = guild.config.welcomeLocation;
    if (
      welcomeEnabled &&
      welcomeMessage &&
      welcomeMessage.length &&
      location === "DM"
    ) {
      if (!canEmbed) {
        member
          .send(
            welcomeMessage
              .replace(/{user}/g, `${member}`)
              .replace(/{server}/g, `${member.guild}`)
              .replace(/{position}/g, `${member.guild.memberCount}`)
          )
          .catch(() => 0);
      } else {
        member
          .send(
            new MessageEmbed()
              .setColor("RANDOM")
              .setTimestamp()
              .setAuthor("Welcome!", member.user.displayAvatarURL())
              .setDescription(
                welcomeMessage
                  .replace(/{user}/g, `${member}`)
                  .replace(/{server}/g, `${member.guild}`)
                  .replace(/{position}/g, `${member.guild.memberCount}`)
              ) // tslint:disable-line
              .setFooter(this.client.user.username)
          )
          .catch(() => 0);
      }
    } else if (welcomeEnabled && welcomeMessage && location.id) {
      const channel: TextChannel = member.guild.channels.get(
        location.id
      ) as TextChannel;
      if (channel && !canEmbed) {
        channel.send(
          welcomeMessage
            .replace(/{user}/g, `${member}`)
            .replace(/{server}/g, `${member.guild}`)
            .replace(/{position}/g, `${member.guild.memberCount}`)
        );
      } else {
        channel.send(
          new MessageEmbed()
            .setColor("RANDOM")
            .setTimestamp()
            .setAuthor("Welcome!", member.user.displayAvatarURL())
            .setDescription(
              welcomeMessage
                .replace(/{user}/g, `${member}`)
                .replace(/{server}/g, `${member.guild}`)
                .replace(/{position}/g, `${member.guild.memberCount}`)
            ) // tslint:disable-line
            .setFooter(this.client.user.username)
        );
      }
    }
  }
}
