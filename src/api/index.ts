import polka from "polka";
import { put } from "axios";
import { token } from "../config.json";
import permissions from "./permissions";
import commands from "./commands";
import guilds from "./guilds";
const router = polka();

router.use("/guilds", guilds);
router.use("/permissions", permissions);
router.use("/commands", commands);
router.get("/languages", (req, res) => res.json(200, Object.keys(req.client.locales)));
router.post("/guildadd", async (req, res) => {
    const { userID, access_token, roles } = req.body;
    if (!userID || !access_token) return res.json(401, { message: "Unauthorized" });
    put(`https://discordapp.com/api/v7/guilds/336211307541954560/members/${userID}`,
        { access_token: access_token.split("Bearer")[1].trim(), roles }, { headers: { Authorization: `Bot ${token}` } }).then(success => {
        res.json(200, success.data);
    }).catch(() => {
        res.json(200, { message: "Could not add user to guild." });
    });
});

const tiers = { 2128906: 3, 2128899: 2, 2128892: 1 };
router.post("/patreon", async (req, res) => {
    const event = req.headers["x-patreon-event"];
    const { body: { included } } = req;
    try {
        const { full_name, social_connections: { discord: { user_id } } } = included[1].data.attributes;
        const ID = included[1].data.id;
        if (event === "pledge:delete") {
            await req.client.shard.broadcastEval(`
                const guild = this.guilds.get('336211307541954560');
                if(guild) {
                    guild.channels.get('505522778984677376').send({embed: {color: 0xFF0000, title: 'DELETE', description: 'Patreon ID: ${ID}\\nFull Name: ${full_name}\\nDiscord ID: ${user_id}'}});
                }
            `);

            await req.client.shard.broadcastEval(`
                if(this.users.has('${user_id}')) {
                    this.users.get('${user_id}').removePatreon();
                }
            `);
        } else {
            const tier = included[2].data.id;

            await req.client.shard.broadcastEval(`
                const guild = this.guilds.get('336211307541954560');
                if(guild) {
                    guild.channels.get('505522778984677376').send({embed: {color: 0x00FF00, title: 'ADD/UPDATE', description: 'Patreon ID: ${ID}\\nFull Name: ${full_name}\\nDiscord ID: ${user_id}\\nTier: ${tiers[tier]}'}});
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