import fp from "fastify-plugin";
import type { FastifyInstance } from "fastify";
import { FASTIFY_PLUGINS_NAME_KEY } from "../common/const.js";
import bcrypt from "bcrypt";

declare module "fastify" {
  interface FastifyInstance {
    [FASTIFY_PLUGINS_NAME_KEY.passwordHasher]: typeof passwordHasher;
  }
}

const passwordHasher = {
  hashPassword: (password: string | null | undefined): string | undefined => {
    if (!password) {
      return undefined;
    }

    return bcrypt.hashSync(password, 2);
  },
};

export default fp(
  async (fastify: FastifyInstance) => {
    fastify.decorate(FASTIFY_PLUGINS_NAME_KEY.passwordHasher, passwordHasher);
  },
  {
    name: FASTIFY_PLUGINS_NAME_KEY.passwordHasher,
  },
);
