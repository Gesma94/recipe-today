import fp from "fastify-plugin";
import type { FastifyInstance } from "fastify";
import { COOKIES_NAME, FASTIFY_PLUGINS_NAME_KEY } from "../common/const.js";
import type { User } from "@recipe-today/prisma";
import { getUserPayload } from "../common/utils/get-user-payload.js";

declare module "fastify" {
  interface FastifyReply {
    getAndSetAuthCookies: (this: FastifyReply, user: User) => void;
    setAuthCookies: (this: FastifyReply, accessToken: string, refreshToken: string) => void;
  }
}

export default fp(async (fastify: FastifyInstance) => {
  fastify.decorateReply(FASTIFY_PLUGINS_NAME_KEY.getAndSetAuthCookies, function (this, user) {
    const { accessToken, refreshToken } = fastify.tokens.generateTokens(getUserPayload(user));
    this.setAuthCookies(accessToken, refreshToken);
  });

  fastify.decorateReply(FASTIFY_PLUGINS_NAME_KEY.setAuthCookies, function (this, accessToken, refreshToken) {
    this.setCookie(COOKIES_NAME.accessToken, accessToken, {
      path: "/",
      signed: true,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    });

    this.setCookie(COOKIES_NAME.refreshToken, refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    });
  });
});
