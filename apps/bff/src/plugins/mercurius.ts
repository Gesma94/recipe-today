import fp from "fastify-plugin";
import type { FastifyInstance } from "fastify";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { mergeResolvers, mergeTypeDefs } from "@graphql-tools/merge";
import path from "path";
import mercurius from "mercurius";
import { loadFilesSync } from "@graphql-tools/load-files";

const resolverArray = loadFilesSync(path.join(__dirname, "./../modules/**/resolvers.ts"));
const typeDefArray = loadFilesSync(path.join(__dirname, "./../modules/**/schema.graphql"));

const schema = makeExecutableSchema({
  typeDefs: mergeTypeDefs(typeDefArray),
  resolvers: mergeResolvers(resolverArray),
});

export default fp(async (fastify: FastifyInstance) => {
  fastify.register(mercurius, {
    schema,
    graphiql: true,
  });
});
