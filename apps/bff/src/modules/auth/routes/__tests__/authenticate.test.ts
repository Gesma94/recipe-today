import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { buildFastify } from "../../../../app.js";
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

describe("GET /authenticate", () => {
  let app: FastifyInstance;
  const userPayload: UserPayload = {
    id: faker.number.int(),
    provider: UserProvider.Email,
    email: faker.internet.email(),
    displayName: faker.internet.displayName(),
  };

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

  it("returns error if valid access token is passed via 'Authorization' header", async () => {
    const { accessToken } = app.tokens.generateTokens(userPayload);

    const response = await app.inject({
      method: "GET",
      url: "/api/authenticate",
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const bodyResponse = response.json<ResponseError>();

    expect(response.statusCode).toBe(401);
    expect(bodyResponse.error.statusCode).toBe(401);
    expect(bodyResponse.error.name).toBe("InvalidAccessToken");
    expect(bodyResponse.error.code).toBe(ErrorCode.RT_InvalidAccessToken);
    expect(bodyResponse.error.message).toBe("Invalid access token was found in request.cookies");
    expect(Value.Check(ResponseErrorSchema, bodyResponse)).toBe(true);
  });

  it("returns error if unsigned access token is in cookie", async () => {
    const { accessToken } = app.tokens.generateTokens(userPayload);

    const response = await app.inject({
      method: "GET",
      url: "/api/authenticate",
      cookies: { [COOKIES_NAME.accessToken]: accessToken },
    });

    const bodyResponse = response.json<ResponseError>();

    expect(response.statusCode).toBe(401);
    expect(bodyResponse.error.statusCode).toBe(401);
    expect(bodyResponse.error.name).toBe("InvalidAccessToken");
    expect(bodyResponse.error.code).toBe(ErrorCode.RT_InvalidAccessToken);
    expect(bodyResponse.error.message).toBe("Invalid access token was found in request.cookies");
    expect(Value.Check(ResponseErrorSchema, bodyResponse)).toBe(true);
  });

  it("returns user data if signed valid access token is in cookie", async () => {
    const { accessToken } = app.tokens.generateTokens(userPayload);

    const response = await app.inject({
      method: "GET",
      url: "/api/authenticate",
      cookies: { [COOKIES_NAME.accessToken]: app.signCookie(accessToken) },
    });

    const bodyResponse = response.json<UserPayload>();

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject(userPayload);
    expect(Value.Check(UserPayloadSchema, bodyResponse)).toBe(true);
  });

  it("returns error if expired access token is provided and no refresh token is provided", async () => {
    const accessToken = app.tokens.generateToken(userPayload, "1ms");

    const response = await app.inject({
      method: "GET",
      url: "/api/authenticate",
      cookies: { [COOKIES_NAME.accessToken]: app.signCookie(accessToken) },
    });

    const bodyResponse = response.json<ResponseError>();

    expect(response.statusCode).toBe(401);
    expect(bodyResponse.error.statusCode).toBe(401);
    expect(bodyResponse.error.name).toBe("InvalidRefreshToken");
    expect(bodyResponse.error.code).toBe(ErrorCode.RT_InvalidRefreshToken);
    expect(bodyResponse.error.message).toBe("Invalid refresh token was found in request.cookies");
    expect(Value.Check(ResponseErrorSchema, bodyResponse)).toBe(true);
  });

  it("returns user data and save tokens in cookie when expired access token and valid refresh token are provided", async () => {
    const accessToken = app.tokens.generateToken(userPayload, "1ms");
    const refreshToken = app.tokens.generateRefreshToken(userPayload);

    const response = await app.inject({
      method: "GET",
      url: "/api/authenticate",
      cookies: { [COOKIES_NAME.refreshToken]: refreshToken, [COOKIES_NAME.accessToken]: app.signCookie(accessToken) },
    });

    const bodyResponse = response.json<UserPayload>();

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject(userPayload);
    expect(Value.Check(UserPayloadSchema, bodyResponse)).toBe(true);

    const accessTokenCookie = response.cookies.find(cookie => cookie.name == COOKIES_NAME.accessToken);
    const refreshTokenCookie = response.cookies.find(cookie => cookie.name == COOKIES_NAME.refreshToken);

    expect(accessTokenCookie).toBeDefined();
    expect(refreshTokenCookie).toBeDefined();
    expect(accessTokenCookie?.httpOnly).toBeTruthy();
    expect(refreshTokenCookie?.httpOnly).toBeTruthy();
  });

  it("returns error when expired access token and invalid refresh token are provided", async () => {
    const accessToken = app.tokens.generateToken(userPayload, "1ms");

    const response = await app.inject({
      method: "GET",
      url: "/api/authenticate",
      cookies: {
        [COOKIES_NAME.refreshToken]: "invalid_refresh_token",
        [COOKIES_NAME.accessToken]: app.signCookie(accessToken),
      },
    });

    const bodyResponse = response.json<ResponseError>();

    expect(response.statusCode).toBe(401);
    expect(bodyResponse.error.statusCode).toBe(401);
    expect(bodyResponse.error.name).toBe("InvalidRefreshToken");
    expect(bodyResponse.error.code).toBe(ErrorCode.RT_InvalidRefreshToken);
    expect(bodyResponse.error.message).toBe("Invalid refresh token was found in request.cookies");
    expect(Value.Check(ResponseErrorSchema, bodyResponse)).toBe(true);
  });
});
