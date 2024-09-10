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

const prismaClientMock = getPrismaClientMock();

vi.mock(import("@recipe-today/prisma"), async importOriginal => {
  return {
    ...(await importOriginal()),
    PrismaClient: vi.fn(() => prismaClientMock),
  };
});

describe("POST /sign-up", () => {
  let app: FastifyInstance;
  const db: User[] = [createFakerUser(0), createFakerUser(1)];

  beforeAll(async () => {
    app = await buildFastify();

    await app.listen({ port: 1301, host: "0.0.0.0" });
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("returns 400 if email is already in used", async () => {
    prismaClientMock.user.findFirst.mockImplementation(async () => db[0] ?? null);

    const response = await app.inject({
      method: "POST",
      url: "/api/sign-up",
      headers: {
        "Content-Type": "application/json",
      },
      body: {
        email: db[0]?.email,
        password: db[0]?.password,
        displayName: db[1]?.displayName,
      },
    });
    const bodyResponse = response.json<ResponseError>();

    expect(response.statusCode).toBe(400);
    expect(bodyResponse.error.code).toBe(ErrorCode.RT_EmailAlreadyUsed);
    expect(bodyResponse.error.statusCode).toBe(400);
    expect(bodyResponse.error.name).toBe("EmailAlreadyUsed");
    expect(bodyResponse.error.message).toBe("Email is already used");
    expect(Value.Check(ResponseErrorSchema, bodyResponse)).toBe(true);
  });

  it("returns 400 if displayName is already in used", async () => {
    prismaClientMock.user.findFirst.mockImplementation(async () => db[0] ?? null);

    const response = await app.inject({
      method: "POST",
      url: "/api/sign-up",
      headers: {
        "Content-Type": "application/json",
      },
      body: {
        email: db[1]?.email,
        password: db[0]?.password,
        displayName: db[0]?.displayName,
      },
    });
    const bodyResponse = response.json<ResponseError>();

    expect(response.statusCode).toBe(400);
    expect(bodyResponse.error.code).toBe(ErrorCode.RT_DisplayNameAlreadyUsed);
    expect(bodyResponse.error.statusCode).toBe(400);
    expect(bodyResponse.error.name).toBe("DisplayNameAlreadyUsed");
    expect(bodyResponse.error.message).toBe("Display name is already used");
    expect(Value.Check(ResponseErrorSchema, bodyResponse)).toBe(true);
  });

  it("returns 400 if cannot create new user with custom error if catched error has not error schema", async () => {
    prismaClientMock.user.findFirst.mockResolvedValue(null);
    prismaClientMock.user.create.mockRejectedValueOnce(null);

    const response = await app.inject({
      method: "POST",
      url: "/api/sign-up",
      headers: {
        "Content-Type": "application/json",
      },
      body: {
        email: db[0]?.email,
        password: db[0]?.password,
        displayName: db[0]?.displayName,
      },
    });
    const bodyResponse = response.json<ResponseError>();

    expect(response.statusCode).toBe(400);
    expect(bodyResponse.error.code).toBe(ErrorCode.RT_UserRegistrationFailed);
    expect(bodyResponse.error.statusCode).toBe(400);
    expect(bodyResponse.error.name).toBe("UserRegistrationFailed");
    expect(bodyResponse.error.message).toBe("Could not register the new user");
    expect(Value.Check(ResponseErrorSchema, bodyResponse)).toBe(true);
  });

  it("returns 400 if cannot create new user with specific error if catched error has error schema", async () => {
    prismaClientMock.user.findFirst.mockResolvedValue(null);
    prismaClientMock.user.create.mockRejectedValueOnce({
      statusCode: 400,
      name: "MockError",
      message: "Error from Mock",
      code: ErrorCode.RT_MockError,
    });

    const response = await app.inject({
      method: "POST",
      url: "/api/sign-up",
      headers: {
        "Content-Type": "application/json",
      },
      body: {
        email: db[0]?.email,
        password: db[0]?.password,
        displayName: db[0]?.displayName,
      },
    });
    const bodyResponse = response.json<ResponseError>();

    expect(response.statusCode).toBe(400);
    expect(bodyResponse.error.code).toBe(ErrorCode.RT_MockError);
    expect(bodyResponse.error.statusCode).toBe(400);
    expect(bodyResponse.error.name).toBe("MockError");
    expect(bodyResponse.error.message).toBe("Error from Mock");
    expect(Value.Check(ResponseErrorSchema, bodyResponse)).toBe(true);
  });

  it("returns 200 with new user and set cookie", async () => {
    const newUser = createFakerUser(3);

    prismaClientMock.user.findFirst.mockResolvedValue(null);
    prismaClientMock.user.create.mockResolvedValueOnce(newUser);

    const response = await app.inject({
      method: "POST",
      url: "/api/sign-up",
      headers: {
        "Content-Type": "application/json",
      },
      body: {
        email: newUser.email,
        password: newUser.password,
        displayName: newUser.displayName,
      },
    });
    const bodyResponse = response.json<UserPayload>();

    expect(response.statusCode).toBe(200);
    expect(bodyResponse.id).toBe(newUser.id);
    expect(bodyResponse.email).toBe(newUser.email);
    expect(bodyResponse.displayName).toBe(newUser.displayName);
    expect(bodyResponse.provider).toBe(UserProvider.Native);
    expect(Value.Check(UserPayloadSchema, bodyResponse)).toBe(true);

    expect(response.cookies).toHaveLength(2);
    expect(response.cookies.find(cookie => cookie.name === COOKIES_NAME.accessToken)).toBeTruthy();
    expect(response.cookies.find(cookie => cookie.name === COOKIES_NAME.refreshToken)).toBeTruthy();
  });
});
