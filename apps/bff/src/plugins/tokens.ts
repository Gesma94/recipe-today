import fp from "fastify-plugin";
import type { FastifyInstance } from "fastify";
import { FASTIFY_PLUGINS_NAME_KEY } from "../common/const.js";
import type { UserPayload } from "../common/types.js";

type TokensDecorator = {
  generateAccessToken: (userPayload: UserPayload) => string;
  generateRefreshToken: (userPayload: UserPayload) => string;
  generateToken: (userPayload: UserPayload, expiresIn: string) => string;
  generateTokens: (userPayload: UserPayload) => { accessToken: string; refreshToken: string };
  refreshTokens: (refreshToken: string) => { accessToken: string; refreshToken: string; userPayload: UserPayload };
};

declare module "fastify" {
  interface FastifyInstance {
    [FASTIFY_PLUGINS_NAME_KEY.tokens]: TokensDecorator;
  }
}

export default fp(
  async (fastify: FastifyInstance) => {
    const tokens: TokensDecorator = {
      generateToken: (userPayload: UserPayload, expiresIn: string) => {
        return fastify.jwt.sign(userPayload, { expiresIn });
      },
      generateAccessToken: (userPayload: UserPayload) => {
        return tokens.generateToken(userPayload, "15m");
      },
      generateRefreshToken: (userPayload: UserPayload) => {
        return tokens.generateToken(userPayload, "7d");
      },
      generateTokens: (userPayload: UserPayload) => {
        return {
          accessToken: tokens.generateAccessToken(userPayload),
          refreshToken: tokens.generateRefreshToken(userPayload),
        };
      },
      refreshTokens: (refreshToken: string) => {
        const userPayload = fastify.jwt.verify<UserPayload>(refreshToken);

        return {
          userPayload: userPayload,
          accessToken: tokens.generateAccessToken(userPayload),
          refreshToken: tokens.generateRefreshToken(userPayload),
        };
      },
    };

    fastify.decorate(FASTIFY_PLUGINS_NAME_KEY.tokens, tokens);
  },
  {
    name: FASTIFY_PLUGINS_NAME_KEY.tokens,
    dependencies: [FASTIFY_PLUGINS_NAME_KEY.cookie],
  },
);
