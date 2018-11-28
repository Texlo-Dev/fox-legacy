// @ts-ignore
import Axios, { post, put } from "axios";
import { MessageEmbed, WebhookClient } from "discord.js";
import polka from "polka";
import { token } from "../config.json";
import authMiddleware from "../util/authMiddleware.js";
import { FoxUser } from "../util/extensions/index.js";
import { FoxClient } from "../util/index.js";
import commands from "./commands";
import guilds from "./guilds";
import permissions from "./permissions";
const router: any = polka();

router.use("/guilds", guilds);
router.use("/permissions", permissions);
router.use("/commands", commands);
// tslint:disable:no-magic-numbers
router.get("/languages", (req, res) =>
  res.json(200, Object.keys(req.client.locales))
);
router.post("/embed", authMiddleware, async (req, res) => {
  const user: FoxUser = await req.client.users.fetch(req.auth);
  const tier: number = await user._setTier();
  if (tier < 1)
    return res.json(401, {
      error:
        "At this time, you must be a Bronze Patron or higher to use the embed generator."
    });
  const {
    id,
    channel,
    whurl,
    author,
    fields,
    title,
    footer,
    color,
    url,
    description,
    thumbnail,
    image
  }: {
    author: object;
    channel: string;
    color: string;
    description: string;
    fields: object[];
    footer: object;
    id: string;
    image: string;
    thumbnail: string;
    title: string;
    url: string;
    whurl: string;
  } = req.body;
  const embed: {
    author: object;
    color: any;
    description: string;
    fields: object[];
    footer: object;
    image: string;
    thumbnail: string;
    title: string;
    url: string;
  } = {
    author,
    color,
    description,
    footer,
    fields,
    image,
    thumbnail,
    title,
    url: url || null // tslint:disable-line
  };
  embed.color = parseInt(embed.color.replace("#", ""), 16);

  try {
    if (whurl) {
      const [whid, token] = whurl
        .replace("https://discordapp.com/api/webhooks/", "")
        .split("/");
      const webhook: WebhookClient = new WebhookClient(whid, token);
      await webhook.send({ embeds: [embed] });
    } else {
      await FoxClient.http("POST", {
        url: `https://discordapp.com/api/v7/channels/${channel}/messages`,
        body: { embed },
        headers: { Authorization: `Bot ${req.client.token}` }
      });
    }

    return res.json(200, embed);
  } catch (error) {
    res.json(500, {
      error: error.response ? error.response.data.message : error.message
    });
  }
});
router.post("/guildadd", async (req, res) => {
  const { userID, access_token, roles } = req.body;
  if (!userID || !access_token) {
    return res.json(401, { message: "Unauthorized" });
  }
  put(
    `https://discordapp.com/api/v7/guilds/336211307541954560/members/${userID}`,
    {
      access_token: access_token.split("Bearer")[1].trim(),
      roles
    },
    {
      headers: {
        Authorization: `Bot ${token}`
      }
    }
  )
    .then(success => {
      res.json(200, success.data);
    })
    .catch(() => {
      res.json(200, { message: "Could not add user to guild." });
    });
});

const tiers: Object = { 2128906: 3, 2128899: 2, 2128892: 1 };
router.post("/patreon", async (req, res) => {
  const event: any = req.headers["x-patreon-event"];
  const {
    body: { included }
  } = req;
  try {
    const {
      full_name,
      social_connections: {
        discord: { user_id }
      }
    } = included[1].data.attributes;
    const ID: string = included[1].data.id;
    const user: FoxUser = await req.client.users.fetch(user_id);
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
                icon_url: req.client.user.displayAvatarURL()
              },
              timestamp: new Date(),
              title: "Pledge Deleted.",
              description: `Patreon ID: ${ID}\\nFull Name: ${full_name}\\nDiscord: ${
                user.tag
              } (${user_id})`
            }
          },
          headers: { Authorization: `Bot ${req.client.token}` }
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
              color: 0x00ff00,
              thumbnail: {
                url: user.displayAvatarURL()
              },
              footer: {
                text: "Mr.Fox",
                icon_url: req.client.user.displayAvatarURL()
              },
              timestamp: new Date(),
              title:
                event === "members:pledge:create"
                  ? "New Pledge!"
                  : "Pledge Updated!",
              description: `Patreon ID: ${ID}
              Full Name: ${full_name}
              Discord: ${user.tag} (${user_id})
              Tier: ${tiers[tier]}`
            }
          },
          headers: { Authorization: `Bot ${req.client.token}` }
        });
    }

    return res.json(200, { message: "Success" });
  } catch (error) {
    return res.json(500, { error: error.message });
  }
});

export default router;
