import type { FastifyInstance } from "fastify";
import { beforeEach, afterEach } from "vitest";
import { PostgreSqlContainer, StartedPostgreSqlContainer } from "@testcontainers/postgresql";
import { exec } from "child_process";
import { promisify } from "util";
import { buildFastify } from "../src/app.js";

const execPromise = promisify(exec);

export type TestDbEnvironmentContext = {
  app: FastifyInstance;
  dbContainer: StartedPostgreSqlContainer;
};

export function setupTestDbEnvironment() {
  let originalDatabaseUrl: string;
  let hasDatabaseUrlUpdated: boolean = false;

  beforeEach<TestDbEnvironmentContext>(async context => {
    try {
      context.dbContainer = await new PostgreSqlContainer().start();

      hasDatabaseUrlUpdated = true;
      originalDatabaseUrl = process.env.DATABASE_URL;
      process.env.DATABASE_URL = context.dbContainer.getConnectionUri();

      await execPromise(
        `npx cross-env DATABASE_URL=${context.dbContainer.getConnectionUri()} pnpm --filter prisma migrate:dev`,
      );
      await execPromise(
        `npx cross-env DATABASE_URL=${context.dbContainer.getConnectionUri()} pnpm --filter prisma seed`,
      );

      context.app = await buildFastify();

      await context.app.listen({ port: 1301, host: "0.0.0.0" });
      await context.app.ready();
    } catch (error) {
      throw new Error("Error while executing setup for test with DB environment");
    }
  });

  afterEach<TestDbEnvironmentContext>(async context => {
    if (hasDatabaseUrlUpdated) {
      process.env.DATABASE_URL = originalDatabaseUrl;
    }

    await context.dbContainer?.stop();
    await context.app?.close();
  });
}
