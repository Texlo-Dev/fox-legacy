import { Collection, Message, MessageEmbed, TextChannel } from "discord.js";
import { FoxGuild, FoxMessage } from "../extensions";
import { Polls } from "../Mongo";
import Poll from "./Poll";
const numbers = {
  1: "1⃣",
  2: "2⃣",
  3: "3⃣",
  4: "4⃣",
  5: "5⃣"
};

export default class PollStore extends Collection<any, any> {
  public readonly guild: FoxGuild;

  public constructor(guild: FoxGuild) {
    super();
    this.guild = guild;
  }

  public async _cache(): Promise<boolean> {
    const polls: Polls[] = await this.guild.client.mongo.polls.find({
      guildID: this.guild.id
    });
    if (!polls) {
      return;
    }
    const mapped: any[] = polls.map(g => g.get());
    if (!mapped.length) {
      return;
    }
    for (const poll of mapped) {
      const pl: Poll = new Poll(poll);
      super.set(pl.name, pl);
    }

    return true;
  }

  public async add(name: string, obj: any): Promise<Object> {
    if (super.has(name)) {
      throw new Error("Poll already exists.");
    }
    if (obj.channel instanceof String) {
      obj.channel = this.guild.channels.get(obj.channel);
    }
    const data: any = {
      name,
      guildID: this.guild.id,
      channel: JSON.parse(JSON.stringify(obj.channel)),
      open: true,
      type: obj.type,
      question: obj.question,
      responses: []
    };
    let num = 1;
    for (let answer of obj.possibleAnswers) {
      if (obj.type === "open") {
        answer = `${numbers[String(num++)]} ${answer}`;
      }
      data.responses.push({ name: answer, count: 0 });
    }
    if (!obj.question.endsWith("?")) {
      obj.question += "?";
    }
    const newPoll: Polls = new this.guild.client.mongo.polls(data);
    try {
      await newPoll.save();
      const pl = new Poll(data);
      let num = 1;
      const embed: MessageEmbed = new MessageEmbed()
        .setColor(this.guild.client.brandColor)
        .setTimestamp()
        .setAuthor(
          `POLL: ${pl.question}`,
          this.guild.client.user.displayAvatarURL()
        )
        .setFooter(this.guild.client.user.username);
      for (const answer of pl.responses) {
        if (obj.type === "open") {
          embed.addField(`${answer.name}`, "\u200B");
        } else {
          embed.addField(`${num++}. ${answer.name}`, "\u200B");
        }
      }
      const m: Message = await (this.guild.channels.get(
        data.channel.id
      ) as TextChannel).send(embed);
      if (pl.type === "simple") {
        await m.react("✅");
        await m.react("❌");
        await m.react("🤷");
      } else {
        for (const reaction of obj.possibleAnswers) {
          const emote: string = `${
            numbers[String(obj.possibleAnswers.indexOf(reaction) + 1)]
          }`;
          await m.react(emote);
        }
      }
      pl.messageID = m.id;
      super.set(pl.name, pl);
      const entry: Polls = await this.guild.client.mongo.polls.findOne({
        guildID: this.guild.id,
        name: pl.name
      });
      entry.set({ messageID: m.id });
      await entry.save();

      return new Promise(res => {
        setTimeout(() => {
          res(super.array());
        },         50);
      });
    } catch (error) {
      throw error;
    }
  }

  public async gatherData(poll: Poll): Promise<object> {
    if (!poll) {
      throw new Error("No poll was provided.");
    }
    const channel: TextChannel = this.guild.channels.get(
      poll.channel.id
    ) as TextChannel;
    const message: Message = await channel.messages.fetch(poll.messageID);
    if (!channel || !message) {
      throw new Error("Invalid channel/message.");
    }

    try {
      const pl: Polls = await this.guild.client.mongo.polls.findOne({
        guildID: this.guild.id,
        name: poll.name
      });
      if (!pl) {
        throw new Error("Poll could not be resolved.");
      }
      const embed: MessageEmbed = message.embeds[0];
      const responses: any[] = poll.responses;
      for (const answer of embed.fields) {
        answer.name =
          poll.type === "simple" ? answer.name.split(". ")[1] : answer.name;
        const reacted: number = message.reactions.find(
          m => answer.name.indexOf(m.emoji.name) > -1
        ).count;
        answer.value = `Members Voted: ${reacted}`;
        responses.find(
          r =>
            r.name.indexOf(
              poll.type === "open" ? answer.name : answer.name.split(" ")[1]
            ) > -1
        ).count = reacted;
        if (poll.type === "open") {
          responses.find(
            r => r.name === answer.name
          ).name = answer.name.substring(3);
        }
      }
      pl.set({ responses, open: false });
      await pl.save();
      await message.reactions.removeAll();
      message.edit({ embed });
      await this._cache();

      return new Promise(res => {
        setTimeout(() => {
          res(super.array());
        },         50);
      });
    } catch (error) {
      throw error;
    }
  }

  public async remove(name: string): Promise<object> {
    if (!super.has(name)) {
      throw new Error("Poll does not exists in collection.");
    }
    const poll: Polls = await this.guild.client.mongo.polls.findOne({
      guildID: this.guild.id,
      name
    });
    if (!poll) {
      throw new Error("Could not resolve giveaway.");
    }
    await poll.remove();
    await super.delete(name);

    return new Promise(res => {
      setTimeout(() => {
        res(super.array());
      },         50);
    });
  }
}
