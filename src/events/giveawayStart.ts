import { Event } from "../util";
import FoxGuild from "../util/extensions/FoxGuild";
export default class extends Event {

    public constructor(client) {
        super(client, {
            name: "giveawayStart",
            description: "Starts the giveaway cache."
        });
    }
    public async run(gw) {
        gw = gw instanceof FoxGuild ? gw.giveaways : gw;
        if (!gw.timeout) {
            const timeout = this.client.setInterval(() => {
                gw._cache().then(gw.begin());
            }, 3000);
            gw.timeout = timeout;
        } else {
            this.client.clearTimeout(gw.timeout);
            const timeout = this.client.setInterval(() => {
                gw._cache().then(gw.begin());
            }, 7000);
            gw.timeout = timeout;
        }
    }

}
