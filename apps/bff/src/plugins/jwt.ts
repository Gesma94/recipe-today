import fp from "fastify-plugin";
import fastifyJwt from "@fastify/jwt";
import type { FastifyInstance } from "fastify";
import { COOKIES_NAME } from "../common/const.js";
import type { UserPayload } from "../common/types.js";

declare module "@fastify/jwt" {
  interface FastifyJWT {
    payload: UserPayload;
  }
}

export default fp(async (fastify: FastifyInstance) => {
  fastify.register(fastifyJwt, {
    secret: process.env.JWT_SECRET_KEY,
    cookie: {
      signed: true,
      cookieName: COOKIES_NAME.accessToken,
    },
  });
});
