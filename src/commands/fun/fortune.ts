import { Command, FoxClient } from "../../util";
import { FoxMessage } from "../../util/extensions";
export default class FoxCommand extends Command {
  public constructor(client: FoxClient) {
    super(client, {
      name: "fortune",
      description: "Displays a random fortune."
    });
  }

  public async run(message: FoxMessage): Promise<FoxMessage> {
    const [obj]: any = await FoxClient.http("GET", {
      url: "http://fortunecookieapi.herokuapp.com/v1/cookie"
    });

    return message.send({
      embed: {
        description: `🔮: ${
          obj.fortune.message
        }\nYour lucky numbers are ${obj.lotto.numbers.join(", ")}`,
        author: {
          icon_url: this.client.user.displayAvatarURL(),
          name: "Fortune"
        },
        color: this.client.brandColor,
        timestamp: Date.now(),
        footer: this.client.user.username
      }
    });
  }
}
