import autoLoad from "@fastify/autoload";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import Fastify, { type LogLevel } from "fastify";
import { minimatch } from "minimatch";
import fastifyRoutes from "@fastify/routes";

function getLogLevel(): LogLevel {
  switch (process.env.NODE_ENV) {
    case "test":
      return "warn";
    case "development":
      return "debug";
    default:
      return "info";
  }
}

export async function buildFastify() {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);

  const fastify = Fastify({
    logger: {
      level: getLogLevel(),
    },
  });

  await fastify.register(fastifyRoutes);

  // registering all routes in 'routes' folder
  await fastify.register(autoLoad, {
    dir: join(__dirname, "modules"),
    dirNameRoutePrefix: false,
    matchFilter: path => minimatch(path, "**/routes/*.ts"),
    options: {
      prefix: "/api",
    },
  });

  // registering all plugins in 'plugins' folder
  await fastify.register(autoLoad, {
    dir: join(__dirname, "plugins"),
  });

  fastify.get("/ping", (_, reply) => {
    reply.send({ ping: "pong" });
  });

  fastify.get("/env", (_, reply) => {
    reply.send({ env: process.env.SERVER_COMMON_ENV });
  });

  return fastify;
}
