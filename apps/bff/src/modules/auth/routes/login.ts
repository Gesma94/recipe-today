import { Type, type Static } from "@sinclair/typebox";
import type { FastifyPluginAsync, FastifySchema } from "fastify";
import { ErrorCode } from "../../../common/const.js";
import { getReplySchemaWithError, ResponseErrorSchema } from "../../../common/schemas/response-error-schema.js";
import { UserPayloadSchema } from "../../../common/schemas/user-schema.js";
import { $Enums } from "@recipe-today/prisma";
import { getUserPayload } from "../../../common/utils/get-user-payload.js";

const ReplySchema = getReplySchemaWithError(UserPayloadSchema);

const BodySchema = Type.Object({
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

const loginRoute: FastifyPluginAsync = async fastify => {
  fastify.post<RouteInterface>("/login", { schema }, async (request, reply) => {
    const { email, password } = request.body;

    const user = await fastify.prisma.user.findFirst({
      where: { email, provider: $Enums.UserProvider.EMAIL },
    });

    if (!user || !fastify.bcrypt.compareSync(password, user.password)) {
      return reply.status(400).send({
        error: {
          statusCode: 400,
          name: "InvalidCredentials",
          code: ErrorCode.RT_InvalidCredentials,
          message: "User not found with provided credentials",
        },
      });
    }

    return reply.getAndSetAuthCookies(user).status(200).send(getUserPayload(user));
  });
};

export default loginRoute;
