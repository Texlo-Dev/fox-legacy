const answers = [
    "Yes",
    "Definitely",
    "In the forseeable future",
    "Ask again later",
    "I highly doubt it",
    "Unlikely",
    "It is certain",
    "Reply hazy try again",
    "Outlook good",
    "My reply is no",
    "Very doubtful",
    "Outlook is not so good",
    "It is decidedly so",
    "As I see it, yes",
    "You may rely on it",
    "Signs point to yes",
];

import { Command } from "../../util";
export default class FoxCommand extends Command {

    public constructor(client) {
        super(client, {
            name: "magic8",
            description: "Replies with an answer from the Magic 8 Ball.",
            usage: "[question]",
            aliases: ["8ball"],
        });
    }

    public run(message, args) {
        const question = args.join(" ");
        if (!question) { return message.error(" Please specify a question."); }
        return message.reply(`${answers[Math.floor(Math.random() * answers.length)]} :8ball:`);
    }

}
