import "dotenv/config";
import { buildFastify } from "./app.js";
import { getPrintableRoutes as printRoutes } from "./utils/printRoutes.js";

const app = buildFastify();
const port = process.env.PORT ? Number(process.env.PORT) : 7717;

try {
  app.listen({ port, host: "0.0.0.0" }, (err, address) => {
    if (err) {
      throw err;
    } else {
      app.log.debug(`Listening at ${address}`);
      printRoutes(app);
    }
  });
} catch (error) {
  app.log.error(error);
  process.exit(1);
}
