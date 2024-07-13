import fastify from "./app.js";
import { getPrintableRoutes as printRoutes } from "./utils/printRoutes.js";

const port = process.env.PORT ? Number(process.env.PORT) : 7717;

try {
  fastify.listen({ port, host: "0.0.0.0" }, (err, address) => {
    if (err) {
      throw err;
    } else {
      fastify.log.debug(`Listening at ${address}`);
      printRoutes(fastify);
    }
  });
} catch (error) {
  fastify.log.error(error);
  process.exit(1);
}
