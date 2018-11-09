import { FoxClient } from "..";
import { Options } from "../../types";
interface PermOptions extends Options {
    category: string;
}

export default class FoxPermission {
    public category: string;
    public description: string;
    public name: string;

    public constructor(client: FoxClient, data: PermOptions) {
        this.name = data.name;
        this.description = data.description;
        this.category = data.category;
    }

}
