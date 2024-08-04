import type { FastifyInstance } from "fastify";
import type { UserPayload } from "../../../plugins/jwt.js";

type ReturnType = {
  accessToken: string;
  refreshToken: string;
};

export function getTokens(fastify: FastifyInstance, userPaylod: UserPayload): ReturnType {
  const refreshToken = fastify.jwt.sign(
    { email: userPaylod.email, displayName: userPaylod.displayName, id: userPaylod.id },
    { expiresIn: "7d" },
  );
  const accessToken = fastify.jwt.sign(
    { email: userPaylod.email, displayName: userPaylod.displayName, id: userPaylod.id },
    { expiresIn: "15min" },
  );

  return {
    accessToken,
    refreshToken,
  };
}
