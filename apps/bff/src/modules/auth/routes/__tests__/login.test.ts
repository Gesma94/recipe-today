import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { buildFastify } from "../../../../app.js";
import { type User } from "@recipe-today/prisma";
import { createFakerUser } from "../../../../../tests/factories/user-factory.js";
import type { FastifyInstance } from "fastify";
import { ResponseErrorSchema, type ResponseError } from "../../../../common/schemas/response-error-schema.js";
import { COOKIES_NAME, ErrorCode, UserProvider } from "../../../../common/const.js";
import { Value } from "@sinclair/typebox/value";
import { UserPayloadSchema, type UserPayload } from "../../../../common/schemas/user-schema.js";
import { getPrismaClientMock } from "../../../../../tests/mocks/prisma-mock.js";
import { faker } from "@faker-js/faker";

const prismaClientMock = getPrismaClientMock();
vi.mock(import("@recipe-today/prisma"), async importOriginal => {
  return {
    ...(await importOriginal()),
    PrismaClient: vi.fn().mockImplementation(() => prismaClientMock),
  };
});

describe("POST /login", () => {
  let app: FastifyInstance;
  const db: [User, User] = [createFakerUser(0), createFakerUser(1)];

  beforeAll(async () => {
    app = await buildFastify();

    await app.listen({ port: 0, host: "0.0.0.0" });
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("returns 400 if user not found", async () => {
    prismaClientMock.user.findFirst.mockImplementation(async () => null);

    const response = await app.inject({
      method: "POST",
      url: "/api/login",
      headers: {
        "Content-Type": "application/json",
      },
      body: {
        email: faker.internet.email(),
        password: faker.internet.password(),
      },
    });
    const bodyResponse = response.json<ResponseError>();

    expect(response.statusCode).toBe(400);
    expect(bodyResponse.error.statusCode).toBe(400);
    expect(bodyResponse.error.name).toBe("InvalidCredentials");
    expect(bodyResponse.error.code).toBe(ErrorCode.RT_InvalidCredentials);
    expect(bodyResponse.error.message).toBe("User not found with provided credentials");
    expect(Value.Check(ResponseErrorSchema, bodyResponse)).toBe(true);
  });

  it("returns 400 if password does not match", async () => {
    const hashedPassword = app.bcrypt.hashSync(db[0].password);
    const userWithHasedPassword = Object.assign<User, Partial<User>>({ ...db[0] }, { password: hashedPassword });

    prismaClientMock.user.findFirst.mockImplementation(async () => userWithHasedPassword);

    const response = await app.inject({
      method: "POST",
      url: "/api/login",
      headers: {
        "Content-Type": "application/json",
      },
      body: {
        email: db[0].email,
        password: faker.internet.password(),
      },
    });
    const bodyResponse = response.json<ResponseError>();

    expect(response.statusCode).toBe(400);
    expect(bodyResponse.error.statusCode).toBe(400);
    expect(bodyResponse.error.name).toBe("InvalidCredentials");
    expect(bodyResponse.error.code).toBe(ErrorCode.RT_InvalidCredentials);
    expect(bodyResponse.error.message).toBe("User not found with provided credentials");
    expect(Value.Check(ResponseErrorSchema, bodyResponse)).toBe(true);
  });

  it("returns 200 with user details and set cookie", async () => {
    const hashedPassword = app.bcrypt.hashSync(db[0].password);
    const userWithHasedPassword = Object.assign<User, Partial<User>>({ ...db[0] }, { password: hashedPassword });

    prismaClientMock.user.findFirst.mockImplementation(async () => userWithHasedPassword);

    const response = await app.inject({
      method: "POST",
      url: "/api/login",
      headers: {
        "Content-Type": "application/json",
      },
      body: {
        email: db[0].email,
        password: db[0].password,
      },
    });
    const bodyResponse = response.json<UserPayload>();

    expect(response.statusCode).toBe(200);
    expect(bodyResponse.id).toBe(db[0].id);
    expect(bodyResponse.email).toBe(db[0].email);
    expect(bodyResponse.provider).toBe(UserProvider.Email);
    expect(bodyResponse.displayName).toBe(db[0].displayName);
    expect(Value.Check(UserPayloadSchema, bodyResponse)).toBe(true);

    expect(response.cookies).toHaveLength(2);
    expect(response.cookies.find(cookie => cookie.name === COOKIES_NAME.accessToken)).toBeTruthy();
    expect(response.cookies.find(cookie => cookie.name === COOKIES_NAME.refreshToken)).toBeTruthy();
  });
});
