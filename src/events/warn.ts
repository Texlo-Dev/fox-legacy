import { Event, FoxClient } from "../util";

export default class extends Event {

    public constructor(client: FoxClient) {
        super(client, {
            name: "warn",
            description: "Fires when an warning is emitted"
        });
    }

    public async run(msg: any) {
        console.info(msg);
    }

}
