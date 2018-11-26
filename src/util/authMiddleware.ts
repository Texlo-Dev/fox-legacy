import { clientSecret } from "../config.json";
import { decrypt } from "./Utils";

export default async (req, res, next) => {
  const token: string = req.headers.authorization;
  if (!token) {
    return res.json(401, { error: "Provided token is invalid" });
  }
  req.auth = decrypt(token, clientSecret);
  if (!req.auth) {
    return res.json(401, { error: "Provided token is invalid" });
  }
  if (req.path === "/") {
    return next();
  }
  const guildID: string = req.params.guildID;
  let result: any = await req.client.shard
    .broadcastEval(
      `
        if (this.guilds.has('${guildID}')) {
            const guild = this.guilds.get('${guildID}');
            guild.ownerID === '${req.auth}' || guild.member('${
        req.auth
      }').hasPermission('MANAGE_GUILD')
        }
    `
    )
    .catch(() => "Failed");
  if (result === "Failed") {
    return res.json(500, { error: "Failed at Authorization check." });
  }
  result = result.filter(res => res);
  if (!result) {
    return res.json(401, {
      error: "You are unauthorized to edit this server's settings."
    });
  }
  next();
};
