import autoLoad from "@fastify/autoload";
import { join } from "path";
import Fastify from "fastify";
import { minimatch } from "minimatch";
import fastifyRoutes from "@fastify/routes";

export function buildFastify() {
  const fastify = Fastify({
    logger: {
      level: process.env.NODE_ENV === "development" ? "debug" : "info",
    },
  });

  fastify.register(fastifyRoutes);

  // registering all routes in 'routes' folder
  fastify.register(autoLoad, {
    dir: join(__dirname, "modules"),
    dirNameRoutePrefix: false,
    matchFilter: path => minimatch(path, "**/routes/*.ts"),
    options: {
      prefix: "/api",
    },
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

  return fastify;
}
