import { FoxClient } from "..";
import { Options } from "../../types";

export default class Event {
  public client: FoxClient;
  public description: string;
  public enabled: boolean;
  public name: string;

  public constructor(client: FoxClient, info: Options) {
    this.name = info.name;
    this.description = info.description;
    this.enabled = info.enabled || true;
    this.client = client;
  }
  public run(...args: any) {
    // In other files
  }
}
