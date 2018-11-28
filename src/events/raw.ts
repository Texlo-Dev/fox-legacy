import { MessageReaction, TextChannel } from "discord.js";
import { Event, FoxClient } from "../util";
import { FoxMessage, FoxUser } from "../util/extensions";
const events: any = {
  MESSAGE_REACTION_ADD: "messageReactionAdd",
  MESSAGE_REACTION_REMOVE: "messageReactionRemove"
};

export default class extends Event {
  public constructor(client: FoxClient) {
    super(client, {
      name: "raw",
      description: "Raw Discord event."
    });
  }

  public async run(event: any): Promise<void> {
    if (!events.hasOwnProperty(event.t)) {
      return;
    }

    const { d: data } = event;
    const user: FoxUser = (await this.client.users
      .fetch(data.user_id)
      .catch(() => undefined)) as FoxUser;
    if (!user) return;
    const channel: TextChannel = this.client.channels.get(
      data.channel_id
    ) as TextChannel;

    if (channel.messages.has(data.message_id)) {
      return;
    }

    const message: FoxMessage = (await channel.messages.fetch(
      data.message_id
    )) as FoxMessage;
    const emojiKey: string = data.emoji.id || data.emoji.name;
    const reaction: MessageReaction =
      message.reactions.get(emojiKey) || message.reactions.add(data);

    this.client.emit(events[event.t], reaction, user);
    if (message.reactions.size === 1) {
      message.reactions.delete(emojiKey);
    }
  }
}
