import { it, describe } from "vitest";
import { setupTestDbEnvironment, type TestDbEnvironmentContext } from "../../../../tests/test-setups.js";
import { faker } from "@faker-js/faker";
import { UserPayloadSchema, type UserPayload } from "../../../common/schemas/user-schema.js";
import { Value } from "@sinclair/typebox/value";
import { COOKIES_NAME, UserProvider } from "../../../common/const.js";

describe("Auth", () => {
  setupTestDbEnvironment();

  it<TestDbEnvironmentContext>("returns 200 when login after sign-up", async ({ app, expect }) => {
    const email = faker.internet.email();
    const displayName = faker.internet.displayName();
    const password = faker.internet.password({ length: 8 });

    expect(await app.prisma.user.findMany()).toHaveLength(0);

    const signUpResponse = await app.inject({
      method: "POST",
      url: "/api/sign-up",
      headers: {
        "Content-Type": "application/json",
      },
      body: {
        email,
        password,
        displayName,
      },
    });

    const bodySignUpResponse = signUpResponse.json<UserPayload>();

    expect(signUpResponse.statusCode).toBe(200);
    expect(bodySignUpResponse.email).toBe(email);
    expect(bodySignUpResponse.displayName).toBe(displayName);
    expect(bodySignUpResponse.provider).toBe(UserProvider.Email);
    expect(Value.Check(UserPayloadSchema, bodySignUpResponse)).toBe(true);
    expect(signUpResponse.cookies.find(cookie => cookie.name === COOKIES_NAME.accessToken)).toBeTruthy();
    expect(signUpResponse.cookies.find(cookie => cookie.name === COOKIES_NAME.refreshToken)).toBeTruthy();

    const loginResponse = await app.inject({
      method: "POST",
      url: "/api/login",
      headers: {
        "Content-Type": "application/json",
      },
      body: { email, password },
    });

    const bodyLoginResponse = loginResponse.json<UserPayload>();

    expect(loginResponse.statusCode).toBe(200);
    expect(bodyLoginResponse.email).toBe(email);
    expect(bodyLoginResponse.displayName).toBe(displayName);
    expect(bodyLoginResponse.provider).toBe(UserProvider.Email);
    expect(Value.Check(UserPayloadSchema, bodyLoginResponse)).toBe(true);
    expect(loginResponse.cookies.find(cookie => cookie.name === COOKIES_NAME.accessToken)).toBeTruthy();
    expect(loginResponse.cookies.find(cookie => cookie.name === COOKIES_NAME.refreshToken)).toBeTruthy();
  });
});
