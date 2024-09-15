import autoLoad from "@fastify/autoload";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import Fastify, { type FastifyInstance, type LogLevel } from "fastify";
import { minimatch } from "minimatch";
import fastifyRoutes from "@fastify/routes";
import envPlugin from "./plugins/env.js";
import type { Environment } from "./common/schemas/env-schema.js";

function getLogLevel(app: FastifyInstance): LogLevel {
  switch (app.env.NODE_ENV) {
    case "test":
      return "warn";
    case "development":
      return "debug";
    default:
      return "info";
  }
}

type BuildOptions = {
  customEnvs?: Partial<Environment>;
};

export async function buildFastify(options?: BuildOptions) {
  const { customEnvs } = options ?? {};
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);

  const fastify = Fastify({
    logger: true,
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

  // registering env plugin first
  await fastify.register(envPlugin, { customEnvs: customEnvs });

  // once we have the environment variables in fastify app, setting the log level
  fastify.log.level = getLogLevel(fastify);

  // registering all plugins in 'plugins' folder, except "env" which is registered before
  await fastify.register(autoLoad, {
    dir: join(__dirname, "plugins"),
    ignorePattern: /env.ts/,
  });

  fastify.get("/ping", (_, reply) => {
    reply.send({ ping: "pong" });
  });

  fastify.get("/env", (_, reply) => {
    reply.send({ env: fastify.env.SERVER_COMMON_ENV });
  });

  return fastify;
}
