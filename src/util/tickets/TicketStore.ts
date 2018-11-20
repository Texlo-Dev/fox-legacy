// tslint:disable-next-line:file-name-casing
import {
    CategoryChannel, Collection, GuildMember, GuildMemberStore,
    MessageEmbed, Role, TextChannel, VoiceChannel
} from "discord.js";
import { FoxClient } from "..";
import { TicketOptions } from "../../types";
import { FoxGuild, FoxUser } from "../extensions";
import { Tickets } from "../Mongo";
import Ticket from "./Ticket";

export default class TicketStore extends Collection<any, any> {
    public readonly category: CategoryChannel;
    public client: FoxClient;
    public guild: FoxGuild;
    public readonly logchannel: TextChannel;
    public readonly message: string;
    public pingagents: boolean;
    public tkts: Ticket[];

    public constructor(guild: FoxGuild) {
        super();
        this.guild = guild;
        this.client = guild.client;
        this.logchannel = null;
        this.category = null;
        this.message = null;
        this.pingagents = false;
        this.tkts = [];
        Object.defineProperty(this, "client", { value: guild.client });
    }

    public async _cache(): Promise<TicketStore> {
        await this._settings();
        const tkts: Tickets[] = await Tickets.find({
            guildID: this.guild.id,
            type: "tkt"
        });
        if (!tkts) return this._minify();
        const mapped: any[] = tkts.map(t => t.get());
        if (!mapped.length) return this._minify();
        for await (const tkt of mapped) {
            const ticket: Ticket = new Ticket(this.guild, tkt);
            super.set(ticket.id, ticket);
        }

        return this._minify();

    }

    public async add(options: any, member: FoxUser): Promise<Object> {
        if (!this.logchannel) throw new Error("No Log Channel has been set, please set one before continuing.");
        if (!this.category) throw new Error(
            "No ticket channel category has been set, please set one before continuing."
        );
        try {
            const count: number = await Tickets.count({ guildID: this.guild.id, type: "tkt" });
            const data: TicketOptions = {
                agents: [],
                guildID: this.guild.id,
                author: JSON.parse(JSON.stringify(member)),
                id: count + 1,
                type: "tkt",
                createdAt: Date.now(),
                open: true,
                topic: options.topic || "None"
            };
            const dbentry: Tickets = new Tickets(data);
            const ticket: Ticket = new Ticket(this.guild, data);
            await dbentry.save();

            const mentionroles: string[] = this.guild.roles.filter(
                r => this.guild.perms.check("ticket.agent", r)
            )
            .map(r => r.toString());
            const logchannel: TextChannel = this.guild.channels.get(this.logchannel.id) as TextChannel;
            const logembed: MessageEmbed = new MessageEmbed()
            .setColor(this.client.brandColor)
            .setAuthor(member.tag, member.displayAvatarURL())
            .setDescription(
            `New Support ticket from ${member.username}.
            **Topic:** ${ticket.topic}
            To accept this ticket, simply run \`${this.guild.config.prefix}tclaim ${ticket.id}\`.
            `
            )
            .setTimestamp()
            .setFooter(`${this.client.user.username} Tickets`, this.client.user.displayAvatarURL());
            await logchannel.send(this.pingagents ? mentionroles.join(", ") : null, { embed: logembed });
            let members: GuildMemberStore = await this.guild.members.fetch();
            members = members.filter(m => this.guild.perms.check("ticket.agent", m));
            const ows: any[] = members.map(m => ({
                id: m.id,
                allow: ["VIEW_CHANNEL"],
                deny: ["SEND_MESSAGES"]
            }));
            ows.push(
                {
                    id: this.guild.id,
                    deny: ["VIEW_CHANNEL"]
                },
                {
                    id: member.id,
                    allow: ["VIEW_CHANNEL", "SEND_MESSAGES"]
                },
                {
                    id: this.client.user.id,
                    allow: ["VIEW_CHANNEL", "SEND_MESSAGES", "MANAGE_MESSAGES"]
                }
            );
            const tktchannel: TextChannel | VoiceChannel = await this.guild.channels.create(`ticket-${ticket.id}`, {
                type: "text",
                topic: ticket.topic,
                parent: this.category.id,
                permissionOverwrites: ows
            }) as TextChannel;
            ticket.channel = JSON.parse(JSON.stringify(tktchannel));
            const recent: Tickets = await Tickets.findOne({ guildID: this.guild.id, type: "tkt", id: ticket.id });
            await recent.set({ channel: ticket.channel });
            await recent.save();
            super.set(ticket.id, ticket);
            await this._cache();
            const tktembed: MessageEmbed = new MessageEmbed()
            .setColor(this.client.brandColor)
            .setAuthor(`${this.guild.name} Support`, this.guild.iconURL())
            .setFooter(this.client.user.username, this.client.user.displayAvatarURL())
            .setTimestamp()
            .setDescription(
            `${this.message
            ? this.message
            : "You have opened a support ticket, a server support agent will be with you shortly."}
            **Topic:** ${ticket.topic}
            `
            );

            return tktchannel.send(tktembed)
            .then(() => new Promise(res => setTimeout(() => res(ticket), 50)));

        } catch (error) {
            throw error;
        }

    }

    public async remove(id: number): Promise<TicketStore> {
        if (!Number(id)) throw new Error("Missing parameter id.");
        if (!super.has(id)) throw new Error("Ticket does not exist in database.");
        const tkt: Tickets = await Tickets.findOne({
            guildID: this.guild.id,
            id
        });
        if (!tkt) throw new Error("Ticket does not exist in the database.");

        return tkt.remove()
        .then(() => this._cache())
        .then(() => this)
        .catch(Promise.reject);
    }

    public async save(key: string, value: any): Promise<Object> {
        const settings: Tickets = await Tickets.findOne({
            guildID: this.guild.id,
            type: "settings",
        });
        if (!settings) throw new Error("Database entry did not exist.");
        if (!this.hasOwnProperty(key)) { return; }
        settings.set(key, value);
        await settings.save();
        await this._cache();

        return new Promise(res => setTimeout(() => res(this._minify()), 50));
    }

    private _minify(): TicketStore {
        const arg: any = { ...this };
        delete arg.guild;
        delete arg.client;
        arg.tkts = this.map(a => a);

        return arg;
    }

    private async _settings(): Promise<TicketStore> {
        const settings: Tickets = await Tickets.findOne({
            guildID: this.guild.id,
            type: "settings"
        });
        if (!settings) {
            const ent: Tickets = new Tickets({
                guildID: this.guild.id,
                type: "settings",
                category: this.category,
                message: this.message,
                logchannel: this.logchannel
            });

            return ent.save()
            .then(() => this._settings());
        }
        for await (const key of Object.keys(this)) {
            if (key === "guild" || key === "client") { continue; }
            const value: any = settings.get(key);
            if (value !== undefined) { this[key] = value; }
        }

        return this;

    }

}
