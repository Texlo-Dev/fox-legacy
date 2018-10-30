export default class Giveaway {

    public constructor(guild, info) {
        this.guild = guild;
        this.name = info.name;
        this.guildID = info.guildID;
        this.channel = info.channel;
        this.endDate = info.endDate;
        this.running = info.running;
        this.messageID = info.messageID;
        this.winners = info.winners;
        this.paused = info.paused;
        this.maxWinners = info.maxWinners;
        this.timeRemaining = info.timeRemaining;
        this.reactionEmote = info.reactionEmote;
    }

    public async end() {
        if (!this.running) throw new Error("Giveaway must be running in order to end.");
        this.ended = true;

        try {
            return await this.guild.client.guilds.get(this.guildID).giveaways.listenGiveaway(this);
        } catch (err) {
            throw err;
        }
    }

    public async reroll() {
        if (this.running) throw new Error("Giveaway must not be running to reroll.");
        try {
            return await this.guild.client.guilds.get(this.guildID).giveaways.reroll(this);
        } catch (err) {
            throw err;
        }
    }

    public async pause() {
        if (this.paused || !this.running) throw new Error("Giveaway must not either be already paused and currently running.");
        try {
            return await this.guild.client.guilds.get(this.guildID).giveaways.pause(this);
        } catch (err) {
            throw err;
        }
    }

    public async resume() {
        if (!this.paused || !this.running) throw new Error("Giveaway must be already paused and currently running.");
        try {
            return await this.guild.client.guilds.get(this.guildID).giveaways.resume(this);
        } catch (err) {
            throw err;
        }
    }

}
