import { Event, FoxClient } from "../util";

export default class extends Event {

    public constructor(client: FoxClient) {
        super(client, {
            name: "warn",
            description: "Fires when an warning is emitted",
        });
    }

    public run(msg: any): Event {
        console.info(msg);

        return this;
    }

}
