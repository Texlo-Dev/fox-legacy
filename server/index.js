import { createServer } from "http";
import { Nuxt, Builder } from "nuxt";
const host = process.env.HOST || "127.0.0.1";
const port = process.env.PORT || 3000;
import config from "../nuxt.config.js";
(async () => {
  config.dev = !(process.env.NODE_ENV === "production");
  const nuxt = new Nuxt(config);
  if (config.dev) {
    const builder = new Builder(nuxt);
    await builder.build();
  }
  const server = createServer(nuxt.render);
  server.listen(port, () => {
    console.log("Server listening on http://" + host + ":" + port);
  });
})();
