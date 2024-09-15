import fp from "fastify-plugin";
import fastifyJwt from "@fastify/jwt";
import type { FastifyInstance } from "fastify";
import type { UserPayload } from "../common/schemas/user-schema.js";
import { COOKIES_NAME, FASTIFY_PLUGINS_NAME_KEY } from "../common/const.js";

declare module "@fastify/jwt" {
  interface FastifyJWT {
    payload: UserPayload;
  }
}

export default fp(
  async (fastify: FastifyInstance) => {
    fastify.register(fastifyJwt, {
      secret: fastify.env.JWT_SECRET_KEY,
      cookie: {
        signed: true,
        cookieName: COOKIES_NAME.accessToken,
      },
    });
  },
  { dependencies: [FASTIFY_PLUGINS_NAME_KEY.env] },
);
