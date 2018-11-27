import { Command, FoxClient } from "../../util";
import { FoxMessage } from "../../util/extensions";
import { MessageEmbed } from "discord.js";
const userValidator: RegExp = new RegExp("^\\w{3,12}[\\#]\\d{4,5}$");
const platforms: string[] = ["PC", "PSN", "XBL"];
export default class FoxCommand extends Command {
  // Jacz spent a lot of time writing this beautiful function. Shame I'm about to tear it apart, as I do.
  public static async getData(tag: string, platform: string): Promise<Object> {
    const { us, kr, eu } = await FoxClient.http("GET", {
      url: `https://owapi.net/api/v3/u/${tag.replace(
        "#",
        "-"
      )}/stats?platform=${platform.toLowerCase()}`
    })
    .catch(err => { throw err; });
    const stats: any = us.stats || kr.stats || eu.stats;
    const comp: any = stats.competitive;
    const quick: any = stats.quickplay;
    const obj: any = {
      level: `${quick.overall_stats.prestige * 100 + // tslint:disable-line
        quick.overall_stats.level}`,
      quick,
      comp
    };

    return obj;
  }
  public constructor(client: FoxClient) {
    super(client, {
      name: "overwatch",
      description: "Get another user's Overwatch stats",
      usage: "<user> [PC|PSN|XBL]"
    });
  }
  /* NOT USING THE CONSTRUCTOR FOR A MULTITUDE OF REASONS,
  NOT *JUST* BECAUSE I'M STUBBORN AND LAZY. THAT'S PART OF IT THOUGH. */
  public makeEmbed(owStats: any, cmdMeta: any): MessageEmbed  {
    const { platform, owUser } = cmdMeta;
    const { quick: owQuick, comp: owComp, level: owLevel } = owStats;
    // API Doesn't include comp data if player has never played comp
    const cmdEmbed: any = {
      timestamp: new Date(),
      title: `Overwatch stats for ${owUser} on ${platform.toUpperCase()}:`,
      color: this.client.brandColor,
      footer: { text: "Mr.Fox" },
      thumbnail: { url: `${owQuick.overall_stats.avatar}` },
      author: {
        name: "Overwatch Stats",
        icon_url:
          "https://cdn.discordapp.com/avatars/333985343445663749/42a1a4f26b3a407898974fb3573b2257.png"
      },
      fields: [
        {
          name: "Level",
          value: `${owLevel}`,
          inline: true
        },
        {
          name: "__**Quickplay**__",
          value: `${owQuick.game_stats.time_played} Hours`,
          inline: false
        },
        {
          name: "Games Won",
          value: `${owQuick.game_stats.games_won}`,
          inline: true
        },
        {
          name: "Total Eliminations",
          value: `${owQuick.game_stats.eliminations}`,
          inline: true
        },
        {
          name: "Total Damage Done",
          value: `${owQuick.game_stats.all_damage_done}`,
          inline: true
        },
        {
          name: "Total Healing Done",
          value: `${owQuick.game_stats.healing_done}`,
          inline: true
        }
      ]
    };
    if (owComp) {
      cmdEmbed.fields.push(
        {
          name: "__**Competitive**__",
          value: `${owComp.game_stats.time_played} Hours`,
          inline: false
        },
        {
          name: "Games Won",
          value: `${owComp.game_stats.games_won}`,
          inline: true
        },
        {
          name: "Total Eliminations",
          value: `${owComp.game_stats.eliminations}`,
          inline: true
        },
        {
          name: "Total Damage Done",
          value: `${owComp.game_stats.all_damage_done}`,
          inline: true
        },
        {
          name: "Total Healing Done",
          value: `${owComp.game_stats.healing_done}`,
          inline: true
        }
      );
      cmdEmbed.fields.splice(1, 0, {
        name: "SR",
        value: `${owComp.overall_stats.comprank ||
          "Hasn't completed\nplacement matches."}`,
        inline: true
      });
    }

    return cmdEmbed;
    // End of function
  }

  public async run(
    message: FoxMessage,
    [battlenettag, platform = "PC"]: [string, string]
  ): Promise<FoxMessage> {
    // ~~hand~~ user input sanitization
    if (!battlenettag) {
      return message.error("Please specify a user.");
    }
    if (!platforms.includes(platform.toUpperCase())) {
      return message.error("Invalid platform. Valid: PC, PSN, XBL");
    }
    if (!userValidator.test(battlenettag)) {
      return message.error(`Invalid User: "${battlenettag}"`);
    }
    const commandMsg: FoxMessage = await message.send(
      `:check: Getting Overwatch stats for ${battlenettag}. This may take a minute.`
    );
    // If the user input is correct, send our API request
    const owStats: any = await FoxCommand.getData(battlenettag, platform)
    .catch(err => {
      switch (err.response.status) { // tslint:disable:no-magic-numbers
        case 404:
          commandMsg.edit(
            `<:nicexmark:495362785010647041> User ${battlenettag} not found.`
          );
          break;
        case 429:
          commandMsg.edit(
            "<:nicexmark:495362785010647041> API Error 429: API is overloaded. Please wait a bit and try again."
          );
          break;
        case 502:
          commandMsg.edit(
            "<:nicexmark:495362785010647041> API Error 502: Bad gateway (API is down). Please try again later."
          );
          break;
        default:
          commandMsg.edit(
            `<:nicexmark:495362785010647041> Unknown API Error: Please try again in a few minutes. Error code: ${
              err.status
            }`
          );
      }

      return;
    });
    if (!owStats) {
      return;
    }

    return commandMsg.edit({
      embed: this.makeEmbed(owStats, { platform, owUser: battlenettag })
    });
  }
}
