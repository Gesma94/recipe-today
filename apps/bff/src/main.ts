import "dotenv/config";
import Fastify from "fastify";

const port = process.env.PORT ? Number(process.env.PORT) : 7717;
const fastify = Fastify({
  logger: true,
});

fastify.get("/ping", (_, reply) => {
  reply.send({ ping: "pong" });
});

fastify.get("/env", (_, reply) => {
  reply.send({ env: process.env.SERVER_COMMON_ENV });
});

fastify.listen({ port, host: "0.0.0.0" }, (err, address) => {
  fastify.log.debug(`Listening at ${address}`);
  if (err) throw err;
});
