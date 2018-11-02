import { get } from "snekfetch";
import { Command } from "../../util";
const game = {};

export default class FoxCommand extends Command {

    public constructor(client) {
        super(client, {
            name: "trivia",
            description: "Answer a random trivia question!",
            guildOnly: true,
            cooldown: 240,
            requiredPerms: ["`games.play`"]
        });
    }

    public hasPermission(message) {
        return message.guild.perms.check("games.play", message);
    }

    public async run(message) {
        const obj = await this.fetchTriviaQ().catch(err => {
            message.error(" It seems like the trivia API is currently down. Please try again later.");
            throw err.stack ? err.stack : err;
        });
        if (!obj) return message.error(" It seems like the trivia API is currently down. Please try again later.");
        let trivia = game[`${message.guild.id}${message.author.id}`];
        if (!trivia) {
            trivia = game[`${message.guild.id}${message.author.id}`] = { correct: [] };
        }
        const res = await this.sendQuestion(1, message, trivia);
        if (res === 0) return message.send("Successfuly cancelled the game.");
        const res2 = await this.sendQuestion(2, message, trivia);
        if (res2 === 0) return message.send("Successfuly cancelled the game.");
        const res3 = await this.sendQuestion(3, message, trivia);
        if (res3 === 0) return message.send("Successfuly cancelled the game.");
        const res4 = await this.sendQuestion(4, message, trivia);
        if (res4 === 0) return message.send("Successfuly cancelled the game.");
        const res5 = await this.sendQuestion(5, message, trivia);
        if (res5 === 0) return message.send("Successfuly cancelled the game.");
    }

    public isCorrect(str, obj) {
        const num = parseInt(str) - 1;
        return this.boolean(str) ? str.match(new RegExp(obj.correct_answer, "i")) : obj.available_answers[num] ? obj.available_answers[num].match(new RegExp(obj.correct_answer)) : false;
    }

    public async sendQuestion(num, message, trivia) {
        let question = 1;
        const obj = await this.fetchTriviaQ();
        let res;
        if (num === 1) res = await message.sendPrompt(`Welcome to trivia! Let's get started!\nCategory: *${obj.category}*.\n${obj.type === "boolean" ? `True or False: ${obj.question}\n${obj.available_answers.map(o => `\n**${question++}.** ${o}`).join("\n")}` : `${obj.question}\n${obj.available_answers.map(o => `\n**${question++}.** ${o}`).join("\n")}`}\n\nPlease enter a number between 1 and 4.`, 15000);
        else res = await message.sendPrompt(`Category: *${obj.category}*.\n${obj.type === "boolean" ? `True or False: ${obj.question}\n${obj.available_answers.map(o => `\n**${question++}.** ${o}`).join("\n")}` : `${obj.question}\n${obj.available_answers.map(o => `\n**${question++}.** ${o}`).join("\n")}`}\n\nPlease enter a number between 1 and 4.`, 15000);
        if (res === undefined) message.channel.send(`Time is up!`);
        if (res === 0) return 0;
        if (!this.isCorrect(res, obj)) { message.send(`<:nicexmark:495362785010647041>  Sorry, wrong answer! Correct answer is "${obj.correct_answer}".`); } else {
            await message.channel.send("Correct!");
            trivia.correct.push(true);
        }
        if (num === 5) {
            const amount = trivia.correct.length * 2000 || 100;
            await message.channel.send(`You answered **${trivia.correct.length}/5** questions correctly.\nTotal payout: ¥${amount}\nThanks for playing!`);
            message.guild.banking.addMoney(message.author, { amount, guild: message.guild });
            trivia.correct = [];
            return true;
        }
    }

    public async fetchTriviaQ() {
        const { body: { results: arr } } = await get("https://opentdb.com/api.php?amount=1&encode=base64")
            .catch(err => err);
        const obj = arr[0];
        obj.type = this.atob(obj.type);
        obj.category = this.atob(obj.category);
        obj.question = this.atob(obj.question);
        obj.correct_answer = this.atob(obj.correct_answer);
        const answers = obj.incorrect_answers.map(o => this.atob(o));
        answers.splice(Math.floor(Math.random() * answers.length), 0, obj.correct_answer).shuffle();
        obj.available_answers = answers;
        return obj;
    }

    public atob(base64) {
        return Buffer.from(base64, "base64").toString("ascii");
    }

    public regExpEsc(str) {
        return str.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");
    }

}
