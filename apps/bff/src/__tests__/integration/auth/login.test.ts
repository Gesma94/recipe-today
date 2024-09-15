import { it, describe } from "vitest";
import { setupTestDbEnvironment, type TestDbEnvironmentContext } from "../../../../tests/test-setups.js";
import { faker } from "@faker-js/faker";
import { UserPayloadSchema, type UserPayload } from "../../../common/schemas/user-schema.js";
import { Value } from "@sinclair/typebox/value";
import { COOKIES_NAME, ErrorCode, UserProvider } from "../../../common/const.js";
import { $Enums } from "@recipe-today/prisma";
import { ResponseErrorSchema, type ResponseError } from "../../../common/schemas/response-error-schema.js";

describe.concurrent("POST /login", () => {
  setupTestDbEnvironment();

  it<TestDbEnvironmentContext>("returns 400 if user not found", async ({ app, expect }) => {
    const email = faker.internet.email();
    const password = faker.internet.password();

    expect(await app.prisma.user.findMany()).toHaveLength(0);

    const response = await app.inject({
      method: "POST",
      url: "/api/login",
      headers: {
        "Content-Type": "application/json",
      },
      body: { email, password },
    });

    const bodyResponse = response.json<ResponseError>();

    expect(response.statusCode).toBe(400);
    expect(bodyResponse.error.statusCode).toBe(400);
    expect(bodyResponse.error.name).toBe("InvalidCredentials");
    expect(bodyResponse.error.code).toBe(ErrorCode.RT_InvalidCredentials);
    expect(bodyResponse.error.message).toBe("User not found with provided credentials");
    expect(Value.Check(ResponseErrorSchema, bodyResponse)).toBe(true);
  });

  it<TestDbEnvironmentContext>("returns 400 if password does not match", async ({ app, expect }) => {
    const email = faker.internet.email();
    const password = faker.internet.password();
    const displayName = faker.internet.displayName();

    expect(await app.prisma.user.findMany()).toHaveLength(0);

    await app.prisma.user.create({
      data: {
        email,
        displayName,
        provider: $Enums.UserProvider.EMAIL,
        password: app.bcrypt.hashSync(password),
      },
    });

    expect(await app.prisma.user.findMany()).toHaveLength(1);

    const response = await app.inject({
      method: "POST",
      url: "/api/login",
      headers: {
        "Content-Type": "application/json",
      },
      body: { email, password: faker.internet.password() },
    });

    const bodyResponse = response.json<ResponseError>();

    expect(response.statusCode).toBe(400);
    expect(bodyResponse.error.statusCode).toBe(400);
    expect(bodyResponse.error.name).toBe("InvalidCredentials");
    expect(bodyResponse.error.code).toBe(ErrorCode.RT_InvalidCredentials);
    expect(bodyResponse.error.message).toBe("User not found with provided credentials");
    expect(Value.Check(ResponseErrorSchema, bodyResponse)).toBe(true);
  });

  it<TestDbEnvironmentContext>("returns 200 with new user and set cookie", async ({ app, expect }) => {
    const email = faker.internet.email();
    const password = faker.internet.password();
    const displayName = faker.internet.displayName();

    expect(await app.prisma.user.findMany()).toHaveLength(0);

    await app.prisma.user.create({
      data: {
        email,
        displayName,
        provider: $Enums.UserProvider.EMAIL,
        password: app.bcrypt.hashSync(password),
      },
    });

    expect(await app.prisma.user.findMany()).toHaveLength(1);

    const response = await app.inject({
      method: "POST",
      url: "/api/login",
      headers: {
        "Content-Type": "application/json",
      },
      body: { email, password },
    });

    const bodyResponse = response.json<UserPayload>();

    expect(response.statusCode).toBe(200);
    expect(bodyResponse.email).toBe(email);
    expect(bodyResponse.displayName).toBe(displayName);
    expect(bodyResponse.provider).toBe(UserProvider.Email);
    expect(Value.Check(UserPayloadSchema, bodyResponse)).toBe(true);
    expect(response.cookies.find(cookie => cookie.name === COOKIES_NAME.accessToken)).toBeTruthy();
    expect(response.cookies.find(cookie => cookie.name === COOKIES_NAME.refreshToken)).toBeTruthy();
  });
});
