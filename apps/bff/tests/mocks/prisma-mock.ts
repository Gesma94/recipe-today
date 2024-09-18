import { vi } from "vitest";
import type { PrismaClient } from "@recipe-today/prisma";
import type { DeepMock } from "../utils/deep-mock.js";

type PrismaClientMock = DeepMock<PrismaClient>;

export function getPrismaClientMock(): Partial<PrismaClientMock> {
  return {
    $connect: vi.fn(),
    $disconnect: vi.fn(),
    user: {
      create: vi.fn(),
      findFirst: vi.fn(),
    },
  };
}
