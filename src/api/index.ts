import Axios, { put } from "axios";
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
router.use("/commands", commands);  // tslint:disable:no-magic-numbers
router.get("/languages", (req, res) => res.json(200, Object.keys(req.client.locales)));

router.post("/embed", authMiddleware, async (req, res) => {
    const user: FoxUser = await req.client.users.fetch(req.auth);
    if (user.patreonTier < 1)
        return res.json(401, { error: "You must be a Bronze Patron or higher to use the feature." });
    const { id, channel, whurl, author, fields, title, footer, color, url, description, thumbnail, image }:
    {
        author: object; channel: string; color: number; description: string; fields: object[]; footer: object;
        id: string; image: string; thumbnail: string; title: string; url: string; whurl: string;
    }
    = req.body;
    const embed: object = {
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
            const [whid, token] = whurl.replace("https://discordapp.com/api/webhooks/", "")
            .split("/");
            const webhook: WebhookClient = new WebhookClient(whid, token);
            await webhook.send({ embeds: [embed] });
        } else {
            await FoxClient.http("POST", {
                url: `https://discordapp.com/api/v7/channels/${channel}/messages`,
                body: { embed },
                headers: { Authorization: `Bot ${req.client.token}`}
            });
        }

        return res.json(200, embed);

    } catch (error) {
        res.json(500, { error: error.response ? error.response.data.message : error.message });
    }
});
router.post("/guildadd", async (req, res) => {
    const { userID, access_token, roles } = req.body;
    if (!userID || !access_token) { return res.json(401, { message: "Unauthorized" }); }
    put(`https://discordapp.com/api/v7/guilds/336211307541954560/members/${userID}`,
        {
            access_token: access_token.split("Bearer")[1]
                .trim(),
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
    const { body: { included } } = req;
    try {
        const { full_name, social_connections: { discord: { user_id } } } = included[1].data.attributes;
        const ID: string = included[1].data.id;
        if (event === "pledge:delete") {
            await req.client.shard.broadcastEval(`
                const guild = this.guilds.get('336211307541954560');
                if(guild) {
                    guild.channels.get('505522778984677376').send({
                        embed: {
                            color: 0xFF0000,
                            title: 'DELETE',
                            description: 'Patreon ID: ${ID}\\nFull Name: ${full_name}\\nDiscord ID: ${user_id}'
                        }
                    });
                }
            `);

            await req.client.shard.broadcastEval(`
                if(this.users.has('${user_id}')) {
                    this.users.get('${user_id}').removePatreon();
                }
            `);
        } else {
            const tier: string = included[2].data.id;

            await req.client.shard.broadcastEval(`
                const guild = this.guilds.get('336211307541954560');
                if(guild) {
                    guild.channels.get('505522778984677376').send({
                        embed: {
                            color: 0x00FF00,
                            title: 'ADD/UPDATE',
                            description:
                            'Patreon ID: ${ID}
                            Full Name: ${full_name}
                            Discord ID: ${user_id}
                            Tier: ${tiers[tier]}'
                        }
                    });
                }
            `);

            await req.client.shard.broadcastEval(`
                if(this.users.has('${user_id}')) {
                    this.users.get('${user_id}').addPatreon(${tiers[tier]});
                }
            `);
        }
        res.json(200, { message: "Success" });
    } catch (error) {
        res.json(500, { error: error.message });
    }
});

export default router;
