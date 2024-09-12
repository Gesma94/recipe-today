import { Type, type Static } from "@sinclair/typebox";
import type { FastifyPluginAsync, FastifySchema } from "fastify";
import { ErrorCode } from "../../../common/const.js";
import { getReplySchemaWithError, ResponseErrorSchema } from "../../../common/schemas/response-error-schema.js";
import { UserPayloadSchema } from "../../../common/schemas/user-schema.js";
import { $Enums } from "@recipe-today/prisma";
import { getUserPayload } from "../../../common/utils/get-user-payload.js";

const ReplySchema = getReplySchemaWithError(UserPayloadSchema);

const BodySchema = Type.Object({
  idToken: Type.String(),
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

const loginGoogleRoute: FastifyPluginAsync = async fastify => {
  fastify.post<RouteInterface>("/login/google", { schema }, async (request, reply) => {
    const decodedToken = await fastify.firebase.auth.verifyIdToken(request.body.idToken);

    if (!decodedToken.email) {
      return reply.code(400).send({
        error: {
          code: ErrorCode.RT_InvalidGoogleIdToken,
          message: "Invalid google ID token",
          name: "InvalidGoogleIdToken",
          statusCode: 401,
        },
      });
    }

    let user = await fastify.prisma.user.findUnique({
      where: { email: decodedToken.email, firebase_uid: decodedToken.uid, provider: $Enums.UserProvider.GOOGLE },
    });

    if (!user) {
      try {
        user = await fastify.prisma.user.create({
          data: {
            email: decodedToken.email,
            firebase_uid: decodedToken.uid,
            displayName: decodedToken.name,
            provider: $Enums.UserProvider.GOOGLE,
          },
        });
      } catch (error) {
        return reply.status(400).send({
          error: {
            statusCode: 400,
            name: "UserRegistrationFailed",
            code: ErrorCode.RT_UserRegistrationFailed,
            message: "Could not register the new user",
          },
        });
      }
    }

    reply.getAndSetAuthCookies(user).status(200).send(getUserPayload(user));
  });
};

export default loginGoogleRoute;
