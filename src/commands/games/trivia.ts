import { Banking, Command, FoxClient } from "../../util";
import { FoxMessage } from "../../util/extensions";
const game: any = {};

export default class FoxCommand extends Command {

    public static atob(base64: string): string {
        return Buffer.from(base64, "base64")
            .toString("ascii");
    }

    public static hasPermission(message: FoxMessage) {
        return message.guild.perms.check("games.play", message);
    }

    public static isCorrect(str: string, obj: any): boolean {
        const num = Number(str) - 1;

        return this.boolean(str)
        ? str.match(new RegExp(obj.correct_answer, "i"))
        : obj.available_answers[num]
        ? obj.available_answers[num].match(new RegExp(obj.correct_answer)) 
        : false;
    }

    public static regExpEsc(str: string): string {
        return str.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");
    }

    public constructor(client: FoxClient) {
        super(client, {
            name: "trivia",
            description: "Answer a random trivia question!",
            guildOnly: true,
            cooldown: 240,
            requiredPerms: ["`games.play`"],
        });
    }

    public async fetchTriviaQ(): Promise<Object> {
        const { results: arr }: any = await this.client.http("GET", {
            url: "https://opentdb.com/api.php?amount=1&encode=base64",
        }).catch(() => null);
        if (!arr) { return null; }
        const obj: any = arr[0];
        obj.type = FoxCommand.atob(obj.type);
        obj.category = FoxCommand.atob(obj.category);
        obj.question = FoxCommand.atob(obj.question);
        obj.correct_answer = FoxCommand.atob(obj.correct_answer);
        const answers: string[] = obj.incorrect_answers.map(o => FoxCommand.atob.atob(o));
        answers.splice(Math.floor(Math.random() * answers.length), 0, obj.correct_answer);
        obj.available_answers = this.client.shuffleArray(answers);

        return obj;
    }

    public async run(message: FoxMessage) {
        const obj = await this.fetchTriviaQ()
            .catch(() => null);
        if (!obj) { return message.error("It seems like the trivia API is currently down. Please try again later."); }
        let trivia: object = game[`${message.guild.id}${message.author.id}`];
        if (!trivia) {
            trivia = game[`${message.guild.id}${message.author.id}`] = { correct: [] };
        }
        const res: boolean | number = await this.sendQuestion(1, message, trivia);
        if (res === 0) { return message.send("Successfuly cancelled the game."); }
        const res2: boolean | number = await this.sendQuestion(2, message, trivia);
        if (res2 === 0) { return message.send("Successfuly cancelled the game."); }
        const res3: boolean | number = await this.sendQuestion(3, message, trivia);
        if (res3 === 0) { return message.send("Successfuly cancelled the game."); }
        const res4: boolean | number = await this.sendQuestion(4, message, trivia);
        if (res4 === 0) { return message.send("Successfuly cancelled the game."); }
        const res5: boolean | number = await this.sendQuestion(5, message, trivia);
        const res5 = await this.sendQuestion(5, message, trivia);
        if (res5 === 0) { return message.send("Successfuly cancelled the game."); }
    }

    public async sendQuestion(num: number, message: FoxMessage, trivia: any) {
        let question = 1;
        const obj: Object = await this.fetchTriviaQ();
        let res: any;
        num === 1
            ? res = await message.sendPrompt(`Welcome to trivia! Let's get started!\nCategory: *${obj.category}*.\n${obj.type === "boolean" ? `True or False: ${obj.question}\n${obj.available_answers.map(o => `\n**${question++}.** ${o}`).join("\n")}` : `${obj.question}\n${obj.available_answers.map(o => `\n**${question++}.** ${o}`).join("\n")}`}\n\nPlease enter a number between 1 and 4.`, 15000)
            : res = await message.sendPrompt(`Category: *${obj.category}*.\n${obj.type === "boolean" ? `True or False: ${obj.question}\n${obj.available_answers.map(o => `\n**${question++}.** ${o}`).join("\n")}` : `${obj.question}\n${obj.available_answers.map(o => `\n**${question++}.** ${o}`).join("\n")}`}\n\nPlease enter a number between 1 and 4.`, 15000);
        if (res === undefined) { message.channel.send("Time is up!"); }
        if (res === 0) { return 0; }
        if (!FoxCommand.isCorrect(res, obj)) {
            message.channel.send(`<:nicexmark:495362785010647041>  Sorry, wrong answer! Correct answer is "${obj.correct_answer}".`); // tslint:disable-line
        } else {
            await message.channel.send("Correct!");
            trivia.correct.push(true);
        }
        if (num === 5) {
            const amount = trivia.correct.length * 2000 || 100;
            await message.channel.send(`You answered **${trivia.correct.length}/5** questions correctly.\nTotal payout: ¥${amount}\nThanks for playing!`); // tslint:disable-line
            Banking.addMoney(message.author, { amount, guild: message.guild });
            trivia.correct = [];

            return true;
        }
    }

}
