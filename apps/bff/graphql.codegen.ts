import { codegenMercurius } from "mercurius-codegen";
import fastify from "./src/app";

codegenMercurius(fastify, {
  targetPath: "src/@types/mercurius-generated.ts",
  codegenConfig: {
    useTypeImports: true,
    noSchemaStitching: true,
    scalars: {
      DateTime: "Date",
    },
  },
});
