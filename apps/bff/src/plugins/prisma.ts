import fp from "fastify-plugin";
import type { FastifyInstance } from "fastify";
import { FASTIFY_PLUGINS_NAME_KEY } from "../common/const.js";
import { PrismaClient } from "@recipe-today/prisma";

declare module "fastify" {
  interface FastifyInstance {
    [FASTIFY_PLUGINS_NAME_KEY.prisma]: PrismaClient;
  }
}

export default fp(
  async (fastify: FastifyInstance) => {
    const prismaClient = new PrismaClient();

    await prismaClient.$connect();

    fastify.decorate(FASTIFY_PLUGINS_NAME_KEY.prisma, prismaClient);

    fastify.addHook("onClose", async innerFastify => {
      innerFastify.log.info("disconnecting Prisma from DB");
      await prismaClient.$disconnect();
    });
  },
  {
    name: FASTIFY_PLUGINS_NAME_KEY.prisma,
  },
);
