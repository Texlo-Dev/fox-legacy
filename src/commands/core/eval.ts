import { inspect } from "util";
import { Command, FoxClient } from "../../util";
import { FoxMessage, FoxGuild } from "../../util/extensions"; //tslint:disable-line
export default class FoxCommand extends Command {
  public static getClass(value: object): string {
    return value && value.constructor && value.constructor.name
      ? value.constructor.name
      : {}.toString.call(value).match(/\[object (\w+)\]/)[1];
  }

  public static getComplexType(value: object): any {
    const basicType: string = FoxCommand.getType(value);
    if (basicType === "object" || basicType === "function") {
      return { basicType, type: FoxCommand.getClass(value) };
    }

    return { basicType, type: basicType };
  }

  public static getType(value: any): string {
    //tslint:disable-line
    if (value === null) {
      return String(value);
    }

    return typeof value;
  }

  public static hasPermission(message: FoxMessage): boolean {
    return FoxClient.isOwner(message.author.id);
  }

  public depth: number;
  public constructor(client: FoxClient) {
    super(client, {
      aliases: ["ev", "javascript", "js"],
      description: "Evaluates Javascript Code, reserved for bot owner, aka me.",
      name: "eval",
      requiredPerms: ["Bot Owner"],
      usage: "<code>"
    });
    this.depth = 0;
  }

  public async run(message: FoxMessage, args: string[]): Promise<void> {
    const client: FoxClient = message.client;
    const guild: FoxGuild = message.guild;
    const code: string = args.join(" ");
    try {
      const evaled: any = eval(code); //tslint:disable-line
      let ogeval: any = evaled; //tslint:disable-line
      if (ogeval instanceof Promise) {
        ogeval = await evaled;
      }
      if (typeof evaled !== "string") {
        ogeval = inspect(ogeval, { depth: this.depth, showHidden: true });
      }
      const cleanEval: string = client.clean(ogeval);
      const maxlength = 1950; //tslint:disable-line

      if (ogeval.length > maxlength) {
        const haste: string = await FoxClient.haste(cleanEval, "js").catch(
          () => ""
        );
        message.send(
          `\`Output:\` **Evaled code was very very long,** ${haste}`,
          { translate: false }
        );
      }
      message.send(
        `**Typeof:** \`${FoxCommand.getComplexType(evaled).type}\`

\`Output:\`
                    \`\`\`js\n${cleanEval} \`\`\`
            `,
        { translate: false }
      );
    } catch (err) {
      message.send(`
                \`Error:\`
                    \`\`\`js\n${err.stack ? err.stack : err}\`\`\` `);
    }
  }
}
