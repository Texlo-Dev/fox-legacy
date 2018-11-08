// tslint:disable:no-magic-numbers
import { Command, FoxClient } from "../../util";
import { FoxMessage } from "../../util/extensions";
export default class FoxCommand extends Command {

    public static hasPermission(message: FoxMessage): boolean {
        return message.guild.perms.check("polls.pollster", message);
    }

    public static async run(message: FoxMessage, args: string[]): Promise<void> {
        const name: string = args[0];
        if (!name) { return message.error("Please set a name for this poll that is one word and contains no spaces."); }
        const type: string = args[1];
        if (["simple", "open"].indexOf(type) < 0) { return message.error('Invalid poll type. Must be "simple".'); }
        const question: string = args.slice(2)
            .join(" ");
        if (!question) { return message.send("You must specify a question to ask."); }
        if (type === "simple") {
            const m: FoxMessage = await message.send("<a:typing:393848431413559296> Creating a simple poll....");
            message.guild.polls.add(name, {
                type,
                question,
                possibleAnswers: ["Yes ✅", "No ❌", "Maybe 🤷"],
                channel: message.channel,
            })
            .then(() => m.delete())
            .catch(error => m.edit(`<:nicexmark:495362785010647041> I could not start this poll.. ${error.message}`));
        }
    }

    public constructor(client: FoxClient) {
        super(client, {
            name: "newpoll",
            description: "Create a new poll.",
            usage: "<name> <type[simple]> <question>",
            requiredPerms: ["polls.pollster"],
        });
    }

}
