import { Collection, Message } from "discord.js";
export default class PermStore extends Collection {

    public constructor(guild) {
        super();
        this.guild = guild;
    }

    public async _cache() {
        try {
            const permission = await this.guild.client.mongo.permissions.find({ guildID: this.guild.id });
            if (!permission) return;
            const mapped = permission.map(p => p.get());
            if (mapped.length) {
                super.clear();
                for (const ow of mapped[0].overwrites) {
                    if (!super.has(ow.target.id)) super.set(ow.target.id, { identifier: ow.target, overwrites: [ow] });
                    else super.get(ow.target.id).overwrites.push(ow);
                }
            } else {
                const server = new this.guild.client.mongo.permissions({
                    guildID: this.guild.id,
                    overwrites: [
                        {
                            permission: "automod.freespeech",
                            target: { name: "@everyone", id: this.guild.id },
                            status: "neutral",
                            channel: null
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

    public async set(perm, target, status, channel = null) {
        if (!["neutral", "allowed", "denied"].includes(status)) throw new Error("Invalid status.");
        const entry = await this.guild.client.mongo.permissions.findOne({ guildID: this.guild.id });
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
            const ow = entry.get("overwrites");
            const pm = ow.find(o => o.permission === perm && o.target.id === target.id);
            if (!pm) {
                const obj = { permission: perm || "automod.freespeech", target: JSON.parse(JSON.stringify(target)), status: status || "neutral", channel: JSON.parse(JSON.stringify(channel)) };
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

    public async delete(target) {
        const entry = await this.guild.client.mongo.permissions.findOne({ guildID: this.guild.id });
        if (!entry) throw new Error("Server overwrites do not exist.");
        const ow = entry.get("overwrites");
        const pm = ow.filter(o => o.target.id === target);
        if (!pm) throw new Error("Permission overwrite does not exist.");
        pm.forEach(p => ow.splice(ow.indexOf(p), 1));
        entry.set({ overwrites: ow });
        await entry.save();
        await this._cache();
        return new Promise(res => setTimeout(() => res(super.array()), 50));
    }

    public check(perm, member, channel = null) {
        if (member instanceof Message) {
            channel = member.channel;
            member = member.member;
            if (this.guild.ownerID === member.id) return true;
            for (const role of member.roles.values()) {
                const ows = super.get(role.id);
                if (!ows) continue;
                const ow = ows.overwrites.find(o => o.target.id === role.id && o.permission === perm);
                if (!ow) continue;
                if (ow.status === "denied") return false;
                else if (ow.status === "allowed") return true;
                else continue;
            }
            const userows = super.get(member.id);
            if (!userows) return;
            const userow = userows.overwrites.find(o => o.target.id === member.id && o.permission === perm);
            if (!userow) return;
            if (userow.status === "denied") return false;
            else if (userow.status === "allowed") return true;
            else return PermStore._verifyEveryone(perm);
        }
    }

    public static _verifyEveryone(perm) {
        const guildows = super.get(this.guild.id);
        const ow = guildows.overwrites.find(o => o.permission === perm);
        if (!ow) return null;
        if (ow.status === "denied") return false;
        else if (ow.status === "allowed") return true;
        else return null;
    }

}
