import polka from "polka";
import { Command } from "../util";
import authMiddleware from "../util/authMiddleware";
const router = polka();

router.get("/", (req, res) => {
  const help: Object = {};
  const excludedCommands: string[] = [
    "eval",
    "exec",
    "addperm",
    "addpatreon",
    "rmpatreon",
    "restart",
    "reload",
    "addmoney",
    "removemoney"
  ];
  req.client.commands
    .filter(c => excludedCommands.indexOf(c.name) < 0)
    .forEach((cmd: Command) => {
      const cat = cmd.category;
      cmd.executor = null;
      if (!help.hasOwnProperty(cat)) {
        help[cat] = [];
      }
      help[cat].push(cmd);
    });
  res.json(200, help);
});

router.patch("/:guildID", authMiddleware, async (req, res) => {
  const userID = req.auth;
  const command = req.body.command;
  const guildID = req.params.guildID;
  const bool = req.body.bool;
  if (!userID || !command || !guildID || bool == undefined) {
    return res.status(400).json({ message: "Missing Parameters" });
  }
  try {
    let commands = await req.client.shard
      .broadcastEval(
        `
            if (this.guilds.has('${guildID}')) {
                const guild = this.guilds.get('${guildID}');
                guild.config._loadSettings();
                guild.config.disabledCommands
            }
        `
      )
      .catch(err => {
        throw err;
      });
    if (!commands.filter(g => g)) {
      throw new Error("Could Not resolve guild.");
    }
    commands = commands.filter(f => f)[0];
    if (!bool) {
      commands.push(command);
    } else {
      commands.splice(commands.indexOf(command), 1);
    }
    const resp = await req.client.shard
      .broadcastEval(
        `
            if (this.guilds.has('${guildID}')) {
                const guild = this.guilds.get('${guildID}');
                guild.config.setArray('disabledCommands', ${JSON.stringify(
                  commands
                )}, true).then(r => r);
            }
        `
      )
      .catch(err => {
        throw err;
      });
    if (!resp.filter(g => g)) {
      throw new Error("Could Not resolve guild.");
    }
    res.json(200, resp.filter(g => g)[0]);
  } catch (error) {
    res.json(500, { error: error.message });
  }
});

router.get("/:pkg", authMiddleware, async (req, res) => {
  let pkg = req.params.pkg;
  let settings = await req.client.shard
    .broadcastEval(
      `
            if (this.guilds.has('${req.query.guildID}')) {
                const guild = this.guilds.get('${req.query.guildID}');
                guild.config._loadSettings();
                guild.config
            }
        `
    )
    .catch(() => "False");
  if (settings === "False") {
    return res.json(500, "Internal Server Error when fetching configuration.");
  }
  settings = settings.filter(p => p !== null)[0];
  if (settings === null) {
    return res.json(500, { message: "Bot is not on server." });
  }
  const excludedCommands = [
    "eval",
    "exec",
    "addperm",
    "restart",
    "reload",
    "addmoney",
    "removemoney"
  ];
  pkg = decodeURIComponent(pkg).capitalize();
  let commands = req.client.commands.filter(cmd => cmd.category === pkg);
  commands = commands.filter(c => excludedCommands.indexOf(c.name) < 0);
  commands.forEach(command => {
    if (
      (settings.disabledCommands ? settings.disabledCommands : []).indexOf(
        command.name
      ) > -1
    ) {
      command.enabled = false;
    } else {
      command.enabled = true;
    }
  });
  if (!commands.size && settings.packages.indexOf(pkg) < 0) {
    return res.json(400, { message: "Package Not Found" });
  }
  res.json(200, commands);
});

export default router;
