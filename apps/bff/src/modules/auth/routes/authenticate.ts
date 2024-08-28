import type { FastifyPluginAsync } from "fastify";
import { COOKIES_NAME } from "../../../common/const.js";
import { Type, type Static, type TObject, type TProperties } from "@sinclair/typebox";
import { Value } from "@sinclair/typebox/value";

const ErrorSchema = Type.Object({
  code: Type.String(),
  message: Type.String(),
  name: Type.String(),
  statusCode: Type.Number(),
});

function getSchemaWithError<T extends TProperties>(schemaObject: TObject<T>) {
  return Type.Union([schemaObject, ErrorSchema]);
}

const schema = Type.Object({
  Reply: Type.Object({
    email: Type.Optional(Type.String()),
    id: Type.Optional(Type.Number()),
    displayName: Type.Optional(Type.String()),
    error: Type.Optional(ErrorSchema),
  }),
});

type SchemaType = Static<typeof schema>;

const loginRoute: FastifyPluginAsync = async fastify => {
  fastify.get<SchemaType>("/authenticate", { schema: getSchemaWithError(schema) }, async (request, reply) => {
    // checks if user is already authenticated via JWT and retrieve its email and displayName
    try {
      await request.jwtVerify({ onlyCookie: true });
      const { email, displayName, id } = request.user;

      reply.send({ displayName, email, id });
      return;
    } catch (error) {
      if (Value.Check(ErrorSchema, error)) {
        if (error.code === "FST_JWT_AUTHORIZATION_TOKEN_EXPIRED") {
          fastify.log.info("JWT access token is not verified, attempts with the refresh token");
        } else {
          reply.status(401).send({ error });
          return;
        }
      } else {
        reply.status(401).send({
          error: {
            code: "RT_INVALID_ACCESS_TOKEN",
            message: "Invalid access token was found in request.cookies",
            name: "RecipeTodayError",
            statusCode: 401,
          },
        });
        return;
      }
    }

    // if JWT access token is not verified, attempts with the refresh token
    const { refreshToken } = request.cookies;

    if (!refreshToken) {
      reply.status(401).send({
        error: {
          code: "RT_INVALID_REFRESH_TOKEN",
          message: "Invalid refresh token was found in request.cookies",
          name: "RecipeTodayError",
          statusCode: 401,
        },
      });
      return;
    }

    try {
      const {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        userPayload,
      } = fastify.tokens.refreshTokens(refreshToken);

      reply
        .setCookie(COOKIES_NAME.accessToken, newAccessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
        })
        .setCookie(COOKIES_NAME.refreshToken, newRefreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
        })
        .send({ email: userPayload.email, displayName: userPayload.displayName, id: userPayload.id });
    } catch (error) {
      reply.status(401).send({
        error: {
          code: "RT_INVALID_REFRESH_TOKEN",
          message: "Invalid refresh token was found in request.cookies",
          name: "RecipeTodayError",
          statusCode: 401,
        },
      });
      return;
    }
  });
};

export default loginRoute;
