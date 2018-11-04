import { Command } from '../../util';
export default class FoxCommand extends Command {

    constructor(client) {
        super(client, {
            name: 'roll',
            description: 'Rolls a die.'
        });
    }

    run(message) {
        message.send(`:game_die: ${message.member.displayName} rolled a ${Math.floor(Math.random() * 6) + 1}.`);
    }

}
