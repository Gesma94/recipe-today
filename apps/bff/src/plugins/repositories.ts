import fp from "fastify-plugin";
import type { FastifyInstance } from "fastify";
import { FASTIFY_PLUGINS_NAME_KEY } from "../common/const.js";
import { authRepositoryFactory, type IAuthRepository } from "../modules/auth/repositories/repository.js";

type RepositoryDecorator = {
  authRepository: IAuthRepository;
};

declare module "fastify" {
  interface FastifyInstance {
    [FASTIFY_PLUGINS_NAME_KEY.repositories]: RepositoryDecorator;
  }
}

export default fp(
  async (fastify: FastifyInstance) => {
    const repositoryDecorator: RepositoryDecorator = {
      authRepository: authRepositoryFactory(fastify.prisma),
    };

    fastify.decorate(FASTIFY_PLUGINS_NAME_KEY.repositories, repositoryDecorator);
  },
  {
    name: FASTIFY_PLUGINS_NAME_KEY.repositories,
    dependencies: [FASTIFY_PLUGINS_NAME_KEY.prisma],
  },
);
