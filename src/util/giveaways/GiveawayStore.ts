// tslint:disable:no-magic-numbers
import { Collection, MessageEmbed, MessageReaction, TextChannel, User } from "discord.js";
import moment, { duration } from "moment";
import { FoxClient } from "..";
import { FoxGuild, FoxMessage } from "../extensions";
import { Giveaways } from "../Mongo";
import Giveaway from "./Giveaway";

export default class GiveawayStore extends Collection<any, any> {
    public client: FoxClient;
    public guild: FoxGuild;
    public timeout?: any;

    public constructor(guild: FoxGuild) {
        super();
        this.guild = guild;
        Object.defineProperty(this, "client", { value: guild.client });
    }

    public async _cache(): Promise<GiveawayStore> {
        const giveaways: Giveaways[] = await this.client.mongo.giveaways.find({ guildID: this.guild.id });
        if (!giveaways) { return; }
        const mapped: any[] = giveaways.map((g) => g.get());
        if (!mapped.length) { return; }
        for await (const giveaway of mapped) {
            const gw: Giveaway = new Giveaway(this.guild, giveaway);
            super.set(gw.name, gw);
        }

        return this;
    }

    public async add(name: string, giveaway: any): Promise<object> {
        if (super.has(name)) { throw new Error("Giveaway Already added."); }
        const data: any = {
            name,
            guildID: this.guild.id,
            channel: JSON.parse(JSON.stringify(giveaway.channel)),
            endDate: giveaway.endDate,
            running: true,
            winners: [],
            maxWinners: giveaway.maxWinners,
            timeRemaining: giveaway.endDate - Date.now(),
            reactionEmote: giveaway.reactionEmote,
            paused: false,

        };
        const newGiveaway: Giveaways = new this.client.mongo.giveaways(data);
        try {
            await newGiveaway.save();
            const gw: Giveaway = new Giveaway(this.guild, data);
            const embed: MessageEmbed = new MessageEmbed()
                .setAuthor("There's a new GIVEAWAY in town!", this.client.user.displayAvatarURL())
                .setColor(0xF37934)
                .setTitle(`Giveaway prize: ${gw.name}`)
                .setDescription(`In order to enter this giveaway, make sure to react with ${giveaway.reactionEmote ? this.guild.emojis.get(giveaway.reactionEmote.id) : "<:phat:495031665803001876>"}.\nPossible winners: **${gw.maxWinners}**\nYou have **${gw.timeRemaining}** remaining to enter.`.replace(gw.timeRemaining.toString(), `${duration(gw.timeRemaining, "milliseconds").format("d [days], h [hours], m [minutes and] s [seconds]")}`)) // tslint:disable-line
                .setTimestamp(new Date(gw.endDate))
                .setFooter("The Giveaway Ends At");
            const m: any = await (this.guild.channels.get(giveaway.channel.id) as TextChannel).send(embed);
            gw.messageID = m.id;
            super.set(gw.name, gw);
            const entry: Giveaways = await this.client.mongo.giveaways
                .findOne({ guildID: this.guild.id, endDate: gw.endDate, name: gw.name });
            entry.set({ messageID: m.id });
            await entry.save();
            gw.reactionEmote ? m.react(giveaway.reactionEmote.id) : m.react("495031665803001876");
            this.client.emit("giveawayStart", this.guild);

            return new Promise((res) => {
                setTimeout(() => {
                    res(this.array());
                },         50);
            });
        } catch (error) {
            throw error;
        }
    }

    public begin(): void {
        this.forEach(giveaway => {
            if (giveaway.running) {
                this.listenGiveaway(giveaway);
            }
        });
    }

    public async listenGiveaway(giveaway: Giveaway): Promise<Object> {
        let time: number = giveaway.endDate;
        const channel: TextChannel = this.guild.channels.get(giveaway.channel.id) as TextChannel;
        const gw: Giveaways = await this.client.mongo.giveaways
            .findOne({ guildID: this.guild.id, name: giveaway.name });
        const message: FoxMessage = channel && channel.messages
            ? await channel.messages.fetch(giveaway.messageID)
                .catch(() => undefined)
            : undefined;
        if (giveaway.ended) { time = 0; }
        if (time <= Date.now() && channel && message && message.reactions && giveaway.running && !giveaway.paused) {
            const reaction: MessageReaction = giveaway.reactionEmote
                ? message.reactions.get(giveaway.reactionEmote.id)
                : message.reactions.get("495031665803001876");
            const embed: MessageEmbed = message.embeds[0];
            if (!reaction || !reaction.users.filter((u) => !u.bot).size) {
                embed.title = `Giveaway Name: ${giveaway.name}`;
                embed.description = "No users reacted, so the giveaway could not proceed. Please have people react, then reroll."; // tslint:disable-line
                // @ts-ignore
                embed.timestamp = new Date(giveaway.endDate);
                embed.footer.text = "The Giveaway Ended At";
                message.edit({ embed });
                giveaway.ended = false;
                gw.set({ running: false });
                await gw.save();
                await this._cache();

                return new Promise((res) => {
                    setTimeout(() => {
                        res(this.array());
                    },         50);
                });
            } else if (reaction.users.filter((u) => !u.bot).size < giveaway.maxWinners) {
                embed.title = `Giveaway Name: ${giveaway.name}`;
                embed.description = "Not enough users reacted, so the giveaway was cancelled.";
                // @ts-ignore
                embed.timestamp = new Date(giveaway.endDate);
                embed.footer.text = "The Giveaway Ended At";
                message.edit({ embed });

                return this.array();
            } else {
                const winner: any[] = reaction.users.filter((u) => !u.bot)
                    .random(giveaway.maxWinners);
                embed.title = `Giveaway Name: ${giveaway.name}`;
                embed.description = `
                    ${winner.length > 1 ? `Winners: ${winner.join(", ")}` : `Winner: ${winner[0]}`}
                    If you didn't win this time around, there's always next time!`;
                // @ts-ignore
                embed.timestamp = new Date(giveaway.endDate);
                embed.footer.text = "The Giveaway Ended At";
                embed.author.name = `We have ${winner.length > 1 ? "some WINNERS!" : "a WINNER!"}`;
                channel.send(
                `Congratulations to ${winner.length > 1 ? winner.join(", ") : winner[0]} for winning the giveaway!`
                );
                message.edit({ embed });
                gw.set({ running: false, winners: winner, timeRemaining: 0 });
                await gw.save();
                await this._cache();

                return new Promise((res) => {
                    setTimeout(() => {
                        res(this.array());
                    },         50);
                });
            }
        } else if (time >= Date.now() && message && channel && !giveaway.paused) {
            const embed: MessageEmbed = message.embeds[0];
            const newTime: number = giveaway.endDate - Date.now();
            // @ts-ignore
            embed.description = embed.description.replace(`${duration(gw.get("timeRemaining"), "milliseconds").format("d [days], h [hours], m [minutes and] s [seconds]")}`, `${duration(newTime, "milliseconds").format("d [days], h [hours], m [minutes and] s [seconds]")}`); // tslint:disable-line
            gw.set({ timeRemaining: newTime });
            message.edit({ embed });
            await gw.save();
            await this._cache();
        } else if (giveaway.paused) {
            gw.set({ paused: gw.get("paused") + this.timeout._idleTimeout });
            await gw.save();
            await this._cache();
        }
    }

    public async pause(giveaway: Giveaway): Promise<Object> {
        const channel: TextChannel = this.guild.channels.get(giveaway.channel.id) as TextChannel;
        const message: FoxMessage = channel
            ? await channel.messages.fetch(giveaway.messageID)
                .catch(() => undefined)
            : undefined;
        const gw: Giveaways = await this.client.mongo.giveaways.findOne({
            guildID: this.guild.id,
            name: giveaway.name
        });
        if (channel && message && !giveaway.paused) {
            const embed: MessageEmbed = message.embeds[0];
            embed.description = "This giveaway is currently paused. You can still react, but the timer will start when the giveaway is resumed."; // tslint:disable-line
            embed.timestamp = null;
            embed.footer.text = "Giveaway Paused.";
            message.edit({ embed });
            gw.set({ paused: 3000 });
            await gw.save();
            await this._cache();

            return new Promise((res) => {
                setTimeout(() => {
                    res(super.array());
                },         50);
            });
        }
    }

    public async remove(name: string): Promise<object> {
        const giveaway: Giveaways = await this.client.mongo.giveaways.findOne({ guildID: this.guild.id, name });
        if (!giveaway) { throw new Error("Could not resolve giveaway."); }
        await giveaway.remove();
        await super.delete(name);

        return new Promise((res) => {
            setTimeout(() => {
                res(this.array());
            },         50);
        });
    }

    public async reroll(giveaway: Giveaway): Promise<Object> {
        const channel: TextChannel = this.guild.channels.get(giveaway.channel.id) as TextChannel;
        const message: FoxMessage = channel && channel.messages
            ? await channel.messages.fetch(giveaway.messageID) as FoxMessage
            : undefined;
        const gw: Giveaways = await this.client.mongo.giveaways.findOne({
            guildID: this.guild.id,
            name: giveaway.name
        });
        if (channel && message) {
            const embed: MessageEmbed = message.embeds[0];
            let reaction: any = giveaway.reactionEmote
                ? message.reactions.get(giveaway.reactionEmote.id)
                : message.reactions.get("495031665803001876");
            if (reaction) { reaction = await reaction.users.fetch(); }
            if (!reaction || !reaction.filter((u) => !u.bot).size) {
                embed.title = `Giveaway Name: ${giveaway.name}`;
                embed.description = "Reroll failed due to no new reactions. Ensure that users react, and reroll again.";
                message.edit({ embed });

                return super.array();
            } else if (reaction.filter((u) => !u.bot).size < giveaway.maxWinners) {
                embed.title = `Giveaway Name: ${giveaway.name}`;
                embed.description = "Not enough users reacted, so the reroll was cancelled.";
                message.edit({ embed });

                return super.array();
            } else {
                const winner: User[] = reaction.filter((u) => !u.bot)
                    .random(giveaway.maxWinners);
                embed.title = `Giveaway Name: ${giveaway.name}`;
                embed.description = `${winner.length > 1 ? `New Winners: ${winner.join(", ")}` : `New Winner: ${winner[0]}`}\nIf you didn't win this time around, there's always next time!`; // tslint:disable-line
                // @ts-ignore
                embed.timestamp = new Date(giveaway.endDate);
                embed.footer.text = "The Giveaway Ended At";
                embed.author.name = "Giveaway Re-rolled!";
                channel.send(`${winner.length > 1 ? winner.join(", ") : winner[0]}, you are the new ${winner.length > 1 ? "winners!" : "winner!"}`); // tslint:disable-line
                message.edit({ embed });
                gw.set({ winners: winner });
                await gw.save();
                await this._cache();

                return new Promise((res) => {
                    setTimeout(() => {
                        res(this.array());
                    },         50);
                });
            }
        }
    }

    public async resume(giveaway: Giveaway): Promise<Object> {
        const channel: TextChannel = this.guild.channels.get(giveaway.channel.id) as TextChannel;
        const message: FoxMessage = channel
            ? await channel.messages.fetch(giveaway.messageID) as FoxMessage
            : undefined;
        const gw: Giveaways = await this.client.mongo.giveaways.findOne({
            guildID: this.guild.id,
            name: giveaway.name
        });
        if (channel && message && giveaway.paused) {
            const newEnd: number = (gw.get("endDate") + giveaway.paused) - Date.now();
            const embed: MessageEmbed = message.embeds[0];
            embed.description = embed.description.replace(
                embed.description,
                `In order to enter this giveaway, make sure to react with ${giveaway.reactionEmote ? this.guild.emojis.get(giveaway.reactionEmote.id) : "<:phat:495031665803001876>"}.\nPossible winners: **${giveaway.maxWinners}**\nYou have **${newEnd}** remaining to enter.`.replace(newEnd.toString(), `${duration(newEnd, "milliseconds").format("d [days], h [hours], m [minutes and] s [seconds]")}`) // tslint:disable-line
            );
            // @ts-ignore
            embed.timestamp = new Date(gw.get("endDate") + giveaway.paused);
            embed.footer.text = "The Giveaway Ends At";
            message.edit({ embed });
            gw.set({ paused: !giveaway.paused, endDate: gw.get("endDate") + giveaway.paused, timeRemaining: newEnd });
            await gw.save();
            await this._cache();

            return new Promise((res) => {
                setTimeout(() => {
                    res(this.array());
                },         75);
            });
        }
    }

}
