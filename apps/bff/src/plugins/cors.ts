import fp from "fastify-plugin";
import cors from "@fastify/cors";
import type { FastifyInstance } from "fastify";
import { FASTIFY_PLUGINS_NAME_KEY } from "../common/const.js";

export default fp(
  async (fastify: FastifyInstance) => {
    fastify.register(cors, {
      origin: fastify.env.CORS_ORIGIN,
      credentials: true,
    });
  },
  {
    dependencies: [FASTIFY_PLUGINS_NAME_KEY.env],
  },
);
