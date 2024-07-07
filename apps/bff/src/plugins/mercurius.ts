import fp from "fastify-plugin";
import type { FastifyInstance } from "fastify";
import mercurius from "mercurius";
import { GraphQLFileLoader } from "@graphql-tools/graphql-file-loader";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { mergeResolvers, mergeTypeDefs } from "@graphql-tools/merge";
import authResolver from "./../modules/auth/resolvers/resolvers.js";
import { loadSchemaSync } from "@graphql-tools/load";
import { join } from "node:path";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function loadSchemaSyncFromGraphQLFile(filePath: string) {
  return loadSchemaSync(filePath, {
    loaders: [new GraphQLFileLoader()],
  });
}

const resolverArray = [authResolver];
const typeDefArray = [loadSchemaSyncFromGraphQLFile(join(__dirname, "./../modules/auth/schema/schema.graphql"))];

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
