import { Event } from "../util";

export default class extends Event {

    public constructor(client) {
        super(client, {
            name: "warn",
            description: "Fires when an warning is emitted"
        });
    }

    public async run(msg) {
        console.info(msg);
    }

}
