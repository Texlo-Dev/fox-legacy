import cors from "cors";
import polka from "polka";
import { json as _json, urlencoded } from "body-parser";
import { FoxClient } from "./util/";
import respond from "@polka/send-type";
import { ServerResponse, ClientRequest } from "http";
const app = polka();

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

    app.use("/api", require("./api/").default);
    app.listen(17428, () => {
        console.log(`> Mr.Fox API running at *:17428`);
    });
};
