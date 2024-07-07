import "dotenv/config";
import autoLoad from "@fastify/autoload";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import Fastify from "fastify";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const fastify = Fastify({
  logger: true,
});

// registering all plugins in 'plugins' folder
fastify.register(autoLoad, {
  dir: join(__dirname, "plugins"),
});

fastify.get("/ping", (_, reply) => {
  reply.send({ ping: "pong" });
});

fastify.get("/env", (_, reply) => {
  reply.send({ env: process.env.SERVER_COMMON_ENV });
});

export default fastify;
