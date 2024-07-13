import type { FastifyInstance } from "fastify";

export function getPrintableRoutes(fastify: FastifyInstance): void {
  for (const routes of fastify.routes.values()) {
    if (routes[0]) {
      console.log(`[${routes[0].method}] ${routes[0].url}`);
    }
  }
}
