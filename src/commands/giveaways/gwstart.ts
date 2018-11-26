import { Command } from "../../util";
export default class FoxCommand extends Command {
  public args: any;

  public constructor(client) {
    super(client, {
      name: "gwstart",
      description: "Starts a new giveaway.",
      requiredPerms: ["`giveaway.leader`"]
    });
    this.args = {};
  }

  public async confirm(message) {
    const res = await message
      .sendPrompt(
        `Check this info! Is it correct? Respond with Yes to start the giveaway.\nTime: ${
          this.args.time
        }\nPrize: ${this.args.prize}\nChannel: ${
          this.args.channel
        }\nMax Winners: ${this.args.maxWinners}`,
        30000
      )
      .catch(() => null);
    if (res && res.match(/yes/i)) {
      return true;
    } else if (res === 0) {
      throw new Error("Missing parameters.");
    } else if (res.match(/no/i)) {
      throw new Error("Cancelled.");
    } else if (res) {
      message.error("Invalid Option. Must respond with Yes or No.");
      return this.confirm(message);
    } else {
      throw new Error("Time expired to enter a channel.");
    }
  }

  public async getChannel(message) {
    const res = await message
      .sendPrompt(
        "What channel would you like the giveaway to be held in?",
        30000
      )
      .catch(() => null);
    if (res && (await this.channel(res, message))) {
      this.args.channel = await this.channel(res, message);
      return this.args;
    } else if (res === 0) {
      throw new Error("Missing parameters.");
    } else if (res) {
      message.error("Invalid Channel.");
      return this.getChannel(message);
    } else {
      throw new Error("Time expired to enter a channel.");
    }
  }

  public async getMaxWinners(message) {
    const res = await message
      .sendPrompt("How many winners would you like to allow?", 30000)
      .catch(() => null);
    if (res && parseInt(res) && parseInt(res) > 0) {
      this.args.maxWinners = parseInt(res);
      return this.args;
    } else if (res === 0) {
      throw new Error("Missing parameters.");
    } else if (res) {
      message.error("Invalid Number.");
      return this.getMaxWinners(message);
    } else {
      throw new Error("Time expired to enter a channel.");
    }
  }

  public async getPrize(message) {
    const res = await message
      .sendPrompt("What would you like to name the prize?", 30000)
      .catch(() => null);
    if (res) {
      this.args.prize = res;
      return this.args;
    } else if (res === 0) {
      throw new Error("Missing parameters.");
    } else {
      throw new Error("Time expired to enter a prize.");
    }
  }

  public async getTime(message) {
    const res = await message
      .sendPrompt(
        "How long would you like the giveaway to start?, in time format? Example: 40m for minutes, 3w for weeks.",
        15000
      )
      .catch(() => null);
    if (
      res &&
      FoxClient.spanMs(res) >= 25000 &&
      FoxClient.spanMs(res) <= 3888000000
    ) {
      this.args.time = res;
      return this.args;
    } else if (res === 0) {
      throw new Error("Missing parameters.");
    } else if (res) {
      message.error(
        "Invalid Time Format/option. Giveaway must be at least 25 seconds, and no longer than 45 days."
      );
      return this.getTime(message);
    } else {
      throw new Error("Time expired to input a time.");
    }
  }

  public hasPermission(message) {
    return message.guild.perms.check("giveaway.leader", message);
  }

  public async run(message) {
    try {
      await this.getTime(message);
      await this.getPrize(message);
      await this.getChannel(message);
      await this.getMaxWinners(message);
      await this.confirm(message);
      const m = await message.send(
        "a:typing:393848431413559296> Starting giveaway...."
      );
      message.guild.giveaways
        .set(this.args.prize, {
          name: this.args.name,
          channel: this.args.channel,
          endDate: Date.now() + FoxClient.spanMs(this.args.time),
          maxWinners: this.args.maxWinners,
          prize: this.args.prize
        })
        .then(() => {
          this.args = {};
          m.edit("Successfully started a new giveaway.");
        })
        .catch(error => {
          m.edit(
            `<:nicexmark:495362785010647041> Could not add this giveaway. ${
              error.message
            }`
          );
        });
    } catch (error) {
      return message.error("Received the timeout signal, cancelling prompt.");
    }
  }
}
