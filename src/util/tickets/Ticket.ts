import { Message, MessageEmbed, TextChannel } from "discord.js";
import { TicketOptions } from "../../types";
import { FoxGuild, FoxUser } from "../extensions";
import { Tickets } from "../Mongo";
import TicketStore from "./TicketStore";

export default class Ticket implements TicketOptions {
    public agents: FoxUser[];
    public author: FoxUser;
    public channel?: TextChannel;
    public createdAt: number;
    public guild: FoxGuild;
    public id: number;
    public open: boolean;
    public topic: string;

    public constructor(guild: FoxGuild, info: TicketOptions) {
        this.author = info.author;
        this.channel = info.channel;
        this.createdAt = info.createdAt;
        this.topic = info.topic;
        this.id = info.id;
        this.open = info.open;
        this.guild = guild;
        this.agents = info.agents;
    }

    public async accept(user: FoxUser): Promise<Ticket> {
        const tkt: Tickets = await Tickets.findOne({
            guildID: this.guild.id,
            id: this.id
        });
        if (!tkt) throw new Error("Ticket does not exist in database.");
        const agents: FoxUser[] = tkt.get("agents");
        if (agents.some(a => a.id === user.id)) return this;
        agents.push(JSON.parse(JSON.stringify(user)));
        tkt.set({ agents });

        await tkt.save();

        return (this.guild.channels.get(this.channel.id) as TextChannel)
        .send(new MessageEmbed()
            .setColor(this.guild.client.brandColor)
            .setAuthor(`${this.guild.name} Support`, this.guild.iconURL())
            .setTimestamp()
            .setDescription(`${user.username} has joined this ticket.`)
            .setFooter(`${this.guild.client.user.username} Tickets`, this.guild.client.user.displayAvatarURL())
        )
        .then((m: Message) => m.channel.createOverwrite(user, {
                SEND_MESSAGES: true,
                VIEW_CHANNEL: true
            })
        )
        .then(() => this.guild.tickets._cache())
        .then(() => this)
        .catch(err => err);
    }

    public async close(): Promise<TicketStore> {
        const ticket: Tickets = await Tickets.findOne({
            guildID: this.guild.id,
            id: this.id
        });
        ticket.set({ open: false });

        return ticket.save()
        .then(() => this.guild.channels.get(this.channel.id)
            .delete())
        .then(() => this.guild.tickets._cache())
        .then(() => this.guild.tickets)
        .catch(err => Promise.reject(err));
    }

    public async rename(topic: string): Promise<Ticket> {
        if (!topic) throw new Error("No topic was specified.");
        const ticket: Tickets = await Tickets.findOne({
            guildID: this.guild.id,
            id: this.id
        });
        ticket.set({ topic });
        const channel: TextChannel = this.guild.channels.get(this.channel.id) as TextChannel;
        if (channel) await channel.setTopic(topic);

        return ticket.save()
        .then(() => this.guild.tickets._cache())
        .then(() => this)
        .catch(err => Promise.reject(err));
    }
}
