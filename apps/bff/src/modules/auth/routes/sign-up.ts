import { Type, type Static } from "@sinclair/typebox";
import type { FastifyPluginAsync, FastifySchema } from "fastify";
import { COOKIES_NAME, ErrorCode, UserProvider } from "../../../common/const.js";
import { UserPayloadSchema } from "../../../common/schemas/user-schema.js";
import {
  getReplySchemaWithError,
  hasErrorSchema,
  ResponseErrorSchema,
} from "../../../common/schemas/response-error-schema.js";

const ReplySchema = getReplySchemaWithError(UserPayloadSchema);

const BodySchema = Type.Object({
  displayName: Type.String(),
  email: Type.String({ format: "email" }),
  password: Type.String({ minLength: 6 }),
});

const schema: FastifySchema = {
  body: BodySchema,
  response: {
    200: UserPayloadSchema,
    400: ResponseErrorSchema,
  },
};

type RouteInterface = {
  Body: Static<typeof BodySchema>;
  Reply: Static<typeof ReplySchema>;
};

const signUpRoute: FastifyPluginAsync = async fastify => {
  fastify.post<RouteInterface>("/sign-up", { schema }, async (request, reply) => {
    const { email, password, displayName } = request.body;

    const alreadyExistingUser = await fastify.prisma.user.findFirst({
      where: {
        OR: [{ email }, { displayName }],
      },
    });

    if (alreadyExistingUser?.email === email) {
      return reply.status(400).send({
        error: {
          statusCode: 400,
          name: "EmailAlreadyUsed",
          message: "Email is already used",
          code: ErrorCode.RT_EmailAlreadyUsed,
        },
      });
    }

    if (alreadyExistingUser?.displayName === displayName) {
      return reply.status(400).send({
        error: {
          statusCode: 400,
          name: "DisplayNameAlreadyUsed",
          code: ErrorCode.RT_DisplayNameAlreadyUsed,
          message: "Display name is already used",
        },
      });
    }

    try {
      const newUser = await fastify.prisma.user.create({
        data: {
          email,
          displayName,
          password: fastify.passwordHasher.hashPassword(password),
        },
      });

      const { accessToken, refreshToken } = fastify.tokens.generateTokens({
        id: newUser.id,
        provider: "native",
        email: newUser.email,
        displayName: newUser.displayName,
      });

      reply
        .setCookie(COOKIES_NAME.accessToken, accessToken, {
          httpOnly: true,
          path: "/",
          signed: true,
          secure: process.env.NODE_ENV === "production",
        })
        .setCookie(COOKIES_NAME.refreshToken, refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
        });

      return reply.status(200).send({
        id: newUser.id,
        email: newUser.email,
        provider: UserProvider.Native,
        displayName: newUser.displayName,
      });
    } catch (error) {
      if (hasErrorSchema(error)) {
        return reply.status(400).send({ error });
      }

      return reply.status(400).send({
        error: {
          statusCode: 400,
          name: "UserRegistrationFailed",
          code: ErrorCode.RT_UserRegistrationFailed,
          message: "Could not register the new user",
        },
      });
    }
  });
};

export default signUpRoute;