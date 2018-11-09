import { Command } from "../../util";
export default class FoxCommand extends Command {

    public constructor(client) {
        super(client, {
            name: "roll",
            description: "Rolls a die.",
        });
    }

    public run(message) {
        message.send(`:game_die: ${message.member.displayName} rolled a ${Math.floor(Math.random() * 6) + 1}.`);
    }

}
