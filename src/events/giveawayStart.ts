// tslint:disable:no-magic-numbers align
import { Event, FoxClient } from "../util";
import FoxGuild from "../util/extensions/FoxGuild";
export default class extends Event {

    public constructor(client: FoxClient) {
        super(client, {
            name: "giveawayStart",
            description: "Starts the giveaway cache.",
        });
    }

    public async run(gw: any): Promise<void> {
        gw = gw instanceof FoxGuild ? gw.giveaways : gw; //tslint:disable-line
        if (!gw.timeout) {
            const timeout: NodeJS.Timeout = this.client.setInterval(() => {
                gw._cache()
                .then(() => gw.begin());
            }, 3000);
            gw.timeout = timeout;
        } else {
            this.client.clearTimeout(gw.timeout);
            const timeout: NodeJS.Timeout = this.client.setInterval(() => {
                gw._cache()
                .then(() => gw.begin());
            }, 7000);
            gw.timeout = timeout;
        }
    }

}
