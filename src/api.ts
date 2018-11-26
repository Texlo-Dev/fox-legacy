import respond from "@polka/send-type";
import { json as _json, urlencoded } from "body-parser";
import cors from "cors";
import { ClientRequest, ServerResponse } from "http";
import polka from "polka";
import { FoxClient } from "./util/";
const app: any = polka();

export default (client: FoxClient) => {
  app.use(cors());
  app.use(_json());
  app.use(urlencoded());

  app.use((req: ClientRequest, res: ServerResponse, next: any) => {
    (req as any).client = client;
    (res as any).json = (code: String, json: any) => {
      respond(res, code, json);
    };
    next();
  });

  app.use("/api", require("./api/").default); // tslint:disable-line
  app.listen(17428, () => {
    // tslint:disable-line
    console.log("> Mr.Fox API running at *:17428");
  });
};
