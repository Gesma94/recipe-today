import type { FastifyPluginAsync, FastifySchema } from "fastify";
import { ErrorCode } from "../../../common/const.js";
import type { Static } from "@sinclair/typebox";
import {
  getReplySchemaWithError,
  hasErrorSchema,
  ResponseErrorSchema,
} from "../../../common/schemas/response-error-schema.js";
import { UserPayloadSchema } from "../../../common/schemas/user-schema.js";

const ReplySchema = getReplySchemaWithError(UserPayloadSchema);

const schema: FastifySchema = {
  response: {
    200: UserPayloadSchema,
    400: ResponseErrorSchema,
  },
};

type RouteInterface = {
  Reply: Static<typeof ReplySchema>;
};

const authenticateRoute: FastifyPluginAsync = async fastify => {
  fastify.get<RouteInterface>("/authenticate", { schema }, async (request, reply) => {
    try {
      await request.jwtVerify({ onlyCookie: true });
      return reply.send({ ...request.user });
    } catch (error) {
      if (hasErrorSchema(error)) {
        if (error.code !== ErrorCode.FST_JwyAuthorizationTokenExpired) {
          return reply.status(401).send({ error });
        }
      } else {
        return reply.status(401).send({
          error: {
            code: ErrorCode.RT_InvalidAccessToken,
            message: "Invalid access token was found in request.cookies",
            name: "InvalidAccessToken",
            statusCode: 401,
          },
        });
      }
    }

    const { refreshToken } = request.cookies;

    if (!refreshToken) {
      return reply.status(401).send({
        error: {
          code: ErrorCode.RT_InvalidRefreshToken,
          message: "Invalid refresh token was found in request.cookies",
          name: "InvalidRefreshToken",
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

      return reply.setAuthCookies(newAccessToken, newRefreshToken).status(200).send(userPayload);
    } catch (error) {
      return reply.status(401).send({
        error: {
          code: ErrorCode.RT_InvalidRefreshToken,
          message: "Invalid refresh token was found in request.cookies",
          name: "InvalidRefreshToken",
          statusCode: 401,
        },
      });
    }
  });
};

export default authenticateRoute;
