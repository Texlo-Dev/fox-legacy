import { inspect } from "util";
import { Command } from "../../util";
export default class FoxCommand extends Command {

    public constructor(client) {
        super(client, {
            name: "eval",
            description: "Evaluates Javascript Code, reserved for bot owner, aka me.",
            aliases: ["ev", "javascript", "js"],
            usage: "<code>",
            requiredPerms: ["Bot Owner"]
        });

        this.depth = 0;
    }

    public hasPermission(message) {
        return message.client.isOwner(message.author.id);
    }

    public async run(message, args) {
        const client = message.client; // eslint-disable-line
        const guild = message.guild; // eslint-disable-line

        const code = args.join(" ");
        try {
            const evaled = eval(code);
            let ogeval = evaled;
            if (ogeval instanceof Promise) ogeval = await evaled;
            if (typeof evaled !== "string") ogeval = inspect(ogeval, { depth: this.depth, showHidden: true });
            const cleanEval = client.clean(ogeval);

            if (ogeval.length > 1950) {
                const haste = await client.haste(cleanEval, "js").catch(() => "");
                message.send(`\`Output:\` **Evaled code was very very long,** ${haste}`, { translate: false });
            }

            message.send(`**Typeof:** \`${this.getComplexType(evaled).type}\`

\`Output:\`
\`\`\`js\n${cleanEval} \`\`\`
            `, { translate: false });
        } catch (err) {
            message.send(`
\`Error:\`

\`\`\`js\n${err.stack ? err.stack : err}\`\`\` `);
        }
    }

    public getType(value) {
        if (value === null) return String(value);
        return typeof value;
    }

    public getComplexType(value) {
        const basicType = this.getType(value);
        if (basicType === "object" || basicType === "function") return { basicType, type: this.getClass(value) };
        return { basicType, type: basicType };
    }

    public getClass(value) {
        return value && value.constructor && value.constructor.name ?
            value.constructor.name :
            {}.toString.call(value).match(/\[object (\w+)\]/)[1];
    }

}
