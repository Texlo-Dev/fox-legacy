import { Command } from '../../util';
export default class FoxCommand extends Command {

    constructor(client) {
        super(client, {
            name: 'fortune',
            description: 'Displays a random fortune.'
        });
    }

    async run(message) {
        const snekfetch = require('snekfetch');
        const { body: [obj] } = await snekfetch.get('http://fortunecookieapi.herokuapp.com/v1/cookie');
        message.send({ embed: { description: `🔮: ${obj.fortune.message}\nYour lucky numbers are ${obj.lotto.numbers.join(', ')}`, author: { icon_url: this.client.user.displayAvatarURL(), name: 'Fortune' }, color: this.client.brandColor, timestamp: Date.now(), footer: this.client.user.username } });
    }

}
