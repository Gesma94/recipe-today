import fp from "fastify-plugin";
import type { FastifyInstance } from "fastify";
import { FASTIFY_PLUGINS_NAME_KEY } from "../common/const.js";
import bcrypt from "bcrypt";

declare module "fastify" {
  interface FastifyInstance {
    [FASTIFY_PLUGINS_NAME_KEY.bcrypt]: typeof passwordHasher;
  }
}

const passwordHasher = {
  hashSync: (data: string | null | undefined): string | undefined => {
    if (!data) {
      return undefined;
    }

    return bcrypt.hashSync(data, 2);
  },
  compareSync: (plainText: string | null | undefined, hash: string | null | undefined): boolean => {
    if (!plainText || !hash) {
      return false;
    }

    return bcrypt.compareSync(plainText, hash);
  },
};

export default fp(
  async (fastify: FastifyInstance) => {
    fastify.decorate(FASTIFY_PLUGINS_NAME_KEY.bcrypt, passwordHasher);
  },
  {
    name: FASTIFY_PLUGINS_NAME_KEY.bcrypt,
  },
);
