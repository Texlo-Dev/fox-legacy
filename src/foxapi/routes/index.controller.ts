import {
  Body,
  Controller,
  Headers,
  Post,
  UseGuards,
  UsePipes,
  ValidationPipe
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { WebhookClient } from "discord.js";
import { FoxClient } from "../../util";
import { FoxUser } from "../../util/extensions";
import { FoxService } from "../app.service";
import { Client } from "../decorators/client.decorator";
import { Tier } from "../decorators/patreon.decorator";
import { CreateEmbed } from "../dtos/embed.dto";
import { AuthGuard } from "../guards/auth.guard";
import { PatreonGuard } from "../guards/patreon.guard";

@Controller()
export class IndexController {
  public constructor(private readonly appService: FoxService) {}

  @Post("/embed")
  @UsePipes(new ValidationPipe({ transform: true }))
  @UseGuards(AuthGuard, new PatreonGuard(new Reflector()))
  @Tier(1)
  public async createEmbed(
    @Client() client: FoxClient,
    @Body() embed: CreateEmbed
  ): Promise<CreateEmbed> {
    embed.color = parseInt(embed.color.replace("#", ""), 16);
    if (embed.whurl) {
      const [whid, token] = embed.whurl
        .replace("https://discordapp.com/api/webhooks/", "")
        .split("/");
      const webhook: WebhookClient = new WebhookClient(whid, token);
      await webhook.send({ embeds: [embed] });
    } else {
      await FoxClient.http("POST", {
        url: `https://discordapp.com/api/v7/channels/${embed.channel}/messages`,
        body: { embed },
        headers: { Authorization: `Bot ${client.token}` }
      });
    }

    return embed;
  }

  @Post("/patreon")
  public async editPatreon(
    @Client() client: FoxClient,
    @Body("included") included: any,
    @Headers("x-patreon-event") event: string
  ): Promise<FoxUser> {
    const tiers: Object = { 2128906: 3, 2128899: 2, 2128892: 1 };
    const colors: Object = { 3: 0xe0b51a, 2: 0xa3a3a3, 1: 0xda6b14 };
    const {
      full_name,
      social_connections: {
        discord: { user_id }
      }
    } = included[1].data.attributes;
    const ID: string = included[1].data.id;
    const user: FoxUser = (await client.users.fetch(user_id)) as FoxUser;
    switch (event) {
      case "members:pledge:delete":
        await user.removePatreon();
        await FoxClient.http("POST", {
          url:
            "https://discordapp.com/api/v7/channels/505522778984677376/messages",
          body: {
            embed: {
              color: 0xff0000,
              thumbnail: {
                url: user.displayAvatarURL()
              },
              footer: {
                text: "Mr.Fox",
                icon_url: client.user.displayAvatarURL()
              },
              timestamp: new Date(),
              title: "Pledge Deleted.",
              description: `**Patreon ID:** ${ID}\n**Full Name:** ${full_name}\n**Discord:** ${
                user.tag
              } (${user_id})`
            }
          },
          headers: { Authorization: `Bot ${client.token}` }
        });
        break;

      default:
        const tier: string = included[2].data.id;
        await user.addPatreon(tiers[tier]);
        await FoxClient.http("POST", {
          url:
            "https://discordapp.com/api/v7/channels/505522778984677376/messages",
          body: {
            embed: {
              color: colors[tiers[tier].toString()],
              thumbnail: {
                url: user.displayAvatarURL()
              },
              footer: {
                text: "Mr.Fox",
                icon_url: client.user.displayAvatarURL()
              },
              timestamp: new Date(),
              title:
                event === "members:pledge:create"
                  ? "New Pledge!"
                  : "Pledge Updated!",
              description: `**Patreon ID:** ${ID}
                **Full Name:** ${full_name}
                **Discord:** ${user.tag} (${user_id})
                **Tier:** ${tiers[tier]}`
            }
          },
          headers: { Authorization: `Bot ${client.token}` }
        });
    }

    return user;
  }
}
