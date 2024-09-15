import type { FastifyInstance } from "fastify";
import { beforeEach, afterEach } from "vitest";
import { PostgreSqlContainer, StartedPostgreSqlContainer } from "@testcontainers/postgresql";
import { buildFastify } from "../src/app.js";
import { execSync } from "node:child_process";

export type TestDbEnvironmentContext = {
  app: FastifyInstance;
  dbContainer: StartedPostgreSqlContainer;
};

export function setupTestDbEnvironment() {
  beforeEach<TestDbEnvironmentContext>(async context => {
    try {
      context.dbContainer = await new PostgreSqlContainer().start();

      const dbConnectionUri = context.dbContainer.getConnectionUri();

      execSync(`pnpm --filter prisma db:push`, { env: { DATABASE_URL: dbConnectionUri } });

      context.app = await buildFastify({ customEnvs: { DATABASE_URL: dbConnectionUri } });

      await context.app.listen({ port: 0, host: "0.0.0.0" });
      await context.app.ready();
    } catch (error) {
      console.error("Error while executing setup for test with DB environment");
      throw error;
    }
  });

  afterEach<TestDbEnvironmentContext>(async context => {
    await context.dbContainer?.stop();
    await context.app?.close();
  });
}
