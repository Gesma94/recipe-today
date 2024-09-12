import type { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  schema: ["./src/**/*.graphql"],
  config: {
    useTypeImports: true,
    scalars: {
      DateTime: "Date",
    },
  },
  generates: {
    "./src/@types/graphql-generated.ts": {
      plugins: ["typescript", "typescript-resolvers"],
    },
  },
};

export default config;
