import { type Mock } from "vitest";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type MockedFunction<T extends (...args: any[]) => any> = Mock<T>;

export type DeepMock<T> = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [K in keyof Partial<T>]: T[K] extends (...args: any[]) => any
    ? MockedFunction<T[K]>
    : T[K] extends object
      ? DeepMock<T[K]> | undefined
      : T[K];
};
