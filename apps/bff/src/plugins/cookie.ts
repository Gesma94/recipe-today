import fp from "fastify-plugin";
import fastifyCookie from "@fastify/cookie";
import type { FastifyInstance } from "fastify";
import { FASTIFY_PLUGINS_NAME_KEY } from "../common/const.js";

export default fp(
  async (fastify: FastifyInstance) => {
    fastify.register(fastifyCookie, {
      secret: process.env.COOKIE_SECRET_KEY,
    });
  },
  {
    name: FASTIFY_PLUGINS_NAME_KEY.cookie,
  },
);
