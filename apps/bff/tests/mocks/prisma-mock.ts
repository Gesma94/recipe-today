import type { PrismaClient, User } from "@recipe-today/prisma";
import { vi } from "vitest";

export function getPrismaClientMock() {
  return {
    $connect: vi.fn(),
    $disconnect: vi.fn(),
    user: {
      create: vi.fn<(...args: Parameters<PrismaClient["user"]["create"]>) => Promise<User | null>>(),
      findMany: vi.fn<(...args: Parameters<PrismaClient["user"]["findMany"]>) => Promise<User[] | null>>(),
      findFirst: vi.fn<(...args: Parameters<PrismaClient["user"]["findFirst"]>) => Promise<User | null>>(),
    },
  };
}
