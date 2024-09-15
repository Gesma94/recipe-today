import type { FastifyInstance } from "fastify";
import { beforeEach, afterEach } from "vitest";
import { PostgreSqlContainer, StartedPostgreSqlContainer } from "@testcontainers/postgresql";
import { exec } from "child_process";
import { promisify } from "util";
import { buildFastify } from "../src/app.js";

const execPromise = promisify(exec);

export type TestDbEnvironmentContext = {
  app: FastifyInstance;
  originalDatabaseUrl: string;
  hasDatabaseUrlUpdated: boolean;
  dbContainer: StartedPostgreSqlContainer;
};

export function setupTestDbEnvironment() {
  beforeEach<TestDbEnvironmentContext>(async context => {
    try {
      context.hasDatabaseUrlUpdated = false;
      context.dbContainer = await new PostgreSqlContainer().start();

      context.hasDatabaseUrlUpdated = true;
      context.originalDatabaseUrl = process.env.DATABASE_URL;
      process.env.DATABASE_URL = context.dbContainer.getConnectionUri();

      await execPromise(
        `npx cross-env DATABASE_URL=${context.dbContainer.getConnectionUri()} pnpm --filter prisma migrate:dev`,
      );
      await execPromise(
        `npx cross-env DATABASE_URL=${context.dbContainer.getConnectionUri()} pnpm --filter prisma seed`,
      );

      context.app = await buildFastify();

      await context.app.listen({ port: 0, host: "0.0.0.0" });
      await context.app.ready();
    } catch (error) {
      console.error("Error while executing setup for test with DB environment");
      throw error;
    }
  });

  afterEach<TestDbEnvironmentContext>(async context => {
    if (context.hasDatabaseUrlUpdated) {
      process.env.DATABASE_URL = context.originalDatabaseUrl;
    }

    await context.dbContainer?.stop();
    await context.app?.close();
  });
}
