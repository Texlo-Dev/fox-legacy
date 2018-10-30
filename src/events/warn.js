import { Event } from '../util';

export default class extends Event {

    constructor(client) {
        super(client, {
            name: 'warn',
            description: 'Fires when an warning is emitted'
        });
    }

    async run(msg) {
        console.info(msg);
    }


}
