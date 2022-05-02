import Ngulf from "ngulf";
import config from "./config";
import hooks from "./hooks";
import plugin from "./plugin";

(async function () {
  const app = Ngulf.create(config);
  await plugin(app.server);
  await hooks(app.server);
  app.listen(config.port).then(() => {
    console.log(`Listen on ${config.port}`.bgWhite);
  });
})();
