import fp from "fastify-plugin";
import fastifyEnv from "@fastify/env";
import type { FastifyInstance } from "fastify";
import { FASTIFY_PLUGINS_NAME_KEY } from "../common/const.js";
import { EnvSchema, type Environment } from "../common/schemas/env-schema.js";

declare module "fastify" {
  interface FastifyInstance {
    [FASTIFY_PLUGINS_NAME_KEY.env]: Environment;
  }
}

type Options = {
  customEnvs?: Partial<Environment>;
};

export default fp<Options>(
  async (fastify: FastifyInstance, options) => {
    fastify.register(fastifyEnv, {
      dotenv: true,
      schema: EnvSchema,
      data: Object.assign(process.env, options.customEnvs),
      confKey: FASTIFY_PLUGINS_NAME_KEY.env,
    });
  },
  {
    name: FASTIFY_PLUGINS_NAME_KEY.env,
  },
);
