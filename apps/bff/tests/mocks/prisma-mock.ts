import { vi } from "vitest";

export function getPrismaClientMock() {
  return {
    $connect: vi.fn(),
    $disconnect: vi.fn(),
    user: {
      create: vi.fn(),
      findMany: vi.fn(),
      findFirst: vi.fn(),
    },
  };
}
