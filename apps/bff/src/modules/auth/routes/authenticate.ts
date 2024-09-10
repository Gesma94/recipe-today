import type { FastifyPluginAsync, FastifySchema } from "fastify";
import { COOKIES_NAME, ErrorCode } from "../../../common/const.js";
import { Type, type Static } from "@sinclair/typebox";
import { ErrorSchema, getReplySchemaWithError, hasErrorSchema } from "../../../common/schemas/response-error-schema.js";

const UserSchema = Type.Object({
  id: Type.Number(),
  email: Type.String(),
  displayName: Type.String(),
  provider: Type.Union([Type.Literal("native"), Type.Literal("google")]),
});

const ReplySchema = getReplySchemaWithError(UserSchema);

const schema: FastifySchema = {
  response: {
    200: UserSchema,
    401: ErrorSchema,
  },
};

const loginRoute: FastifyPluginAsync = async fastify => {
  fastify.get<{ Reply: Static<typeof ReplySchema> }>("/authenticate", { schema }, async (request, reply) => {
    try {
      await request.jwtVerify({ onlyCookie: true });

      return reply.send({
        displayName: request.user.displayName,
        email: request.user.email,
        id: request.user.id,
        provider: request.user.provider,
      });
    } catch (error) {
      if (hasErrorSchema(error)) {
        if (error.code !== ErrorCode.FST_JWT_AUTHORIZATION_TOKEN_EXPIRED) {
          return reply.status(401).send({ error });
        }
      } else {
        return reply.status(401).send({
          error: {
            code: ErrorCode.RT_INVALID_ACCESS_TOKEN,
            message: "Invalid access token was found in request.cookies",
            name: "RecipeTodayError",
            statusCode: 401,
          },
        });
      }
    }

    const { refreshToken } = request.cookies;

    if (!refreshToken) {
      return reply.status(401).send({
        error: {
          code: ErrorCode.RT_INVALID_ACCESS_TOKEN,
          message: "Invalid refresh token was found in request.cookies",
          name: "RecipeTodayError",
          statusCode: 401,
        },
      });
    }

    try {
      const {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        userPayload,
      } = fastify.tokens.refreshTokens(refreshToken);

      return reply
        .setCookie(COOKIES_NAME.accessToken, newAccessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
        })
        .setCookie(COOKIES_NAME.refreshToken, newRefreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
        })
        .send({
          provider: userPayload.provider,
          email: userPayload.email,
          displayName: userPayload.displayName,
          id: userPayload.id,
        });
    } catch (error) {
      return reply.status(401).send({
        error: {
          code: ErrorCode.RT_INVALID_REFRESH_TOKEN,
          message: "Invalid refresh token was found in request.cookies",
          name: "RecipeTodayError",
          statusCode: 401,
        },
      });
    }
  });
};

export default loginRoute;
