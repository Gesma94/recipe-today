import { Type, type Static } from "@sinclair/typebox";
import type { FastifyPluginAsync } from "fastify";
import { COOKIES_NAME } from "../../../common/const.js";

const schema = Type.Object({
  Body: Type.Object({
    email: Type.String({ format: "email" }),
    password: Type.String(),
  }),
  Reply: Type.Object({
    error: Type.Optional(Type.String()),
  }),
});

type SchemaType = Static<typeof schema>;

const loginRoute: FastifyPluginAsync = async fastify => {
  fastify.post<SchemaType>("/login", { schema }, async (request, reply) => {
    const { email, password } = request.body;
    const user = await fastify.prisma.user.findFirst({
      where: { email, password: fastify.passwordHasher.hashPassword(password) },
    });

    if (!user) {
      reply.code(400).send({ error: "Invalid" });
      return;
    }

    const { accessToken, refreshToken } = fastify.tokens.generateTokens({
      displayName: user.displayName,
      email: user.email,
      id: user.id,
    });

    reply
      .setCookie(COOKIES_NAME.accessToken, accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
      })
      .setCookie(COOKIES_NAME.refreshToken, refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
      })
      .send({ email: user.email, displayName: user.displayName });
  });
};

export default loginRoute;
