// tslint:disable-next-line:file-name-casing
import { FoxGuild, Options } from "../../types";
import { GuildSettings } from "../Mongo";

interface PackageOptions extends Options {
  patreonTier: number;
}

export default class Package {
  public description: string;
  public enabled: boolean;
  public guild: FoxGuild;
  public name: string;
  public patreonTier: number;

  public constructor(info: PackageOptions, guild: FoxGuild) {
    this.name = info.name;
    this.description = info.description;
    this.enabled = undefined;
    this.patreonTier = info.patreonTier || 0;
    this.guild = guild;
  }

  public _setEnabled(): boolean {
    if (this.name === "Core") {
      this.enabled = true;

      return;
    }
    this.enabled = this.guild.config.packages
      ? this.guild.config.packages.includes(this.name)
      : false;

    return true;
  }

  public async disable(): Promise<boolean> {
    const query: GuildSettings = await this.guild.client.mongo.guildconfig.findOne(
      {
        guildID: this.guild.id,
        type: "settings"
      }
    );
    if (!query) {
      return false;
    }
    const packages: string[] = query.get("packages") || [];
    if (packages.indexOf(this.name) < 0) {
      return true;
    }
    packages.splice(packages.indexOf(this.name), 1);
    query.set({ packages });
    await query.save();

    return true;
  }

  public async enable(): Promise<boolean> {
    const query: GuildSettings = await this.guild.client.mongo.guildconfig.findOne(
      {
        guildID: this.guild.id,
        type: "settings"
      }
    );
    if (!query) {
      return false;
    }
    const arr: string[] = query.get("packages") || [];
    if (arr.indexOf(this.name) > -1) {
      return false;
    }
    arr.push(this.name);
    query.set({ packages: arr });
    await query.save();

    return true;
  }
}
