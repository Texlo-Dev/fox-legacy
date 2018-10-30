import { Event } from "../util";
const events = {
    MESSAGE_REACTION_ADD: "messageReactionAdd",
    MESSAGE_REACTION_REMOVE: "messageReactionRemove"
};

export default class extends Event {

    public constructor(client) {
        super(client, {
            name: "raw",
            description: "Raw Discord event."
        });
    }

    public async run(event) {
        if (!events.hasOwnProperty(event.t)) return;

        const { d: data } = event;
        const user = this.client.users.get(data.user_id);
        const channel = this.client.channels.get(data.channel_id) || await user.createDM();

        if (channel.messages.has(data.message_id)) return;

        const message = await channel.messages.fetch(data.message_id);
        const emojiKey = data.emoji.id || data.emoji.name;
        const reaction = message.reactions.get(emojiKey) || message.reactions.add(data);

        this.client.emit(events[event.t], reaction, user);
        if (message.reactions.size === 1) message.reactions.delete(emojiKey);
    }

}
