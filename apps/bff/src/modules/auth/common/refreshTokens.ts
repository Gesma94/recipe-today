import type { FastifyInstance } from "fastify";
import type { UserPayload } from "../../../plugins/jwt.js";
import { getTokens } from "./getTokens.js";

type ReturnType = {
  accessToken: string;
  refreshToken: string;
  userPayload: UserPayload;
};

export function refreshTokens(fastify: FastifyInstance, refreshToken: string): ReturnType {
  try {
    const userPayload = fastify.jwt.verify<UserPayload>(refreshToken);
    const { accessToken: newAccessToken, refreshToken: newRefreshToken } = getTokens(fastify, userPayload);

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      userPayload,
    };
  } catch (error) {
    throw new Error("cannot refresh tokens");
  }
}
