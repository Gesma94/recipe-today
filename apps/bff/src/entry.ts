import fastify from "./app.js";

const port = process.env.PORT ? Number(process.env.PORT) : 7717;

declare module "*.graphql" {
  import { DocumentNode } from "graphql";
  const value: DocumentNode;
  export = value;
}

try {
  fastify.listen({ port, host: "0.0.0.0" }, (err, address) => {
    if (err) {
      throw err;
    } else {
      fastify.log.debug(`Listening at ${address}`);
    }
  });
} catch (error) {
  fastify.log.error(error);
  process.exit(1);
}
