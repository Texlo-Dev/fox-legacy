// tslint:disable:no-magic-numbers
import { get } from "axios";
import { Permissions, TextChannel } from "discord.js";
import moment, { duration } from "moment";
import polka from "polka";
import { FoxClient, Giveaway } from "../util";
import authMiddleware from "../util/authMiddleware";
import { Tags } from "../util/Mongo";
const router: any = polka();

router.get("/", authMiddleware, async (req, res) => {
  let { data: guilds } = await get(
    "https://discordapp.com/api/users/@me/guilds",
    {
      headers: { Authorization: `Bearer ${req.auth}` }
    }
  )
  .catch(() => 0);
  if (!guilds) {
    return res.json(401, { error: "Invalid Credentials." });
  }
  guilds = guilds.filter(
    guild =>
      guild.owner || new Permissions(guild.permissions).has("MANAGE_GUILD")
  );
  for (const guild of guilds) {
    const arr: any[] = await req.client.shard.broadcastEval(
      `this.guilds.has('${guild.id}')`
    );
    guild.canManage = arr.some(a => a === true);
    guild.iconURL = `https://cdn.discordapp.com/icons/${guild.id}/${
      guild.icon
    }.jpg?size=128`;
  }
  res.json(200, guilds);
});

router.get("/:guildID", authMiddleware, async (req, res) => {
  const guildID: string = req.params.guildID;
  try {
    const guild: any[] = await req.client.shard.broadcastEval(`
            if (this.guilds.has('${req.params.guildID}')) {
                this.guilds.get('${guildID}');
            }
        `);
    if (!guild.filter(g => g)) {
      throw new Error("Could Not resolve guild.");
    }
    res.json(200, guild.filter(r => r)[0]);
  } catch (error) {
    res.json(500, { error: error.message });
  }
});

router.get("/:guildID/packages", authMiddleware, async (req, res) => {
  try {
    const guild: any[] = await req.client.shard.broadcastEval(`
            if (this.guilds.has('${req.params.guildID}')) {
                const guild = this.guilds.get('${req.params.guildID}');
                (async () => {
                    await guild.config._loadSettings();
                    guild.packages.forEach(p => p._setEnabled());
                })();
                guild.packages
            }
        `);
    if (!guild.filter(g => g)) {
      throw new Error("Could Not resolve guild.");
    }
    res.json(200, guild.filter(g => g)[0]);
  } catch (error) {
    res.json(500, { error: error.message });
  }
});

router.get("/:guildID/emojis", async (req, res) => {
  const guildID: string = req.params.guildID;
  try {
    const resp: any[] = await req.client.shard.broadcastEval(`
        if (this.guilds.has('${guildID}')) {
            const guild = this.guilds.get('${guildID}');
            guild.emojis.array();
        }
        `);
    if (!resp.filter(g => g)) {
      throw new Error("Could Not resolve guild.");
    }
    res.json(200, resp.filter(g => g)[0]);
  } catch (error) {
    res.json(500, { error: error.message });
  }
});

router.get("/:guildID/leveling", authMiddleware, async (req, res) => {
  const guildID: string = req.params.guildID;
  try {
    const resp: any[] = await req.client.shard.broadcastEval(`
        if (this.guilds.has('${guildID}')) {
            const guild = this.guilds.get('${guildID}');
            guild.leveling._loadSettings();
            guild.leveling.minify();
        }
        `);
    if (!resp.filter(g => g)) {
      throw new Error("Could Not resolve guild.");
    }
    res.json(200, resp.filter(g => g)[0]);
  } catch (error) {
    res.json(500, { error: error.message });
  }
});

router.get("/:guildID/tags", authMiddleware, async (req, res) => {
  try {
    const resp: Tags[] = await req.client.mongo.tags.find({
      guildID: req.params.guildID
    });
    res.json(200, resp.map(tag => tag.get("tagName")).sort());
  } catch (error) {
    res.json(500, { error: error.message });
  }
});

router.get("/:guildID/banking", authMiddleware, async (req, res) => {
  const guildID: string = req.params.guildID;
  try {
    const resp: any[] = await req.client.shard.broadcastEval(`
        if (this.guilds.has('${guildID}')) {
            const guild = this.guilds.get('${guildID}');
            guild.banking._loadSettings();
            guild.banking.minify();
        }
        `);
    if (!resp.filter(g => g)) {
      throw new Error("Could Not resolve guild.");
    }
    res.json(200, resp.filter(g => g)[0]);
  } catch (error) {
    res.json(500, { error: error.message });
  }
});

router.get("/:guildID/config", authMiddleware, async (req, res) => {
  const guildID: string = req.params.guildID;
  try {
    const resp: any[] = await req.client.shard.broadcastEval(`
        if (this.guilds.has('${guildID}')) {
            const guild = this.guilds.get('${guildID}');
            guild.config._loadSettings();
            guild.config;
        }
        `);
    if (!resp.filter(g => g)) {
      throw new Error("Could Not resolve guild.");
    }
    res.json(200, resp.filter(g => g)[0]);
  } catch (error) {
    res.json(500, { error: error.message });
  }
});

router.get("/:guildID/channels", authMiddleware, async (req, res) => {
  const { category }: { category: boolean } = req.query;
  try {
    const resp: any[] = await req.client.shard.broadcastEval(`
            if (this.guilds.has('${req.params.guildID}')) {
                const guild = this.guilds.get('${req.params.guildID}');
                guild.channels
                .filter(c =>
                    c.permissionsFor(this.user.id)
                    .has(["SEND_MESSAGES", "MANAGE_MESSAGES", "VIEW_CHANNEL"]) && c.type === (${category} ? 'category' : 'text'))
                .array()
                .sort();
            }
        `);
    if (!resp.filter(g => g)) {
      throw new Error("Could Not resolve guild.");
    }
    res.json(200, resp.filter(g => g)[0]);
  } catch (error) {
    res.json(500, { error: error.message });
  }
});

router.get("/:guildID/roles", authMiddleware, async (req, res) => {
  const guildID: string = req.params.guildID;
  const { all }: { all: boolean } = req.query;
  const userID: string = req.auth;
  try {
    const resp: any[] = await req.client.shard.broadcastEval(`
            if (this.guilds.has('${guildID}')) {
                const guild = this.guilds.get('${guildID}');
                if (!guild.ownerID === '${userID}' || !guild.member('${userID}').hasPermission('MANAGE_GUILD')) { null }
                guild.roles
                .sort((c, d) => c.position - d.position)
                .filter(r =>
                    ${all}
                    ? r.name !== "@everyone" && !r.managed
                    : r.position < guild.me.roles.highest.position && r.name !== "@everyone" && !r.managed)
                .array();
            }
        `);
    if (!resp.filter(g => g)) {
      throw new Error("Could Not resolve guild.");
    }
    res.json(200, resp.filter(g => g)[0]);
  } catch (error) {
    res.json(500, { error: error.message });
  }
});

router.get("/:guildID/giveaways", authMiddleware, async (req, res) => {
  const guildID: string = req.params.guildID;
  try {
    const resp: any = await req.client.shard.broadcastEval(`
            if (this.guilds.has('${guildID}')) {
                const guild = this.guilds.get('${guildID}');
                guild.giveaways._cache()
                guild.giveaways.array();
            }
        `);
    if (!resp.filter(g => g)) {
      throw new Error("Could Not resolve guild.");
    }
    const arr: Giveaway[] = resp.filter(g => g)[0];
    for await (const gw of arr) {
      // @ts-ignore
      gw.endDate = moment(new Date(gw.endDate)).format("MM/DD/YY [at] h:mm A");
      // @ts-ignore
      gw.timeRemaining = duration(gw.timeRemaining, "milliseconds").format(
        "d [days], h [hours], m [minutes], s [seconds]"
      );
    }
    res.json(200, arr);
  } catch (error) {
    res.json(500, { error: error.message });
  }
});

router.get("/:guildID/polls", authMiddleware, async (req, res) => {
  const guildID: string = req.params.guildID;
  try {
    const resp: any[] = await req.client.shard.broadcastEval(`
            if (this.guilds.has('${guildID}')) {
                const guild = this.guilds.get('${guildID}');
                guild.polls._cache()
                guild.polls.array();
            }
        `);
    if (!resp.filter(g => g)) {
      throw new Error("Could Not resolve guild.");
    }
    res.json(200, resp.filter(g => g)[0]);
  } catch (error) {
    res.json(500, { error: error.message });
  }
});

router.get("/:guildID/tickets", authMiddleware, async (req, res) => {
  const guildID: string = req.params.guildID;
  try {
    const resp: any[] = await req.client.shard.broadcastEval(`
            if (this.guilds.has('${guildID}')) {
                const guild = this.guilds.get('${guildID}');
                guild.tickets._cache()
                .then(tkts => tkts);
            }
        `);
    if (!resp.filter(g => g)) {
      throw new Error("Could Not resolve guild.");
    }
    res.json(200, resp.filter(g => g)[0]);
  } catch (error) {
    res.json(500, { error: error.message });
  }
});

router.patch("/:guildID/tickets", authMiddleware, async (req, res) => {
  const {
    key,
    value,
    bool
  }: { bool: boolean; key: string; value: any } = req.body;
  const stringifiedValue: any = JSON.stringify(value);
  const guildID: string = req.params.guildID;
  try {
    const resp: any[] = await req.client.shard.broadcastEval(`
            if (this.guilds.has('${guildID}')) {
                const guild = this.guilds.get('${guildID}');
                guild.tickets.save('${key}', ${
      bool ? value : stringifiedValue
    }).then(r => r)
            }
        `);
    if (!resp.filter(g => g)) {
      throw new Error("Could Not resolve guild.");
    }
    res.json(200, resp.filter(g => g)[0]);
  } catch (error) {
    res.json(500, { error: error.message });
  }
});

router.get("/:guildID/customcommands", authMiddleware, async (req, res) => {
  const guildID: string = req.params.guildID;
  try {
    const resp: any[] = await req.client.shard.broadcastEval(`
            if (this.guilds.has('${guildID}')) {
                const guild = this.guilds.get('${guildID}');
                guild.commands.array();
            }
        `);
    if (!resp.filter(g => g)) {
      throw new Error("Could Not resolve guild.");
    }
    res.json(200, resp.filter(g => g)[0]);
  } catch (error) {
    res.json(500, { error: error.message });
  }
});

router.post("/:guildID/customcommands", authMiddleware, async (req, res) => {
  const { guildID }: { guildID: string } = req.params;
  const commandData: object = {
    name: req.body.name,
    description: req.body.description
  };
  for (const key in commandData) {
    if (!req.body[key]) {
      return res.json(400, { error: `Missing Parameter: ${key}` });
    }
  }

  try {
    const resp: any[] = await req.client.shard.broadcastEval(`
            if (this.guilds.has('${guildID}')) {
                const guild = this.guilds.get('${guildID}');
                guild.commands.add(${JSON.stringify(req.body)}).then(r => r)
            }
        `);
    if (!resp.filter(g => g)) {
      throw new Error("Could Not resolve guild.");
    }
    res.json(200, resp.filter(g => g)[0]);
  } catch (error) {
    res.json(500, { error: error.message });
  }
});

router.patch(
  "/:guildID/customcommands/:command",
  authMiddleware,
  async (req, res) => {
    const {
      command,
      guildID
    }: { command: string; guildID: string } = req.params;
    try {
      const resp: any[] = await req.client.shard.broadcastEval(`
            if (this.guilds.has('${guildID}')) {
                const guild = this.guilds.get('${guildID}');
                const command = guild.commands.get('${decodeURIComponent(
                  command
                )}');
                if (!command) Promise.reject('The provided command does not exist.');
                command.edit(${JSON.stringify(req.body)}).then(r => r);
            }
        `);
      if (!resp.filter(g => g)) {
        throw new Error("Could Not resolve guild.");
      }
      res.json(200, resp.filter(g => g)[0]);
    } catch (error) {
      res.json(500, { error: error.message });
    }
  }
);
router.delete(
  "/:guildID/customcommands/:command",
  authMiddleware,
  async (req, res) => {
    const {
      command,
      guildID
    }: { command: string; guildID: string } = req.params;
    try {
      const resp: any[] = await req.client.shard.broadcastEval(`
            if (this.guilds.has('${guildID}')) {
                const guild = this.guilds.get('${guildID}');
                guild.commands.remove('${decodeURIComponent(
                  command
                )}').then(r => r)
            }
        `);
      if (!resp.filter(g => g)) {
        throw new Error("Could Not resolve guild.");
      }
      res.json(200, resp.filter(g => g)[0]);
    } catch (error) {
      res.json(500, { error: error.message });
    }
  }
);

router.post("/:guildID/polls", authMiddleware, async (req, res) => {
  const { guildID }: { guildID: string } = req.params;
  const {
    name,
    type,
    possibleAnswers,
    channel,
    open = true,
    question
  }: {
    channel: TextChannel;
    name: string;
    open: boolean;
    possibleAnswers: string[];
    question: string;
    type: string;
  } = req.body;
  if (
    !name ||
    !type ||
    !channel ||
    !question ||
    !(possibleAnswers instanceof Object)
  ) {
    return res.json(500, { error: "Improper paramaters given." });
  }
  try {
    const resp: any[] = await req.client.shard.broadcastEval(`
            if (this.guilds.has('${guildID}')) {
                const guild = this.guilds.get('${guildID}');
                guild.polls.add('${decodeURIComponent(name)}', ${JSON.stringify(
      req.body
    )}).then(r => r)
            }
        `);
    if (!resp.filter(g => g)) {
      throw new Error("Could Not resolve guild.");
    }
    res.json(200, resp.filter(g => g)[0]);
  } catch (error) {
    res.json(500, { error: error.message });
  }
});

router.patch("/:guildID/polls/:name", authMiddleware, async (req, res) => {
  const { guildID }: { guildID: string } = req.params;
  const { action }: { action: string } = req.body;
  const name: string = decodeURIComponent(req.params.name);
  if (!guildID || !name || !action) {
    return res.json(500, { message: "Missing parameters." });
  }
  try {
    const resp: any[] = await req.client.shard.broadcastEval(`
            if (this.guilds.has('${guildID}')) {
                const guild = this.guilds.get('${guildID}');
                const poll = guild.polls.get('${name}');
                if (!poll) throw new Error('Invalid polls name.');
                if ('${action}' === 'close') {
                    guild.polls.gatherData(poll).then(r => r);
                }
            }
        `);
    if (!resp.filter(g => g)) {
      throw new Error("Could Not resolve guild.");
    }
    res.json(200, resp.filter(g => g)[0]);
  } catch (error) {
    res.json(500, { error: error.message });
  }
});

router.delete("/:guildID/polls/:name", authMiddleware, async (req, res) => {
  const { guildID, name }: { guildID: string; name: string } = req.params;
  if (!name) {
    return res.json(500, { error: "Improper paramaters given." });
  }
  try {
    const resp: any[] = await req.client.shard.broadcastEval(`
            if (this.guilds.has('${guildID}')) {
                const guild = this.guilds.get('${guildID}');
                guild.polls.remove('${decodeURIComponent(name)}').then(r => r)
            }
        `);
    if (!resp.filter(g => g)) {
      throw new Error("Could Not resolve guild.");
    }
    res.json(200, resp.filter(g => g)[0]);
  } catch (error) {
    res.json(500, { error: error.message });
  }
});

router.post("/:guildID/giveaways", authMiddleware, async (req, res) => {
  const { guildID }: { guildID: string } = req.params;
  const {
    name,
    channel,
    maxWinners,
    time,
    reactionEmote
  }: {
    channel: TextChannel;
    maxWinners: number;
    name: string;
    reactionEmote: any;
    time: string;
  } = req.body;

  if (!guildID || !name || !channel || !maxWinners || !time) {
    return res.json(500, { message: "Missing one or more parameters." });
  }
  const struct: object = {
    name,
    channel,
    endDate: Date.now() + FoxClient.spanMs(time),
    maxWinners,
    reactionEmote
  };
  try {
    const resp: any[] = await req.client.shard.broadcastEval(`
            if (this.guilds.has('${guildID}')) {
                const guild = this.guilds.get('${guildID}');
                guild.giveaways.add('${decodeURIComponent(
                  name
                )}', ${JSON.stringify(struct)}).then(r => r)
            }
        `);
    if (!resp.filter(g => g)) {
      throw new Error("Could Not resolve guild.");
    }
    const arr: Giveaway[] = resp.filter(g => g)[0];
    for await (const gw of arr) {
      // @ts-ignore
      gw.endDate = moment(new Date(gw.endDate)).format("MM/DD/YY [at] h:mm A");
      // @ts-ignore
      gw.timeRemaining = duration(gw.timeRemaining, "milliseconds").format(
        "d [days], h [hours], m [minutes], s [seconds]"
      );
    }
    res.json(200, arr);
  } catch (error) {
    res.json(500, { error: error.message });
  }
});

router.delete("/:guildID/giveaways/:name", authMiddleware, async (req, res) => {
  const { guildID, name }: { guildID: string; name: string } = req.params;
  if (!guildID || !name) {
    return res.json(500, { message: "Missing parameters." });
  }
  try {
    const resp: any[] = await req.client.shard.broadcastEval(`
            if (this.guilds.has('${guildID}')) {
                const guild = this.guilds.get('${guildID}');
                guild.giveaways.remove('${decodeURIComponent(
                  name
                )}').then(r => r);
            }
        `);
    if (!resp.filter(g => g)) {
      throw new Error("Could Not resolve guild.");
    }
    res.json(200, resp.filter(g => g)[0]);
  } catch (error) {
    res.json(500, { error: error.message });
  }
});

router.patch("/:guildID/giveaways/:name", authMiddleware, async (req, res) => {
  const { guildID }: { guildID: string } = req.params;
  const { action }: { action: string } = req.body;
  const name: string = decodeURIComponent(req.params.name);
  if (!guildID || !name || !action) {
    return res.json(400, { message: "Missing parameters." });
  }
  try {
    const resp: any[] = await req.client.shard.broadcastEval(`
            if (this.guilds.has('${guildID}')) {
                const guild = this.guilds.get('${guildID}');
                const giveaway = guild.giveaways.get('${name}');
                if (!giveaway) throw new Error('Invalid giveaway name.');
                if ('${action}' === 'reroll') {
                    giveaway.reroll().then(r => r);
                } else if ('${action}' === 'end') {
                    giveaway.end().then(r => r);
                } else if ('${action}' === 'pause') {
                    giveaway.pause().then(r => r);
                } else if ('${action}' === 'resume') {
                    giveaway.resume().then(r => r);
                }
            }
        `);
    if (!resp.filter(g => g)) {
      throw new Error("Could Not resolve guild.");
    }
    const arr: Giveaway[] = resp.filter(g => g)[0];
    for await (const gw of arr) {
      // @ts-ignore
      gw.endDate = moment(new Date(gw.endDate)).format("MM/DD/YY [at] h:mm A");
      // @ts-ignore
      gw.timeRemaining = duration(gw.timeRemaining, "milliseconds").format(
        "d [days], h [hours], m [minutes], s [seconds]"
      );
    }
    res.json(200, arr);
  } catch (error) {
    res.json(500, { error: error.message });
  }
});

router.patch("/:guildID/config", authMiddleware, async (req, res) => {
  const setting: any = req.body;
  const stringifiedValue: any = JSON.stringify(setting.value);
  try {
    if (req.body.array) {
      const resp: any[] = await req.client.shard.broadcastEval(`
                if (this.guilds.has('${setting.guildID}')) {
                    const guild = this.guilds.get('${setting.guildID}');
                    guild.config.setArray('${setting.key}', ${JSON.stringify(
        setting.value
      )}, true).then(r => r);
                }
            `);
      if (!resp.filter(g => g)) {
        throw new Error("Could Not resolve guild.");
      }
      res.json(200, resp.filter(g => g)[0]);
    } else {
      const resp: any[] = await req.client.shard.broadcastEval(`
                if (this.guilds.has('${setting.guildID}')) {
                    const guild = this.guilds.get('${setting.guildID}');
                    guild.config.set('${setting.key}', ${
        setting.bool ? setting.value : stringifiedValue
      }).then(r => r);
                }
            `);
      if (!resp.filter(g => g)) {
        throw new Error("Could Not resolve guild.");
      }
      res.json(200, resp.filter(g => g)[0]);
    }
  } catch (error) {
    res.json(500, { error: error.message });
  }
});

router.patch("/:guildID/leveling", authMiddleware, async (req, res) => {
  const {
    key,
    bool,
    value
  }: { bool: boolean; key: string; value: any } = req.body;
  const stringifiedValue: any = JSON.stringify(value);
  const { guildID }: { guildID: string } = req.params;
  try {
    const resp: any[] = await req.client.shard.broadcastEval(`
            if (this.guilds.has('${guildID}')) {
                const guild = this.guilds.get('${guildID}');
                guild.leveling.set('${key}', ${
      bool ? value : stringifiedValue
    }).then(r => r)
            }
        `);
    if (!resp.filter(g => g)) {
      throw new Error("Could Not resolve guild.");
    }
    res.json(200, resp.filter(g => g)[0]);
  } catch (error) {
    res.json(500, { error: error.message });
  }
});

router.patch("/:guildID/banking", authMiddleware, async (req, res) => {
  const {
    key,
    bool,
    value
  }: { bool: boolean; key: string; value: any } = req.body;
  const stringifiedValue: any = JSON.stringify(value);
  const { guildID }: { guildID: string } = req.params;
  try {
    const resp: any[] = await req.client.shard.broadcastEval(`
            if (this.guilds.has('${guildID}')) {
                const guild = this.guilds.get('${guildID}');
                guild.banking.set('${key}', ${
      bool ? value : stringifiedValue
    }).then(r => r)
            }
        `);
    if (!resp.filter(g => g)) {
      throw new Error("Could Not resolve guild.");
    }
    res.json(200, resp.filter(g => g)[0]);
  } catch (error) {
    res.json(500, { error: error.message });
  }
});

router.post("/:guildID/tags", authMiddleware, async (req, res) => {
  const guildID: string = req.params.guildID;
  const tagName: string = req.body.tagName.toLowerCase();
  const tagContent: string = req.body.tagContent;
  try {
    const tag: Tags = await req.client.mongo.tags.findOne({ guildID, tagName });
    if (tag) {
      return res.json(500, { error: "Tag Already exists." });
    }
    const entry: Tags = new req.client.mongo.tags({
      guildID,
      tagName,
      tagContent,
      author: req.auth,
      createdAt: new Date(),
      usage_count: 0
    });
    await entry.save();
    const tags: Tags[] = await req.client.mongo.tags.find({ guildID });
    res.json(200, tags.map(t => t.get("tagName")).sort());
  } catch (error) {
    res.json(500, { error: error.message });
  }
});

router.delete("/:guildID/tags/:tagName", authMiddleware, async (req, res) => {
  const guildID: string = req.params.guildID;
  const tagName: string = req.params.tagName.toLowerCase();
  try {
    const tag: Tags = await req.client.mongo.tags.findOne({ guildID, tagName });
    if (!tag) {
      return res.json(500, { error: "Tag was not found." });
    }
    await tag.remove();
    const tags: Tags[] = await req.client.mongo.tags.find({ guildID });
    res.json(200, tags.map(t => t.get("tagName")).sort());
  } catch (error) {
    res.json(500, { error: error.message });
  }
});

router.patch("/:guildID/packages", authMiddleware, async (req, res) => {
  const userID: string = req.auth;
  const pkg: string = req.body.pkg;
  const guildID: string = req.params.guildID;
  const enabled: boolean = req.body.enabled;
  if (!userID || !pkg || !guildID || enabled === undefined) {
    return res.json(400, { message: "Missing Parameters" });
  }
  try {
    const resp: any[] = await req.client.shard.broadcastEval(`
            if (this.guilds.has('${guildID}')) {
                const guild = this.guilds.get('${guildID}');
                const pkg = guild.packages.get('${pkg}');
                ${enabled} ? pkg.enable().then(r => r) : pkg.disable().then(r => r);
            }
        `);
    if (!resp.filter(g => g)) {
      throw new Error("Could Not resolve guild.");
    }
    res.json(200, { packageModified: pkg });
  } catch (error) {
    res.json(500, { error: error.message });
  }
});

export default router;
