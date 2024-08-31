import "dotenv/config";
import { it, expect, beforeAll, afterAll, describe } from "vitest";
import type { FastifyInstance } from "fastify";
import { buildFastify } from "../../../../app.js";
import { COOKIES_NAME } from "../../../../common/const.js";
import type { UserPayload } from "../../../../common/types.js";

const userPayload: UserPayload = { id: 7, email: "test@example.com", displayName: "Test User", provider: "native" };

// // const generateInvalidToken = () => 'invalid.token.value';

describe("GET /authenticate", () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = buildFastify();
    app.listen({ port: 1301, host: "0.0.0.0" });

    await app.ready();
  });

  afterAll(() => {
    app.close();
  });

  it("returns error if valid access token is passed via 'Authorization' header", async () => {
    const { accessToken } = app.tokens.generateTokens(userPayload);

    const response = await app.inject({
      method: "GET",
      url: "/api/authenticate",
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    expect(response.statusCode).toBe(401);
    expect(response.json()).toMatchObject({
      error: {
        statusCode: 401,
        name: "FastifyError",
        code: "FST_JWT_NO_AUTHORIZATION_IN_COOKIE",
        message: "No Authorization was found in request.cookies",
      },
    });
  });

  it("returns error if unsigned access token is in cookie", async () => {
    const { accessToken } = app.tokens.generateTokens(userPayload);

    const response = await app.inject({
      method: "GET",
      url: "/api/authenticate",
      cookies: { [COOKIES_NAME.accessToken]: accessToken },
    });

    expect(response.statusCode).toBe(401);
    expect(response.json()).toMatchObject({
      error: {
        code: "RT_INVALID_ACCESS_TOKEN",
        message: "Invalid access token was found in request.cookies",
        name: "RecipeTodayError",
        statusCode: 401,
      },
    });
  });

  it("returns user data if signed valid access token is in cookie", async () => {
    const { accessToken } = app.tokens.generateTokens(userPayload);

    const response = await app.inject({
      method: "GET",
      url: "/api/authenticate",
      cookies: { [COOKIES_NAME.accessToken]: app.signCookie(accessToken) },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject(userPayload);
  });

  it("returns error if expired access token is provided and no refresh token is provided", async () => {
    const accessToken = app.tokens.generateToken(userPayload, "1ms");

    const response = await app.inject({
      method: "GET",
      url: "/api/authenticate",
      cookies: { [COOKIES_NAME.accessToken]: app.signCookie(accessToken) },
    });

    expect(response.statusCode).toBe(401);
    expect(response.json()).toMatchObject({
      error: {
        code: "RT_INVALID_REFRESH_TOKEN",
        message: "Invalid refresh token was found in request.cookies",
        name: "RecipeTodayError",
        statusCode: 401,
      },
    });
  });

  it("returns user data and save tokens in cookie when expired access token and valid refresh token are provided", async () => {
    const accessToken = app.tokens.generateToken(userPayload, "1ms");
    const refreshToken = app.tokens.generateRefreshToken(userPayload);

    const response = await app.inject({
      method: "GET",
      url: "/api/authenticate",
      cookies: { [COOKIES_NAME.refreshToken]: refreshToken, [COOKIES_NAME.accessToken]: app.signCookie(accessToken) },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual(userPayload);

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

    expect(response.statusCode).toBe(401);
    expect(response.json()).toMatchObject({
      error: {
        code: "RT_INVALID_REFRESH_TOKEN",
        message: "Invalid refresh token was found in request.cookies",
        name: "RecipeTodayError",
        statusCode: 401,
      },
    });
  });
});
