import fp from "fastify-plugin";
import type { FastifyInstance } from "fastify";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { mergeResolvers, mergeTypeDefs } from "@graphql-tools/merge";
import path from "path";
import { fileURLToPath } from "url";
import mercurius from "mercurius";
import { loadFilesSync } from "@graphql-tools/load-files";
import userResolver from "./../modules/auth/resolvers/resolvers.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// cannot be used with vitest
// const resolverArray = loadFilesSync(path.join(__dirname, "./../modules/**/resolvers.ts"));
const typeDefArray = loadFilesSync(path.join(__dirname, "./../modules/**/schema.graphql"));

const schema = makeExecutableSchema({
  typeDefs: mergeTypeDefs(typeDefArray),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  resolvers: mergeResolvers([userResolver] as any),
  // 'as any' is a workaround because of missmatch in types IResolvers of graphql-tools and mercurius
});

export default fp(async (fastify: FastifyInstance) => {
  fastify.register(mercurius, {
    schema,
    graphiql: true,
  });
});
