import { Collection, GuildMember, Message, Role } from "discord.js";
import { FoxGuild, FoxMessage } from "../extensions";
import { Permissions } from "../Mongo";
export default class PermStore extends Collection<any, any> {
  public guild: FoxGuild;

  public constructor(guild: FoxGuild) {
    super();
    this.guild = guild;
  }

  public async _cache(): Promise<boolean> {
    try {
      const permission: any[] = await this.guild.client.mongo.permissions.find({
        guildID: this.guild.id
      });
      if (!permission) {
        return;
      }
      const mapped: any[] = permission.map(p => p.get());
      if (mapped.length) {
        super.clear();
        for (const ow of mapped[0].overwrites) {
          if (!super.has(ow.target.id)) {
            super.set(ow.target.id, {
              identifier: ow.target,
              overwrites: [ow]
            });
          } else {
            super.get(ow.target.id).overwrites.push(ow);
          }
        }
      } else {
        const server: Permissions = new this.guild.client.mongo.permissions({
          guildID: this.guild.id,
          overwrites: [
            {
              permission: "automod.freespeech",
              target: { name: "@everyone", id: this.guild.id },
              status: "neutral",
              channel: undefined
            }
          ]
        });
        await server.save();

        return this._cache();
      }

      return true;
    } catch (error) {
      console.error(error);
    }
  }

  public async add(
    perm: string,
    target: any,
    status: string,
    channel?: any
  ): Promise<Object> {
    if (!["neutral", "allowed", "denied"].includes(status)) {
      throw new Error("Invalid status.");
    }
    const entry: Permissions = await this.guild.client.mongo.permissions.findOne(
      { guildID: this.guild.id }
    );
    if (!entry) {
      const ow = new this.guild.client.mongo.permissions({
        guildID: this.guild.id,
        overwrites: [
          {
            permission: perm ? perm : "automod.freespeech",
            target: JSON.parse(JSON.stringify(target)),
            status: status || "neutral",
            channel: JSON.parse(JSON.stringify(channel))
          }
        ]
      });
      await ow.save();
    } else {
      const ow: any[] = entry.get("overwrites");
      const pm: any = ow.find(
        o => o.permission === perm && o.target.id === target.id
      );
      if (!pm) {
        const obj: object = {
          permission: perm || "automod.freespeech",
          target: JSON.parse(JSON.stringify(target)),
          status: status || "neutral"
        };
        ow.push(obj);
        entry.set({ overwrites: ow });
        await entry.save();
      } else {
        pm.status = status;
        entry.set({ overwrites: ow });
        await entry.save();
      }
    }
    await this._cache();

    return new Promise(res => setTimeout(() => res(super.array()), 70));
  }

  public check(
    perm: string,
    member: GuildMember | Role | FoxMessage,
    channel?: any
  ): boolean {
    if (member instanceof Role) {
      const ows: any = super.get(member.id);
      if (!ows) {
        return;
      }
      const ow: any = ows.overwrites.find(
        (o: any) => o.target.id === member.id && o.permission === perm
      );
      if (!ow) {
        return;
      }
      if (ow.status === "denied") {
        return false;
      } else if (ow.status === "allowed") {
        return true;
      } else {
        return;
      }
    } else {
      if (member instanceof Message) {
        // tslint:disable:no-parameter-reassignment
        channel = member.channel;
        member = member.member;
      }
      if (this.guild.ownerID === member.id) {
        return true;
      }
      for (const role of member.roles.values()) {
        const ows: any = super.get(role.id);
        if (!ows) {
          continue;
        }
        const ow: any = ows.overwrites.find(
          (o: any) => o.target.id === role.id && o.permission === perm
        );
        if (!ow) {
          continue;
        }
        if (ow.status === "denied") {
          return false;
        } else if (ow.status === "allowed") {
          return true;
        } else {
          continue;
        }
      }
      const userows: any = super.get(member.id);
      if (!userows) {
        return;
      }
      const userow: any = userows.overwrites.find(
        (o: any) => o.target.id === member.id && o.permission === perm
      );
      if (!userow) {
        return;
      }
      if (userow.status === "denied") {
        return false;
      } else if (userow.status === "allowed") {
        return true;
      } else {
        return this._verifyEveryone(perm);
      }
    }
  }

  public async remove(target: string): Promise<Object> {
    const entry: Permissions = await this.guild.client.mongo.permissions.findOne(
      { guildID: this.guild.id }
    );
    if (!entry) {
      throw new Error("Server overwrites do not exist.");
    }
    const ow: any[] = entry.get("overwrites");
    const pm: any[] = ow.filter(o => o.target.id === target);
    if (!pm) {
      throw new Error("Permission overwrite does not exist.");
    }
    for (const p of pm) {
      ow.splice(ow.indexOf(p), 1);
    }
    entry.set({ overwrites: ow });
    await entry.save();
    await this._cache();

    return new Promise(res => setTimeout(() => res(super.array()), 50));
  }

  private _verifyEveryone(perm: string): boolean {
    const guildows: any = super.get(this.guild.id);
    const ow: any = guildows.overwrites.find((o: any) => o.permission === perm);
    if (!ow) {
      return undefined;
    }
    if (ow.status === "denied") {
      return false;
    } else if (ow.status === "allowed") {
      return true;
    } else {
      return null;
    }
  }
}
