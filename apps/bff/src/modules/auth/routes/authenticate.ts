import type { FastifyPluginAsync } from "fastify";
import { COOKIES_NAME } from "../../../common/const.js";
import { Type, type Static } from "@sinclair/typebox";
import { refreshTokens } from "../common/refreshTokens.js";

const schema = Type.Object({
  Reply: Type.Object({
    email: Type.Optional(Type.String()),
    displayName: Type.Optional(Type.String()),
    error: Type.Optional(Type.String()),
  }),
});

type SchemaType = Static<typeof schema>;

const loginRoute: FastifyPluginAsync = async fastify => {
  fastify.get<SchemaType>("/authenticate", { schema }, async (request, reply) => {
    // checks if user is already authenticated via JWT and retrieve its email and displayName
    try {
      request.jwtVerify();
      const { email, displayName } = request.user;

      reply.send({ displayName, email });
      return;
    } catch (error) {
      fastify.log.info("JWT access token is not verified, attempts with the refresh token");
    }
    // if JWT access token is not verified, attempts with the refresh token
    const { refreshToken } = request.cookies;

    if (!refreshToken) {
      reply.status(401).send({ error: "refresh token not available" });
      return;
    }

    try {
      const {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        userPayload,
      } = refreshTokens(fastify, refreshToken);

      reply
        .setCookie(COOKIES_NAME.accessToken, newAccessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
        })
        .setCookie(COOKIES_NAME.refreshToken, newRefreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
        })
        .send({ email: userPayload.email, displayName: userPayload.displayName });
    } catch (error) {
      reply.status(401).send({ error: "cannot authenticate with refresh token" });
      return;
    }
  });
};

export default loginRoute;
