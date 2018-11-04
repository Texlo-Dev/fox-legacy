import { Command } from "../../util";
export default class FoxCommand extends Command {

    public constructor(client) {
        super(client, {
            name: "newpoll",
            description: "Create a new poll.",
            usage: "<name> <type[simple]> <question>",
            requiredPerms: ["polls.pollster"]
        });
    }

    public hasPermission(message) {
        return message.guild.perms.check("polls.pollster", message);
    }

    public async run(message, args) {
        const name = args[0];
        if (!name) return message.error("Please set a name for this poll that is one word and contains no spaces.");
        const type = args[1];
        if (["simple", "open"].indexOf(type) < 0) return message.error('Invalid poll type. Must be "simple".');
        const question = args.slice(2).join(" ");
        if (!question) return message.send("You must specify a question to ask.");
        if (type === "simple") {
            const m = await message.send("<a:typing:393848431413559296> Creating a simple poll....");
            message.guild.polls.set(name, {
                type,
                question,
                possibleAnswers: ["Yes ✅", "No ❌", "Maybe 🤷"],
                channel: message.channel
            }).then(m.delete()).catch(error => m.edit(`<:nicexmark:495362785010647041> I could not start this poll.. ${error.message}`));
        }
    }

}
