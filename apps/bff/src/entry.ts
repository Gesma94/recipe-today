import { buildFastify } from "./app.js";
import { getPrintableRoutes } from "./utils/printRoutes.js";

const app = await buildFastify();
const port = app.env.PORT ? Number(app.env.PORT) : 7717;

try {
  app.listen({ port, host: "0.0.0.0" }, (err, address) => {
    if (err) {
      throw err;
    } else {
      app.log.debug(`Listening at ${address}`);
      getPrintableRoutes(app);
    }
  });
} catch (error) {
  app.log.error(error);
  process.exit(1);
}
