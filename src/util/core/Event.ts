import { FoxClient } from "..";
import { Options } from "../../types";

export default class Event {
    public name: string;
    public description: string;
    public enabled: boolean;
    public client: FoxClient;
    public run(...args: any) {
        // In other files
    }

    public constructor(client: FoxClient, info: Options) {
        this.name = info.name;
        this.description = info.description;
        this.enabled = info.enabled || true;
        this.client = client;
    }
}
