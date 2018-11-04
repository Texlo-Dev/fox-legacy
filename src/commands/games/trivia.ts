import { Command } from "../../util";
import { FoxMessage } from "../../util/extensions";
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

    public hasPermission(message: FoxMessage) {
        return message.guild.perms.check("games.play", message);
    }

    public async run(message: FoxMessage) {
        const obj = await this.fetchTriviaQ().catch(error => {
            console.error(error);
            return null;
        });
        if (!obj) return message.error("It seems like the trivia API is currently down. Please try again later.");
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

    public isCorrect(str: string, obj: any): boolean {
        const num = parseInt(str) - 1;
        return this.boolean(str) ? str.match(new RegExp(obj.correct_answer, "i")) : obj.available_answers[num] ? obj.available_answers[num].match(new RegExp(obj.correct_answer)) : false;
    }

    public async sendQuestion(num: number, message: FoxMessage, trivia: any) {
        let question = 1;
        const obj = await this.fetchTriviaQ();
        let res;
        num === 1
            ? res = await message.sendPrompt(`Welcome to trivia! Let's get started!\nCategory: *${obj.category}*.\n${obj.type === "boolean" ? `True or False: ${obj.question}\n${obj.available_answers.map(o => `\n**${question++}.** ${o}`).join("\n")}` : `${obj.question}\n${obj.available_answers.map(o => `\n**${question++}.** ${o}`).join("\n")}`}\n\nPlease enter a number between 1 and 4.`, 15000)
            : res = await message.sendPrompt(`Category: *${obj.category}*.\n${obj.type === "boolean" ? `True or False: ${obj.question}\n${obj.available_answers.map(o => `\n**${question++}.** ${o}`).join("\n")}` : `${obj.question}\n${obj.available_answers.map(o => `\n**${question++}.** ${o}`).join("\n")}`}\n\nPlease enter a number between 1 and 4.`, 15000);
        if (res === undefined) message.channel.send(`Time is up!`);
        if (res === 0) return 0;
        if (!this.isCorrect(res, obj)) { message.channel.send(`<:nicexmark:495362785010647041>  Sorry, wrong answer! Correct answer is "${obj.correct_answer}".`); } else {
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
        const { results: arr }: any = await this.client.http("GET", {
            url: "https://opentdb.com/api.php?amount=1&encode=base64"
        }).catch(error => {
            console.error(error);
            return null;
        });
        if (!arr) return null;
        const obj = arr[0];
        obj.type = this.atob(obj.type);
        obj.category = this.atob(obj.category);
        obj.question = this.atob(obj.question);
        obj.correct_answer = this.atob(obj.correct_answer);
        let answers = obj.incorrect_answers.map(o => this.atob(o));
        answers.splice(Math.floor(Math.random() * answers.length), 0, obj.correct_answer);
        obj.available_answers = this.client.shuffleArray(answers);
        return obj;
    }

    public atob(base64: string): string {
        return Buffer.from(base64, "base64").toString("ascii");
    }

    public regExpEsc(str: string): string {
        return str.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");
    }

}
