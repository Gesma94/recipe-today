import fp from "fastify-plugin";
import type { FastifyInstance } from "fastify";
import OpenAI from "openai";
import { FASTIFY_PLUGINS_NAME_KEY } from "../common/const.js";

declare module "fastify" {
  interface FastifyInstance {
    [FASTIFY_PLUGINS_NAME_KEY.openai]: OpenAI;
  }
}

export default fp(
  async (fastify: FastifyInstance) => {
    const openai = new OpenAI({ apiKey: process.env.OPEN_AI_API_KEY });
    fastify.decorate(FASTIFY_PLUGINS_NAME_KEY.openai, openai);
  },
  {
    name: FASTIFY_PLUGINS_NAME_KEY.openai,
  },
);
